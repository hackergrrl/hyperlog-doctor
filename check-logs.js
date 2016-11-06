var hyperlog = require('hyperlog')
var through = require('through2')

var messages = require('hyperloglib/messages')
var encoder = require('hyperloglib/encode')

module.exports = function (log, done) {
  var nodes = {}
  var logs = {}
  var logsNotNodes = 0
  var nodesNotLogs = 0

  db.createKeyStream({
    gt: '!nodes!',
    lt: '!nodes!' + '~',
    valueEncoding: 'utf-8'
  })
    .on('data', function (chunk) {
      var self = this
      db.get(chunk, {valueEncoding: 'binary'}, function (err, buf) {
        // TODO: better behaviour
        if (err) throw err

        var node = messages.Node.decode(buf)
        nodes[node.key] = node
        logs[node.log] = logs[node.log] || {}
        var seq = node.seq.toString(16)
        // console.log('seq', seq, node.seq)
        logs[node.log][seq] = node
      })
    })
    .on('end', checkLogs)

  function checkLogs () {
    db.createKeyStream({
      gt: '!logs!',
      lt: '!logs!' + '~',
      valueEncoding: 'utf-8'
    })
    .on('data', function (chunk) {
      var self = this
      db.get(chunk, {valueEncoding: 'binary'}, function (err, buf) {
        if (err) throw err
        var entry = messages.Entry.decode(buf)
        var log = chunk.toString().split('!')[2]
        var seq = parseInt(chunk.toString().split('!')[3], 16).toString(16)
        // var seq = chunk.toString().split('!')[3]
        if (!nodes[entry.node]) {
          // console.log(entry.node, 'exists in LOGS but not NODES')
          logsNotNodes++
        }
        nodes[entry.node] = true
        // if (!logs[log] || !logs[log][seq]) {
        //   console.log(entry.node, 'in LOGS but not NODES (key good; missing seq)', log, seq)
        // }
      })
    })
    .on('end', fin)
  }

  function fin () {
    console.log('processed', Object.keys(nodes).length, 'nodes')

    Object.keys(nodes).forEach(function (key) {
      if (nodes[key] !== true) {
        // console.log(key, 'exists in NODES but not LOGS')
        nodesNotLogs++
      }
    })

    console.log(''+logsNotNodes, 'nodes in LOGS but not NODES')
    console.log(''+nodesNotLogs, 'nodes in NODES but not LOGS')

    done()
  }
}
