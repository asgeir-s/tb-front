import * as test from "tape"
import * as Promise from "bluebird"
import * as _ from "ramda"
import * as tv4 from "tv4"


import { Context } from "../../lib/common/typings/aws-lambda"
import { handle } from "../../lib/handler"
import { Streams } from "../../lib/common/streams"
import { DynamoDb } from "../../lib/common/aws"
import { GetMyStreams } from "./action"
import { eventSchema } from "./handler"
import { JWT } from "../../lib/jwt"


const DYNAMO_REGION = "us-west-2"
const DYNAMO_TABLE_STREAMS = "streams-staging"
const JWT_SECRET = "jwt-secret"
const AUTH0_CLIENT_ID = "2wW6lKZgFSxjqlHgqUydE9gtkLzt6H4h"

const event = {
    "jwt": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiYXV0aDB8NTZiMjMwMjBmOTcxYjE2MjA1NTY0MGMzIiwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJhcHBfbWV0YWRhdGEiOnsic3RyZWFtLTE0NTQ1Mjg5MDgxODYiOiIwOTY4NmM4MC0zMGZjLTRjODUtODQwMy0yNzIxZTkyOGNlNWYifSwiaXNzIjoiaHR0cHM6Ly9jbHVkYS5hdXRoMC5jb20vIiwic3ViIjoiYXV0aDB8NTZiMjMwMjBmOTcxYjE2MjA1NTY0MGMzIiwiYXVkIjoiMndXNmxLWmdGU3hqcWxIZ3FVeWRFOWd0a0x6dDZINGgiLCJleHAiOjU0NTQ1NTY2NzcsImlhdCI6MTQ1NDUyMDY3N30._oDtTyLH1_4YPZPsxL2LT0Kcwr8GDfFoKqZKifGYG8Y"
}

const dynamoClient = DynamoDb.documentClientAsync(DYNAMO_REGION)

test("get-my-streams:", (ot) => {
  ot.plan(2)

  ot.test("- test event schema", (t) => {
    t.plan(2)

    t.equal(tv4.validate(event, eventSchema), true)
    t.equal(tv4.validate({ "field": "fake" }, eventSchema), false)
  })


  ot.test("- should get one stream with only public data", (t) => {
    t.plan(10)

    const inject: GetMyStreams.Inject = {
      getStreamsAuth: _.curry(Streams.getStreams)(dynamoClient, DYNAMO_TABLE_STREAMS,
        Streams.AuthLevel.Auth)
    }

    GetMyStreams.action(inject, event, <Context>{ awsRequestId: "test-request" },
      JWT.getUser(JWT_SECRET, AUTH0_CLIENT_ID, event.jwt))
      .then(responds => {
        const firstStream = responds.data[0]
        t.equal(_.has("streamPrivate", firstStream), false, "should not return private fields")

        t.equal(_.has("currencyPair", firstStream), true, "should return public fields")
        t.equal(_.has("name", firstStream), true, "should return public fields")
        t.equal(_.has("stats", firstStream), true, "should return public fields")
        t.equal(_.has("subscriptionPriceUSD", firstStream), true, "should return public fields")
        t.equal(_.has("exchange", firstStream), true, "should return public fields")
        t.equal(_.has("id", firstStream), true, "should return public fields")
        t.equal(_.has("lastSignal", firstStream), true, "should return auth fields")
        t.equal(_.has("status", firstStream), true, "should return auth fields")
        t.equal(_.has("idOfLastSignal", firstStream), true, "should return auth fields")
      })
  })

})