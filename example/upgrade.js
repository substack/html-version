var fs = require('fs')
var versions = require('../')

var prev = fs.readFileSync(__dirname + '/page.html')
var src = fs.readFileSync(__dirname + '/src.html')

console.log(versions.update(src, versions.parse(prev)))
