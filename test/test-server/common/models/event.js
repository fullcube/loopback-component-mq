module.exports = function(Event) {

  // This is the method in which we handle the incoming message
  Event.handleIncomingMessage = function handleIncomingMessage(payload, ack) {
    console.log(`handleIncomingMessage: type: '${payload.type}' data:`, payload.data)
    ack()
  }

  Event.observe('after save', (ctx, next) => {
    if (Event.sendOutgoingMessage) {
      Event.sendOutgoingMessage(ctx.instance)
    } else {
      throw new Error('Method Event.sendOutgoingMessage does not exist')
    }
    next()
  })

};
