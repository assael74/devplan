// teamProfile/sharedLogic/players/insightsLogic/viewModel/cards/production.cards.js

import {
  buildTooltip,
} from '../tooltips/index.js'

const emptyArray = []

const getWarningTone = (count) => {
  return count > 0 ? 'warning' : 'success'
}

export const buildProductionCards = ({
  production = {},
} = {}) => {
  const attack = production?.attack || {}
  const contributors = attack?.contributors || emptyArray
  const highMinutesNoProduction =
    attack?.highMinutesNoProduction || emptyArray

  return [
    {
      id: 'contributors',
      label: 'תורמים ישירים',
      value: contributors.length,
      sub: 'שערים או בישולים',
      icon: 'goal',
      color: 'primary',
      tooltip: buildTooltip({
        title: 'תורמים ישירים',
        actual: `${contributors.length} שחקנים`,
        target: 'פיזור תרומה התקפית בסגל',
        status: 'שחקנים עם שער או בישול',
        basis: 'goals + assists > 0',
        players: contributors,
      }),
    },
    {
      id: 'goals',
      label: 'שערים',
      value: attack?.goalsTotal || 0,
      sub: 'מתוך שחקני הסגל',
      icon: 'goal',
      color: 'neutral',
    },
    {
      id: 'assists',
      label: 'בישולים',
      value: attack?.assistsTotal || 0,
      sub: 'מתוך שחקני הסגל',
      icon: 'assists',
      color: 'neutral',
    },
    {
      id: 'highMinutesNoProduction',
      label: 'דקות ללא תרומה',
      value: highMinutesNoProduction.length,
      sub: '50%+ דקות ללא שער/בישול',
      icon: 'warning',
      color: getWarningTone(highMinutesNoProduction.length),
      tooltip: buildTooltip({
        title: 'דקות גבוהות ללא תרומה ישירה',
        actual: `${highMinutesNoProduction.length} שחקנים`,
        target: 'שחקן עם נפח דקות גבוה אמור לייצר ערך מדיד בהתאם לעמדה',
        status: highMinutesNoProduction.length ? 'דורש בדיקה' : 'תקין',
        basis: 'minutesPct >= 50 וגם goals + assists = 0',
        players: highMinutesNoProduction,
      }),
    },
  ]
}
