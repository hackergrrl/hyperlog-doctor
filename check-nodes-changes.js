var hyperlog = require('./')
var level = require('level')
var through = require('through2')

var messages = require('./lib/messages')
var encoder = require('./lib/encode')

if (process.argv.length !== 3) {
  console.error('USAGE: check-nodes-changes <LEVEL-DIR>')
  process.exit(1)
}

var db = level(process.argv[2])
var log = hyperlog(db)

var nodes = {}

log.createReadStream()
  .on('data', function (node) {
    nodes[node.key] = nodes
  })
  .on('end', matchNodes)

function matchNodes () {
  var rs = db.createKeyStream({
    gt: '!nodes!',
    lt: '!nodes!' + '~',
    valueEncoding: 'utf-8'
  })

  rs
    .on('data', function (chunk) {
      var self = this
      db.get(chunk, {valueEncoding: 'binary'}, function (err, buf) {
        if (err) throw err
        var node = messages.Node.decode(buf)
        if (nodes[node.key]) {
          nodes[node.key] = true
        } else {
          console.log(node.key, 'exists in NODES but not CHANGES')
        }
      })
    })
    .on('end', done)
}

function done () {
  console.log('processed', Object.keys(nodes).length, 'nodes')

  Object.keys(nodes).forEach(function (key) {
    if (nodes[key] !== true) {
      console.log(key, 'exists in CHANGES but not NODES')
    }
  })
}
