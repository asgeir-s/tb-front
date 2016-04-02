import * as test from "tape"
import * as Promise from "bluebird"
import * as _ from "ramda"

import { Context } from "../../lib/common//typings/aws-lambda"
import { handle } from "../../lib/handler"
import { Streams } from "../../lib/common/streams"
import { DynamoDb } from "../../lib/common/aws"
import { GetStreams, Inject } from "./action"

const DYNAMO_REGION = "us-west-2"
const DYNAMO_TABLE_STREAMS = "streams-staging"

const event = require("./event.json")

const dynamoClient = DynamoDb.documentClientAsync(DYNAMO_REGION)

test("get-streams:", (ot) => {
  ot.plan(1)

  ot.test("- should get all streams with only public data", (t) => {
    t.plan(30)

    const inject: Inject = {
      getStreams: () => Streams.getAllStremsPublic(dynamoClient, DYNAMO_TABLE_STREAMS)
    }

    GetStreams.action(inject, event, <Context>{ awsRequestId: "test-request" })
      .then(responds => {
        _.take(3, responds.data).map((stream) => {
          t.equal(_.has("lastSignal", stream), false, "should not return auth fields")
          t.equal(_.has("status", stream), false, "should not return auth fields")
          t.equal(_.has("idOfLastSignal", stream), false, "should not return auth fields")
          t.equal(_.has("streamPrivate", stream), false, "should not return private fields")

          t.equal(_.has("currencyPair", stream), true, "should return public fields")
          t.equal(_.has("name", stream), true, "should return public fields")
          t.equal(_.has("stats", stream), true, "should return public fields")
          t.equal(_.has("subscriptionPriceUSD", stream), true, "should return public fields")
          t.equal(_.has("exchange", stream), true, "should return public fields")
          t.equal(_.has("id", stream), true, "should return public fields")
        })
      })
  })

})