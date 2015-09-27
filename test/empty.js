var test = require('tape')
var fs = require('fs')
var hver = require('../')
var cheerio = require('cheerio')

var src = fs.readFileSync(__dirname + '/data/src.html', 'utf8')

test('empty upgrade', function (t) {
  t.plan(1)
  t.equal(hver.update(src, [], {}), src)
})
