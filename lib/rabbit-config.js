
require('ssl-root-cas').inject()
const https = require('https')
const querystring = require('querystring')

module.exports = function rabbitConfig(settings) {

  // Build up config object
  const config = {
    hostname: settings.hostname || 'localhost',
    port: settings.port || '5672',
    restPort: settings.restPort || '15672',
    username: settings.username || 'guest',
    password: settings.password || 'guest',
    vhost: settings.vhost || '/',
    protocol: settings.protocol || 'amqp',
  }

  // Define a connection config for jackrabbit
  const jackrabbitConnection = {
    username: config.username,
    password: config.password,
    hostname: config.hostname,
    port: config.port,
    protocol: config.protocol,
    vhost: querystring.escape(config.vhost),
  }

  // Define a the SSL config for jackrabbit
  const cas = https.globalAgent.options.ca || []

  // Optionally add SSL cert to the registry
  if (settings.sslKey) {
    cas.push(settings.sslKey.replace(/\\n/g, '\n'))
  }

  const jackrabbitSsl = {
    ca: cas,
  }

  // Define a connection object for amqp-stats
  const amqpStats = {
    username: config.username,
    password: config.password,
    hostname: `${config.hostname}:${config.restPort}`,
    protocol: (config.protocol === 'amqps') ? 'https' : 'http',
  }

  return {
    jackrabbitConnection,
    jackrabbitSsl,
    amqpStats,
  }
}
