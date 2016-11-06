var through = require('through2')
var messages = require('hyperlog/lib/messages')
var encoder = require('hyperlog/lib/encode')

module.exports = function (log, done) {
  var rs = db.createKeyStream({
    gt: '!nodes!',
    lt: '!nodes!' + '~',
    valueEncoding: 'utf-8'
  })

  var nodes = {}

  rs
    .pipe(through(function (chunk, enc, next) {
      var self = this
      db.get(chunk, {valueEncoding: 'binary'}, function (err, buf) {
        if (err) { console.error(err); return next() }
        var node = messages.Node.decode(buf)
        var value = encoder.decode(node.value, log.valueEncoding)
        nodes[node.key] = node
        node.links.forEach(self.push.bind(self))
        next()
      })
    }))
    .on('data', function (key) {
      key = key.toString()
      // TODO: nicer reporting
      if (!nodes[key]) console.error(key)
    })
    .on('end', done)
}

