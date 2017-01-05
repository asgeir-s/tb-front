Serverless API-functions for TradersBit. TradersBit is shut down and open sourced.

This project contains serverless (AWS Lambda) functions that are accessible as an API through AWS API Gateway. This is the API used by the [tradersbit webpage](https://github.com/sogasg/tradersbit.com). It is using the [Serverless framework](https://github.com/serverless/serverless).

## What is TradersBit?
TradersBit is (was a) a marketplace for streams of Bitcoin trading signals.

Publishers create streams, send trading signals to streams, and sell subscriptions to streams. Publishing on TradersBit is completely free. Signals can be published through our website, API or by connecting your Bitfinex account. The API makes it possible to connect trading bots and other applications.

Statistics for each stream's performance are computed and displayed in the marketplace. Trading fees are incorporated in the statistics.

Subscribers can browse, filter and sort streams based on average monthly profit, average trade, and other indicators. When subscribing to a stream, users can receive signals via email or have the signaled trades automatically executed through their own Bitfinex accounts.

The publishers of the streams will set the monthly subscription fee. Upon selling subscriptions, publishers will earn 70 percent of the subscription fees. We get the remaining 30 percent. TradersBit earns profits only when the publishers make profits, so our respective interests are the same.

Upon the reception of a trading signal, we simulate the trade (including trading fees). As a result of this, there is no way for the publishers to manipulate statistics.

There is no social interaction in this marketplace because the statistics and trading signals speak for themselves. This way, subscribers will not be scammed easily. A subscriber should not need to know or care whether signals are sent manually by a teenager, an MBA graduate or automatically generated by a trading bot. At TradersBit, the streams and statistics matter, not the people behind them.

TradersBit will also host trading competitions. For instance, most profitable streams last 30 days, etc., with rewards in Bitcoins.

## TradersBit consists of
* [tradersbit.com](https://github.com/sogasg/tradersbit.com) - the webpage
* [tb-front](https://github.com/sogasg/tb-front) - serverless REST API
* [tb-back](https://github.com/sogasg/tb-back) - serverless backend (not accessed directly by users)
* [tb-signals](https://github.com/sogasg/tb-signals) - microservice for handling incoming trading signals 
* [tb-streams](https://github.com/sogasg/tb-streams) - microservice for handling stats for streams of trading signals

## API
Publicly available
  * **GET: /streams/{streamId}** - get statistics for a stream
  * **GET: /streams/{streamId}/signals** - get all signals in a stream, except any currently open position
  * **GET: /streams** - statistics for all streams
  * **POST: /subscribe** - subscribe to a stream (returns payment URL etc.)

Accessible after sign in on webpage
  * **GET: /me/streams/{streamId}/apikey** - generate an API key for this stream
  * **GET: /me/streams** - returns the users streams
  * **POST: /me/streams/{streamId}/mirror** - post API-keys for Bitfinex so that your trades can be copied to this stream
  * **POST: /me/streams/{streamId}/signal** - publish a signal to one of my streams
  * **POST: /me/streams** - create a new stream
  * **PUT: /me/streams/{streamId}/subscription-price** - change the price for subscribing to one of my streams

Accessed with an API-key (from GET: /me/streams/{streamId}/apikey)
  * **GET: /api/streams/{streamId}/status** - customer API for getting a streams status
  * **POST: /api/streams/{streamId}/signal** - customer API for posting a new trading signal

## Testing
Currently AWS Lambda runs on Node.js: v0.10.36. Therfore, it must be tested on that version of node:

    nvm use 0.10.36
    tsc && npm-lx tape -- '**/*.tap.js' | npm-lx tap-spec
    
Set npm-lx alias in ~/.zshrc:

    alias npm-lx='PATH=$(npm bin):$PATH'
    
## After new deployment
Remember to manually set the caching variables in the API Gateway console, only for public streams and signals.