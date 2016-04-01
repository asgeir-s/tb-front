import * as test from "tape"
import * as _ from "ramda"
import * as sinon from "sinon"

import { JWT } from "./jwt"
import { User } from "./typings/user"



test("JWT:", (ot) => {
  ot.plan(2)

  const secret = "secret"
  const auth0ClientID = "test"
  const user: User = {
    "email": "test@emsil.com",
    "user_id": "123",
    "app_metadata": {
      "stream-1454292180290": "ee1cc14b-3ad6-4868-929e-6365d1717e9a",
      "stream-1454703617876": "56843ba3-0581-4abd-be05-76ae38207687"
    },
    "iss": "test",
    "sub": "test",
    "aud": auth0ClientID,
    "exp": 2454292180,
    "iat": 1454292180,
    "streamIds": ["ee1cc14b-3ad6-4868-929e-6365d1717e9a", "56843ba3-0581-4abd-be05-76ae38207687"]
  }

  ot.test("- should be able to sign a user and verify it", (t) => {
    t.plan(7)
    const jwt = JWT.signUser(secret, user)
    const gittenUser = JWT.getUser(secret, auth0ClientID, jwt)

    t.deepEqual(gittenUser.app_metadata, user.app_metadata, "should not change")
    t.deepEqual(gittenUser.aud, user.aud, "should not change")
    t.deepEqual(gittenUser.email, user.email, "should not change")
    t.deepEqual(gittenUser.exp, user.exp, "should not change")
    t.deepEqual(gittenUser.streamIds, user.streamIds, "should not change")

    t.isNotDeepEqual(gittenUser.iat, user.iat, "should change")
    t.isNotDeepEqual(gittenUser.iss, user.iss, "should change")
  })

  ot.test("- should be not be able to sign a user and verify it with wrong secret", (t) => {
    t.plan(1)
    const jwt = JWT.signUser(secret, user)
    t.throws(() => JWT.getUser("wrong", auth0ClientID, jwt), "should throw exception when secret is wrong")
  })

})