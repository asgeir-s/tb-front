import * as request from "request"

export module Recaptcha {
  export function validate(recaptcha: string): Promise<boolean> {
    return new Promise<boolean>((resolve: any, reject: any) => {
      request({
        method: "POST",
        uri: "https://www.google.com/recaptcha/api/siteverify?secret=6Lek2xETAAAAANJ6TKRjrF-R9BCCYGX82mSzj2Vu&response=" + recaptcha,
        headers: {
          "content-type": "application/json"
        },
        json: true // automatically parses the JSON string in the response
      },
        (error: any, response: any, body: any) => {
          if (error) {
            reject(error)
          }
          else if (body.success === true) {
            resolve(true)
          }
          else {
            reject(new Error("unvalide recaptcha"))
          }
        })
    })
  }
}