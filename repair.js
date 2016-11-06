var level = require('level')
var getHeads = require('./get-heads')
var getChanges = require('./get-changes')
var collect = require('stream-collector')
var waterfall = require('run-waterfall')
var lexint = require('lexicographic-integer')
var after = require('after-all')

var messages = require('hyperlog/lib/messages')

module.exports = function (db, done) {

  waterfall([
    function (next) {
      deletePrefix(db, '!heads!', next)
    },
    function (next) {
      // console.log('old heads deleted')
      writeHeads(db, next)
    },
    function (next) {
      // console.log('new heads written')
      deletePrefix(db, '!changes!', next)
    },
    function (next) {
      // console.log('old changes deleted')
      getChanges(db, next)
    },
    function (keys, next) {
      // console.log('computed changes')
      writeChanges(db, keys, next)
    },
    // function (next) {
    //   console.log('wrote changes')
    //   next()
    // },
    function (err) {
      // console.log('done')
      done(err)
    }
  ])

  function deletePrefix (db, prefix, done) {
    var changes = db.createKeyStream({
      gt: prefix,
      lt: prefix + '~',
      reverse: false
    })
    collect(changes, function (err, keys) {
      // console.log(err, keys)
      var ops = keys.map(function (key) {
        return { type: 'del', key: key }
      })

      db.batch(ops, done)
    })
  }

  function writeHeads (db, done) {
    getHeads(db, function (err, heads) {
      if (err) throw err

      var ops = heads.map(function (key) {
        return { type: 'put', key: '!heads!' + key, value: key }
      })

      db.batch(ops, done)
    })
  }

  function writeChanges (db, keys, done) {
    var ops = []

    function getNode (key, done) {
      db.get('!nodes!' + key, {valueEncoding: 'binary'}, function (err, chunk) {
        if (err) return done(err)
        var node = messages.Node.decode(chunk)
        done(null, node)
      })
    }

    // Update all nodes with their new change #
    var next = after(writeActualChanges)
    console.log('preparing updated node entries')
    keys.forEach(function (key, index) {
      var done = next()
      getNode(key, function (err, node) {
        if (err) return done(err)
        node.change = index + 1
        var encoded = messages.Node.encode(node)
        ops.push({ type: 'put', key: '!nodes!' + key, value: encoded })
        done()
      })
    })

    function writeActualChanges (err) {
      if (err) throw err
      console.log('preparing changes entries')
      ops = ops.concat(keys.map(function (key, index) {
        var idx = lexint.pack(index + 1, 'hex')
        return { type: 'put', key: '!changes!' + idx, value: key }
      }))

      console.log('writing nodes+changes entries')
      db.batch(ops, done)
    }
  }
}
