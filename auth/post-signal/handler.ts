import * as _ from "ramda"

import { Context } from "../../lib/common//typings/aws-lambda"
import { handle } from "../../lib/handler"
import { Signals } from "../../lib/common/signals"
import { DynamoDb } from "../../lib/common/aws"
import { JWT } from "../../lib/jwt"
import { PostSignal } from "./action"

const publicEndpoint = false
export const eventSchema: tv4.JsonSchema = {
  "type": "object",
  "properties": {
    "jwt": {
      "type": "string"
    },
    "streamId": {
      "type": "string"
    },
    "signal": {
      "type": "number",
      "minimum": -1,
      "maximum": 1
    }
  },
  "additionalProperties": false,
  "required": ["jwt", "streamId", "signal"]
}

const inject: PostSignal.Inject = {
  postSignal: _.curry(Signals.postSignal)(process.env.SIGNAL_SERVICE_URL, process.env.SIGNAL_SERVICE_APIKEY)
}

export function handler(event: any, context: Context) {
  handle(PostSignal.action, eventSchema, inject, event, context, publicEndpoint, true,
    process.env.JWT_USER_SECRET, process.env.AUTH0_CLIENT_ID)
}
