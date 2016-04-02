import * as _ from "ramda"
import * as Promise from "bluebird"

import { Context } from "../../lib/common/typings/aws-lambda"
import { log } from "../../lib/logger"
import { Responds } from "../../lib/common/typings/responds"
import { Stream } from "../../lib/common/typings/stream"


export interface Inject {
  getStream: (streamId: string) => Promise<Stream>
}

export module GetStream {

  export function action(inn: Inject, event: any, context: Context): Promise<Responds> {
    return inn.getStream(event.streamId)
      .then(stream => {
        if (stream == null) {
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
            "data": stream,
            "success": true,
            "statusCode": 200
          }
        }
      })
  }

}