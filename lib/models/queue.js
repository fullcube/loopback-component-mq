const Promise = require('bluebird')

module.exports = function queueFn(Queue) {

  // The topology
  Queue.topology = {}
  // The rabbit
  Queue.rabbit = null

  Queue.status = function status() {
    return new Promise((resolve, reject) => {
      if (!Queue.rabbit) {
        return reject(new Error('Error connecting to rabbit'))
      }
      return Queue.rabbit.stats.overview((err, res, data) => {
        if (err) {
          return reject(err)
        }
        data = data || {}
        return resolve(data)
      })
    })
  }

  Queue.queues = function queues() {
    return new Promise((resolve, reject) => {
      if (!Queue.rabbit) {
        return reject(new Error('Error connecting to rabbit'))
      }
      return Queue.rabbit.stats.queues((err, res, data) => {
        if (err) {
          return reject(err)
        }
        // Only show queues that are defined in the topology
        data = data || []
        data = data.filter(item => Object.keys(Queue.topology).includes(item.name))
        return resolve(data)
      })
    })
  }


  Queue.remoteMethod('status', {
    isStatic: true,
    description: 'Get an status overview of the connected rabbitmq server',
    returns: {
      arg: 'result',
      type: 'Object',
      root: true,
    },
    http: { path: '/status', verb: 'get' },
  })


  Queue.remoteMethod('queues', {
    isStatic: true,
    description: 'Get queues of connected rabbitmq server',
    returns: {
      arg: 'result',
      type: 'Object',
      root: true,
    },
    http: { path: '/queues', verb: 'get' },
  })

  return Queue
}
