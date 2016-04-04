import * as test from "tape"
import * as Promise from "bluebird"
import * as _ from "ramda"
import * as tv4 from "tv4"


import { Context } from "../../lib/common/typings/aws-lambda"
import { handle } from "../../lib/handler"
import { Streams } from "../../lib/common/streams"
import { DynamoDb } from "../../lib/common/aws"
import { PostStream } from "./action"
import { eventSchema } from "./handler"
import { JWT } from "../../lib/jwt"
import { Auth0 } from "../../lib/auth0"

const JWT_SECRET = "jwt-secret"
const AUTH0_CLIENT_ID = "2wW6lKZgFSxjqlHgqUydE9gtkLzt6H4h"

const AUTH0_URL = "https://cluda.auth0.com"
const AUTH0_GET_USER_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJLbW8xMFFHcENPeEtIRFg2VEhKQzJzWmJlWEpYMktDbiIsInNjb3BlcyI6eyJ1c2Vyc19hcHBfbWV0YWRhdGEiOnsiYWN0aW9ucyI6WyJ1cGRhdGUiXX0sInVzZXJzIjp7ImFjdGlvbnMiOlsicmVhZCJdfX0sImlhdCI6MTQ1NDUxODQ4NywianRpIjoiMWMxZTkxNjA3ODY3ZTEyYTEwZmQ2OTVjZTYxZWYwNDgifQ.xwh6dCyidm-nxd2Q6YAZcW7K-xQvLIlZQoIHkxSOGb4"
const STREAM_SERVICE_URL = "http://tb-staging-streams.elasticbeanstalk.com"
const STREAM_SERVICE_APIKEY = "secret"
const JWT_USER_SECRET = "jwt-secret"
const MAX_NUMBER_OF_STREAM = "3"

const event = require("./event.json")

test("get-streams:", (ot) => {
  ot.plan(2)

  ot.test("- test event schema", (t) => {
    t.plan(2)

    t.equal(tv4.validate(event, eventSchema), true)
    t.equal(tv4.validate({ "field": "fake" }, eventSchema), false)
  })


  ot.test("- should get name already taken when trying to add a stream with a already used name", (t) => {
    t.plan(1)

    const inject: PostStream.Inject = {
      checkJwtIsUpToDate:
      _.curry(Auth0.checkUserAppMetadataUptodate)(AUTH0_URL, AUTH0_GET_USER_JWT),
      postToStreamService:
      _.curry(Streams.addNewStream)(STREAM_SERVICE_URL, STREAM_SERVICE_APIKEY),
      addStreamToAuth0UserReturnAppData:
      _.curry(Auth0.addStreamToAuth0UserReturnAppData)(AUTH0_URL, AUTH0_GET_USER_JWT),
      updateUserJwt: _.curry(JWT.updatedJwtWithNewAppData)(JWT_USER_SECRET),
      maximumNumberOfStreamsPerUser: parseInt(MAX_NUMBER_OF_STREAM)
    }

    PostStream.action(inject, event, <Context>{ awsRequestId: "test-request" },
      JWT.getUser(JWT_SECRET, AUTH0_CLIENT_ID, event.jwt))
      .then(responds => {
        t.equal(responds.statusCode, 409, "should retur statusCode 'Conflict'")
      })

  })

})