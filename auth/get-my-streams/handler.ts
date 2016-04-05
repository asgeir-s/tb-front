
import * as _ from "ramda"

import { Context } from "../../lib/common//typings/aws-lambda"
import { handle } from "../../lib/handler"
import { Streams } from "../../lib/common/streams"
import { DynamoDb } from "../../lib/common/aws"
import { GetMyStreams } from "./action"

const publicEndpoint = false
export const eventSchema: tv4.JsonSchema = {
  "type": "object",
  "properties": {
    "jwt": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$"
    }
  },
  "additionalProperties": false,
  "required": ["jwt"]
}

const dynamoClient = DynamoDb.documentClientAsync(process.env.DYNAMO_REGION)

const inject: GetMyStreams.Inject = {
  getStreamsAuth: _.curry(Streams.getStreams)(dynamoClient, process.env.DYNAMO_TABLE_STREAMS, Streams.AuthLevel.Auth)
}

export function handler(event: any, context: Context) {
  handle(GetMyStreams.action, eventSchema, inject, event, context, publicEndpoint, true, process.env.JWT_USER_SECRET,
    process.env.AUTH0_CLIENT_ID)
}
