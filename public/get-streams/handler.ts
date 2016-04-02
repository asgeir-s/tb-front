import * as _ from "ramda"

import { Context } from "../../lib/common//typings/aws-lambda"
import { handle } from "../../lib/handler"
import { Streams } from "../../lib/common/streams"
import { DynamoDb } from "../../lib/common/aws"
import { GetStreams, Inject } from "./action"

const publicEndpoint = true
const dynamoClient = DynamoDb.documentClientAsync(process.env.DYNAMO_REGION)

const inject: Inject = {
  getStreams: () => Streams.getAllStremsPublic(dynamoClient, process.env.DYNAMO_TABLE_STREAMS)
}

export function handler(event: any, context: Context) {
  handle(GetStreams.action, {}, inject, event, context, publicEndpoint)
}