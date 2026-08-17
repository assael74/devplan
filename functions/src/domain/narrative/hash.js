// C:\projects\devplan\functions\src\domain\narrative\hash.js

const crypto = require('crypto')

function sortValue(value) {
  if (Array.isArray(value)) return value.map(sortValue)
  if (!value || typeof value !== 'object') return value

  return Object.keys(value)
    .sort()
    .reduce((result, key) => {
      result[key] = sortValue(value[key])
      return result
    }, {})
}

function buildHash(value) {
  const canonical = JSON.stringify(sortValue(value))
  return crypto.createHash('sha256').update(canonical).digest('hex')
}

module.exports = { buildHash }
