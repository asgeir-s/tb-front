import * as test from "tape"
import * as Promise from "bluebird"
import * as _ from "ramda"
import * as tv4 from "tv4"


import { Context } from "../../lib/common//typings/aws-lambda"
import { handle } from "../../lib/handler"
import { Streams, AuthLevel } from "../../lib/common/streams"
import { DynamoDb } from "../../lib/common/aws"
import { GetStream, Inject } from "./action"
import { eventSchema } from "./handler"


const DYNAMO_REGION = "us-west-2"
const DYNAMO_TABLE_STREAMS = "streams-staging"

const event = require("./event.json")

const dynamoClient = DynamoDb.documentClientAsync(DYNAMO_REGION)

test("get-streams:", (ot) => {
  ot.plan(3)

  ot.test("- test event schema", (t) => {
    t.plan(2)

    t.equal(tv4.validate(event, eventSchema), true)
    t.equal(tv4.validate({ "field": "fake" }, eventSchema), false)
  })


  ot.test("- should get one stream with only public data", (t) => {
    t.plan(10)

    const inject: Inject = {
      getStream: _.curry(Streams.getStream)(dynamoClient, DYNAMO_TABLE_STREAMS, AuthLevel.Public)
    }

    GetStream.action(inject, event, <Context>{ awsRequestId: "test-request" })
      .then(responds => {
        const stream = responds.data
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

  ot.test("- should return 404 when stream does not exist", (t) => {
    t.plan(3)

    const inject: Inject = {
      getStream: _.curry(Streams.getStream)(dynamoClient, DYNAMO_TABLE_STREAMS, AuthLevel.Public)
    }

    GetStream.action(inject, { "streamId": "fake" }, <Context>{ awsRequestId: "test-request" })
      .then(responds => {
        t.equal(responds.statusCode, 404, "should return not found")
        t.equal(responds.success, false, "should return not success")
        t.equal(responds.data, "Not Found", "should return not found")
      })
  })

})