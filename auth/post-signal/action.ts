import * as Promise from "bluebird"
import * as _ from "ramda"

import { Context } from "../../lib/common/typings/aws-lambda"

import { User } from "../../lib/typings/jwt-user"
import { Signals } from "../../lib/common/signals"
import { Signal } from "../../lib/common/typings/signal"
import { Responds } from "../../lib/common/typings/responds"


export module PostSignal {

  export interface Inject {
    postSignal: (GRID: string, streamId: string, signalNum: number) => Promise<Array<Signal>>
  }

  export function action(inn: Inject, event: any, context: Context, user: User): Promise<Responds> {
    if (_.contains(event.streamId, user.streamIds)) {
      return inn.postSignal(context.awsRequestId, event.streamId, event.signal)
        .then(signals => {
          return {
            "GRID": context.awsRequestId,
            "data": signals,
            "success": true,
          }
        })
        .catch((e: Error) => e.message.indexOf("duplicate") > -1, error => {
          return {
            "GRID": context.awsRequestId,
            "data": "duplicate. Same as last signal",
            "statusCode": 409,
            "success": false
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
