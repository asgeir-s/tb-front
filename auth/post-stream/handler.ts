
import * as _ from "ramda"

import { Context } from "../../lib/common//typings/aws-lambda"
import { handle } from "../../lib/handler"
import { Streams } from "../../lib/common/streams"
import { DynamoDb } from "../../lib/common/aws"
import { PostStream } from "./action"
import { Auth0 } from "../../lib/common/auth0"
import { JWT } from "../../lib/jwt"


const publicEndpoint = false
export const eventSchema: tv4.JsonSchema = {
  "type": "object",
  "properties": {
    "jwt": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$"
    },
    "stream": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          "pattern": "(?!.*  )[a-zA-Z0-9\\-\\_ ]{4,20}$"
        },
        "exchange": {
          "type": "string",
          "pattern": "^[a-zA-Z1-9]{2,20}$"
        },
        "currencyPair": {
          "type": "string",
          "pattern": "^btcUSD$"
        },
        "payoutAddress": {
          "type": "string",
          "pattern": "^[13][a-km-zA-HJ-NP-Z0-9]{26,34}$"
        },
        "subscriptionPriceUSD": {
          "type": "number",
          "minimum": 3,
          "maximum": 99999
        },
      },
      "additionalProperties": false,
      "required": ["name", "exchange", "currencyPair", "payoutAddress", "subscriptionPriceUSD"]
    }
  },
  "additionalProperties": false,
  "required": ["jwt", "stream"]
}

const inject: PostStream.Inject = {
  checkJwtIsUpToDate:
  _.curry(Auth0.checkUserAppMetadataUptodate)(process.env.AUTH0_URL, process.env.AUTH0_GET_USER_JWT),
  postToStreamService:
  _.curry(Streams.addNewStream)(process.env.STREAM_SERVICE_URL, process.env.STREAM_SERVICE_APIKEY),
  addStreamToAuth0UserReturnAppData:
  _.curry(Auth0.addStreamToAuth0UserReturnAppData)(process.env.AUTH0_URL, process.env.AUTH0_GET_USER_JWT),
  updateUserJwt: _.curry(JWT.updatedJwtWithNewAppData)(process.env.JWT_USER_SECRET),
  maximumNumberOfStreamsPerUser: parseInt(process.env.MAX_NUMBER_OF_STREAM)
}

export function handler(event: any, context: Context) {
  handle(PostStream.action, eventSchema, inject, event, context, publicEndpoint, true, process.env.JWT_USER_SECRET,
    process.env.AUTH0_CLIENT_ID)
}


