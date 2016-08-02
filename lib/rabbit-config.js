
const AmqpStats = require('amqp-stats')
const https = require('https')
const jackrabbit = require('jackrabbit')
const querystring = require('querystring')

require('ssl-root-cas').inject()
const cas = https.globalAgent.options.ca || []

module.exports = function rabbitConfig(settings) {

  // Build up config object
  const config = {
    hostname: settings['hostname'] || 'localhost',
    port: settings['port'] || '5672',
    restPort: settings['restPort'] || '15672',
    username: settings['username'] || 'guest',
    password: settings['password'] || 'guest',
    vhost: settings['vhost'] || '/',
    protocol: settings['protocol'] || 'amqp',
  }

  if (settings.sslKey) {
    // Add our SSL cert to the registry
    cas.push(settings.sslKey.replace(/\\n/g, '\n'))
  }

  // Define a connection config for jackrabbit
  const jackrabbitConnectionConfig = {
    username: config.username,
    password: config.password,
    hostname: config.hostname,
    port: config.port,
    protocol: config.protocol,
    vhost: querystring.escape(config.vhost),
  }

  // Define a the SSL config for jackrabbit
  const jackrabbitSslConfig = {
    ca: cas,
  }

  // Define a connection object for ampq-stats
  const amqpStatsConfig = {
    username: config.username,
    password: config.password,
    hostname: `${config.hostname}:${config.restPort}`,
    protocol: (config.protocol === 'amqps') ? 'https' : 'http',
  }

  const rabbit = jackrabbit(jackrabbitConnectionConfig, jackrabbitSslConfig)
  const exchange = rabbit.default()
  const stats = new AmqpStats(amqpStatsConfig)

  return {
    rabbit,
    exchange,
    stats,
  }
}
