var hyperlog = require('./')
var level = require('level')
var eos = require('end-of-stream')
var through = require('through2')
var pump = require('pump')
var memdb = require('memdb')

if (process.argv.length !== 4) {
  console.error('USAGE: copy <LEVEL-DIR> <LEVEL-DIR>')
  process.exit(1)
}

var log1 = hyperlog(level(process.argv[2]))
var log2 = hyperlog(level(process.argv[3]))

var r
pump(r=log1.replicate(), log2.replicate(), r, onend)

function onend (err) {
  console.log('onend', err)

  // log1.createReadStream().pipe(through.obj(function (node, enc, next) {
  //   console.log('1', node.value.toString())
  //   next()
  // }))

  // log2.createReadStream().pipe(through.obj(function (node, enc, next) {
  //   console.log('2', node.value.toString())
  //   next()
  // }))
}
