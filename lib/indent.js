module.exports = function indent (str, sp) {
  return sp + str.split('\n').join('\n' + sp).replace(/ *$/, '')
}
