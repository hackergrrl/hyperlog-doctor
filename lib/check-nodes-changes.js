// Checks whether all NODES appear in CHANGES, and vice versa.

var messages = require('hyperlog/lib/messages')

module.exports = function (log, done) {
  var nodes = {}
  var nodesNotChanges = []
  var changesNotNodes = []

  log.createReadStream()
    .on('data', function (node) {
      nodes[node.key] = nodes
    })
    .on('end', matchNodes)

  function matchNodes () {
    var rs = log.db.createValueStream({
      gt: '!nodes!',
      lt: '!nodes!' + '~',
      valueEncoding: 'binary'
    })

    rs
      .on('data', function (buf) {
        var node = messages.Node.decode(buf)
        if (nodes[node.key]) {
          nodes[node.key] = true
        } else {
          nodesNotChanges.push(node.key)
        }
      })
      .on('end', fin)
  }

  function fin () {
    // console.log('processed', Object.keys(nodes).length, 'nodes')

    Object.keys(nodes).forEach(function (key) {
      if (nodes[key] !== true) {
        changesNotNodes.push(key)
      }
    })

    if (nodesNotChanges.length === 0) {
      console.log('No NODES missing from CHANGES.')
    } else {
      console.log('ERROR:', nodesNotChanges.length, 'NODES don\'t appear in CHANGES.')
    }

    if (changesNotNodes.length === 0) {
      console.log('No CHANGES missing from NODES.')
    } else {
      console.log('ERROR:', changesNotNodes.length, 'CHANGES don\'t appear in NODES.')
    }

    done()
  }
}
