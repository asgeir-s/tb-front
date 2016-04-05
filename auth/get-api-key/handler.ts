
import * as _ from "ramda"

import { Context } from "../../lib/common//typings/aws-lambda"
import { handle } from "../../lib/handler"
import { Streams } from "../../lib/common/streams"
import { DynamoDb } from "../../lib/common/aws"
import { JWT } from "../../lib/jwt"
import { GetApiKey } from "./action"

const publicEndpoint = false
export const eventSchema: tv4.JsonSchema = {
  "type": "object",
  "properties": {
    "jwt": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$"
    },
    "streamId": {
      "type": "string",
      "pattern": "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"
    }
  },
  "additionalProperties": false,
  "required": ["jwt", "streamId"]
}

const dynamoClient = DynamoDb.documentClientAsync(process.env.DYNAMO_REGION)

const inject: GetApiKey.Inject = {
  getApiKeyId: _.curry(Streams.getApiKeyId)(dynamoClient, process.env.DYNAMO_TABLE_STREAMS),
  generateApiKey: _.curry(JWT.createApiKey)(process.env.JWT_API_USER_SECRET)
}

export function handler(event: any, context: Context) {
  handle(GetApiKey.action, eventSchema, inject, event, context, publicEndpoint, true, process.env.JWT_USER_SECRET,
    process.env.AUTH0_CLIENT_ID)
}
