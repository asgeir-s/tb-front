import * as R from "ramda"
import * as Promise from "bluebird"
import * as tv4 from "tv4"

export function validateEvent(event: any, eventSchema: tv4.JsonSchema): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    if (tv4.validate(event, eventSchema)) {
      resolve(true)
    }
    else {
      reject(new Error(tv4.error as any))
    }
  })
}