// functions\src\domain\abilities\engine\abilitiesHistory.dates.js

// קובץ מקביל: src/shared/abilities/engine/abilitiesHistory.dates.js
// הערה: בכל שינוי בקובץ זה יש לבדוק ולעדכן גם את הקובץ המקביל בצד ה־src.

const {
  safeStr,
  toIsoDateOnly,
  parseIsoDateOnly,
} = require('./abilitiesHistory.utils')
const { WINDOW_DAYS } = require('./abilitiesHistory.constants')

function buildWindowMeta(evalDate) {
  const isoDate = toIsoDateOnly(evalDate)
  const dateObj = parseIsoDateOnly(isoDate)

  if (!dateObj) {
    return {
      evalDate: null,
      windowKey: 'undated',
      windowStart: null,
      windowEnd: null,
      sortTime: 0,
    }
  }

  const dayMs = 24 * 60 * 60 * 1000
  const windowMs = WINDOW_DAYS * dayMs
  const time = dateObj.getTime()
  const bucketIndex = Math.floor(time / windowMs)
  const startMs = bucketIndex * windowMs
  const endMs = startMs + windowMs - dayMs

  const start = new Date(startMs)
  const end = new Date(endMs)

  const windowStart = `${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(2, '0')}-${String(start.getUTCDate()).padStart(2, '0')}`
  const windowEnd = `${end.getUTCFullYear()}-${String(end.getUTCMonth() + 1).padStart(2, '0')}-${String(end.getUTCDate()).padStart(2, '0')}`

  return {
    evalDate: isoDate,
    windowKey: safeStr(`${windowStart}_${windowEnd}`),
    windowStart,
    windowEnd,
    sortTime: startMs,
  }
}

module.exports = { buildWindowMeta }
