import * as test from "tape"
import * as Promise from "bluebird"
import * as _ from "ramda"
import * as tv4 from "tv4"


import { Context } from "../../lib/common//typings/aws-lambda"
import { handle } from "../../lib/handler"
import { Streams, AuthLevel } from "../../lib/common/streams"
import { DynamoDb } from "../../lib/common/aws"
import { PostSubscribe, Inject } from "./action"
import { eventSchema } from "./handler"
import { Signals } from "../../lib/common/signals"
import { Subscription } from "../../lib/common/subscription"


const TB_BACK_URL = "https://86jxkw20u2.execute-api.us-west-2.amazonaws.com/dev/"

const event = require("./event.json")

test("PostSubscribe:", (ot) => {
  ot.plan(2)

  ot.test("- test event schema", (t) => {
    t.plan(2)

    t.equal(tv4.validate(event, eventSchema), true)
    t.equal(tv4.validate({ "field": "fake" }, eventSchema), false)
  })


  const inject: Inject = {
    getPaymentCode: _.curry(Subscription.getPaymentCode)(TB_BACK_URL)
  }

  ot.test("- should be able to get the paymentCode", (t) => {
    t.plan(3)
    PostSubscribe.action(inject, event, <Context>{ awsRequestId: "test-request" })
      .then(respondse => {
        t.equal(respondse.success, true, "request should be succesfull")
        t.equal(_.has("paymentCode", respondse.data), true, "should have paymentCode")
        t.equal(respondse.data.paymentCode.length > 6, true, "the paymentCode should be longer then 6 characters")
      })
  })

})
