'use strict'

const Promise = require('bluebird')
const path = require('path')
const chai = require('chai')

const expect = chai.expect

const TEST_APP = path.join(__dirname, 'test-server')
const app = require(path.join(TEST_APP, 'server/server.js'))
const Event = app.models.Event
const RabbitConfig = require('../lib/rabbit-config')
const Component = require('../lib/index')

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

  it('should be able to run the method defined in the component configuration of the test-server', function() {
    app.models.Event.sendOutgoingMessage()
  })

})

describe('Rapid config with SSL key', function() {

  it('should initialize the config', function() {
    const cfg = {
      hostname: 'localhost',
      sslKey: '123'
    }
    const rabbit = new RabbitConfig(cfg)
    expect(rabbit.jackrabbitConnection).to.deep.equal({ username: 'guest',
      password: 'guest',
      hostname: 'localhost',
      port: '5672',
      protocol: 'amqp',
      vhost: '%2F',
    })
    expect(rabbit.amqpStats).to.deep.equal({
      username: 'guest',
      password: 'guest',
      hostname: 'localhost:15672',
      protocol: 'http',
    })
  })
})

describe('Main component config', function() {

  it('should initialize with a default dataSource value', function() {
    const cfg = {}
    const component = new Component(app, cfg)
    expect(component).to.be.an('object')
  })

  it('should initialize with a non-existing dataSource value', function() {
    const cfg = {
      options: {
        dataSource: 'i-do-not-exist'
      }
    }
    const component = new Component(app, cfg)
    expect(component).to.be.an('object')
  })

  it('should throw an error with a non-existing producer Model value', function() {
    const cfg = {
      options: {
        dataSource: 'rabbit'
      },
      topology: {
        'my-queue-name': {
          producer: {
            model: 'Unknown'
          }
        }
      }
    }
    try {
      const component = new Component(app, cfg)
    }
    catch (err) {
      expect(err).to.be.an('error')
      expect(err.message).to.equal('setupQueueProducer: Model not found: Unknown')
    }
  })

  it('should throw an error with a non-existing consumer Model value', function() {
    const cfg = {
      options: {
        dataSource: 'rabbit'
      },
      topology: {
        'my-queue-name': {
          consumer: {
            model: 'Unknown',
          }
        }
      }
    }
    try {
      const component = new Component(app, cfg)
    }
    catch (err) {
      expect(err).to.be.an('error')
      expect(err.message).to.equal('setupQueueConsumer: Model not found: Unknown')
    }
  })


  it('should throw an error with a non-existing consumer Method value', function() {
    const cfg = {
      options: {
        dataSource: 'rabbit'
      },
      topology: {
        'my-queue-name': {
          consumer: {
            model: 'Event',
            method: 'nonExisting',
          }
        }
      }
    }
    try {
      const component = new Component(app, cfg)
    }
    catch (err) {
      expect(err).to.be.an('error')
      expect(err.message).to.equal('setupQueueConsumer: Method not found: Event.nonExisting')
    }
  })

})
