'use strict'

const _ = require('lodash')
const debug = require('debug')('loopback:component:mq')
const setupModel = require('./setup-model')
const Rabbit = require('./rabbit')
const RabbitTopology = require('./rabbit-topology')()

module.exports = function loopbackComponentMq(app, config) {

  // Store the component configuration
  _.set(app, 'settings.loopback-component-mq', {
    options: config.options || {},
    topology: config.topology || {},
  })

  debug('loopback-component-mq settings: %o', _.get(app, 'settings.loopback-component-mq'))

  // Independent of app boot, add model and ACL
  setupModel(app)

  // - Update models to work even if rabbit is not there/not booted

  // Wait the app to be booted
  app.once('booted', () => {

    // Get a reference to the created model
    const Queue = app.models.Queue

    // Get a reference to the configured datasource
    const dsName = _.get(app, 'settings.loopback-component-mq.options.dataSource', 'rabbit')
    const ds = app.dataSources[dsName]

    // If we have a datasource, wire up Rabbit and set up the topology
    if (ds) {
      Queue.rabbit = new Rabbit(ds.settings.options || {})
      RabbitTopology.setupTopology(Queue)
    }

  })

}
