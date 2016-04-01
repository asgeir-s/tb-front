import { User } from './typings/user'
import * as Promise from 'bluebird'
import * as R from "ramda"

var jwt = require('jsonwebtoken');
var jwtVerifyAsync: (token: string, secret: any, options: any) => Promise<any> = Promise.promisify(jwt.verify, jwt);

export module JWT {  
  /**
   * TODO: should work syncronusly -> retun a user not a promise
   * Returns the user reprisented in the JWT if the JWT is valide
   */
  export function getUser(secret: string, auth0ClientID: string, token: string): Promise<User> {
    const options = {
      audience: auth0ClientID,
      algorithms: ["HS256"]
    }

    const isStream = (value: string) => {
      let start = 'stream-'
      return value.substring(0, start.length) === start
    }

    return jwtVerifyAsync(token, new Buffer(secret, 'base64'), options)
      .then((valideUserdate: User) => {
        if (typeof valideUserdate.app_metadata === "undefined") {
          valideUserdate.streamIds = [];
        }
        else {
          let streamKeys = Object.keys(valideUserdate.app_metadata).filter(isStream);
          valideUserdate.streamIds = streamKeys.map((key: string) => valideUserdate.app_metadata[key])
        }
        return valideUserdate
      })
  }

  export function signJwt(secret: string, user: User): string {
    const expIn: number = user.exp - Math.floor(Date.now() / 1000)
    console.log('userInfo.exp: ' + user.exp + ' - Date' + Math.floor(Date.now() / 1000));
    
    const options = {
      algorithm: 'HS256',
      expiresIn: expIn,
      audience: user.aud,
      subject: user.sub,
      issuer: 'tradersbit.com'
    }
    const userToSign = R.clone(user)
    delete userToSign.streamIds
    return jwt.sign(userToSign, new Buffer(secret, 'base64'), options)
  }

  export function createApiKey(secret: string, user: User, streamId: string, apiKeyId: string): string {
    const options = {
      algorithm: 'HS256',
      audience: user.aud,
      subject: user.sub,
      issuer: 'tradersbit.com'
    }

    const claims = {
      "streamId": streamId,
      "apiKeyId": apiKeyId,
      "userId": user.user_id
    }
    return jwt.sign(claims, new Buffer(secret, 'base64'), options)
  }

  export function updatedJwtWithNewAppData(secret: string, user: User, new_app_metadata: any): string {
    const newUser = R.clone(user)
    newUser.app_metadata = new_app_metadata
    return signJwt(secret, newUser)
  }

}