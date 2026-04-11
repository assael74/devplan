// C:\projects\devplan\functions\src\shared\clean.js

function clean(value) {
  return String(value ?? '').trim()
}

module.exports = { clean }
