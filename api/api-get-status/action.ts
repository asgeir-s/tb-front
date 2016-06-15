import * as Promise from "bluebird"
import * as _ from "ramda"

import { Context } from "../../lib/common/typings/aws-lambda"

import { Signals } from "../../lib/common/signals"
import { Signal } from "../../lib/common/typings/signal"
import { Stream } from "../../lib/common/typings/stream"
import { Responds } from "../../lib/common/typings/responds"
import { log, userLog } from "../../lib/logger"


export module GetStatusApi {

  export interface Inject {
    getStreamPrivete: (streamId: string) => Promise<Stream>
    getStaus: (GRID: string, streamId: string, signalNum: number) => Promise<Array<Signal>>
  }

  export function action(inn: Inject, event: any, context: Context, userId: string,
    apiKeyId: string): Promise<Responds> {

    // get stream userId and apiKeyId from streams private
    return inn.getStreamPrivete(event.streamId)
      .then(stream => {

        // validate agaist userId and apiKeyId
        if (stream.streamPrivate.userId === userId && stream.streamPrivate.apiKeyId === apiKeyId) {

          // post signal
          return inn.getStaus(context.awsRequestId, event.streamId, event.tradeSignal)
            .then(status => {
              // success
              return {
                "GRID": context.awsRequestId,
                "data": status,
                "success": true
              }
            })
            .catch((e: Error) => {
              return {
                "GRID": context.awsRequestId,
                "data": "error",
                "statusCode": 500,
                "success": false
              }
            })
        }
        else {
          log.error("userId fro stream and userId in JWT does not match OR apiKeyId and apiKeyID in JWT" +
            "does not match", {
              "streamIdJWT": userId,
              "streamIdStream": stream.streamPrivate.userId,
              "apiKeyIDJWT": apiKeyId,
              "apiKeyIDStream": stream.streamPrivate.apiKeyId
            })
          return {
            "GRID": context.awsRequestId,
            "data": "wrong apiKey",
            "success": false,
            "statusCode": 401
          }

        }
      })
      .catch((error: Error) => {
        log.exception("unknow exception", error)
        return {
          "GRID": context.awsRequestId,
          "statusCode": 500,
          "data": "internal server error",
          "success": false
        }
      })
  }
}
