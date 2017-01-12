const debug = require('debug')('loopback:component:mq')

module.exports = function itemModel(Item) {
  // Here, we are publishing details of created or updated items to the relevant topic queue.
  Item.observe('after save', ctx => {
    debug('Item after save. ctx.instance: %o', ctx.instance)

    if (ctx.isNewInstance) {
      return Item.publishNewItem(ctx.instance)
    }
    return Item.publishUpdatedItem(ctx.instance)
  })
}
