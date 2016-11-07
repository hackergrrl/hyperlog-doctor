// Checks whether every link referenced by a node exists somewhere in the
// hyperlog.

module.exports = function (log, done) {
  var badLinks = []

  log.createReadStream()
    .on('data', function (node) {
      var left = node.links.length
      node.links.forEach(function (link) {
        log.get(link, function (err) {
          left--
          if (err) badLinks.push([node.key, link])
          // if (left === 0) next()
        })
      })
      // if (!node.links.length) next()
    })
    .on('end', function () {
      if (badLinks.length === 0) {
        console.log('No dangling links found.')
      } else {
        console.log('WARNING: Found', badLinks.length, 'dangling links. Possible corruption in CHANGES index.')
      }
      done()
    })
}

