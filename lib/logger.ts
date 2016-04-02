import * as _ from "ramda"

export interface Logger {
  info: (message: string, data: any) => void,
  error: (message: string, data: any) => void,
  exception: (message: string, error: Error, stack?: boolean) => void,
  log: (infoLevel: string, message: string, data: any) => void,
  raw: (raw: any) => void
}

/**
 * User when no user is signed in
 */
export const log: Logger = {
  info: _.curry(logMessage)("INFO"),
  error: _.curry(logMessage)("ERROR"),
  exception: exception,
  log: logMessage,
  raw: console.log
}

/**
 * Initiate with user when a user is signed in
 */
export function userLog(userId: string): Logger {
  return {
    info: _.curry(userLogMessage)("INFO", userId),
    error: _.curry(userLogMessage)("ERROR", userId),
    exception: _.curry(userException)(userId),
    log: _.curry(userLogMessage)(userId),
    raw: console.log
  }
}

function logMessage(logLevel: string, message: any, data: any) {
  return console.log(JSON.stringify({
    "level": logLevel,
    "message": message,
    "data": data instanceof Array ? data.slice(0, 4).push("TRUNCATED...") : data
  }))
}

function exception(message: string, error: Error, stack: boolean = true) {
  return console.log(JSON.stringify({
    "level": "EXCEPTION",
    "message": message,
    "exceptionName": error.name,
    "exceptionMessage": error.message,
    "stack": stack ? error.stack : ""
  }))
}

// user logging

function userLogMessage(userId: string, logLevel: string, message: any, data: any) {
  return console.log(JSON.stringify({
    "level": logLevel,
    "user": userId,
    "message": message,
    "data": data instanceof Array ? data.slice(0, 4).push("TRUNCATED...") : data
  }))
}

function userException(userId: string, message: string, error: Error, stack: boolean = true) {
  return console.log(JSON.stringify({
    "level": "EXCEPTION",
    "user": userId,
    "message": message,
    "exceptionName": error.name,
    "exceptionMessage": error.message,
    "stack": stack ? error.stack : ""
  }))
}

