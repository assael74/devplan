// teamProfile/sharedLogic/games/insightsLogic/print/printMain.model.js

import {
  emptyText,
  formatNumber,
  formatPct,
  getBriefText,
  getText,
  hasRealValue,
  asArray,
} from './print.utils.js'

const getTeamTitle = (team) => {
  return getText(team?.teamName, 'קבוצה')
}

const getCalculationLabel = (mode) => {
  if (mode === 'games') return 'נתוני משחקים'
  if (mode === 'team') return 'נתוני קבוצה'

  return getText(mode, emptyText)
}

const getGamesCount = (model) => {
  return getText(model?.gamesSource?.playedGames, 0)
}

const getForecastValue = (forecast = {}) => {
  const rankLabel = getText(
    forecast?.targetLevel?.rankLabel,
    forecast?.level?.shortLabel
  )

  if (rankLabel) return `מקום ${rankLabel}`

  const rankRange =
    forecast?.targetLevel?.rankRange ||
    forecast?.level?.rankRange

  if (Array.isArray(rankRange) && rankRange.length >= 2) {
    return `מקום ${rankRange[0]}–${rankRange[1]}`
  }

  return emptyText
}

const getTargetRowValue = (row) => {
  const progress = formatPct(row?.progressPct)
  const projected = formatNumber(row?.projected)
  const target = formatNumber(row?.target)

  if (progress && projected && target) {
    return `${progress} · ${projected}/${target}`
  }

  if (projected && target) {
    return `${projected}/${target}`
  }

  return getText(row?.valueLabel, row?.value)
}

const getTargetRowColor = (row) => {
  if (row?.color) return row.color
  if (row?.tone) return row.tone

  if (row?.status === 'ahead') return 'success'
  if (row?.status === 'close') return 'primary'
  if (row?.status === 'behind') return 'warning'
  if (row?.status === 'danger') return 'danger'

  return 'neutral'
}

const normalizeTargetRows = (rows) => {
  return asArray(rows)
    .map((row) => {
      const title = getText(row?.title, row?.label, row?.id, emptyText)
      const value = getTargetRowValue(row)

      return {
        id: getText(row?.id, row?.key, title),
        title,
        value,
        sub: getText(row?.sub),
        color: getTargetRowColor(row),
        takeaway: '',
      }
    })
    .filter((row) => {
      return hasRealValue(row.title) && hasRealValue(row.value)
    })
}

export const buildPrintMeta = ({
  liveTeam,
  calculationMode,
  model,
}) => {
  return [
    {
      id: 'team',
      title: 'קבוצה',
      value: getTeamTitle(liveTeam),
    },
    {
      id: 'games',
      title: 'משחקים',
      value: getGamesCount(model),
    },
    {
      id: 'mode',
      title: 'מקור חישוב',
      value: getCalculationLabel(calculationMode),
    },
  ]
}

export const buildPrintMainCards = ({
  forecast,
  targetRows,
}) => {
  return [
    {
      id: 'forecast',
      title: 'תחזית מיקום',
      value: getForecastValue(forecast),
      sub: '',
      color: 'primary',
      takeaway: '',
    },
    ...normalizeTargetRows(targetRows),
  ]
}

export const buildPrintMainTakeaway = (briefSections) => {
  return {
    id: 'mainTakeaway',
    title: 'תובנה מרכזית',
    text: getBriefText(briefSections?.forecast),
  }
}

export const getPrintTeamTitle = getTeamTitle
