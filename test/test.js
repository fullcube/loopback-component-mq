'use strict'

const path = require('path')
const chai = require('chai')
const request = require('supertest-as-promised')

const expect = chai.expect

const TEST_APP = path.join(__dirname, 'test-server/server/server.js')

const RabbitConfig = require('../lib/rabbit-config')
const Component = require('../lib/index')

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

describe('test-server', function() {
  let app = null

  beforeEach(function() {
    app = requireUncached(TEST_APP)
  })

  describe('Component initialized', function() {

    it('should have configured the methods as defined in component-config', function() {
      expect(app.models.Event.handleIncomingMessage).to.be.a('function')
      expect(app.models.Event.sendOutgoingMessage).to.be.a('function')
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

    // it('should be able to run the method defined in the component configuration of the test-server', function() {
    //   app.models.Event.sendOutgoingMessage()
    // })

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


  describe('Queue model', function() {

    it('should have created the Queue model', function() {
      expect(app.models.Queue).to.be.a('function')
      expect(app.models.Queue.status).to.be.a('function')
      expect(app.models.Queue.queues).to.be.a('function')
    })

    it('should be able to get the server status', function() {
      app.models.Queue.status()
        .then(res => expect(res).to.be.an('object'))
    })

    it('should be able to get the server queues', function() {
      app.models.Queue.queues()
        .then(res => {
          expect(res).to.be.an('array')
          expect(res.length).to.equal(1)
        })
    })

  })

  describe('Access to Queue model', function() {
    const endPoints = [
      '/api/Queue/queues',
      '/api/Queue/status',
    ]
    const verb = 'get'
    const expectedStatus = 200

    endPoints.forEach(endPoint => {
      it(`should have a ${expectedStatus} response to endpoint ${endPoint}`, function() {
        return json(app, verb, endPoint)
          .send()
          .expect(expectedStatus)
      })
    })
  })
})
