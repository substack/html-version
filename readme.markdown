# html-version

parse and modify html file versions according to the
[html version spec](https://github.com/substack/html-version-spec)

# example

## parse

``` js
var fs = require('fs')
var versions = require('html-version')

fs.readFile(__dirname + '/page.html', function (err, src) {
  console.log(versions.parse(src))
})
```

output:

```
{ integrity: 
   { 'https://example.com/versions/1.0.0.html': [ 'sha256-mPjSxFzbBSy+LyCVyylIf5E/7zswbvsL4D/qxCAqrjY' ],
     'https://example.com/versions/1.0.1.html': [ 'sha256-Qra3bKdpoprvRqkTF96gWOa0dPkA8MHYxOJqVsvkzIY=' ],
     'https://example.com/versions/1.1.0.html': [ 'sha256-9VGwnCJuLbwo/N+TL1Ia9whqP8kVwEO8K0IFTUQk19o=' ] },
  version: '1.2.0',
  versions: 
   { '1.0.0': 
      [ 'https://example.com/versions/1.0.0.html',
        'magnet:?xt=urn:btih:4822271aa656ba6913a14edb117d3c4dc50f1209' ],
     '1.0.1': 
      [ 'https://example.com/versions/1.0.1.html',
        'ipfs:QmNcojAWDNwf1RZsPsG2ABvK4FVs7yq4iwSrKaMdPwV3Sh',
        'magnet:?xt=urn:btih:d0320ebba035cc86526baae771da14912895e113' ],
     '1.1.0': 
      [ 'https://example.com/versions/1.1.0.html',
        'ipfs:QmWMey8Dd1ZH9XWRP3d7N1oSoL35uou1GSMpBwt4UahFSD' ] },
  signature: [ 'https://example.com/versions/1.2.0.html.sig' ],
  latest: 
   [ 'https://example.com/versions/latest.html',
     'ipns:QmWJ9zRgvEvdzBPm1pshDqqFKqMXRJoHDQ4nuocHYS2REk',
     'magnet:?xt=urn:btih:4a533d47ec9c7d95b1ad75f576cffc641853b750' ],
  predecessor: 
   [ 'https://example.com/versions/1.1.0.html',
     'ipfs:QmWMey8Dd1ZH9XWRP3d7N1oSoL35uou1GSMpBwt4UahFSD' ] }
```

## upgrade

``` js
var fs = require('fs')
var versions = require('html-version')

var prev = fs.readFileSync(__dirname + '/page.html')
var src = fs.readFileSync(__dirname + '/src.html')
var loc = [
  'https://example.com/versions/1.2.0.html',
  'ipfs:QmSguVEXZRRtDCRm3XGjvTQNnLHWkgowoFJ9jpCp5kEMEB'
]
console.log(versions.update(src, loc, versions.parse(prev)))
```

output:

```
<html>
  <head>
    <meta name="version" content="1.2.1">
    <link rel="version" href="https://example.com/versions/1.0.0.html" version="1.0.0" integrity="sha256-mPjSxFzbBSy+LyCVyylIf5E/7zswbvsL4D/qxCAqrjY">
    <link rel="version" href="magnet:?xt=urn:btih:4822271aa656ba6913a14edb117d3c4dc50f1209" version="1.0.0">
    <link rel="version" href="https://example.com/versions/1.0.1.html" version="1.0.1" integrity="sha256-Qra3bKdpoprvRqkTF96gWOa0dPkA8MHYxOJqVsvkzIY=">
    <link rel="version" href="ipfs:QmNcojAWDNwf1RZsPsG2ABvK4FVs7yq4iwSrKaMdPwV3Sh" version="1.0.1">
    <link rel="version" href="magnet:?xt=urn:btih:d0320ebba035cc86526baae771da14912895e113" version="1.0.1">
    <link rel="version" href="https://example.com/versions/1.1.0.html" version="1.1.0" integrity="sha256-9VGwnCJuLbwo/N+TL1Ia9whqP8kVwEO8K0IFTUQk19o=">
    <link rel="version" href="ipfs:QmWMey8Dd1ZH9XWRP3d7N1oSoL35uou1GSMpBwt4UahFSD" version="1.1.0">
    <link rel="version" href="https://example.com/versions/1.2.0.html" version="1.2.0">
    <link rel="version" href="ipfs:QmSguVEXZRRtDCRm3XGjvTQNnLHWkgowoFJ9jpCp5kEMEB" version="1.2.0">
    <link rel="latest-version" href="https://example.com/versions/latest.html">
    <link rel="latest-version" href="ipns:QmWJ9zRgvEvdzBPm1pshDqqFKqMXRJoHDQ4nuocHYS2REk">
    <link rel="latest-version" href="magnet:?xt=urn:btih:4a533d47ec9c7d95b1ad75f576cffc641853b750">
    <link rel="predecessor-version" href="https://example.com/versions/1.2.0.html">
    <link rel="predecessor-version" href="ipfs:QmSguVEXZRRtDCRm3XGjvTQNnLHWkgowoFJ9jpCp5kEMEB">
  </head>
  <body>
    whatever
  </body>
</html>
```

# api

``` js
var versions = require('html-version')
```

## var info = versions.parse(html)

Parse a string of `html` into an object `info`:

* `info.version` - the `<meta name="version">` contents
* `info.versions` - an object mapping semver version strings to arrays of URLs
* `info.integrity` - an object mapping URLs to arrays of integrity strings
* `info.signature` - an array of signature URLs
* `info.latest` - an array of latest version URLs
* `info.predecessor` - an array of predecessor version URLs

## var html = versions.meta(info)

Return meta and link tags in an `html` string for `info`, a parsed version
object.

## var html = versions.update(src, loc, prevInfo)

Update `src` with new meta and link tags that add to the previous version
metadata.

Return a string of `html` for a current html string `src`, the location of the
previous document as an array of URLs `loc`, and `prevInfo`, the parsed version
info for the previous html.

# thanks

Thanks to [blockai](https://blockai.com) for sponsoring this project.

# license

MIT
