
import * as Promise from "bluebird"
import * as _ from "ramda"

import { User } from "../../lib/typings/jwt-user"
import { NewStreamRequest } from "../../lib/common/typings/new-stream-request"
import { Responds } from "../../lib/common/typings/responds"
import { Context } from "../../lib/common/typings/aws-lambda"
import { JWT } from "../../lib/jwt"
import { Streams } from "../../lib/common/streams"


export module PostStream {

  export interface Inject {
    checkJwtIsUpToDate: (user: User) => Promise<boolean>
    postToStreamService: (grid: string, newStreamRequest: NewStreamRequest) => Promise<string> // returns streamId
    addStreamToAuth0UserReturnAppData: (userId: string, streamId: string) => Promise<any>
    updateUserJwt: (user: User, newAppMetadata: any) => string
    maximumNumberOfStreamsPerUser: number
  }

  export function action(inn: Inject, event: any, context: Context, user: User): Promise<Responds> {

    if (user.streamIds.length < inn.maximumNumberOfStreamsPerUser) {
      const newStream: NewStreamRequest = event.stream
      newStream.userId = user.user_id // dirty!

      return inn.checkJwtIsUpToDate(user)
        .then(result => {
          if (result) {
            return inn.postToStreamService(context.awsRequestId, newStream)
              .then(newStreamId => inn.addStreamToAuth0UserReturnAppData(user.user_id, newStreamId)
                .then(newAppdata => {
                  return {
                    "GRID": context.awsRequestId,
                    "success": true,
                    "data": {
                      jwt: inn.updateUserJwt(user, newAppdata),
                      streamId: newStreamId
                    } as any
                  }
                })
              )
              .catch((e: Error) => (e.message.indexOf("A stream with this name already exists") > -1), error => {
                return {
                  "GRID": context.awsRequestId,
                  "success": false,
                  "data": "A stream with this name already exists",
                  "statusCode": 409
                }
              })
          }
          else {
            return {
              "GRID": context.awsRequestId,
              "success": false,
              "data": "the jwt is outdated. Sign out, then sign in again",
              "statusCode": 401
            }
          }
        })

    }
    else {
      return Promise.resolve({
        "GRID": context.awsRequestId,
        "success": false,
        "data": "user already has maximum number of streams",
        "statusCode": 403
      })
    }
  }

}