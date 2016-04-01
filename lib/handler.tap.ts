import * as test from "tape"
import * as _ from "ramda"
import * as sinon from "sinon"

import { Handler } from "./handler"
import { Context } from "./typings/aws-lambda"
import { User } from "./typings/user"
import { Response } from "./typings/response"



test("Handler:", (ot) => {
  ot.plan(2)

  function testAction(inject: any, event: any, context: Context, user?: User): Promise<Response> {
    return Promise.resolve({
      "GRID": "some-grid-123",
      "statusCode": 403,
      "data": "Could not authenticate. Please, include the GRID when contacting support.",
      "success": false
    })
  }

  ot.test("- should be able to handle unvalide event", (t) => {
    t.plan(3)

    Handler.handle(testAction,
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
          t.equal(err.success, false, "should not be succesfull")
          t.equal(err.statusCode, 400, "should not be succesfull")
          t.equal(err.GRID, "test-grid", "should not be succesfull")
        }
      } as any))
  })

  ot.test("- should be able to handle unvalide schema", (t) => {
    t.plan(3)

    Handler.handle(testAction,
      {
        "tile": "Example Schema",
        "typ": "object",
        "prperties": {
          "nme": {
            "tye": "string"
          }
        },
        "requid": ["name"]
      }
      , {}, {}, ({
        awsRequestId: "test-grid",
        done: (err: any, res: any) => {
          t.equal(err.success, false, "should not be succesfull")
          t.equal(err.statusCode, 500, "should not be succesfull")
          t.equal(err.GRID, "test-grid", "should not be succesfull")
        }
      } as any))
  })
})

/** 
import * as R from 'ramda'
import * as chai from 'chai'

import { Executor } from './executor'
import { TestData, Mock } from './test-util'

const expect = chai.expect;
const executor = R.curry(Executor.run)(Mock.action, Mock.eventSchema, 'fake-GRID')

describe('get-apikey', function() {
  this.timeout(6000);

  describe('event with valide JWT', () => {
    it('should return success: mock', (done) => {
      executor({
        "jwt": TestData.valideJwt,
        "test": "data"
      }, (error: any, success: any) => {
        expect(error).to.equal(null)
        expect(success).to.equal('mock')
        done()
      })
    })
  })

  describe('event with invalide JWT', () => {
    it('should return an error', (done) => {
      executor({
        "jwt": TestData.invalideJwt,
        "test": "data"
      }, (err: any, succ: any) => {
        expect(succ).to.equal(null)
        expect(JSON.parse(err).message).to.equal('Could not authenticate. Pleas, include the request id when contacting support.')
        done()
      })
    })
  })

  describe('event with expired JWT', () => {
    it('should return an error', (done) => {
      executor({
        "jwt": TestData.expiredJWT,
        "test": "data"
      }, (err: any, succ: any) => {
        expect(succ).to.equal(null)
        expect(JSON.parse(err).message).to.equal('Could not authenticate. Pleas, include the request id when contacting support.')
        done()
      })
    })
  })

  describe('event with valide JWT, but invalide json format', () => {
    it('should return an error', (done) => {
      executor({
        "jwt": TestData.expiredJWT,
        "test": "data",
        "www": 22
      }, (err: any, succ: any) => {
        expect(succ).to.equal(null)
        expect(JSON.parse(err).message).to.equal('Invalide json format.')
        done()
      })
    })
  })

  describe('action that throws ReturnToUserError', () => {
    it('should return the error to the user', (done) => {
      Executor.run(Mock.actionThrowingReturnToUserError, Mock.eventSchema, 'fake-GRID', {
        "jwt": TestData.valideJwt,
        "test": "data"
      }, (err: any, succ: any) => {
        expect(succ).to.equal(null)
        expect(JSON.parse(err).message).to.contain('ReturnToUserError-mock-error')
        done()
      })
    })
  })

  describe('action that throws unknown error', () => {
    it('should return a standard error to the user', (done) => {
      Executor.run(Mock.actionThrowingReturnToUserError, Mock.eventSchema, 'fake-GRID', {
        "jwt": TestData.valideJwt,
        "test": "data"
      }, (err: any, succ: any) => {
        expect(succ).to.equal(null)
        expect(JSON.parse(err).message).to.equal('Unknown error. Pleas, include the request id when contacting support.')
        done()
      })
    })
  })

  describe('action that rejects with boolean, true,', () => {
    it('should return a standard error to the user', (done) => {
      Executor.run(Mock.actionRejectWithBooll, Mock.eventSchema, 'fake-GRID', {
        "jwt": TestData.valideJwt,
        "test": "data"
      }, (err: any, succ: any) => {
        expect(succ).to.equal(null)
        expect(JSON.parse(err).message).to.equal('Unknown error. Pleas, include the request id when contacting support.')
        done()
      })
    })
  })

  describe('action that rejects with unknown error', () => {
    it('should return a standard error to the user', (done) => {
      Executor.run(Mock.actionRejectWithError, Mock.eventSchema, 'fake-GRID', {
        "jwt": TestData.valideJwt,
        "test": "data"
      }, (err: any, succ: any) => {
        expect(succ).to.equal(null)
        expect(JSON.parse(err).message).to.equal('Unknown error. Pleas, include the request id when contacting support.')
        done()
      })
    })
  })

})
*/