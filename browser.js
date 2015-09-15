var uniq = require('uniq')
var has = require('has')
var detect = require('detect-indent')
var copy = require('shallow-copy')
var indent = require('./lib/indent.js')

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

exports.meta = require('./meta.js')

exports.update = function (root, loc, prev) {
  if (/^html/i.test(root.constructor.name)) {
    root = root.cloneNode(true)
  } else root = dom(root)
  var src = root.outerHTML

  prev = copy(prev)
  if (prev.version) {
    prev.versions[prev.version] = loc
    prev.predecessor = loc
  }
  var meta = exports.meta(prev)
  var head = root.querySelector('head')
  var detected = detect(typeof src === 'string' ? src : src.toString())
    .indent

  if (head) {
    var pre = head.innerHTML
    var postdent = /(\s*)$/.exec(pre.split('\n').slice(-1)[0])[1].length
    var dent = Array(
      /^(\s*)/.exec(pre.split('\n').slice(-2,-1)[0])[1].length+1
    ).join(' ')
    head.innerHTML = pre.replace(/\s*$/, '\n')
      + indent(meta, dent) + '\n'
      + Array(postdent + 1).join(' ')
    return root.outerHTML
  }
  var html = root.querySelector('html')
  if (html) {
    html = select(html)
    var post = html.html()
    var dent = Array(/^[\r\n]*(\s*)/.exec(post)[1].length + 1).join(' ')
    html.innerHTML = '\n' + dent + '<head>'
      + '\n' + indent(meta, dent + detected)
      + '\n' + dent + '</head>\n'
      + html.innerHTML
    return root.outerHTML
  } else {
    var post = root.innerHTML
    var dent = Array(/^[\r\n]*(\s*)/.exec(post)[1].length + 1).join(' ')
    return dent + '<head>\n'
      + indent(meta, dent + detected)
      + '\n' + dent + '</head>\n'
      + post
  }

  function select (q, f) {
    var nodes = root.querySelectorAll(q)
    for (var i = 0; i < nodes.length; i++) f(nodes[i])
  }
}

function dom (str) {
  var div = document.createElement('html')
  div.innerHTML = str
  return div
}
