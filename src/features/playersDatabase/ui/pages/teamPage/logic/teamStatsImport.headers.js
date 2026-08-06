// src/features/playersDatabase/ui/pages/teamPage/logic/teamStatsImport.headers.js

import { clean } from './teamPage.utils.js'

export const normalizeImportHeader = value => clean(value)
  .replace(/[.״"׳']/g, '')
  .replace(/\s+/g, ' ')

export const buildStatsHeaderMap = headers => headers.reduce((map, header, index) => {
  const normalizedHeader = normalizeImportHeader(header)

  if (normalizedHeader.includes('אינדקס')) map.index = index

  if (
    normalizedHeader === 'שנתון' ||
    normalizedHeader.includes('שנת לידה')
  ) {
    map.birthYear = index
  }

  if (
    normalizedHeader.includes('מזהה שחקן') ||
    normalizedHeader.includes('מזהה התאחדות')
  ) {
    map.externalPlayerId = index
  }

  if (normalizedHeader.includes('קישור שחקן')) {
    map.playerUrl = index
  }

  if (
    normalizedHeader.includes('שם השחקן') ||
    normalizedHeader.includes('שם שחקן')
  ) {
    map.fullName = index
  }

  if (
    normalizedHeader.includes('משחקי ליגה') ||
    (
      normalizedHeader.includes('משחקים') &&
      !normalizedHeader.includes('דקות')
    )
  ) {
    map.games = index
  }

  if (
    normalizedHeader === 'שערים' ||
    normalizedHeader.includes('שערי ליגה') ||
    normalizedHeader.endsWith(' שערים')
  ) {
    map.goals = index
  }

  if (
    normalizedHeader.includes('צהובים ליגה') ||
    normalizedHeader.includes('כ צהובים') ||
    normalizedHeader.includes('צהובים')
  ) {
    map.yellowCards = index
  }

  if (normalizedHeader.includes('הרכב פותח')) map.starts = index
  if (normalizedHeader.includes('נכנס כמחליף')) map.substituteIn = index
  if (normalizedHeader.includes('הוחלף')) map.substitutedOut = index

  if (
    normalizedHeader === 'דקות' ||
    normalizedHeader.includes('דקות ליגה') ||
    normalizedHeader.includes('דקות משחק')
  ) {
    map.minutes = index
  }

  return map
}, {})

export const hasPlayerStatsHeader = row => {
  const normalizedRow = normalizeImportHeader(row)

  return (
    (
      normalizedRow.includes('שם השחקן') ||
      normalizedRow.includes('שם שחקן')
    ) &&
    (
      normalizedRow.includes('דקות ליגה') ||
      normalizedRow.includes('דקות משחק') ||
      normalizedRow.includes('משחקי ליגה') ||
      normalizedRow.includes('משחקים')
    )
  )
}

export const hasMappedStatsHeader = headerMap => (
  Number.isInteger(headerMap.fullName) ||
  Number.isInteger(headerMap.games) ||
  Number.isInteger(headerMap.minutes)
)

export const getMappedStatsCell = ({
  cells,
  headerMap,
  key,
  fallbackIndex,
}) => {
  const mappedIndex = headerMap[key]

  if (Number.isInteger(mappedIndex)) {
    return cells[mappedIndex] || ''
  }

  return cells[fallbackIndex] || ''
}
