import * as Promise from "bluebird"
import * as _ from "ramda"

import { Context } from "../../lib/common/typings/aws-lambda"
import { JWT } from "../../lib/jwt"
import { User } from "../../lib/typings/jwt-user"
import { Logger } from "../../lib/logger"
import { Responds } from "../../lib/common/typings/responds"

export module GetApiKey {

  export interface Inject {
    getApiKeyId: (streamId: string) => Promise<string>
    generateApiKey: (user: User, streamId: string, apiKeyId: string) => string
  }

  export function action(inn: Inject, event: any, context: Context, user: User): Promise<Responds> {
    if (_.contains(event.streamId, user.streamIds)) {
      return inn.getApiKeyId(event.streamId)
        .then(apiKeyId => inn.generateApiKey(user, apiKeyId, event.streamId))
        .then(apiKey => {
          return {
            "GRID": context.awsRequestId,
            "data": { "apiKey": apiKey },
            "success": true,
          }
        })
    }
    else {
      return Promise.resolve({
        "GRID": context.awsRequestId,
        "data": "the current user is not the owner of this stream",
        "success": false,
        "statusCode": 401
      })
    }
  }
}