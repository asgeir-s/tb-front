import * as _ from "ramda"
import * as Promise from "bluebird"
import * as tv4 from "tv4"

import { Context } from "./common/typings/aws-lambda"
import { JWT } from "./jwt"
import { User } from "./typings/jwt-user"
import { Responds } from "./common/typings/responds"
import { log, userLog } from "./logger"
import { validateEvent } from "./event-validator"

/**
 * If publicEndpoint is false jwtSecret and auth0ClientId is not neede.
 * Default is publicEndpoint: false
 */
export function handle(
  action: (inject: any, event: any, context: Context, user?: User) => Promise<Responds>,
  eventSchema: tv4.JsonSchema,
  inject: any,
  event: any,
  context: Context,
  publicEndpoint: boolean = false,
  printEvent: boolean = true,
  jwtSecret: string = "",
  auth0ClientId: string = ""): Promise<any> {

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
        return action(inject, event, context, JWT.getUser(jwtSecret, auth0ClientId, event.jwt))
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
        const statusCode = result.statusCode ? result.statusCode : 500
        log.log("RESULT", "FAILURE: returning result", {
          "GRID": result.GRID,
          "data": result.data,
          "success": result.success,
          "statusCode": statusCode
        })
        context.done("[" + statusCode + "] " + result.data + ". When contacting support please provide this id: " +
          result.GRID, null)
      }
    })

}