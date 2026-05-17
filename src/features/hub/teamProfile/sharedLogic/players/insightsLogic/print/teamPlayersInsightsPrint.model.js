// teamProfile/sharedLogic/players/insightsLogic/print/teamPlayersInsightsPrint.model.js

import {
  PLAYER_INSIGHT_PROFILES,
} from '../../../../../../../shared/players/insights/index.js'

import {
  asText,
  formatNumber,
  formatSignedNumber,
  getGameLabel,
  getRangeGames,
} from './print.utils.js'

const ROLE_LABELS = {
  key: 'שחקן מפתח',
  core: 'שחקן מרכזי',
  rotation: 'שחקן רוטציה',
  fringe: 'סגל מורחב',
}

const POSITION_LABELS = {
  goalkeeper: 'שוער',
  defense: 'הגנה',
  dmMid: 'קישור אחורי',
  midfield: 'קישור',
  atMidfield: 'קישור התקפי',
  attack: 'התקפה',
}

const PROFILE_ORDER = [
  'stat_anchor',
  'core_worker',
  'weak_spot',
  'joker',
  'unstable',
  'secondary_contributor',
  'out_of_sample',
]

const PROFILE_SORT_ORDER = PROFILE_ORDER.reduce((acc, id, index) => {
  acc[id] = index + 1

  return acc
}, {})

const getRoleLabel = (value) => {
  return ROLE_LABELS[value] || 'ללא מעמד'
}

const getPositionLabel = (value) => {
  return POSITION_LABELS[value] || 'ללא עמדה'
}

const getScopeTitle = ({
  performanceScope,
}) => {
  if (performanceScope?.mode === 'range') {
    return 'טווח משחקים'
  }

  return 'כל השנה'
}

const getScopeDescription = ({
  performanceScope,
  rangeGames,
}) => {
  if (!rangeGames.length) {
    return 'לא נמצאו משחקי ליגה ששוחקו בפועל'
  }

  if (performanceScope?.mode !== 'range') {
    return `${rangeGames.length} משחקי ליגה ששוחקו`
  }

  const first = rangeGames[0]
  const last = rangeGames[rangeGames.length - 1]

  return [
    `${rangeGames.length} משחקים`,
    `מ־${getGameLabel(first)}`,
    `עד ${getGameLabel(last)}`,
  ].join(' · ')
}

const getPrintSubStatus = (value) => {
  const text = asText(value, '')

  if (!text) return ''

  return text
    .replace('יציב, אבל במינוס', 'יציב במינוס')
    .replace('לא נמצא במדגם המשחקים שנבחר', 'לא במדגם')
}

const getProfileId = (row = {}) => {
  return row.scopedInsightId ||
    row.insightId ||
    row.profile?.id ||
    'out_of_sample'
}

const getProfileRank = (row = {}) => {
  const profileId = getProfileId(row)

  return PROFILE_SORT_ORDER[profileId] || 99
}

const getRatingValue = (row = {}) => {
  const rating = Number(row.ratingRaw)

  return Number.isFinite(rating) ? rating : 0
}

const getTvaValue = (row = {}) => {
  const tva = Number(row.tva)

  return Number.isFinite(tva) ? tva : 0
}

const sortRowsByProfile = (rows = []) => {
  const safeRows = Array.isArray(rows) ? rows : []

  return safeRows.slice().sort((a, b) => {
    const profileDiff = getProfileRank(a) - getProfileRank(b)

    if (profileDiff !== 0) {
      return profileDiff
    }

    const ratingDiff = getRatingValue(b) - getRatingValue(a)

    if (ratingDiff !== 0) {
      return ratingDiff
    }

    return getTvaValue(b) - getTvaValue(a)
  })
}

const getOrderedProfiles = () => {
  return PROFILE_ORDER
    .map((id) => PLAYER_INSIGHT_PROFILES[id])
    .filter(Boolean)
}

const getTvaTone = (value) => {
  const number = Number(value)

  if (!Number.isFinite(number)) return 'neutral'
  if (number > 0) return 'positive'
  if (number < 0) return 'negative'

  return 'neutral'
}

const buildPrintRows = (rows = []) => {
  const safeRows = sortRowsByProfile(rows)

  return safeRows.map((row, index) => {
    return {
      id: row.playerId || row.id || index,

      index: index + 1,

      playerFullName: asText(row.playerFullName),
      photo: row.photo,
      role: getRoleLabel(row.role),
      position: getPositionLabel(row.positionLayer),

      scopedProfile: asText(row.scopedInsightLabel || row.insightLabel),

      rating: formatNumber({
        value: row.ratingRaw,
        digits: 3,
      }),

      tva: formatSignedNumber({
        value: row.tva,
        digits: 2,
      }),

      tvaTone: getTvaTone(row.tva),

      games: formatNumber({
        value: row.games,
        digits: 0,
      }),

      minutes: formatNumber({
        value: row.minutes,
        digits: 0,
      }),

      goals: formatNumber({
        value: row.goals,
        digits: 0,
      }),

      assists: formatNumber({
        value: row.assists,
        digits: 0,
      }),

      involvement: formatNumber({
        value: row.involvement,
        digits: 0,
      }),

      subStatus: getPrintSubStatus(row.subStatus),
    }
  })
}

const buildProfileCards = (rows = []) => {
  const safeRows = Array.isArray(rows) ? rows : []
  const profiles = getOrderedProfiles()

  const counts = safeRows.reduce((acc, row) => {
    const id = getProfileId(row)

    acc[id] = (acc[id] || 0) + 1

    return acc
  }, {})

  return profiles.map((profile) => {
    return {
      id: profile.id,
      label: profile.label,
      shortLabel: profile.shortLabel || profile.label,
      value: counts[profile.id] || 0,
      description: profile.description || '',
      coachText: profile.coachText || '',
    }
  })
}

const buildProfileLegend = () => {
  return getOrderedProfiles().map((profile) => {
    return {
      id: profile.id,
      label: profile.label,
      description: profile.description || '',
      coachText: profile.coachText || '',
    }
  })
}

const buildSummary = ({
  rows,
  rangeGames,
}) => {
  const safeRows = Array.isArray(rows) ? rows : []

  const positiveTva = safeRows.filter((row) => {
    return Number(row.tva) > 0
  }).length

  const negativeTva = safeRows.filter((row) => {
    return Number(row.tva) < 0
  }).length

  const totalMinutes = safeRows.reduce((sum, row) => {
    const minutes = Number(row.minutes)

    return sum + (Number.isFinite(minutes) ? minutes : 0)
  }, 0)

  return [
    {
      id: 'games',
      label: 'כמות משחקים',
      value: rangeGames.length,
    },
    {
      id: 'players',
      label: 'שחקנים בדוח',
      value: safeRows.length,
    },
    {
      id: 'positiveTva',
      label: 'מדד השפעה חיובי',
      value: positiveTva,
    },
    {
      id: 'negativeTva',
      label: 'מדד השפעה שלילי',
      value: negativeTva,
    },
    {
      id: 'minutes',
      label: 'סה״כ דקות שחקנים',
      value: formatNumber({
        value: totalMinutes,
        digits: 0,
      }),
    },
  ]
}

export const buildTeamPlayersInsightsPrintModel = ({
  team,
  rows,
  games,
  performanceScope,
} = {}) => {
  const rangeGames = getRangeGames({
    games,
    performanceScope,
  })

  const sortedRows = sortRowsByProfile(rows)

  const title = 'דוח ביצוע שחקנים'
  const teamName = team?.teamName || team?.name || 'קבוצה'

  return {
    title,
    teamName,

    scope: {
      mode: performanceScope?.mode || 'season',
      title: getScopeTitle({
        performanceScope,
      }),
      description: getScopeDescription({
        performanceScope,
        rangeGames,
      }),
      gamesCount: rangeGames.length,
    },

    summary: buildSummary({
      rows: sortedRows,
      rangeGames,
    }),

    profileCards: buildProfileCards(sortedRows),
    profileLegend: buildProfileLegend(),

    rows: buildPrintRows(sortedRows),
  }
}
