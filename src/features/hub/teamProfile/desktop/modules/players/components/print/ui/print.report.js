// teamProfile/desktop/modules/players/components/print/ui/print.report.js

import {
  TEAM_PLAYERS_PRINT_MODES,
} from './print.constants.js'

const findBucketLabel = (buckets, id) => {
  const items = Array.isArray(buckets) ? buckets : []
  const item = items.find(candidate => candidate?.id === id)

  return item?.label || id || ''
}

export const getTodayLabel = () => {
  return new Date().toLocaleDateString('he-IL')
}

export const getPrintReportMeta = ({ teamName, seasonLabel, mode }) => {
  const isPerformance = mode === TEAM_PLAYERS_PRINT_MODES.PERFORMANCE

  const title = isPerformance
    ? 'דוח יעדים וביצוע שחקנים'
    : 'דוח סגל שחקנים'

  const subtitle = [
    seasonLabel,
    isPerformance ? 'יעדים מול ביצוע בפועל' : 'סגל ניהולי עם מקום ליעדים',
  ].filter(Boolean).join(' · ')

  return {
    title,
    teamName,
    subtitle,
    isPerformance,
  }
}

export const getPrintFilterKpi = ({ filters, summary }) => {
  const activeFilters = []

  if (filters?.onlyActive) activeFilters.push('רק פעילים')
  if (filters?.onlyWithTargets) activeFilters.push('עם יעדים')

  if (filters?.positionCode) {
    activeFilters.push(
      `עמדה: ${findBucketLabel(summary?.positionCodeBuckets, filters.positionCode)}`
    )
  }

  if (filters?.generalPositionKey) {
    activeFilters.push(
      `חוליה: ${findBucketLabel(summary?.generalPositionBuckets, filters.generalPositionKey)}`
    )
  }

  if (activeFilters.length === 0) {
    return {
      key: 'filters',
      label: 'פילטרים פעילים',
      value: 'ללא פילטרים',
    }
  }

  return {
    key: 'filters',
    label: activeFilters.join(' · '),
    value: `${activeFilters.length} פילטרים`,
  }
}

export const getPrintKpiItems = ({ filters, summary } = {}) => {
  return [
    getPrintFilterKpi({ filters, summary }),
    { key: 'kpi-2', label: '', value: '' },
    { key: 'kpi-3', label: '', value: '' },
    { key: 'kpi-4', label: '', value: '' },
  ]
}
