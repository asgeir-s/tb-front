import * as _ from "ramda"
import * as Promise from "bluebird"

import { Context } from "../../lib/common/typings/aws-lambda"
import { log } from "../../lib/logger"
import { Responds } from "../../lib/common/typings/responds"
import { SubscriptionRequest } from "../../lib/common/typings/subscription-request"

export interface Inject {
  getPaymentCode: (GRID: string, subscriptionRequest: SubscriptionRequest) => Promise<Responds>
}

export module PostSubscribe {
  export function action(inn: Inject, event: any, context: Context): Promise<Responds> {
    return inn.getPaymentCode(context.awsRequestId, event.subscription)
  }
}