
const AmqpStats = require('amqp-stats')
const jackrabbit = require('jackrabbit')
const RabbitConfig = require('./rabbit-config')

module.exports = function rabbitFn(settings) {

  // Build up config object
  const config = RabbitConfig(settings)

  // Initialize libraries
  const rabbit = jackrabbit(config.jackrabbitConnection, config.jackrabbitSsl)
  const exchange = rabbit.default()
  const stats = new AmqpStats(config.amqpStats)

  return {
    rabbit,
    exchange,
    stats,
  }
}
