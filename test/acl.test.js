'use strict'

const path = require('path')
const chai = require('chai')
const request = require('supertest-as-promised')

const expect = chai.expect

const TEST_APP = path.join(__dirname, 'test-server-acl')
const app = require(path.join(TEST_APP, 'server.js'))
const Component = require('../lib/index')

function json(app, verb, reqUrl) {
  return request(app)[verb](reqUrl)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
}

describe('test-server-acl: Component initialized', function() {

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

describe('test-server-acl: Queue model', function() {

  const Queue = app.models.Queue

  it('should have created the Queue model', function() {
    expect(Queue).to.be.a('function')
    expect(Queue.status).to.be.a('function')
    expect(Queue.queues).to.be.a('function')
  })

  it('should be able to get the server status', function() {
    Queue.status()
      .then(res => expect(res).to.be.an('object'))
  })

  it('should be able to get the server queues', function() {
    Queue.queues()
      .then(res => {
        expect(res).to.be.an('array')
        expect(res.length).to.equal(1)
      })
  })

})

describe('test-server-acl: Access to Queue model should be DENIED', function() {
  const endPoints = [
    '/api/Queue/queues',
    '/api/Queue/status',
  ]
  const verb = 'get'
  const expectedStatus = 401

  endPoints.forEach(endPoint => {
    it(`should have a ${expectedStatus} response to endpoint ${endPoint}`, function (done) {
      json(app, verb, endPoint)
        .send()
        .expect(expectedStatus)
        .end((err, res) => {
          expect(res.statusCode).to.equal(expectedStatus)
          done()
        })
    })
  })
})
