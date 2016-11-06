var level = require('level')
var through = require('through2')
var messages = require('./lib/messages')

module.exports = function (db, cb) {
  var rs = db.createValueStream({
    gt: '!nodes!',
    lt: '!nodes!' + '~',
    valueEncoding: 'binary'
  })

  var nodes = {}
  var deps = []

  rs
    .pipe(through.obj(function (chunk, enc, next) {
      var node = messages.Node.decode(chunk)
      if (nodes[node.key]) {
        nodes[node.key] = true  // def not a head
      } else {
        nodes[node.key] = node
      }
      node.links.forEach(function (link) {
        nodes[link] = true
      })
      next()
    }, done))

  function done () {
    // console.log('processed', Object.keys(nodes).length, 'nodes')

    var res = []

    Object.keys(nodes).forEach(function (key) {
      if (nodes[key] !== true) {
        res.push(key)
      }
    })

    cb(null, res)
  }
}
