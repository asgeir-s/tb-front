import * as _ from "ramda"

import { Context } from "../../lib/common//typings/aws-lambda"
import { handle } from "../../lib/handler"
import { Signals } from "../../lib/common/signals"
import { DynamoDb } from "../../lib/common/aws"
import { GetStream, Inject } from "./action"

const publicEndpoint = true
export const eventSchema = {
  "type": "object",
  "properties": {
    "streamId": {
      "type": "string"
    }
  },
  "additionalProperties": false,
  "required": ["streamId"]
}

const inject: Inject = {
  getSignals: _.curry(Signals.getAllSignals)(process.env.SIGNALS_URL, process.env.SIGNALS_APIKEY)
}

export function handler(event: any, context: Context) {
  handle(GetStream.action, eventSchema, inject, event, context, publicEndpoint)
}