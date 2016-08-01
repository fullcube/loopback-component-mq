module.exports = function(app) {
  let count = 0
  let interval = 1000

  setInterval(() => {
    count++
    app.models.Event
      .create({ type: 'counter', data: { count, } })
  }, interval)
}

