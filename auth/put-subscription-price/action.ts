import * as Promise from "bluebird"
import * as _ from "ramda"

import { Context } from "../../lib/common/typings/aws-lambda"
import { JWT } from "../../lib/jwt"
import { User } from "../../lib/common/typings/jwt-user"
import { Logger } from "../../lib/logger"
import { Responds } from "../../lib/common/typings/responds"

export module PutSubscriptionPrice {

  export interface Inject {
    updateSubscriptionPrice: (streamId: string, newPriceUsd: number) => Promise<number>
  }

  export function action(inn: Inject, event: any, context: Context, user: User): Promise<Responds> {
    if (_.contains(event.streamId, user.streamIds)) {
      return inn.updateSubscriptionPrice(event.streamId, event.priceUsd)
        .then(newPrice => {
          return {
            "GRID": context.awsRequestId,
            "data": { "newPrice": newPrice },
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