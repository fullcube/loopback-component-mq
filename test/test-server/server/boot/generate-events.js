module.exports = function(app) {

  if (process.env.NODE_ENV && process.env.NODE_ENV === 'test') {
    return false
  }

  let count = 0
  let interval = 1000

  setInterval(() => {
    count++
    app.models.Event
      .create({ type: 'counter', data: { count, } })
  }, interval)
}

