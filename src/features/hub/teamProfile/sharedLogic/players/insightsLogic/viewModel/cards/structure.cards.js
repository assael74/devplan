// teamProfile/sharedLogic/players/viewModel/cards/structure.cards.js

import {
  pct,
} from '../common/index.js'

import {
  buildTooltip,
} from '../tooltips/index.js'

export const buildStructureCards = ({
  structure = {},
} = {}) => {
  const squad = structure?.squad || {}
  const total = squad.total || 0
  const active = squad.active || 0
  const nonActive = squad.nonActive || 0

  return [
    {
      id: 'activePlayers',
      label: 'שחקנים פעילים',
      value: active,
      sub: `מתוך ${total} משויכים`,
      icon: 'players',
      color: 'neutral',
      tooltip: buildTooltip({
        title: 'שחקנים פעילים',
        actual: `${active} שחקנים פעילים`,
        target: 'סגל מקצועי פעיל ומוגדר',
        status: `${nonActive} לא פעילים · ${total} משויכים בסך הכול`,
        basis: 'הניתוח המקצועי מתבסס על שחקנים פעילים בלבד',
      }),
    },

    {
      id: 'inactivePlayers',
      label: 'לא פעילים',
      value: nonActive,
      sub: `${pct(nonActive, total)}% מהמשויכים`,
      icon: 'close',
      color: nonActive ? 'warning' : 'success',
      tooltip: buildTooltip({
        title: 'שחקנים לא פעילים',
        actual: `${nonActive} שחקנים`,
        target: 'סגל פעיל נקי ככל האפשר',
        status: nonActive ? 'קיימים שחקנים לא פעילים' : 'אין שחקנים לא פעילים',
        basis: 'active !== true',
      }),
    },

    {
      id: 'withoutRole',
      label: 'ללא מעמד',
      value: squad.withoutRole || 0,
      sub: `${pct(squad.withoutRole || 0, active)}% מהפעילים`,
      icon: 'noneType',
      color: squad.withoutRole ? 'warning' : 'success',
      tooltip: buildTooltip({
        title: 'שחקנים ללא מעמד',
        actual: `${squad.withoutRole || 0} שחקנים`,
        target: 'לכל שחקן פעיל צריך להיות מעמד מקצועי',
        status: squad.withoutRole ? 'דורש השלמת הגדרה' : 'כל הפעילים מוגדרים',
        basis: 'squadRole ריק או חסר',
      }),
    },

    {
      id: 'withoutPrimaryPosition',
      label: 'ללא עמדה ראשית',
      value: squad.withoutPrimaryPosition || 0,
      sub: `${pct(squad.withoutPrimaryPosition || 0, active)}% מהפעילים`,
      icon: 'position',
      color: squad.withoutPrimaryPosition ? 'warning' : 'success',
      tooltip: buildTooltip({
        title: 'שחקנים ללא עמדה ראשית',
        actual: `${squad.withoutPrimaryPosition || 0} שחקנים`,
        target: 'לכל שחקן פעיל צריכה להיות עמדה ראשית',
        status: squad.withoutPrimaryPosition
          ? 'דורש השלמת עמדה ראשית'
          : 'כל הפעילים עם עמדה ראשית',
        basis: 'primaryPosition קיים ונמצא בתוך positions',
      }),
    },
  ]
}
