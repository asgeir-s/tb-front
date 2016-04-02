import * as _ from "ramda"

import { Context } from "../../lib/common//typings/aws-lambda"
import { handle } from "../../lib/handler"
import { Streams, AuthLevel } from "../../lib/common/streams"
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

const dynamoClient = DynamoDb.documentClientAsync(process.env.DYNAMO_REGION)

const inject: Inject = {
  getStream: _.curry(Streams.getStream)(dynamoClient, process.env.DYNAMO_TABLE_STREAMS, AuthLevel.Public)
}

export function handler(event: any, context: Context) {
  handle(GetStream.action, eventSchema, inject, event, context, publicEndpoint)
}