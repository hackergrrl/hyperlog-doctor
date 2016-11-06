// Checks whether every link referenced by a node exists somewhere in the
// hyperlog.

var through = require('through2')

module.exports = function (log, done) {
  var failed = undefined
  log.createReadStream()
    .pipe(through.obj(function (node, enc, next) {
      var left = node.links.length
      node.links.forEach(function (link) {
        log.get(link, function (err) {
          if (err) {
            failed = true
            console.error('link err', err)
          }
          left--
          if (left === 0) next()
        })
      })
      if (!node.links.length) next()
    }, function (flush) {
      flush()
      done(failed)
    }))
}

