
import * as _ from "ramda"

import { Context } from "../../lib/common//typings/aws-lambda"
import { handle } from "../../lib/handler"
import { Streams } from "../../lib/common/streams"
import { DynamoDb } from "../../lib/common/aws"
import { GetMyStreams } from "./action"

const publicEndpoint = false
const dynamoClient = DynamoDb.documentClientAsync(process.env.DYNAMO_REGION)

const inject: GetMyStreams.Inject = {
    getStreamsAuth: _.curry(Streams.getStreams)(dynamoClient, process.env.DYNAMO_TABLE_STREAMS, Streams.AuthLevel.Auth)
}


export function handler(event: any, context: Context) {
  handle(GetMyStreams.action, {}, inject, event, context, publicEndpoint)
}
