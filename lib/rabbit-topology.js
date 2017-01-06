const _ = require('lodash')
const debug = require('debug')('loopback:component:mq')
let msqQueue = null

module.exports = function rabbitTopology() {
  debug('rabbitTopology')

  let QueueModel = null

  function setupQueue(name) {
    debug('setupQueue: queue: %s', name)
    msqQueue = QueueModel.rabbit.exchange.queue({ name, durable: true })
  }

  function setupQueues(Model) {
    QueueModel = Model

    // Loop through all the defined queues
    _.forEach(QueueModel.topology, (handlers, queue) => {
      // Setup the actual queue on RabbitMQ
      setupQueue(queue)
    })
  }

  function setupQueueConsumer(app, queue, definition) {
    debug('setupQueueConsumer')
    const modelName = definition.model
    const methodName = definition.method
    const Model = app.models[modelName]

    // Check if the model exists
    if (!Model) {
      throw new Error(`setupQueueConsumer: Model not found: ${modelName}`)
    }

    const Method = Model[methodName]

    // Check if the method on the model exists
    if (!Method) {
      throw new Error(`setupQueueConsumer: Method not found: ${modelName}.${methodName}`)
    }

    // Start consuming the queue
    if (msqQueue) {
      msqQueue.consume(Method)
    }


    debug('setupQueueConsumer: queue: %s, model: %s, method: %s', queue, modelName, methodName)
  }

  function setupQueueProducer(app, queue, definition) {
    const modelName = definition.model
    const methodName = definition.method
    const Model = app.models[modelName]

    debug('setupQueueProducer: queue: %s, model: %s, method: %s', queue, modelName, methodName)

    if (!Model) {
      throw new Error(`setupQueueProducer: Model not found: ${modelName}`)
    }

    Model[methodName] = function queueProducer(params) {
      debug(`${modelName}.${methodName}(%o)`, params)
      if (QueueModel.rabbit && QueueModel.rabbit.exchange) {
        QueueModel.rabbit.exchange.publish(params, { key: queue })
      }
      else {
        debug('setupQueueProducer: queue %s is not yet initialised', queue)
      }
    }
  }

  function setupTopology(Model) {
    QueueModel = Model

    // Loop through all the defined queues
    _.forEach(QueueModel.topology, (handlers, queue) => {

      // Setup the consumer of this queue
      if (handlers.consumer) {
        setupQueueConsumer(QueueModel.app, queue, handlers.consumer)
      }

      // Setup the producers of this queue
      if (handlers.producer) {
        setupQueueProducer(QueueModel.app, queue, handlers.producer)
      }

    })
  }

  function stubQueueMethod(StubmodelModel) {
    // Loop through all the defined queues
    _.forEach(StubmodelModel.topology, handlers => {

      // Setup the producers of this queue
      if (handlers.producer) {
        const modelName = handlers.producer.model
        const methodName = handlers.producer.method
        const Model = StubmodelModel.app.models[modelName]

        // Log if the method does not exists yet
        Model[methodName] = function stubQueueProducer() {
          debug(`${modelName}.${methodName} is not initialised yet`)
        }
      }

    })

  }

  return {
    setupQueue,
    setupQueues,
    setupTopology,
    setupQueueProducer,
    setupQueueConsumer,
    stubQueueMethod,
  }
}
