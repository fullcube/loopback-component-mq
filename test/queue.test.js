'use strict'

require('./common')

const path = require('path')
const { requireUncached } = require('./common')

const TEST_APP = path.join(__dirname, 'fixtures/test-server/server.js')

describe('RabbitMQ', function() {
  let app = null

  before(function(done) {
    app = requireUncached(TEST_APP)
    app.once('booted', done)
  })

  describe('Status', function() {
    it('should be able to get the server status', function() {
      return app.models.RabbitMQ.status()
        .then(res => expect(res).to.be.an('object'))
    })
  })

  describe('Queues', function() {
    it('should be able to get the server queues', function() {
      return app.models.RabbitMQ.queues()
        .then(res => {
          expect(res).to.be.an('array')
          expect(res.length).to.equal(3)
        })
    })
  })
})
