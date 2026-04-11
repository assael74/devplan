// C:\projects\devplan\functions\src\shared\extractLastPathPart.js

const { clean } = require('./clean')

function extractLastPathPart(req) {
  const parts = String(req.path || '')
    .split('/')
    .map((part) => clean(part))
    .filter(Boolean)

  return parts.length ? parts[parts.length - 1] : ''
}

module.exports = { extractLastPathPart }
