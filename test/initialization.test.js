'use strict'

require('./common')

const path = require('path')
const { requireUncached } = require('./common')

const TEST_APP = path.join(__dirname, 'fixtures/test-server/server.js')

describe('Initialization', function() {
  let app = null

  before(function(done) {
    app = requireUncached(TEST_APP)
    app.once('booted', done)
  })

  describe('Component initialized', function() {
    it('should have created the RabbitMQ model', function() {
      expect(app.models.RabbitMQ).to.be.a('function')
    })
    it('should have created the RabbitMQ.status method', function() {
      expect(app.models.RabbitMQ.status).to.be.a('function')
    })
    it('should have created the RabbitMQ.queues method', function() {
      expect(app.models.RabbitMQ.queues).to.be.a('function')
    })
  })
})
