import * as Promise from "bluebird"
import * as request from "request"
import * as _ from "ramda"

const requestAsync = Promise.promisify(request)

export module Auth0 {

  export function getUserInfo(auth0Url: string, auth0Jwt: string, userId: string, fields: string):
    Promise<any> {
    return requestAsync({
      method: "GET",
      uri: auth0Url + "/api/v2/users/" + userId + "?fields=" + fields + "&include_fields=true",
      headers: {
        "Authorization": "Bearer " + auth0Jwt,
        "content-type": "application/json"
      },
      json: true
    })
      .then((res: any) => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          throw new Error(res)
        }
        else {
          return res.body
        }
      })
  }

  export function checkUserAppMetadataUptodate(auth0Url: string, auth0Jwt: string, userId: string, appMetadata: any):
    Promise<boolean> {
    return getUserInfo(auth0Url, auth0Jwt, userId, "app_metadata")
      .then(userData => _.equals(userData.app_metadata, appMetadata) ? true : false)
  }

  export function addStreamToAuth0UserReturnAppData(auth0Url: string, auth0Jwt: string, userId: string,
    streamId: string): Promise<any> {
    return addStreamToUserAppMetadataAtAuth0(auth0Url, auth0Jwt, userId, streamId)
      .then(result => result.app_metadata)
  }

  function addStreamToUserAppMetadataAtAuth0(auth0Url: string, auth0Jwt: string,
    userId: string, streamId: string): Promise<any> {
    const newStreamKey = "stream-" + (new Date).getTime()

    let requestAppMetadata: any = {}
    requestAppMetadata[newStreamKey] = streamId

    return requestAsync({
      method: "PATCH",
      uri: auth0Url + "/api/v2/users/" + userId,
      headers: {
        "Authorization": "Bearer " + auth0Jwt,
        "content-type": "application/json"
      },
      body: { "app_metadata": requestAppMetadata },
      json: true
    })
      .then((res: any) => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          throw new Error(res.body)
        }
        else {
          return res.body
        }
      })
  }

}
