/* eslint global-require: 0 */
const debug = require('debug')('loopback:component:mq')
const modelDefinition = require('./models/queue.json')

// Remove properties that will confuse LB
function getModelSettings(def) {
  const settings = {}

  for (const s in def) {
    if (def.hasOwnProperty(s)) {
      if (s !== 'name' || s !== 'properties') {
        settings[s] = def[s]
      }
    }
  }
  return settings
}

module.exports = function setupModelFn(app, ds, rabbit, topology) {
  debug('setupModelFn')

  const newModel = ds.createModel(
    modelDefinition.name,
    modelDefinition.properties,
    getModelSettings(modelDefinition)
  )

  const Model = require('./models/queue')(newModel, rabbit, topology)

  app.model(Model)
}

