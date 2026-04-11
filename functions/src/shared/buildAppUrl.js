// C:\projects\devplan\functions\src\shared\buildAppUrl.js

function buildAppUrl(path = '') {
  const safePath = path.startsWith('/') ? path : `/${path}`
  return `https://devplan-b4454.web.app${safePath}`
}

module.exports = { buildAppUrl }
