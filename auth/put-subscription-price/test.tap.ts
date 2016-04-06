import * as test from "tape"
import * as Promise from "bluebird"
import * as _ from "ramda"
import * as tv4 from "tv4"


import { Context } from "../../lib/common/typings/aws-lambda"
import { handle } from "../../lib/handler"
import { Streams } from "../../lib/common/streams"
import { DynamoDb } from "../../lib/common/aws"
import { PutSubscriptionPrice } from "./action"
import { eventSchema } from "./handler"
import { JWT } from "../../lib/jwt"


const DYNAMO_REGION = "us-west-2"
const DYNAMO_TABLE_STREAMS = "streams-staging"
const JWT_USER_SECRET = "jwt-secret"
const AUTH0_CLIENT_ID = "2wW6lKZgFSxjqlHgqUydE9gtkLzt6H4h"

const event = {
  "jwt": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiYXV0aDB8NTZiMjMwMjBmOTcxYjE2MjA1NTY0MGMzIiwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJhcHBfbWV0YWRhdGEiOnsic3RyZWFtLTE0NTQ1Mjg5MDgxODYiOiIwOTY4NmM4MC0zMGZjLTRjODUtODQwMy0yNzIxZTkyOGNlNWYifSwiaXNzIjoiaHR0cHM6Ly9jbHVkYS5hdXRoMC5jb20vIiwic3ViIjoiYXV0aDB8NTZiMjMwMjBmOTcxYjE2MjA1NTY0MGMzIiwiYXVkIjoiMndXNmxLWmdGU3hqcWxIZ3FVeWRFOWd0a0x6dDZINGgiLCJleHAiOjU0NTQ1NTY2NzcsImlhdCI6MTQ1NDUyMDY3N30._oDtTyLH1_4YPZPsxL2LT0Kcwr8GDfFoKqZKifGYG8Y",
  "streamId": "09686c80-30fc-4c85-8403-2721e928ce5f",
  "priceUsd": 9.9
}

const dynamoClient = DynamoDb.documentClientAsync(DYNAMO_REGION)

test("put-subscription-price:", (ot) => {
  ot.plan(3)

  const inject: PutSubscriptionPrice.Inject = {
    updateSubscriptionPrice: _.curry(Streams.updateSubscriptionPrice)(dynamoClient, DYNAMO_TABLE_STREAMS)
  }

  ot.test("- test event schema", (t) => {
    t.plan(2)

    t.equal(tv4.validate(event, eventSchema), true)
    t.equal(tv4.validate({ "field": "fake" }, eventSchema), false)
  })


  ot.test("- should be able to update the subscription price", (t) => {
    t.plan(2)



    PutSubscriptionPrice.action(inject, event, <Context>{ awsRequestId: "test-request" },
      JWT.getUser(JWT_USER_SECRET, AUTH0_CLIENT_ID, event.jwt))
      .then(responds => {
        t.equal(responds.success, true, "the request should be succesfull")
        t.equal(responds.data.newPrice, 9.9, "should return the new price")
      })
  })

  ot.test("- should not be able to operate on stream that the user is not the owner of", t => {
    t.plan(3)

    const newEvent = _.clone(event)
    newEvent.streamId = "919408ee-920e-425b-a86e-687bf8adc50c"

    PutSubscriptionPrice.action(inject, newEvent, <Context>{ awsRequestId: "test-request" },
      JWT.getUser(JWT_USER_SECRET, AUTH0_CLIENT_ID, event.jwt))
      .then(responds => {
        t.equal(responds.success, false, "the request should NOT be succesfull")
        t.equal(responds.data.indexOf("not the owner of this stream") > -1, true,
          "should return message about 'not the owner of this stream'")
        t.equal(responds.statusCode, 401, "should return Unauthorized statuscode")
      })
  })

})