// src/features/hub/teamProfile/sharedLogic/players/insightsLogic/data.js

import {
  buildStructureModel,
} from './structure/index.js'

import {
  buildUsageAlignment,
} from './usage/index.js'

import {
  buildProductionModel,
} from './production/index.js'

import {
  buildAlignmentModel,
} from './alignment/index.js'

const emptyArray = []

const safeArr = (value) => {
  return Array.isArray(value) ? value : emptyArray
}

const getPrimaryPositionStructure = (alignment = {}) => {
  return (
    alignment?.positionStructure?.primary ||
    alignment?.positionStructure ||
    {}
  )
}

const buildFlags = ({ alignment, usage, production }) => {
  const critical = []
  const warning = []
  const info = []

  const positionStructure = getPrimaryPositionStructure(alignment)

  const thinPositions = safeArr(positionStructure.thin)
  const overloadedPositions = safeArr(positionStructure.overloaded)
  const keyOverloadPositions = safeArr(positionStructure.keyOverload)

  if (thinPositions.length) {
    warning.push({
      id: 'thinPositions',
      label: 'עמדות ללא עומק',
      text: `${thinPositions.length} עמדות מתחת למינימום של 2 שחקנים.`,
      players: [],
    })
  }

  if (overloadedPositions.length) {
    warning.push({
      id: 'overloadedPositions',
      label: 'עמדות עמוסות מדי',
      text: `${overloadedPositions.length} עמדות מעל המקסימום של 4 שחקנים.`,
      players: [],
    })
  }

  if (keyOverloadPositions.length) {
    warning.push({
      id: 'keyOverloadPositions',
      label: 'ריבוי שחקני מפתח בעמדה',
      text: `${keyOverloadPositions.length} עמדות עם יותר משחקן מפתח אחד.`,
      players: [],
    })
  }

  if (safeArr(alignment?.underUsedByRole).length) {
    warning.push({
      id: 'underUsedByRole',
      label: 'שימוש חסר לפי מעמד',
      text: `${alignment.underUsedByRole.length} שחקנים מתחת ליעד השימוש לפי המעמד.`,
      players: alignment.underUsedByRole,
    })
  }

  if (safeArr(alignment?.overUsedByRole).length) {
    info.push({
      id: 'overUsedByRole',
      label: 'שימוש גבוה מהגדרה',
      text: `${alignment.overUsedByRole.length} שחקנים מעל טווח השימוש שהוגדר למעמד.`,
      players: alignment.overUsedByRole,
    })
  }

  if (safeArr(alignment?.projectOpportunity?.lowOpportunity).length) {
    warning.push({
      id: 'projectLowOpportunity',
      label: 'פרויקט ללא הזדמנות מספקת',
      text: `${alignment.projectOpportunity.lowOpportunity.length} שחקני פרויקט עם שימוש נמוך.`,
      players: alignment.projectOpportunity.lowOpportunity,
    })
  }

  if (safeArr(usage?.squadButNotPlayed).length) {
    info.push({
      id: 'squadButNotPlayed',
      label: 'בסגל אך לא שותפו',
      text: `${usage.squadButNotPlayed.length} שחקנים היו בסגל אך לא שותפו.`,
      players: usage.squadButNotPlayed,
    })
  }

  if (safeArr(production?.attack?.highMinutesNoProduction).length) {
    info.push({
      id: 'highMinutesNoProduction',
      label: 'דקות ללא תרומה ישירה',
      text: `${production.attack.highMinutesNoProduction.length} שחקנים עם דקות גבוהות וללא שערים/בישולים.`,
      players: production.attack.highMinutesNoProduction,
    })
  }

  return {
    critical,
    warning,
    info,
  }
}

export const buildData = ({ rows = [], summary = {}, team = {} } = {}) => {
  const structure = buildStructureModel({
    rows,
    summary,
    team,
  })

  const usage = buildUsageAlignment({
    rows,
  })

  const production = buildProductionModel({
    rows,
    summary,
    team,
  })

  const alignment = buildAlignmentModel({
    rows,
    summary,
    team,
    structure,
    usage,
    production,
  })

  const flags = buildFlags({
    alignment,
    usage,
    production,
  })

  return {
    structure,
    usage,
    production,
    alignment,
    flags,

    meta: {
      rowsCount: rows.length,
      hasRows: rows.length > 0,
      defenseReady: production?.defense?.ready === true,
    },
  }
}
