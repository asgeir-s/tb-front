import * as test from "tape"
import * as Promise from "bluebird"
import * as _ from "ramda"
import * as tv4 from "tv4"


import { Context } from "../../lib/common/typings/aws-lambda"
import { handle } from "../../lib/handler"
import { Streams } from "../../lib/common/streams"
import { DynamoDb } from "../../lib/common/aws"
import { PostSignalApi } from "./action"
import { handler, eventSchema } from "./handler"
import { JWT } from "../../lib/jwt"
import { Signals } from "../../lib/common/signals"


const DYNAMO_REGION = "us-west-2"
const DYNAMO_TABLE_STREAMS = "streams-staging"
const JWT_USER_SECRET = "jwt-secret"
const AUTH0_CLIENT_ID = "2wW6lKZgFSxjqlHgqUydE9gtkLzt6H4h"
const SIGNAL_SERVICE_URL = "http://tb-staging-signals.elasticbeanstalk.com"
const SIGNAL_SERVICE_APIKEY = "secret"

const event = require("./event.json")
const userId = "auth0|563c81e8ed40b21c524b86ea"
const apiKeyId = "e11b4d83-0514-455b-9709-1b574bad4a77"

const dynamoClient = DynamoDb.documentClientAsync(DYNAMO_REGION)

test("post-signal:", (ot) => {
  ot.plan(5)

  const inject: PostSignalApi.Inject = {
    getStreamPrivete: _.curry(Streams.getStream)(dynamoClient, DYNAMO_TABLE_STREAMS, Streams.AuthLevel.Private),
    postSignal: _.curry(Signals.postSignal)(SIGNAL_SERVICE_URL, SIGNAL_SERVICE_APIKEY)
  }

  ot.test("closes any open position (if any) before test", (t) => {
    t.plan(1)

    const SIGNALS_URL = "http://tb-staging-signals.elasticbeanstalk.com"
    const SIGNALS_APIKEY = "secret"

    Signals.postSignal(SIGNALS_URL, SIGNALS_APIKEY, "test-grid", "09686c80-30fc-4c85-8403-2721e928ce5f", 0)
      .then(() => t.equal(1, 1))
      .catch((e: Error) => t.equal(e.message.indexOf("duplicate") > -1, true))
  })

  ot.test("- test event schema", (t) => {
    t.plan(2)

    t.equal(tv4.validate(event, eventSchema), true)
    t.equal(tv4.validate({ "field": "fake" }, eventSchema), false)
  })

  ot.test("- should return 'duplicate', when the signal is the same as the last signal", (t) => {
    t.plan(10)

    PostSignalApi.action(inject, event, <Context>{ awsRequestId: "test-request" }, userId, apiKeyId)
      .then(responds => {
        const signals = responds.data
        t.equal(signals.length, 1, "should return one signal")
        t.equal(signals[0].signal, 1, "the signal should be 'LONG'")
        t.equal(_.has("timestamp", signals[0]), true, "should have the attribute")
        t.equal(_.has("price", signals[0]), true, "should have the attribute")
        t.equal(_.has("change", signals[0]), true, "should have the attribute")
        t.equal(_.has("id", signals[0]), true, "should have the attribute")
        t.equal(_.has("signal", signals[0]), true, "should have the attribute")
        t.equal(_.has("changeInclFee", signals[0]), true, "should have the attribute")
        t.equal(_.has("value", signals[0]), true, "should have the attribute")
        t.equal(_.has("valueInclFee", signals[0]), true, "should have the attribute")
      })
  })

  ot.test("- should return 'duplicate', when the signal is the same as the last signal", (t) => {
    t.plan(3)

    PostSignalApi.action(inject, event, <Context>{ awsRequestId: "test-request" }, userId, apiKeyId)
      .then(responds => {
        t.equal(responds.statusCode, 409, "should returne statusCode 409")
        t.equal(responds.success, false, "should not be succesfull")
        t.equal(responds.data.indexOf("duplicate") > -1, true, "should returne data with 'duplicate' message")
      })
  })

  ot.test("- a valide 'reverse position' signals should return the signal info", (t) => {
    t.plan(19)

    const newEvent = _.clone(event)
    newEvent.tradeSignal = -1

    PostSignalApi.action(inject, newEvent, <Context>{ awsRequestId: "test-request" }, userId, apiKeyId)
      .then(responds => {
        const signals = responds.data
        t.equal(signals.length, 2, "should return two signal")
        t.equal(signals[0].signal, -1, "the signal should be 'SHORT'")
        t.equal(_.has("timestamp", signals[0]), true, "should have the attribute")
        t.equal(_.has("price", signals[0]), true, "should have the attribute")
        t.equal(_.has("change", signals[0]), true, "should have the attribute")
        t.equal(_.has("id", signals[0]), true, "should have the attribute")
        t.equal(_.has("signal", signals[0]), true, "should have the attribute")
        t.equal(_.has("changeInclFee", signals[0]), true, "should have the attribute")
        t.equal(_.has("value", signals[0]), true, "should have the attribute")
        t.equal(_.has("valueInclFee", signals[0]), true, "should have the attribute")

        t.equal(signals[1].signal, 0, "the signal should be 'CLOSE'")
        t.equal(_.has("timestamp", signals[1]), true, "should have the attribute")
        t.equal(_.has("price", signals[1]), true, "should have the attribute")
        t.equal(_.has("change", signals[1]), true, "should have the attribute")
        t.equal(_.has("id", signals[1]), true, "should have the attribute")
        t.equal(_.has("signal", signals[1]), true, "should have the attribute")
        t.equal(_.has("changeInclFee", signals[1]), true, "should have the attribute")
        t.equal(_.has("value", signals[1]), true, "should have the attribute")
        t.equal(_.has("valueInclFee", signals[1]), true, "should have the attribute")
      })
  })

})