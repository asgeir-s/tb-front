import * as _ from "ramda"

import { Context } from "../../lib/common//typings/aws-lambda"
import { handle } from "../../lib/handler"
import { Signals } from "../../lib/common/signals"
import { DynamoDb } from "../../lib/common/aws"
import { GetSignals } from "./action"

const publicEndpoint = true
export const eventSchema = {
  "type": "object",
  "properties": {
    "streamId": {
      "type": "string",
      "pattern": "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"
    }
  },
  "additionalProperties": false,
  "required": ["streamId"]
}

const inject: GetSignals.Inject = {
  getSignals: _.curry(Signals.getClosedSignals)(process.env.SIGNALS_URL, process.env.SIGNALS_APIKEY)
}

export function handler(event: any, context: Context) {
  handle(GetSignals.action, eventSchema, inject, event, context, publicEndpoint)
}