'use strict'

const Promise = require('bluebird')
const path = require('path')
const chai = require('chai')

const expect = chai.expect

const TEST_APP = path.join(__dirname, 'test-server')
const app = require(path.join(TEST_APP, 'server/server.js'))
const Event = app.models.Event

describe('Component initialized', function() {

  it('should have configured the methods as defined in component-config', function() {
    expect(Event.handleIncomingMessage).to.be.a('function')
    expect(Event.sendOutgoingMessage).to.be.a('function')
  })

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
