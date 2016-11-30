const _ = require('lodash')
const debug = require('debug')('loopback:component:mq')

module.exports = function setupModelFn(app) {
  debug('setupModelFn')

  let dataSource = _.get(app, 'settings.loopback-component-mq.options.dataSource', 'db')

  if (typeof dataSource === 'string') {
    dataSource = app.dataSources[dataSource]
  }

  const newModel = dataSource.createModel('Queue', {}, {
    plural: 'Queue',
    base: 'Model',
    description: 'Provide access to data about the queues and the rabbitmq server',
    acls: _.get(app, 'settings.loopback-component-mq.options.acls', []),
  })

  // eslint-disable-next-line global-require
  const Model = require('./models/queue')(newModel)

  app.model(Model)

  Model.topology = _.get(app, 'settings.loopback-component-mq.topology', {})
}
