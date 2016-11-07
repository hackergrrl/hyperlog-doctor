// Reads all nodes and records what nodes they link to. Ensures that all nodes
// linked to are present.

var messages = require('hyperlog/lib/messages')

module.exports = function (log, done) {
  var rs = log.db.createValueStream({
    gt: '!nodes!',
    lt: '!nodes!' + '~',
    valueEncoding: 'binary'
  })

  var nodes = {}
  var links = []

  rs
    .on('data', function (buf) {
      var node = messages.Node.decode(buf)
      nodes[node.key] = node
      links = links.concat(node.links)
    })
    .on('end', process)

  function process () {
    // filter out all good links, leaving only the ones that point to non-present nodes
    links = links.filter(function (link) {
      return !nodes[link]
    })

    if (links.length === 0) {
      console.log('No missing nodes found.')
    } else {
      console.log('ERROR:', links.length, 'missing nodes found (linked to but not present).')
    }

    done()
  }
}

