/* eslint no-undefined: 0 */

'use strict'

const _ = require('lodash')
const debug = require('debug')('loopback:component:mq:mixin')
const rabbit = require('rabbot')
const loopback = require('loopback')

module.exports = function messageQueueMixin(Model, options) {
  debug('initializing MessageQueue Mixin for model %s with options: %o', Model.modelName, options)

  // Initialize consumers.
  if (options.consumers) {
    Object.keys(options.consumers).forEach(name => {
      const consumer = options.consumers[name]

      debug('initializing consumer %s for model %s. options: %o', name, Model.modelName, consumer)

      const handlerOptions = {
        queue: consumer.queue || '*',
        type: consumer.type || '#',
      }

      rabbit.handle(handlerOptions, msg => {
        debug(`consumer ${name}.${Model.modelName} handling message. exchange: %o, routingKey: %o, type: %o, body: %o`,
          msg.fields.exchange, msg.fields.routingKey, msg.type, msg.body)

        const RabbitMQ = loopback.getModel('RabbitMQ')

        try {
          return Model[name](msg.body, msg)
            .then(() => {
              debug('consumer %s ran successfully for model %s. key: %o',
                name, Model.modelName, msg.fields.routingKey)
              return msg.ack()
            })
            .catch(err => {
              RabbitMQ.log.error(err)
              return msg.nack()
            })
        }
        catch (err) {
          RabbitMQ.log.error(err)
          return msg.nack()
        }
      })
    })
  }

  // Initialize producers.
  if (options.producers) {
    Object.keys(options.producers).forEach(name => {
      const producer = Object.assign({ options: { } }, options.producers[name])

      debug(`initializing producer ${name} for model ${Model.modelName}. config: %o`, producer)

      Model[name] = (body, type, opts) => {
        if (typeof opts === 'undefined' && typeof type === 'object') {
          opts = type
          type = undefined
        }

        body = body || ''
        type = type || undefined
        opts = opts || {}

        const params = _.defaultsDeep({
          body,
          type,
        }, opts, producer.options, { type: 'NOTYPE' })

        debug(`producer ${Model.modelName}.${name} publishing message to exchange ${producer.exchange}: %o`, params)

        return rabbit.publish(producer.exchange, params)
      }
    })
  }
}
