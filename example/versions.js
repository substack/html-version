var fs = require('fs')
var versions = require('../')

fs.readFile(__dirname + '/page.html', function (err, src) {
  console.log(versions.parse(src))
})
