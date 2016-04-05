import * as _ from "ramda"

import { Context } from "../../lib/common//typings/aws-lambda"
import { handle } from "../../lib/handler"
import { Subscription } from "../../lib/common/subscription"
import { DynamoDb } from "../../lib/common/aws"
import { PostSubscribe } from "./action"
import { Recaptcha } from "../../lib/recaptcha"
import { log } from "../../lib/logger"

const publicEndpoint = true
export const eventSchema = {
  "type": "object",
  "properties": {
    "recaptcha": {
      "type": "string",
      "pattern": "[0-9a-zA-Z_-]"
    },
    "subscription": {
      "type": "object",
      "properties": {
        "email": {
          "type": "string",
          "pattern": "/.+@.+\..+/i"
        },
        "streamId": {
          "type": "string",
          "pattern": "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"
        },
        "autoTrader": {
          "type": "boolean"
        },
        "apiKey": {
          "type": "string",
          "pattern": "^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$"
        },
        "apiSecret": {
          "type": "string",
          "pattern": "^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$"
        }
      },
      "additionalProperties": false,
      "required": ["email", "streamId", "autoTrader"]
    }
  },
  "additionalProperties": false,
  "required": ["recaptcha", "subscription"]
}

const inject: PostSubscribe.Inject = {
  getPaymentCode: _.curry(Subscription.getPaymentCode)(process.env.TB_BACK_URL)
}

export function handler(event: any, context: Context) {
  Recaptcha.validate(event.recaptcha)
    .then(res => {
      if (res) {
        handle(PostSubscribe.action, eventSchema, inject, event, context, publicEndpoint, false)
      }
      else {
        context.fail({
          "GRID": context.awsRequestId,
          "data": "Bad Request",
          "success": false,
          "statusCode": 400
        })
      }
    })
    .catch((e: Error) => {
      log.exception("invalide Recaptcha", e)
      context.fail({
        "GRID": context.awsRequestId,
        "data": "Bad Request",
        "success": false,
        "statusCode": 400
      })
    })
}