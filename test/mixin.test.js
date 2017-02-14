'use strict'

require('./common')

const path = require('path')
const rabbit = require('rabbot')
const requireUncached = require('./common').requireUncached

const TEST_APP = path.join(__dirname, 'fixtures/test-server/server.js')
const DELAY = 200

describe('Mixin', function() {
  let app = null

  // before(function(done) {
  //   rabbit.once('default.connection.configured', () => done())
  // })

  before(function(done) {
    app = requireUncached(TEST_APP)
    app.once('booted', done)
  })

  describe('Mixin initialized', function() {
    it('should create producer methods', function() {
      expect(app.models.Item).itself.to.respondTo('publishItem')
      expect(app.models.Item).itself.to.respondTo('publishNewItem')
      expect(app.models.Item).itself.to.respondTo('publishUpdatedItem')
    })
  })

  describe('Producer (without type)', function() {
    beforeEach(function() {
      this.sinon.spy(app.models.Client, 'consumeAllItems')
      this.sinon.spy(app.models.Client, 'consumeNewItems')
      return app.models.Item.publishItem('a message')
        .delay(DELAY)
    })

    it('should call the relevant consumers when a mesage is received', function() {
      expect(app.models.Client.consumeAllItems.calledOnce).to.be.true()
      expect(app.models.Client.consumeNewItems.called).to.be.false()
    })
    it('should pass the message body to the consumer', function() {
      expect(app.models.Client.consumeAllItems.calledWith('a message')).to.be.true()
    })
  })

  describe('Producer (with type)', function() {
    beforeEach(function() {
      this.sinon.spy(app.models.Client, 'consumeAllItems')
      this.sinon.spy(app.models.Client, 'consumeNewItems')
      return app.models.Item.publishItem('a message', 'item.write.created')
        .delay(DELAY)
    })
    it('should call the relevant consumers when a mesage is received', function() {
      expect(app.models.Client.consumeAllItems.calledOnce).to.be.true()
      expect(app.models.Client.consumeNewItems.calledOnce).to.be.true()
    })
    it('should pass the message body to the consumer', function() {
      expect(app.models.Client.consumeAllItems.calledWith('a message')).to.be.true()
      expect(app.models.Client.consumeNewItems.calledWith('a message')).to.be.true()
    })
  })
})
