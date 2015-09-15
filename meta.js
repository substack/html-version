var has = require('has')

module.exports = function (page) {
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

function esc (str) {
  return str.replace(/["'<>]/g, function (s) {
    return '&#x' + s.charCodeAt(0).toString(16) + ';'
  })
}
