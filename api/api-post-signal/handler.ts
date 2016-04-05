import * as _ from "ramda"
import * as tv4 from "tv4"

import { Context } from "../../lib/common//typings/aws-lambda"
import { handle } from "../../lib/handler"
import { Signals } from "../../lib/common/signals"
import { Streams } from "../../lib/common/streams"
import { DynamoDb } from "../../lib/common/aws"
import { JWT } from "../../lib/jwt"
import { PostSignalApi } from "./action"
import { validateEvent } from "../../lib/event-validator"
import { verify, VerifyOptions, sign, SignOptions } from "jsonwebtoken"
import { log, userLog } from "../../lib/logger"


export const eventSchema: tv4.JsonSchema = {
  "type": "object",
  "properties": {
    "apiKey": {
      "type": "string",
      "pattern": "^apikey [a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$"
    },
    "streamId": {
      "type": "string",
      "pattern": "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"
    },
    "tradeSignal": {
      "type": "number",
      "minimum": -1,
      "maximum": 1
    }
  },
  "additionalProperties": false,
  "required": ["apiKey", "streamId", "tradeSignal"]
}

const dynamoClient = DynamoDb.documentClientAsync(process.env.DYNAMO_REGION)

const inn: PostSignalApi.Inject = {
  getStreamPrivete: _.curry(Streams.getStream)(dynamoClient, process.env.STREAMS_TABLE, Streams.AuthLevel.Private),
  postSignal: _.curry(Signals.postSignal)(process.env.SIGNAL_SERVICE_URL, process.env.SIGNAL_SERVICE_APIKEY)
}

export function handler(event: any, context: Context) {

  // validate event tv4
  return validateEvent(event, eventSchema)
    .then(res => {
      if (!res) {
        throw new Error("unvalide event")
      }
      else {

        // validate jwt
        const valideJwtData = verify(event.apiKey.split(" ")[1], new Buffer(process.env.JWT_API_USER_SECRET,
          "base64"), {
            audience: process.env.AUTH0_CLIENT_ID,
            algorithms: ["HS256"]
          })

        // check event.streamId = jwt.streamId
        if (valideJwtData.streamId === event.streamId) {
          return PostSignalApi.action(inn, event, context, valideJwtData.userId, valideJwtData.apiKeyId)
        }
        else {
          throw new Error("streamId and apiKey does not match")
        }
      }
    })
    .catch((e: Error) => (e.name === "JsonWebTokenError" || e.name === "TokenExpiredError"), error => {
      log.exception(error.name, error)
      return {
        "GRID": context.awsRequestId,
        "statusCode": 403,
        "data": "Could not authenticate. Please, include the GRID when contacting support.",
        "success": false
      }
    })
    .catch((e: Error) => (e.message.indexOf("ValidationError") > -1), error => {
      log.exception("ValidationError", error, false)
      return {
        "GRID": context.awsRequestId,
        "data": "invalide event format",
        "statusCode": 400,
        "success": false
      }
    })
    .catch((error: Error) => {
      log.exception("unknow exception", error)
      return {
        "GRID": context.awsRequestId,
        "statusCode": 500,
        "data": "internal server error",
        "success": false
      }
    })
    .then(result => {
      if (result.success) {
        log.log("RESULT", "SUCCESS: returning result.data", {
          "GRID": result.GRID,
          "data": result.data instanceof Array ? {
            "truncatedData": result.data.slice(0, 3),
            "originalLength": result.data.length
          } : result.data,
          "success": result.success
        })
        context.done(null, result.data)
      }
      else {
        log.log("RESULT", "FAILURE: returning result", {
          "GRID": result.GRID,
          "data": result.data,
          "success": result.success,
          "statusCode": result.statusCode
        })
        context.done(result, null)
      }
    })
}
