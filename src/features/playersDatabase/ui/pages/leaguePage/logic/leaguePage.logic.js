// features/playersDatabase/ui/pages/leaguePage/logic/leaguePage.logic.js

const REGION_LABELS = [
  'דרום',
  'צפון',
  'מרכז',
  'שרון',
  'שפלה',
  'נגב',
  'גליל',
  'חיפה',
  'ירושלים',
]

const REGION_LABEL_BY_KEY = {
  south: 'דרום',
  north: 'צפון',
  center: 'מרכז',
  central: 'מרכז',
  sharon: 'שרון',
  shefela: 'שפלה',
  negev: 'נגב',
  galil: 'גליל',
  haifa: 'חיפה',
  jerusalem: 'ירושלים',
}

const clean = value => String(value ?? '').trim()
const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const resolveRegionLabel = value => {
  const region = clean(value)
  if (!region) return ''

  return REGION_LABEL_BY_KEY[region] || region
}

export const splitLeagueTitle = league => {
  const name = clean(league?.name)
  const explicitRegion = resolveRegionLabel(league?.region)
  const matchedRegion = explicitRegion || REGION_LABELS.find(region => name.endsWith(region))
  const baseName = matchedRegion
    ? clean(name.replace(new RegExp(`\\s*-?\\s*${escapeRegExp(matchedRegion)}\\s*$`), ''))
    : name

  return {
    name: baseName || name || '-',
    region: matchedRegion,
  }
}
