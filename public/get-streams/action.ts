import * as _ from "ramda"
import * as Promise from "bluebird"

import { Context } from "../../lib/common/typings/aws-lambda"
import { log } from "../../lib/logger"
import { Responds } from "../../lib/common/typings/responds"
import { Stream } from "../../lib/common/typings/stream"

export module GetStreams {

  export interface Inject {
    getStreams: () => Promise<Array<Stream>>
  }

  export function action(inn: Inject, event: any, context: Context): Promise<Responds> {
    return inn.getStreams()
      .then(streams => {
        return {
          "GRID": context.awsRequestId,
          "data": streams,
          "success": true,
          "statusCode": 200
        }
      })
  }

}