require('ssl-root-cas').inject()
const https = require('https')
const querystring = require('querystring')
const cas = https.globalAgent.options.ca || []

const jackrabbit = require('jackrabbit')
const AmqpStats = require('amqp-stats')

module.exports = function rabbitConfig() {

  // Check for required ENV vars
  const requiredEnvVars = [
    'RABBIT_HOST',
    'RABBIT_PORT',
    'RABBIT_REST_PORT',
    'RABBIT_USER',
    'RABBIT_PASS',
    'RABBIT_VHOST',
    'RABBIT_PROTOCOL',
  ]

  // Build op config based on the ENV vars above
  const config = {}

  requiredEnvVars.forEach(envvar => {
    if (!process.env[envvar]) {
      throw new Error(`Please set ${envvar} to start this server`)
    }
    config[envvar] = process.env[envvar]
  })


  if (process.env.RABBIT_SSL_KEY) {
    config.RABBIT_SSL_KEY = process.env.RABBIT_SSL_KEY.replace(/\\n/g, '\n')

    // Add our SSL cert to the registry
    cas.push(config.RABBIT_SSL_KEY)
  }

  // Define a connection object for jackrabbit
  const RABBIT_URL_OBJECT = {
    username: config.RABBIT_USER,
    password: config.RABBIT_PASS,
    hostname: config.RABBIT_HOST,
    port: config.RABBIT_PORT,
    protocol: config.RABBIT_PROTOCOL,
    vhost: querystring.escape(config.RABBIT_VHOST),
  }

  // Define a the SSL options for jackrabbit
  const RABBIT_SSL_OPTS = {
    ca: cas,
  }

  // Define a connection object for ampq-stats
  const RABBIT_STATS_CONFIG = {
    username: config.RABBIT_USER,
    password: config.RABBIT_PASS,
    hostname: `${config.RABBIT_HOST}:${config.RABBIT_REST_PORT}`,
    protocol: (config.RABBIT_PROTOCOL === 'amqps') ? 'https' : 'http',
  }

  const rabbit = jackrabbit(RABBIT_URL_OBJECT, RABBIT_SSL_OPTS)
  const exchange = rabbit.default()
  const stats = new AmqpStats(RABBIT_STATS_CONFIG)

  return {
    rabbit,
    exchange,
    stats,
  }
}
