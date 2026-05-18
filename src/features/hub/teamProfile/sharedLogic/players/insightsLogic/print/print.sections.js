// TEAMPROFILE/sharedLogic/players/insightsLogic/print/print.sections.js

import {
  PROFILE_ORDER,
  ROLE_ORDER,
  getProfileShortLabel,
  getRoleLabel,
} from './print.constants.js'

import {
  buildPrintRow,
  getProfileId,
  getRoleId,
  isNegativeTva,
  isOutOfSample,
  isPositiveTva,
  sortRows,
} from './print.rows.js'

const emptyArray = []

const arr = value => {
  return Array.isArray(value) ? value : emptyArray
}

const getRecommendationsSource = model => {
  return arr(model?.outcomeView?.recommendations)
}

const countProfiles = rows => {
  return arr(rows).reduce((acc, row) => {
    const profileId = getProfileId(row)

    acc[profileId] = (acc[profileId] || 0) + 1

    return acc
  }, {})
}

const buildProfileText = rows => {
  const counts = countProfiles(rows)

  return PROFILE_ORDER
    .filter(id => counts[id])
    .map(id => `${getProfileShortLabel(id)} ${counts[id]}`)
    .join(' · ')
}

const buildRoleSummary = rows => {
  const safeRows = arr(rows)

  return [
    {
      id: 'players',
      label: 'שחקנים',
      value: safeRows.length,
    },
    {
      id: 'positiveTva',
      label: 'מדד השפעה חיובי',
      value: safeRows.filter(isPositiveTva).length,
    },
    {
      id: 'negativeTva',
      label: 'מדד השפעה שלילי',
      value: safeRows.filter(isNegativeTva).length,
    },
    {
      id: 'outOfSample',
      label: 'מחוץ למדגם',
      value: safeRows.filter(isOutOfSample).length,
    },
  ]
}

const buildRoleSub = rows => {
  const profileText = buildProfileText(rows)

  if (profileText) {
    return profileText
  }

  return 'אין מספיק נתונים לניתוח פרופילים במעמד זה'
}

export const buildRoleSections = rows => {
  const safeRows = sortRows(rows)

  return ROLE_ORDER.map(roleId => {
    const roleRows = safeRows.filter(row => {
      return getRoleId(row) === roleId
    })

    return {
      id: roleId,
      title: getRoleLabel(roleId),
      sub: buildRoleSub(roleRows),
      playersCount: roleRows.length,
      summary: buildRoleSummary(roleRows),
      rows: roleRows.map(buildPrintRow),
    }
  }).filter(section => {
    return section.playersCount > 0
  })
}

export const buildSummary = ({
  rows,
  rangeGames,
}) => {
  const safeRows = arr(rows)

  return [
    {
      id: 'games',
      label: 'משחקים בסקופ',
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
      value: safeRows.filter(isPositiveTva).length,
    },
    {
      id: 'negativeTva',
      label: 'מדד השפעה שלילי',
      value: safeRows.filter(isNegativeTva).length,
    },
    {
      id: 'outOfSample',
      label: 'מחוץ למדגם',
      value: safeRows.filter(isOutOfSample).length,
    },
  ]
}

export const buildRecommendations = model => {
  return getRecommendationsSource(model).map((item, index) => {
    return {
      id: item.id || index,
      title: item.title || item.label || 'המלצה',
      text: item.text || item.description || item.body || '-',
      tone: item.tone || 'neutral',
    }
  })
}
