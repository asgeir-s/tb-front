import * as R from "ramda"
import * as Promise from "bluebird"
import * as tv4 from "tv4"

import { Context } from "./typings/aws-lambda"
import { JWT } from "./jwt"
import { User } from "./typings/user"
import { Response } from "./typings/response"
import { log, userLog } from "./logger"
import { validateEvent } from "./event-validator"

export module Handler {

  const userFromJwt: (jwt: string) => Promise<User> =
    R.curry(JWT.getUser)(process.env.JWT_SECRET, process.env.AUTH0_CLIENT_ID)

  export function handle(
    action: (inject: any, event: any, context: Context, user?: User) => Promise<Response>,
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
          return userFromJwt(event.jwt)
            .then((user: User) => {
              return action(inject, event, context, user)
            })
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
