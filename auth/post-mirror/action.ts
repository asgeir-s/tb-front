import * as Promise from "bluebird"
import * as _ from "ramda"

import { Context } from "../../lib/common/typings/aws-lambda"
import { User } from "../../lib/typings/jwt-user"
import { Signals } from "../../lib/common/signals"
import { Signal } from "../../lib/common/typings/signal"
import { Responds } from "../../lib/common/typings/responds"


export module PostMirror {

  export interface Inject {
    encryptApiKey: (content: string) => string,
    addMirror: (mirror: any) => Promise<any>,
    notifyMirrorService: () => Promise<any>
  }

  export function action(inn: Inject, event: any, context: Context, user: User): Promise<Responds> {
    if (_.contains(event.streamId, user.streamIds)) {
      return inn.addMirror({
        "streamId": event.streamId,
        "apiKey": inn.encryptApiKey(event.apiKey),
        "apiSecret": inn.encryptApiKey(event.apiSecret)
      })
        .then(res => {
          return inn.notifyMirrorService()
        })
        .then(res => {
          return {
            "GRID": context.awsRequestId,
            "data": "SUCCESS: mirror added for stream with id: " + event.streamId,
            "success": true
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