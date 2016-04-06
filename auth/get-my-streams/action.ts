
import * as _ from "ramda"

import { Context } from "../../lib/common/typings/aws-lambda"
import { User } from "../../lib/typings/jwt-user"
import { Logger } from "../../lib/logger"
import { Stream } from "../../lib/common/typings/stream"
import { Responds } from "../../lib/common/typings/responds"

export module GetMyStreams {

  export interface Inject {
    getStreamsAuth: (streamIds: Array<string>) => Promise<Array<Stream>>
  }

  export function action(inn: Inject, event: any, context: Context, user: User): Promise<Responds> {

    if (_.isEmpty(user.streamIds)) {
      return Promise.resolve({
        "GRID": context.awsRequestId,
        "data": [],
        "success": true,
      })
    }
    else {
      return inn.getStreamsAuth(user.streamIds)
        .then(streams => {
          return {
            "GRID": context.awsRequestId,
            "data": streams,
            "success": true,
          }
        })
    }
  }
}
