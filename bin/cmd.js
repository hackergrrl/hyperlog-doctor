#!/usr/bin/env node

var fs = require('fs')
var doctor = require('../')

function exit (msg) {
  console.log(fs.readFileSync(__dirname + '/usage.txt').toString())
  console.log(msg)
  console.log()
  process.exit(1)
}

if (process.argv.length <= 2) {
  exit('ERROR: Specify a subcommand')
}
if (process.argv.length <= 3) {
  exit('ERROR: Specify a LevelDB directory to operate on.')
}

if (process.argv[2] === 'lint') {
  doctor.lint(process.argv[3])
} else if (process.argv[2] === 'repair') {
  doctor.repair(process.argv[3])
} else {
  exit('ERROR: unknown subcommand \'' + process.argv[3] + '\'.')
}

