import * as test from "tape"
import * as Promise from "bluebird"
import * as _ from "ramda"
import * as tv4 from "tv4"


import { Context } from "../../lib/common/typings/aws-lambda"
import { handle } from "../../lib/handler"
import { Streams } from "../../lib/common/streams"
import { DynamoDb } from "../../lib/common/aws"
import { GetApiKey } from "./action"
import { eventSchema } from "./handler"
import { JWT } from "../../lib/jwt"


const DYNAMO_REGION = "us-west-2"
const DYNAMO_TABLE_STREAMS = "streams-staging"
const JWT_USER_SECRET = "jwt-secret"
const AUTH0_CLIENT_ID = "2wW6lKZgFSxjqlHgqUydE9gtkLzt6H4h"

const event = require("./event.json")

const dynamoClient = DynamoDb.documentClientAsync(DYNAMO_REGION)

test("get-api-key:", (ot) => {
  ot.plan(3)

  const inject: GetApiKey.Inject = {
    getApiKeyId: _.curry(Streams.getApiKeyId)(dynamoClient, DYNAMO_TABLE_STREAMS),
    generateApiKey: _.curry(JWT.createApiKey)(JWT_USER_SECRET)
  }

  ot.test("- test event schema", (t) => {
    t.plan(2)

    t.equal(tv4.validate(event, eventSchema), true)
    t.equal(tv4.validate({ "field": "fake" }, eventSchema), false)
  })

  ot.test("- should be able to get api key (jwt)", (t) => {
    t.plan(2)

    GetApiKey.action(inject, event, <Context>{ awsRequestId: "test-request" },
      JWT.getUser(JWT_USER_SECRET, AUTH0_CLIENT_ID, event.jwt))
      .then(responds => {
        t.equal(responds.success, true, "the request should be succesfull")
        t.equal(responds.data.apiKey.length > 50, true, "should return an api key")
      })
  })

  ot.test("- should not be able to operate on stream that the user is not the owner of", t => {
    t.plan(3)

    const newEvent = _.clone(event)
    newEvent.streamId = "919408ee-920e-425b-a86e-687bf8adc50c"

    GetApiKey.action(inject, newEvent, <Context>{ awsRequestId: "test-request" },
      JWT.getUser(JWT_USER_SECRET, AUTH0_CLIENT_ID, event.jwt))
      .then(responds => {
        t.equal(responds.success, false, "the request should NOT be succesfull")
        t.equal(responds.data.indexOf("not the owner of this stream") > -1, true,
          "should return message about 'not the owner of this stream'")
        t.equal(responds.statusCode, 401, "should return Unauthorized statuscode")
      })
  })

})