// shared/players/players.logic.js

export const toStr = (value) => {
  return value == null ? '' : String(value)
}

export const clean = (value) => {
  return toStr(value).trim()
}

export const toNum = (value) => {
  if (value == null || value === '') return null

  const num = Number(value)

  return Number.isFinite(num) ? num : null
}

export const safeArr = (value) => {
  return Array.isArray(value) ? value.filter(Boolean) : []
}

export const sameArr = (a, b) => {
  const x = safeArr(a)
  const y = safeArr(b)

  if (x.length !== y.length) return false

  for (let index = 0; index < x.length; index += 1) {
    if (x[index] !== y[index]) return false
  }

  return true
}

export const padMonth = (value) => {
  const str = clean(value)

  if (!str) return ''

  return str.padStart(2, '0')
}

export const parseBirthValue = (birth) => {
  const raw = clean(birth)

  if (!raw) {
    return {
      month: '',
      year: '',
    }
  }

  const [monthRaw = '', yearRaw = ''] = raw.split('-')

  return {
    month: padMonth(monthRaw),
    year: clean(yearRaw),
  }
}

export const buildBirthValue = (month, year) => {
  const safeMonth = padMonth(month)
  const safeYear = clean(year)

  if (!safeMonth || !safeYear) return ''

  return `${safeMonth}-${safeYear}`
}

export const normalizeProjectType = (value) => {
  if (value === true) return true
  if (value === false) return false

  const str = clean(value).toLowerCase()

  return str === 'project' || str === 'true'
}

export const resolvePlayerTypeValue = (value) => {
  return normalizeProjectType(value) ? 'project' : 'noneType'
}

export const isProjectPlayer = (value) => {
  return normalizeProjectType(value)
}

export const buildPlayerName = (player = {}) => {
  const firstName = clean(player?.playerFirstName)
  const lastName = clean(player?.playerLastName)
  const shortName = clean(player?.playerShortName)

  return (
    [firstName, lastName].filter(Boolean).join(' ').trim() ||
    shortName ||
    clean(player?.playerFullName) ||
    clean(player?.fullName) ||
    clean(player?.name) ||
    'שחקן'
  )
}

export const buildPlayerMeta = (player = {}) => {
  return (
    clean(player?.teamName) ||
    clean(player?.team?.teamName) ||
    clean(player?.team?.name) ||
    clean(player?.clubName) ||
    clean(player?.club?.clubName) ||
    clean(player?.club?.name) ||
    'שחקן'
  )
}

export const calcPlayerBmi = (heightCm, weightKg) => {
  const height = toNum(heightCm)
  const weight = toNum(weightKg)

  if (!height || !weight) return null

  const heightMeters = height / 100
  if (!heightMeters) return null

  const bmi = weight / (heightMeters * heightMeters)

  return Number.isFinite(bmi) ? bmi : null
}

export const getPlayerBmiText = (heightCm, weightKg) => {
  const bmi = calcPlayerBmi(heightCm, weightKg)

  return bmi == null ? 'BMI —' : `BMI ${bmi.toFixed(1)}`
}

export const getPlayerActiveChipMeta = (active) => {
  return active
    ? {
        color: 'success',
        iconId: 'active',
        label: 'פעיל',
      }
    : {
        color: 'danger',
        iconId: 'notActive',
        label: 'לא פעיל',
      }
}

export const isPlaceholderPhone = (value) => {
  const str = clean(value)

  if (!str) return true

  return (
    str === '000-000000' ||
    str === '0000000000' ||
    str === '000000000'
  )
}
