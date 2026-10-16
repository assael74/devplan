// src/features/playersDatabase/ui/pages/teamPage/information/model/teamWorkspace.navigation.js

export const TEAM_INSIGHTS = Object.freeze([
  { id: 'performance', title: 'ביצועי השנתון', subtitle: 'העונה וביחס לעונות קודמות', iconId: 'stats' },
  { id: 'roster-balance', title: 'איזון הסגל', subtitle: 'חלוקת דקות ועמדות', iconId: 'scouting' },
  { id: 'year-movements', title: 'תנועת השנתון', subtitle: 'מצטרפים ועוזבים לאורך עונות', iconId: 'swapVert' },
  { id: 'future-competition', title: 'שינוי בצפי התחרות', subtitle: 'רמת התחרות בעונות הבאות', iconId: 'league' },
  { id: 'club-gap', title: 'השנתון בתוך המועדון', subtitle: 'השוואה לנורמת המועדון', iconId: 'players' },
])

const insightIds = new Set(TEAM_INSIGHTS.map(insight => insight.id))

export const getTeamInsight = id => TEAM_INSIGHTS.find(insight => insight.id === id) || null

export const resolveTeamWorkspace = search => {
  const params = new URLSearchParams(search)
  const insight = params.get('insight') || ''
  const sourceInsight = params.get('fromInsight') || ''

  if (params.get('view') === 'roster') {
    return {
      mode: 'roster',
      insightId: '',
      sourceInsightId: insightIds.has(sourceInsight) ? sourceInsight : '',
    }
  }

  if (insightIds.has(insight)) {
    return {
      mode: 'insight',
      insightId: insight,
      sourceInsightId: '',
    }
  }

  return { mode: 'overview', insightId: '', sourceInsightId: '' }
}

export const buildTeamWorkspaceUrl = ({
  location,
  mode,
  insightId = '',
  sourceInsightId = '',
}) => {
  const params = new URLSearchParams(location.search)
  params.delete('insight')
  params.delete('view')
  params.delete('fromInsight')
  params.delete('analysisSeason')

  if (mode === 'insight' && insightIds.has(insightId)) {
    params.set('insight', insightId)
  }
  if (mode === 'roster') {
    params.set('view', 'roster')
    if (insightIds.has(sourceInsightId)) params.set('fromInsight', sourceInsightId)
  }
  const query = params.toString()
  return `${location.pathname}${query ? `?${query}` : ''}`
}

const buildSeasonUrl = ({ location, optionKey, key }) => {
  const params = new URLSearchParams(location.search)
  params.delete('analysisSeason')
  if (optionKey) params.set(key, optionKey)
  else params.delete(key)
  const query = params.toString()
  return `${location.pathname}${query ? `?${query}` : ''}`
}

export const buildTeamRosterSeasonUrl = ({ location, optionKey }) => (
  buildSeasonUrl({ location, optionKey, key: 'rosterSeason' })
)
