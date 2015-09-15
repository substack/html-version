var fs = require('fs')
var versions = require('../')

var prev = fs.readFileSync(__dirname + '/page.html')
var src = fs.readFileSync(__dirname + '/src.html')
var loc = [
  'https://example.com/versions/1.2.0.html',
  'ipfs:QmSguVEXZRRtDCRm3XGjvTQNnLHWkgowoFJ9jpCp5kEMEB'
]
console.log(versions.update(src, loc, versions.parse(prev)))
