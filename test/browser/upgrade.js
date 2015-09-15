var test = require('tape')
var fs = require('fs')
var versions = require('../../')

var prev = fs.readFileSync(__dirname + '/../data/page.html')
var src = fs.readFileSync(__dirname + '/../data/src.html')

test('upgrade', function (t) {
  t.plan(4)
  var loc = [
    'https://example.com/versions/1.2.0.html',
    'ipfs:QmSguVEXZRRtDCRm3XGjvTQNnLHWkgowoFJ9jpCp5kEMEB'
  ]
  var pprev = versions.parse(prev)
  var updated = versions.update(src, loc, pprev)
  var udiv = document.createElement('div')
  udiv.innerTML = updated
  t.equal(udiv.querySelector('body').innerText.trim(), 'whatever')
  var parsed = versions.parse(updated)
  t.deepEqual(fixSort(parsed.versions), {
    '1.0.0': [
      'https://example.com/versions/1.0.0.html', 
      'magnet:?xt=urn:btih:4822271aa656ba6913a14edb117d3c4dc50f1209'
    ].sort(),
    '1.0.1': [
      'https://example.com/versions/1.0.1.html',
      'magnet:?xt=urn:btih:d0320ebba035cc86526baae771da14912895e113',
      'ipfs:QmNcojAWDNwf1RZsPsG2ABvK4FVs7yq4iwSrKaMdPwV3Sh'
    ].sort(),
    '1.1.0': [
      'https://example.com/versions/1.1.0.html',
      'ipfs:QmWMey8Dd1ZH9XWRP3d7N1oSoL35uou1GSMpBwt4UahFSD'
    ].sort(),
    '1.2.0': [
      'https://example.com/versions/1.2.0.html',
      'ipfs:QmSguVEXZRRtDCRm3XGjvTQNnLHWkgowoFJ9jpCp5kEMEB'
    ].sort()
  })
  t.deepEqual(parsed.predecessor.sort(), [
    'https://example.com/versions/1.2.0.html',
    'ipfs:QmSguVEXZRRtDCRm3XGjvTQNnLHWkgowoFJ9jpCp5kEMEB'
  ].sort())
  t.deepEqual(parsed.latest.sort(), [
    'https://example.com/versions/latest.html',
    'ipns:QmWJ9zRgvEvdzBPm1pshDqqFKqMXRJoHDQ4nuocHYS2REk',
    'magnet:?xt=urn:btih:4a533d47ec9c7d95b1ad75f576cffc641853b750'
  ].sort())
})

function fixSort (obj) {
  return Object.keys(obj).reduce(function (acc, key) {
    acc[key] = obj[key].sort()
    return acc
  }, {})
}
