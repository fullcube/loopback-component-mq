const Promise = require('bluebird')
const _ = require('lodash')
const rabbit = require('rabbot')

module.exports = function queueFn(RabbitMQ) {
  /**
   * Fetch details of the rabbit server status.
   */
  RabbitMQ.status = function status() {
    return new Promise((resolve, reject) =>
      RabbitMQ.amqpStats.overview((err, res, data) => {
        if (err) {
          return reject(err)
        }
        data = data || {}
        return resolve(data)
      }))
  }

  /**
   * Fetch details of the queues that are defined in our topology.
   */
  RabbitMQ.queues = function queues() {
    return new Promise((resolve, reject) =>
      RabbitMQ.amqpStats.queues((err, res, data) => {
        if (err) {
          return reject(err)
        }
        // Get a list of the queues that were configured by our topology.
        const configuredQueues = _.get(rabbit, 'configurations.default.queues')
        const configuredQueueNames = _.map(configuredQueues, queue => queue.name)

        data = data || []
        data = data.filter(item => configuredQueueNames.includes(item.name))
        return resolve(data)
      }))
  }


  RabbitMQ.remoteMethod('status', {
    isStatic: true,
    description: 'Get an status overview of the connected rabbitmq server',
    returns: {
      arg: 'result',
      type: 'Object',
      root: true,
    },
    http: { path: '/status', verb: 'get' },
  })


  RabbitMQ.remoteMethod('queues', {
    isStatic: true,
    description: 'Get queues of connected rabbitmq server',
    returns: {
      arg: 'result',
      type: 'Object',
      root: true,
    },
    http: { path: '/queues', verb: 'get' },
  })
}
