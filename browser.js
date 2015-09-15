var uniq = require('uniq')
var has = require('has')

exports.parse = function (root) {
  if (typeof root === 'string' || !/^html/i.test(root.constructor.name)) {
    root = dom(root)
  }
  var info = { integrity: {} }
  info.version = null
  select('meta[name="version"]', function (link) {
    var ver = link.getAttribute('content')
    if (ver) info.version = ver
  })

  info.versions = {}
  select('link[rel="version"]', function (link) {
    var ver = link.getAttribute('version')
    if (!ver) return
    if (!info.versions[ver]) info.versions[ver] = []
    var href = link.getAttribute('href')
    if (href) info.versions[ver].push(href)
    pushIntegrity(link)
  })
  Object.keys(info.versions).forEach(function (key) {
    uniq(info.versions[key])
  })

  info.signature = []
  select('link[rel="signature"]', function (link) {
    var href = link.getAttribute('href')
    if (href) info.signature.push(href)
    pushIntegrity(link)
  })
  uniq(info.signature)

  info.latest = []
  select('link[rel="latest-version"]', function (link) {
    var href = link.getAttribute('href')
    if (href) info.latest.push(href)
  })
  uniq(info.latest)

  info.predecessor = []
  select('link[rel="predecessor-version"]', function (link) {
    var href = link.getAttribute('href')
    var ver = link.getAttribute('version')
    if (href) info.predecessor.push(href)
    if (ver && has(info.versions, ver)) {
      info.predecessor.push.apply(info.predecessor, info.versions[ver])
    }
    pushIntegrity(link)
  })
  uniq(info.predecessor)

  Object.keys(info.integrity).forEach(function (key) {
    uniq(info.integrity[key])
  })

  return info

  function select (q, f) {
    var nodes = root.querySelectorAll(q)
    for (var i = 0; i < nodes.length; i++) f(nodes[i])
  }
 
  function pushIntegrity (link) {
    var href = link.getAttribute('href')
    var grit = link.getAttribute('integrity')
    if (href && grit) {
      var grits = info.integrity[href]
      if (!grits) grits = info.integrity[href] = []
      grits.push.apply(grits, grit.split(/\s+/).filter(Boolean))
    }
  }
}

function dom (str) {
  var div = document.createElement('div')
  div.innerHTML = str
  return div
}
