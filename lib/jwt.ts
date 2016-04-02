import { User } from "./common/typings/jwt-user"
import * as R from "ramda"
import { verify, VerifyOptions, sign, SignOptions } from "jsonwebtoken"

export module JWT {
  /**
   * Throws exception if not valide
   */
  export function getUser(secret: string, auth0ClientID: string, token: string): User {
    const options: VerifyOptions = {
      audience: auth0ClientID,
      algorithms: ["HS256"]
    }
    const isStream = (value: string) => {
      let start = "stream-"
      return value.substring(0, start.length) === start
    }

    const valideUserdate: User = verify(token, new Buffer(secret, "base64"), options)

    if (typeof valideUserdate.app_metadata === "undefined") {
      valideUserdate.streamIds = []
    }
    else {
      let streamKeys = Object.keys(valideUserdate.app_metadata).filter(isStream)
      valideUserdate.streamIds = streamKeys.map((key: string) => valideUserdate.app_metadata[key])
    }
    return valideUserdate
  }

  /**
   * Creates new jwt for the user. With the same expiration date
   */
  export function signUser(secret: string, user: User): string {
    const options: SignOptions = {
      algorithm: "HS256",
      audience: user.aud,
      subject: user.sub,
      issuer: "tradersbit.com"
    }
    const userToSign = R.clone(user)
    delete userToSign.streamIds
    delete userToSign.iat
    return sign(userToSign, new Buffer(secret, "base64"), options)
  }

  export function createApiKey(secret: string, user: User, streamId: string, apiKeyId: string): string {
    const options = {
      algorithm: "HS256",
      audience: user.aud,
      subject: user.sub,
      issuer: "tradersbit.com"
    }

    const claims = {
      "streamId": streamId,
      "apiKeyId": apiKeyId,
      "userId": user.user_id
    }
    return sign(claims, new Buffer(secret, "base64"), options)
  }

  export function updatedJwtWithNewAppData(secret: string, user: User, newAppMetadata: any): string {
    const newUser = R.clone(user)
    newUser.app_metadata = newAppMetadata
    return signUser(secret, newUser)
  }

}