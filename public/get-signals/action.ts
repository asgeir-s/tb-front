import * as _ from "ramda"
import * as Promise from "bluebird"

import { Context } from "../../lib/common/typings/aws-lambda"
import { log } from "../../lib/logger"
import { Responds } from "../../lib/common/typings/responds"
import { Signal } from "../../lib/common/typings/signal"


export interface Inject {
  getSignals: (GROD: string, streamId: string) => Promise<Array<Signal>>
}

export module GetSignals {

  export function action(inn: Inject, event: any, context: Context): Promise<Responds> {
    return inn.getSignals(context.awsRequestId, event.streamId)
      .then(signals => {
        if (signals == null) {
        return {
          "GRID": context.awsRequestId,
          "data": "Not Found",
          "success": false,
          "statusCode": 404
        }
        }
        else {
          return {
            "GRID": context.awsRequestId,
            "data": signals,
            "success": true,
            "statusCode": 200
          }
        }
      })
  }
}