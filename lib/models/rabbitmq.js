const Promise = require('bluebird')
const _ = require('lodash')
const rabbit = require('rabbot')
const loopback = require('loopback')

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

  const statusMethodSpec = {
    description: 'Get an status overview of the connected rabbitmq server',
    returns: {
      arg: 'result',
      type: 'Object',
      root: true,
    },
    http: { path: '/status', verb: 'get' },
  }

  if (loopback.version.startsWith(2)) {
    statusMethodSpec.isStatic = true
  }

  RabbitMQ.remoteMethod('status', statusMethodSpec)


  const queuesMethodSpec = {
    description: 'Get queues of connected rabbitmq server',
    returns: {
      arg: 'result',
      type: 'Array',
      root: true,
    },
    http: { path: '/queues', verb: 'get' },
  }

  if (loopback.version.startsWith(2)) {
    queuesMethodSpec.isStatic = true
  }

  RabbitMQ.remoteMethod('queues', queuesMethodSpec)
}
