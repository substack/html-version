var test = require('tape')
var fs = require('fs')
var versions = require('../')

test('versions', function (t) {
  t.plan(6)
  fs.readFile(__dirname + '/data/page.html', function (err, src) {
    t.ifError(err)
    var parsed = versions.parse(src)
    t.equal(parsed.version, '1.2.0')
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
      ].sort()
    })
    t.deepEqual(parsed.latest, [
      'https://example.com/versions/latest.html',
      'magnet:?xt=urn:btih:4a533d47ec9c7d95b1ad75f576cffc641853b750',
      'ipns:QmWJ9zRgvEvdzBPm1pshDqqFKqMXRJoHDQ4nuocHYS2REk'
    ].sort())
    t.deepEqual(parsed.predecessor, [
      'https://example.com/versions/1.1.0.html',
      'ipfs:QmWMey8Dd1ZH9XWRP3d7N1oSoL35uou1GSMpBwt4UahFSD'
    ].sort())
    t.deepEqual(parsed.integrity, {
      /*
      'https://example.com/versions/1.2.0.html.sig': [
        'ed25519-XIuQBrc84d+KHryxLJ4b/d0JwTV2FtnTDVuiSjRvwsA='
      ],
      */
      'https://example.com/versions/1.0.0.html': [
        'sha256-mPjSxFzbBSy+LyCVyylIf5E/7zswbvsL4D/qxCAqrjY'
      ],
      'https://example.com/versions/1.0.1.html': [
        'sha256-Qra3bKdpoprvRqkTF96gWOa0dPkA8MHYxOJqVsvkzIY='
      ],
      'https://example.com/versions/1.1.0.html': [
        'sha256-9VGwnCJuLbwo/N+TL1Ia9whqP8kVwEO8K0IFTUQk19o='
      ]
    })
  })
})

function fixSort (obj) {
  return Object.keys(obj).reduce(function (acc, key) {
    acc[key] = obj[key].sort()
    return acc
  }, {})
}
