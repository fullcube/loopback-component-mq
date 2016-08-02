'use strict'

const _ = require('lodash')
const debug = require('debug')('loopback:component:mq')
const RabbitConfig = require('./rabbit-config')
let rabbit = null
let msqQueue = null

function setupQueue(name) {
  debug('setupQueue: queue: %s', name)
  msqQueue = rabbit.exchange.queue({ name, durable: true })
}

function setupQueueConsumer(app, queue, definition) {
  const modelName = definition.model
  const methodName = definition.method
  const Model = app.models[modelName]
  const Method = Model[methodName]

  // Check if the model exists
  if (!Model) {
    throw new Error(`setupQueueConsumer: Model not found ${modelName}`)
  }

  // Check if the method on the model exists
  if (!Method) {
    throw new Error(`setupQueueConsumer: Method not found ${modelName}.${methodName}`)
  }

  // Start consuming the queue
  msqQueue.consume(Method)

  debug('setupQueueConsumer: queue: %s, model: %s, method: %s', queue, modelName, methodName)
}

function setupQueueProducer(app, queue, definition) {
  const modelName = definition.model
  const methodName = definition.method
  const Model = app.models[modelName]

  if (!Model) {
    throw new Error(`setupQueueProducer: Model not found ${modelName}`)
  }

  debug('setupQueueProducer: queue: %s, model: %s, method: %s', queue, modelName, methodName)
  Model[methodName] = function queueProducer(params) {
    debug(`${modelName}.${methodName}(%o)`, params)
    rabbit.exchange.publish(params, { key: queue })
  }
}

module.exports = function loopbackComponentMq(app, config) {
  const options = config.options
  const topology = config.topology

  debug('options: %o', options)
  debug('topology: %o', topology)

  if (!options.dataSource) {
    debug('options.dataSource not set, using default value \'rabbit\'')
    options.dataSource = 'rabbit'
  }

  let ds = app.dataSources[options.dataSource]

  if (!ds) {
    debug(`DataSource ${options.dataSource} not found, using empty object`)
    ds = {
      settings: {}
    }
  }

  rabbit = new RabbitConfig(ds.settings.options || {})

  // Loop through all the defined queues
  _.forEach(topology, (handlers, queue) => {

    // Setup the actual queue on RabbitMQ
    setupQueue(queue)

    // Setup the consumer of this queue
    if (handlers.consumer) {
      setupQueueConsumer(app, queue, handlers.consumer)
    }

    // Setup the producers of this queue
    if (handlers.producer) {
      setupQueueProducer(app, queue, handlers.producer)
    }

  })

}
