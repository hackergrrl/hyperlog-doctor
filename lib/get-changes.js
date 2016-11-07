var through = require('through2')
var sort = require('toposort')
var sortSubset = require('sort-subset')

var messages = require('hyperlog/lib/messages')

module.exports = function (db, done) {
  var rs = db.createKeyStream({
    gt: '!nodes!',
    lt: '!nodes!' + '~',
    valueEncoding: 'utf-8'
  })

  var nodes = []
  var edges = []
  var nodeInfo = {}
  var subLogs = {}

  rs
    .pipe(through(function (chunk, enc, next) {
      db.get(chunk, {valueEncoding: 'binary'}, function (err, buf) {
        if (err) throw err
        var node = messages.Node.decode(buf)
        nodes.push(node.key)
        nodeInfo[node.key] = node
        subLogs[node.log] = true
        node.links.forEach(function (link) {
          edges.push([node.key, link])
        })
        next()
      })
    }, onProcessed))

  function onProcessed () {
    console.log('processed', Object.keys(nodes).length, 'nodes')

    // topographically sort using node dependencies
    var keys = sort.array(nodes, edges).reverse()
    console.log('topographic sorted', Object.keys(nodes).length, 'nodes')

    // assign new change #s (purely in-memory temp nodes)
    keys.forEach(function (key, idx) {
      nodeInfo[key].change = idx + 1
    })

    // sort each sublog to ensure sublogs are sorted by their seq #s
    Object.keys(subLogs).forEach(function (log) {
      sortSubset(keys, function (key) { return nodeInfo[key].log === log }, sortSubLog)
    })
    console.log('sublogs sorted', Object.keys(nodes).length, 'nodes')

    done(null, keys)
  }

  function sortSubLog (key1, key2) {
    var a = nodeInfo[key1]
    var b = nodeInfo[key2]

    if (a.log === b.log) {
      return a.seq - b.seq
    } else {
      throw new Error('invariant broken')
    }
  }
}

