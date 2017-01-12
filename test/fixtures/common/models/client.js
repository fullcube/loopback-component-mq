const debug = require('debug')('loopback:component:mq')

module.exports = function clientModel(Client) {

  Client.consumeAllItems = function consumeAllItems(payload) {
    debug('Client.consumeAllItems: payload: %o', payload)
    return Promise.resolve()
  }

  Client.consumeNewItems = function consumeNewItems(payload) {
    debug('Client.consumeNewItems: payload: %o', payload)
    return Promise.resolve()
  }

  Client.consumeUpdatedItems = function consumeUpdatedItems(payload) {
    debug('Client.consumeUpdatedItems: payload: %o', payload)
    return Promise.resolve()
  }
}
