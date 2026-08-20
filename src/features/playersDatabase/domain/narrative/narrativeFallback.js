// src/features/playersDatabase/domain/narrative/narrativeFallback.js

const percent = value => `${Math.round(Number(value || 0) * 100)}%`

const resolveProfileLabels = entries => [...new Set(
  entries
    .map(entry => entry?.scout?.contract?.profiles?.primary?.label)
    .filter(Boolean)
)]

const resolveClubNames = entries => [...new Set(
  entries
    .map(entry => entry?.team?.clubName)
    .filter(Boolean)
)]

const buildTitle = entries => {
  const profiles = resolveProfileLabels(entries)

  if (profiles.length === 1) return profiles[0]
  if (profiles.length > 1) return 'מספר פרופילים מקצועיים'
  return 'תמונת מצב מקצועית'
}

const buildEntryParts = entry => {
  const parts = []
  const stats = entry?.evidence?.stats || {}
  const clubName = entry?.team?.clubName

  if (clubName) parts.push(`${clubName}:`)
  if (stats.games) {
    parts.push(`${stats.games} משחקים, ${stats.starts} פתיחות ו-${stats.goals} שערים.`)
  }
  if (stats.goalShare !== null && stats.goalShare !== undefined) {
    parts.push(`אחראי ל-${percent(stats.goalShare)} משערי הקבוצה.`)
  }
  if (entry?.age?.isPlayingUp === true) {
    parts.push(`משחק מעל קבוצת הגיל שלו בפער של ${entry.age.ageGap} שנתון.`)
  }

  return parts.join(' ')
}

export const buildSeasonFallback = season => {
  const entries = Array.isArray(season?.entries) ? season.entries : []

  if (!entries.length) {
    return {
      title: 'תמונת מצב מקצועית',
      summary: 'אין עדיין מספיק מידע ליצירת סיפור מקצועי.',
    }
  }

  const clubs = resolveClubNames(entries)
  const intro = clubs.length > 1
    ? `בעונה מופיעים ${clubs.length} הקשרים מקצועיים: ${clubs.join(', ')}.`
    : ''
  const details = entries
    .map(buildEntryParts)
    .filter(Boolean)
    .join(' ')

  return {
    title: buildTitle(entries),
    summary: [intro, details].filter(Boolean).join(' '),
  }
}

export const buildCareerFallback = input => {
  const seasons = Array.isArray(input?.seasons) ? input.seasons : []
  const entries = seasons.flatMap(season => season.entries || [])
  const clubs = resolveClubNames(entries)
  const profiles = resolveProfileLabels(entries)
  const parts = []

  if (seasons.length) parts.push(`קיימות ${seasons.length} עונות מתועדות.`)
  if (clubs.length > 1) parts.push(`השחקן הופיע ב-${clubs.length} מועדונים: ${clubs.join(', ')}.`)
  if (profiles.length) parts.push(`פרופילים שזוהו לאורך התקופה: ${profiles.join(', ')}.`)

  const playingUpSeasons = seasons.filter(season => (
    season.entries || []
  ).some(entry => entry?.age?.isPlayingUp === true))

  if (playingUpSeasons.length === 1) {
    parts.push('בעונה אחת תועד משחק מעל קבוצת הגיל.')
  } else if (playingUpSeasons.length > 1) {
    parts.push(`ב-${playingUpSeasons.length} עונות תועד משחק מעל קבוצת הגיל.`)
  }

  return {
    title: 'התפתחות מקצועית לאורך זמן',
    summary: parts.length
      ? parts.join(' ')
      : 'אין עדיין מספיק היסטוריה ליצירת סיפור קריירה.',
  }
}

export const buildNarrativeFallback = input => {
  const seasons = Array.isArray(input?.seasons) ? input.seasons : []
  const currentSeason = seasons[seasons.length - 1] || null

  return buildSeasonFallback(currentSeason)
}
