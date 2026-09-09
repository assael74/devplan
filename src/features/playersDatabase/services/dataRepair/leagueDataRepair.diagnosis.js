import { buildLeaguesMasterLeagueEntry } from './leagueDataRepair.projections.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()
const seasonKeyOf = season => clean(season?.seasonKey || season?.seasonId)

const comparable = value => {
  if (Array.isArray(value)) return value.map(comparable)
  if (value && typeof value === 'object') return Object.keys(value)
    .filter(key => key !== 'updatedAt')
    .sort()
    .reduce((result, key) => ({ ...result, [key]: comparable(value[key]) }), {})
  return value
}

const same = (left, right) => (
  JSON.stringify(comparable(left)) === JSON.stringify(comparable(right))
)

export const buildLeagueDataRepairIssues = ({
  leagueDocument = {},
  leaguesMaster = {},
  seasonKey = '',
} = {}) => {
  const current = leagueDocument?.current && typeof leagueDocument.current === 'object'
    ? leagueDocument.current
    : null
  const history = Array.isArray(leagueDocument?.history) ? leagueDocument.history : []
  const currentSeasonKey = seasonKeyOf(current)
  const selected = clean(seasonKey)
  const issues = []

  if (current && clean(current.seasonStatus) === 'completed' && (!selected || selected === currentSeasonKey)) {
    issues.push({
      action: 'lifecycle',
      title: `עונה שהסתיימה נמצאת ב-current${currentSeasonKey ? ` (${currentSeasonKey})` : ''}`,
      description: 'עונה שהסתיימה חייבת לעבור כאובייקט מלא ל-history. אין לתקן את סטטוס האינדקס בלבד.',
    })
  }

  if (currentSeasonKey && history.some(season => seasonKeyOf(season) === currentSeasonKey)) {
    issues.push({
      action: 'lifecycle',
      title: `עונת ${currentSeasonKey} קיימת גם ב-current וגם ב-history`,
      description: 'לאותה עונה מותר להיות מיקום אחד בלבד במסמך הליגה.',
    })
  }

  const leagueId = clean(leagueDocument?.leagueId || leagueDocument?.id)
  const masterEntry = (Array.isArray(leaguesMaster?.leagues) ? leaguesMaster.leagues : [])
    .find(entry => clean(entry?.leagueId || entry?.leagueDocumentId) === leagueId)
  const expectedMasterEntry = buildLeaguesMasterLeagueEntry(leagueDocument, masterEntry || {})

  if (leagueId && !same(expectedMasterEntry, masterEntry || null)) {
    issues.push({
      action: 'master',
      title: 'המאסטר של הליגה אינו תואם למסמך הליגה',
      description: 'מסמך המאסטר נטען מחדש והושווה למסמך הליגה. התיקון מסנכרן רק את הרשומה של הליגה במסמך המאסטר; מסמך הליגה לא נכתב.',
    })
  }

  return issues
}
