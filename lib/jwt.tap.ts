/** 
import * as R from 'ramda'
import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import * as tv4 from 'tv4'

import { TestData, Mock, actionRunner } from './test-util'
import { JWT } from '../lib/jwt'
import { User } from './typings/user'

chai.use(chaiAsPromised);
const expect = chai.expect

describe('JWT', () => {

  describe('validateJwt', () => {
    it('should be rejected when token and secret not match', () => {
      return expect(JWT.getUser('jwt-secret', '2wW6lKZgFSxjqlHgqUydE9gtkLzt6H4h', 'tokenfdsafdas')).to.be.rejected;
    })
//err
    it('should resolve correctly when JWT is valide', () => {
      return expect(JWT.getUser('jwt-secret', '2wW6lKZgFSxjqlHgqUydE9gtkLzt6H4h', TestData.valideJwt)).to.eventually.have.property("app_metadata")
    })

    it('should reject unvalid JWT', () => {
      expect(JWT.getUser('jwt-secret', '2wW6lKZgFSxjqlHgqUydE9gtkLzt6H4h', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoic29nYXNnQGdtYWlsLmNvbSIsImVtYWlsIjoic29nYXNnQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhcHBfbWV0YWRhdGEiOnsic3RyZWFtLTE0NTQ1MjA2MDYzNzUiOiJmZHNhZmRzYS1mZHNhZmRzYS1mZHNhZmRzYSJ9LCJpc3MiOiJodHRwczovL2NsdWRhLmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHw1NjNjODFlOGVkNDBiMjFjNTI0Yjg2ZWEiLCJhdWQiOiI3Vk5TMlRjMklpUUIyUHZqVUJjYjU3NDRxSDllWTdpQiIsImV4cCI6MzQ0OTcwMjA2MiwiaWF0IjoxNDQ5NjY2MDYyfQ.ABRSrDgO39J9g8yJTCu1XCIJ8Bq3FyCs8UmhGCqBnW0')).to.be.rejected;
    })

    it('should be rejected when token is expired', () => {
      expect(JWT.getUser('jwt-secret', '2wW6lKZgFSxjqlHgqUydE9gtkLzt6H4h', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoic29nYXNnQGdtYWlsLmNvbSIsImVtYWlsIjoic29nYXNnQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhcHBfbWV0YWRhdGEiOnsic3RyZWFtLTE0NTQ1MjA2MDYzNzUiOiJmZHNhZmRzYS1mZHNhZmRzYS1mZHNhZmRzYSJ9LCJpc3MiOiJodHRwczovL2NsdWRhLmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHw1NjNjODFlOGVkNDBiMjFjNTI0Yjg2ZWEiLCJhdWQiOiI3Vk5TMlRjMklpUUIyUHZqVUJjYjU3NDRxSDllWTdpQiIsImV4cCI6MTQ0OTcwMjA2MiwiaWF0IjoxNDQ5NjY2MDYyfQ.CYedVa86K2ZXBX9EaWBd91mVp94PGw68yOMcLrhwd6U')).to.be.rejected;
    })
//err
    it('should list a users streams', () => {
      return JWT.getUser('jwt-secret', '2wW6lKZgFSxjqlHgqUydE9gtkLzt6H4h', TestData.valideJwt)
      .then((user: User) => {
        expect(user.streamIds[0]).to.equal("09686c80-30fc-4c85-8403-2721e928ce5f");
      })
      
    })

  })

});
*/