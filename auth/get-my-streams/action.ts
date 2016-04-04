
import * as _ from "ramda"

import { Context } from "../../lib/common/typings/aws-lambda"
import { User } from "../../lib/common/typings/jwt-user"
import { Logger } from "../../lib/logger"
import { Stream } from "../../lib/common/typings/stream"

export module GetMyStreams {

  export interface Inject {
    getStreamsAuth: (streamIds: Array<string>) => Promise<Array<Stream>>
  }

  export function action(inn: Inject, event: any, context: Context, user: User): any {
    return user.streamIds.length === 0 ? [] : inn.getStreamsAuth(user.streamIds)
  }
}
