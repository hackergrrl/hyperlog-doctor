// Checks the hyperlog to ensure that all of the entries in HEADS are indeed
// heads. That is, that no other node links to them.

var hyperlog = require('hyperlog')
var getHeads = require('./get-heads')

module.exports = function (log, done) {
  var heads = []

  log.heads()
    .on('data', function (node) {
      heads.push(node.key)
    })
    .on('end', count)

  function count () {
    getHeads(db, function (err, heads2) {
      // TODO: compare and report the fake heads and missing heads
      heads.sort()
      heads2.sort()
      console.log(heads.length, heads2.length)
      // console.log(heads, heads2)
    })
  }
}

