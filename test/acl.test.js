'use strict'

const path = require('path')
const chai = require('chai')
const request = require('supertest-as-promised')

const expect = chai.expect

const TEST_APP = path.join(__dirname, 'test-server-acl/server.js')

// Because require'ing config creates and caches a global singleton,
// We have to invalidate the cache to build new object based on the environment variables above
function requireUncached(module) {
  delete require.cache[require.resolve(module)]
  return require(module)
}

function json(app, verb, reqUrl) {
  return request(app)[verb](reqUrl)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
}

describe('test-server-acl', function() {
  let app = null

  beforeEach(function() {
    app = requireUncached(TEST_APP)
  })

  describe('Component initialized', function() {

    it('should have configured a dataSource as defined in component-config', function() {
      expect(app.dataSources.rabbit).to.be.an('object')
      expect(app.dataSources.rabbit.settings).to.be.an('object')
      expect(app.dataSources.rabbit.settings).to.have.deep.property('name', 'rabbit')
      expect(app.dataSources.rabbit.settings).to.have.deep.property('connector', 'transient')
      expect(app.dataSources.rabbit.settings.options).to.deep.equal({
        protocol: 'amqp',
        username: 'guest',
        password: 'guest',
        hostname: 'localhost',
        port: '5672',
        restPort: '15672',
        vhost: '/',
        sslKey: ''
      })
    })

  })

  describe('Queue model', function() {

    it('should have created the Queue model', function() {
      expect(app.models.Queue).to.be.a('function')
      expect(app.models.Queue.status).to.be.a('function')
      expect(app.models.Queue.queues).to.be.a('function')
    })

    it('should be able to get the server status', function() {
      return app.models.Queue.status()
        .then(res => expect(res).to.be.an('object'))
    })

    it('should be able to get the server queues', function() {
      return app.models.Queue.queues()
        .then(res => {
          expect(res).to.be.an('array')
          expect(res.length).to.equal(1)
        })
    })

  })

  describe('Access to Queue model should be DENIED', function() {
    const endPoints = [
      '/api/Queue/queues',
      '/api/Queue/status',
    ]
    const verb = 'get'
    const expectedStatus = 401

    endPoints.forEach(endPoint => {
      it(`should have a ${expectedStatus} response to endpoint ${endPoint}`, function() {
        return json(app, verb, endPoint)
          .send()
          .expect(expectedStatus)
      })
    })
  })
})
