const _ = require('lodash')
const debug = require('debug')('loopback:component:mq')
let msqQueue = null

module.exports = function rabbitTopology() {

  let QueueModel = null

  function setupQueue(name) {
    debug('setupQueue: queue: %s', name)
    msqQueue = QueueModel.rabbit.exchange.queue({ name, durable: true })
  }

  function setupQueueConsumer(queue, definition) {
    const modelName = definition.model
    const methodName = definition.method
    const Model = QueueModel.app.models[modelName]

    // Check if the model exists
    if (!Model) {
      throw new Error(`setupQueueConsumer: Model not found: ${modelName}`)
    }

    const Method = Model[methodName]

    // Check if the method on the model exists
    if (!Method) {
      console.warn(`setupQueueConsumer: Method not found: ${modelName}.${methodName}`) // eslint-disable-line no-console
    }

    // Start consuming the queue
    msqQueue.consume(Method)

    debug('setupQueueConsumer: queue: %s, model: %s, method: %s', queue, modelName, methodName)
  }

  function setupQueueProducer(queue, definition) {
    const modelName = definition.model
    const methodName = definition.method
    const Model = QueueModel.app.models[modelName]

    if (!Model) {
      throw new Error(`setupQueueProducer: Model not found: ${modelName}`)
    }

    debug('setupQueueProducer: queue: %s, model: %s, method: %s', queue, modelName, methodName)
    Model[methodName] = function queueProducer(params) {
      debug(`${modelName}.${methodName}(%o)`, params)
      QueueModel.rabbit.exchange.publish(params, { key: queue })
    }
  }

  function setupTopology(Model) {
    QueueModel = Model

    // Loop through all the defined queues
    _.forEach(QueueModel.topology, (handlers, queue) => {

      // Setup the actual queue on RabbitMQ
      setupQueue(queue)

      // Setup the consumer of this queue
      if (handlers.consumer) {
        setupQueueConsumer(queue, handlers.consumer)
      }

      // Setup the producers of this queue
      if (handlers.producer) {
        setupQueueProducer(queue, handlers.producer)
      }

    })
  }

  return {
    setupTopology,
  }
}
