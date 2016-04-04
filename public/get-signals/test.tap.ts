import * as test from "tape"
import * as Promise from "bluebird"
import * as _ from "ramda"
import * as tv4 from "tv4"


import { Context } from "../../lib/common//typings/aws-lambda"
import { handle } from "../../lib/handler"
import { Streams } from "../../lib/common/streams"
import { DynamoDb } from "../../lib/common/aws"
import { GetSignals } from "./action"
import { eventSchema } from "./handler"
import { Signals } from "../../lib/common/signals"


const SIGNALS_URL = "http://tb-staging-signals.elasticbeanstalk.com"
const SIGNALS_APIKEY = "secret"

const event = require("./event.json")

test("get-streams:", (ot) => {
  ot.plan(3)

  ot.test("- test event schema", (t) => {
    t.plan(2)

    t.equal(tv4.validate(event, eventSchema), true)
    t.equal(tv4.validate({ "field": "fake" }, eventSchema), false)
  })


  const inject: GetSignals.Inject = {
    getSignals: _.curry(Signals.getClosedSignals)(SIGNALS_URL, SIGNALS_APIKEY)
  }

  ot.test("- should be able to get all closed signals", (t) => {
    t.plan(2)
    GetSignals.action(inject, event, <Context>{ awsRequestId: "test-request" })
      .then(respondse => {
        const signals = respondse.data
        t.equal(signals.length > 0, true, "some signals should be returned")
        t.equal(signals[0].signal, 0, "last signal should be CLOSE") // newest signal is first
      })
  })

  ot.test("- should return empety array when not found", (t) => {
    t.plan(1)

    GetSignals.action(inject, { "streamId": "fake-oo" },
      <Context>{ awsRequestId: "test-request" })
      .then(respondse => {
        const signals = respondse.data
        t.equal(signals.length, 0, "empety ")
      })
  })

})