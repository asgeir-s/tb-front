import * as test from "tape"
import * as _ from "ramda"
import * as sinon from "sinon"

import { handle } from "./handler"
import { Context } from "./common/typings/aws-lambda"
import { User } from "./common/typings/jwt-user"
import { Responds } from "./common/typings/responds"
import { JWT } from "./jwt"


test("Handler:", (ot) => {
  const JWT_SECRET = "secret33"
  const AUTH0_CLIENT_ID = "truman.net"

  ot.plan(7)

  function testAction(inject: any, event: any, context: Context, user?: User): Promise<Responds> {
    return Promise.resolve({
      "GRID": "some-grid-123",
      "statusCode": 200,
      "data": {
        "user": user ? user.email : ""
      },
      "success": true
    })
  }

  function testActionThrow(inject: any, event: any, context: Context, user?: User): Promise<Responds> {
    return new Promise<Responds>((resolve, reject) => {
      throw new Error("test error")
    })
  }

  ot.test("- for public endpint; should reject invalide event event", (t) => {
    t.plan(4)

    handle(testAction,
      {
        "title": "Example Schema",
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          }
        },
        "required": ["name"]
      }
      , {}, {}, ({
        awsRequestId: "test-grid",
        done: (err: any, res: any) => {
          t.equal(res, null)
          t.equal(err.success, false, "should not be succesfull")
          t.equal(err.statusCode, 400, "return 'bad request' statusCode")
          t.equal(err.GRID, "test-grid", "should not be succesfull")
        }
      } as any), true)
  })

  ot.test("- for public endpint; should reject when unvalide schema", (t) => {
    t.plan(4)

    handle(testAction,
      {
        "22": "Example Schema",
        "type": "O33",
        "pres": {
          "nme": {
            "tye": "string"
          }
        },
        "quid": "name}"
      }
      , {}, {}, ({
        awsRequestId: "test-grid",
        done: (err: any, res: any) => {
          t.equal(res, null)
          t.equal(err.success, false, "should not be succesfull")
          t.equal(err.statusCode, 400, "return 'bad request' statusCode")
          t.equal(err.GRID, "test-grid", "should return the GRID that is returned when testAction does not run")
        }
      } as any), true)
  })

  ot.test("- for public endpint; should run succesfull when all is OK", (t) => {
    t.plan(2)

    handle(testAction,
      {
        "title": "Example Schema",
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          }
        },
        "required": ["name"]
      }
      , {}, { "name": "Asgeir" }, ({
        awsRequestId: "test-grid",
        done: (err: any, res: any) => {
          t.equal(err, null)
          t.deepEqual(res, { "user": "" }, "should be succesfull")
        }
      } as any), true)
  })

  ot.test("- for not public endpint; should not authenticate with fake JWT", (t) => {
    t.plan(4)

    handle(testAction,
      {
        "title": "Example Schema",
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "jwt": {
            "type": "string"
          }
        },
        "required": ["jwt", "name"]
      }
      , {
        userFromJwt: _.curry(JWT.getUser)(JWT_SECRET, AUTH0_CLIENT_ID)
      }, {
        "name": "Asgeir",
        "jwt": "fake"
      }, ({
        awsRequestId: "test-grid",
        done: (err: any, res: any) => {
          t.equal(res, null)
          t.equal(err.success, false, "should not be succesfull")
          t.equal(err.statusCode, 403, "should return unautorized statusCode")
          t.equal(err.GRID, "test-grid", "should return the GRID that is returned when testAction does not run")
        }
      } as any), false)
  })

  ot.test("- for not public endpint; should not authenticate with expired JWT", (t) => {
    t.plan(4)

    handle(testAction,
      {
        "title": "Example Schema",
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "jwt": {
            "type": "string"
          }
        },
        "required": ["jwt", "name"]
      }
      , {
        userFromJwt: _.curry(JWT.getUser)(JWT_SECRET, AUTH0_CLIENT_ID)
      }, {
        "name": "Asgeir",
        "jwt": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InRlc3RAZW1zaWwuY29tIiwidXNlcl9pZCI6IjEyMyIsImFwcF9tZXRhZGF0YSI6eyJzdHJlYW0tMTQ1NDI5MjE4MDI5MCI6ImVlMWNjMTRiLTNhZDYtNDg2OC05MjllLTYzNjVkMTcxN2U5YSIsInN0cmVhbS0xNDU0NzAzNjE3ODc2IjoiNTY4NDNiYTMtMDU4MS00YWJkLWJlMDUtNzZhZTM4MjA3Njg3In0sImlzcyI6InRyYWRlcnNiaXQuY29tIiwic3ViIjoidGVzdCIsImF1ZCI6InRydW1hbi5uZXQiLCJleHAiOjEzNTk2OTQ3NTgsImlhdCI6MTQ1NDI5MjE4MH0.5yao1BEhVxj6sWfoaOPFH92rn1WQquXZe9n2egLaOyE"
      }, ({
        awsRequestId: "test-grid",
        done: (err: any, res: any) => {
          t.equal(res, null)
          t.equal(err.success, false, "should not be succesfull")
          t.equal(err.statusCode, 403, "should return unautorized statusCode")
          t.equal(err.GRID, "test-grid", "should return the GRID that is returned when testAction does not run")
        }
      } as any), false)
  })

  ot.test("- for public endpint; should return internal server error when the action throws an error", (t) => {
    t.plan(4)

    handle(testActionThrow,
      {
        "title": "Example Schema",
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          }
        },
        "required": ["name"]
      }
      , {}, { "name": "Asgeir" }, ({
        awsRequestId: "test-grid",
        done: (err: any, res: any) => {
          t.equal(res, null)
          t.equal(err.success, false, "should not be succesfull")
          t.equal(err.statusCode, 500, "should return 'internal server error' statusCode")
          t.equal(err.GRID, "test-grid", "should return the GRID that is returned when testAction does not run")
        }
      } as any), true)
  })

  ot.test("- for not public endpint; should authenticate with right JWT", (t) => {
    t.plan(2)

    handle(testAction,
      {
        "title": "Example Schema",
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "jwt": {
            "type": "string"
          }
        },
        "required": ["jwt", "name"]
      }
      , {
        userFromJwt: _.curry(JWT.getUser)(JWT_SECRET, AUTH0_CLIENT_ID)
      }, {
        "name": "Asgeir",
        "jwt": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InRlc3RAZW1zaWwuY29tIiwidXNlcl9pZCI6IjEyMyIsImFwcF9tZXRhZGF0YSI6eyJzdHJlYW0tMTQ1NDI5MjE4MDI5MCI6ImVlMWNjMTRiLTNhZDYtNDg2OC05MjllLTYzNjVkMTcxN2U5YSIsInN0cmVhbS0xNDU0NzAzNjE3ODc2IjoiNTY4NDNiYTMtMDU4MS00YWJkLWJlMDUtNzZhZTM4MjA3Njg3In0sImlzcyI6InRyYWRlcnNiaXQuY29tIiwic3ViIjoidGVzdCIsImF1ZCI6InRydW1hbi5uZXQiLCJleHAiOjM0NTk2OTQ3NTgsImlhdCI6MTQ1NDI5MjE4MH0.D98TWRJp7l4yZ5_ovaNWN8xSnlBbwdEw5g6IXo7EH6c"
      }, ({
        awsRequestId: "test-grid",
        done: (err: any, res: any) => {
          t.equal(err, null)
          t.equal(res.user, "test@emsil.com", "should get the user correctly")
        }
      } as any), false)
  })

})