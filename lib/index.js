'use strict'

const _ = require('lodash')
const debug = require('debug')('loopback:component:mq')
const setupModel = require('./setup-model')
const Rabbit = require('./rabbit')
const RabbitTopology = require('./rabbit-topology')()

module.exports = function loopbackComponentMq(app, config) {
  debug(config.topology)
  // Store the component configuration
  _.set(app, 'settings.loopback-component-mq', {
    options: config.options || {},
    topology: config.topology || {},
  })

  debug('loopback-component-mq settings: %o', _.get(app, 'settings.loopback-component-mq'))

  // Independent of app boot, add model and ACL
  setupModel(app)

  // Get a reference to the created model and set up the topology
  const Queue = app.models.Queue
  RabbitTopology.setupTopology(Queue)

  // Wait the app to be booted
  app.once('booted', () => {

    // Get a reference to the configured datasource
    const dsName = _.get(app, 'settings.loopback-component-mq.options.dataSource', 'rabbit')
    const ds = app.dataSources[dsName]
    const dsOptions = _.get(ds, 'settings.options')

    // If we have a datasource, wire up Rabbit
    if (ds && dsOptions) {
      Queue.rabbit = new Rabbit(dsOptions)
    }

  })

}
