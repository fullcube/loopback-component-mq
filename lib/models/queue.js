const Promise = require('bluebird')

module.exports = function queueFn(Queue, rabbit, topology) {

  Queue.status = function status() {
    return new Promise((resolve, reject) => {
      rabbit.stats.overview((err, res, data) => {
        if (err) {
          reject(err)
        }
        resolve(data)
      })
    })
  }

  Queue.queues = function queues() {
    return new Promise((resolve, reject) => {
      rabbit.stats.queues((err, res, data) => {
        if (err) {
          reject(err)
        }
        // Only show queues that are defined in the topology
        data = data.filter(item => Object.keys(topology).includes(item.name))
        resolve(data)
      })
    })
  }

  return Queue
}
