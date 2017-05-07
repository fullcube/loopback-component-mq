'use strict'

global.chai = require('chai')
global.sinon = require('sinon')
global.sinonChai = require('sinon-chai')

global.expect = global.chai.expect

require('mocha-sinon')()

global.chai.use(require('dirty-chai'))
global.chai.use(require('sinon-chai'))

const request = require('supertest-as-promised')

// Because require'ing config creates and caches a global singleton,
// We have to invalidate the cache to build new object based on the environment variables above
function requireUncached(module) {
  delete require.cache[require.resolve(module)]

  // eslint-disable-next-line global-require
  return require(module)
}

function json(app, verb, reqUrl) {
  return request(app)[verb](reqUrl)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
}

module.exports = {
  requireUncached,
  json,
}
