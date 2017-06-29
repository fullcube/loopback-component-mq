'use strict'

require('./common')

const path = require('path')
const { requireUncached } = require('./common')
const { json } = require('./common')

const TEST_APP = path.join(__dirname, 'fixtures/test-server-acl/server.js')

describe('ACL', function() {
  let app = null

  before(function(done) {
    app = requireUncached(TEST_APP)
    app.once('booted', done)
  })

  describe('RabbitMQ model', function() {
    const endPoints = [
      '/api/RabbitMQ/queues',
      '/api/RabbitMQ/status',
    ]
    const verb = 'get'
    const expectedStatus = 401

    endPoints.forEach(endPoint => {
      it(`should respond with a ${expectedStatus} on endpoint ${endPoint}`, function() {
        return json(app, verb, endPoint)
          .send()
          .expect(expectedStatus)
      })
    })
  })
})
