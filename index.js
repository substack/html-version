var cheerio = require('cheerio')
var uniq = require('uniq')
var has = require('has')
var detect = require('detect-indent')
var esc = require('he').encode
var copy = require('shallow-copy')

exports.parse = function (src) {
  var select = cheerio.load(src)
  var info = { integrity: {} }
  info.version = null
  select('meta[name="version"]').each(function (i, link) {
    var ver = link.attribs.content
    if (ver) info.version = link.attribs.content
  })

  info.versions = {}
  select('link[rel="version"]').each(function (i, link) {
    var ver = link.attribs.version
    if (!ver) return
    if (!info.versions[ver]) info.versions[ver] = []
    var href = link.attribs.href
    if (href) info.versions[ver].push(href)
    pushIntegrity(link)
  })
  Object.keys(info.versions).forEach(function (key) {
    uniq(info.versions[key])
  })

  info.signature = []
  select('link[rel="signature"]').each(function (i, link) {
    var href = link.attribs.href
    if (href) info.signature.push(href)
    pushIntegrity(link)
  })
  uniq(info.signature)

  info.latest = []
  select('link[rel="latest-version"]').each(function (i, link) {
    var href = link.attribs.href
    if (href) info.latest.push(href)
  })
  uniq(info.latest)

  info.predecessor = []
  select('link[rel="predecessor-version"]').each(function (i, link) {
    var href = link.attribs.href
    var ver = link.attribs.version
    if (href) info.predecessor = href
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

  function pushIntegrity (link) {
    var href = link.attribs.href
    var grit = link.attribs.integrity
    if (href && grit) {
      var grits = info.integrity[href]
      if (!grits) grits = info.integrity[href] = []
      grits.push.apply(grits, grit.split(/\s+/).filter(Boolean))
    }
  }
}

exports.meta = function (page) {
  var parts = Object.keys(page.versions).sort().map(function (key) {
    return page.versions[key].map(function (href) {
      var grits = ''
      if (has(page.integrity, href) && page.integrity[href].length) {
        grits = 'integrity="' + esc(page.integrity[href].join(' ')) + '"'
      }
      return '<link rel="version" href="' + esc(href) + '"'
        + ' version="' + esc(key) + '"' + grits + '>'
    }).join('\n')
  })
  page.latest.forEach(function (href) {
    parts.push('<link rel="latest-version" href="' + esc(href) + '">')
  })
  page.predecessor.forEach(function (href) {
    parts.push('<link rel="predecessor-version" href="' + esc(href) + '">')
  })
  return parts.join('\n')
}

exports.update = function (src, loc, prev) {
  prev = copy(prev)
  if (prev.version) {
    prev.versions[prev.version] = loc
    prev.predecessor = loc
  }
  var select = cheerio.load(src)
  var meta = exports.meta(prev)
  var head = select('head')[0]
  var detected = detect(typeof src === 'string' ? src : src.toString())
    .indent

  if (head) {
    head = select(head)
    var pre = head.html()
    var postdent = /(\s*)$/.exec(pre.split('\n').slice(-1)[0])[1].length
    var dent = Array(
      /^(\s*)/.exec(pre.split('\n').slice(-2,-1)[0])[1].length+1
    ).join(' ')
    head.html(
      pre.replace(/\s*$/, '\n')
      + indent(meta, dent) + '\n'
      + Array(postdent + 1).join(' ')
    )
    return select.html()
  }
  var html = select('html')[0]
  if (html) {
    html = select(html)
    var post = html.html()
    var dent = Array(/^[\r\n]*(\s*)/.exec(post)[1].length + 1).join(' ')
    html.html(
      '\n' + dent + '<head>'
      + '\n' + indent(meta, dent + detected)
      + '\n' + dent + '</head>\n'
      + html.html()
    )
    return select.html()
  } else {
    var post = select.html()
    var dent = Array(/^[\r\n]*(\s*)/.exec(post)[1].length + 1).join(' ')
    return dent + '<head>\n'
      + indent(meta, dent + detected)
      + '\n' + dent + '</head>\n'
      + post
  }
}

function indent (str, sp) {
  return sp + str.split('\n').join('\n' + sp).replace(/ *$/, '')
}
