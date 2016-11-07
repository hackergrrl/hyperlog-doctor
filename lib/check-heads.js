// Checks the hyperlog to ensure that all of the entries in HEADS are indeed
// heads. That is, that no other node links to them.

var getHeads = require('./get-heads')
var sub = require('array-differ')

module.exports = function (log, done) {
  var heads = []

  log.heads()
    .on('data', function (node) {
      heads.push(node.key)
    })
    .on('end', count)

  function count () {
    getHeads(log.db, function (err, heads2) {
      heads.sort()
      heads2.sort()

      var nonHeads = sub(heads, heads2)
      if (nonHeads.length === 0) {
        console.log('No bad heads present.')
      } else {
        console.log('ERROR: Detected', nonHeads.length, 'bad heads.')
      }

      var missingHeads = sub(heads2, heads)
      if (missingHeads.length === 0) {
        console.log('No real heads missing.')
      } else {
        console.log('ERROR: Detected', missing.length, 'missing heads.')
      }

      done()
    })
  }
}

