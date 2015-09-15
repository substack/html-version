var cheerio = require('cheerio')
var uniq = require('uniq')
var has = require('has')

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
