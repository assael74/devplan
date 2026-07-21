// features/playersDatabase/ui/pages/teamPage/logic/teamRosterImport.logic.js

import { clean, isSmallIndex } from './teamPage.utils.js'


const isPlayerUrl = value => {
  const nextValue = clean(value).toLowerCase()

  return (
    nextValue.includes('/players/player') ||
    nextValue.includes('player_id=') ||
    /^https?:\/\//.test(nextValue)
  )
}

const isExternalPlayerId = value =>
  /^\d{4,}$/.test(clean(value))

const resolveRosterDataCells = (cells, rowIndex) => {
  const hasIndexCell = isSmallIndex(cells[0]) && (
    clean(cells[0]) === `${rowIndex + 1}` ||
    !isExternalPlayerId(cells[1])
  )

  return hasIndexCell ? cells.slice(1) : cells
}

export const parsePlayerRosterRows = value => {
  const rows = clean(value)
    .split(/\r?\n/)
    .map(row => row.trim())
    .filter(Boolean)

  return rows
    .filter((row, index) => {
      if (index !== 0) return true
      return !row.includes('שם השחקן')
    })
    .map((row, index) => {
      const cells = row.split('\t').map(clean)
      const dataCells = resolveRosterDataCells(cells, index)
      const playerUrl = dataCells.find(isPlayerUrl) || ''
      const externalPlayerId = dataCells.find(cell => (
        cell !== playerUrl && isExternalPlayerId(cell)
      )) || ''
      const fullName = dataCells.find(cell => (
        cell &&
        cell !== playerUrl &&
        cell !== externalPlayerId
      )) || ''
      const numShirt = dataCells.find(cell => (
        cell !== externalPlayerId &&
        isSmallIndex(cell)
      )) || ''

      return {
        id: `${index + 1}_${externalPlayerId || fullName || 'player'}`,
        index: `${index + 1}`,
        fullName,
        externalPlayerId,
        playerUrl,
        numShirt,
      }
    })
}

