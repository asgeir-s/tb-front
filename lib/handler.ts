import * as R from "ramda"
import * as Promise from "bluebird"
import * as tv4 from "tv4"

import { Context } from "./common/typings/aws-lambda"
import { JWT } from "./jwt"
import { User } from "./common/typings/jwt-user"
import { Responds } from "./common/typings/responds"
import { log, userLog } from "./logger"
import { validateEvent } from "./event-validator"

export module Handler {

  export function handle(
    action: (inject: any, event: any, context: Context, user?: User) => Promise<Responds>,
    eventSchema: tv4.JsonSchema,
    inject: any,
    event: any,
    context: Context,
    publicEndpoint: boolean = false,
    printEvent: boolean = true): Promise<any> {

    if (printEvent) {
      log.log("EVENT", "received new event", { "event": event })
    }

    return validateEvent(event, eventSchema)
      .then(res => {
        if (!res) {
          throw new Error("unvalide event")
        }
        if (publicEndpoint) {
          return action(inject, event, context)
        }
        else {
          return action(inject, event, context, inject.userFromJwt(event.jwt))
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
          log.log("RESULT", "SUCCESS", { "result": result })
          context.done(null, result)
        }
        else {
          log.log("RESULT", "FAILE", { "result": result })
          context.done(result, null)
        }
      })

  }

}
