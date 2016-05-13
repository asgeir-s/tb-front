import * as _ from "ramda"
import * as request from "request"
import * as Promise from "bluebird"

const requestAsync = Promise.promisify(request)

import { Context } from "../../lib/common//typings/aws-lambda"
import { handle } from "../../lib/handler"
import { Signals } from "../../lib/common/signals"
import { DynamoDb } from "../../lib/common/aws"
import { JWT } from "../../lib/jwt"
import { Crypto } from "../../lib/common/crypto"
import { PostMirror } from "./action"

const publicEndpoint = false
export const eventSchema: tv4.JsonSchema = {
  "type": "object",
  "properties": {
    "jwt": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$"
    },
    "streamId": {
      "type": "string",
      "pattern": "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"
    },
    "apiKey": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$"
    },
    "apiSecret": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$"
    },
  },
  "additionalProperties": false,
  "required": ["jwt", "streamId", "apiKey", "apiSecret"]
}

const inject: PostMirror.Inject = {
  encryptApiKey: _.curry(Crypto.encryptSimple)(process.env.APIKEYS_ENCRYPTION_PASSWORD),
  addMirror: _.curry(DynamoDb.addItem)
    (DynamoDb.documentClientAsync(process.env.DYNAMO_REGION), process.env.MIRROR_TABLE),
  notifyMirrorService: () => requestAsync({
    method: "GET",
    uri: process.env.MIRROR_SERVICE_URL + "/new-mirror",
    headers: {
      "content-type": "application/json",
    }
  })
}

export function handler(event: any, context: Context) {
  handle(PostMirror.action, eventSchema, inject, event, context, publicEndpoint, true,
    process.env.JWT_USER_SECRET, process.env.AUTH0_CLIENT_ID)
}