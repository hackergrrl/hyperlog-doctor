var checkDangling = require('./lib/check-dangling')
var checkHeads = require('./lib/check-heads')
var checkLogDeps = require('./lib/check-log-deps')
var checkLogs = require('./lib/check-logs')
var checkNodesChanges = require('./lib/check-nodes-changes')
var repair = require('./lib/repair')
var parallel = require('run-parallel')
var level = require('level')
var hyperlog = require('hyperlog')

module.exports.lint = function (dir) {
  var db = level(dir)
  var log = hyperlog(db, {valueEncoding: 'binary'})

  parallel([
    function (cb) {
      checkDangling(log, cb)
    },
    function (cb) {
      checkHeads(log, cb)
    },
    function (cb) {
      checkLogDeps(log, cb)
    },
    function (cb) {
      checkLogs(log, cb)
    },
    function (cb) {
      checkNodesChanges(log, cb)
    }
  ], function (err, results) {
    if (err) throw err
  })
}

module.exports.repair = function (dir) {
  var db = level(dir)
  repair(db, function () {})
}
