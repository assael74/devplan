// src/features/playersDatabase/components/modals/playerStats/playerStatsPreview.js

const clean = value => String(value ?? '').trim()

const normalizeName = value =>
  clean(value)
    .toLowerCase()
    .replace(/[׳'"]/g, '')
    .replace(/\s+/g, ' ')

const nameKey = value =>
  normalizeName(value)
    .split(' ')
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, 'he'))
    .join('|')

const numberOrDash = value => {
  const text = clean(value)
  if (!text) return '-'

  const number = Number(text.replace(/,/g, ''))
  return Number.isFinite(number) ? number : text
}

const playerUrl = cells =>
  cells.map(clean).find(cell => (
    /^https?:\/\/.+football\.org\.il\/players\/player/i.test(cell)
  )) || ''

const playerIdFromUrl = url => {
  const match = clean(url).match(/[?&]player_id=(\d+)/i)
  return match?.[1] || ''
}

const isHeaderRow = cells =>
  cells.some(cell => clean(cell).includes('שם שחקן')) ||
  cells.some(cell => clean(cell).includes('דקות משחק'))

const readStatsRow = cells => {
  const compact = cells.map(clean)
  const rtlOrder = compact.length >= 10 && Number.isNaN(Number(compact[0]))

  if (rtlOrder) {
    return {
      playerName: compact[0],
      games: numberOrDash(compact[1]),
      goals: numberOrDash(compact[2]),
      yellowLeagueCup: numberOrDash(compact[3]),
      yellowToto: numberOrDash(compact[4]),
      redCards: numberOrDash(compact[5]),
      starts: numberOrDash(compact[6]),
      subIn: numberOrDash(compact[7]),
      subOut: numberOrDash(compact[8]),
      minutes: numberOrDash(compact[9]),
    }
  }

  return {
    minutes: numberOrDash(compact[0]),
    subOut: numberOrDash(compact[1]),
    subIn: numberOrDash(compact[2]),
    starts: numberOrDash(compact[3]),
    redCards: numberOrDash(compact[4]),
    yellowToto: numberOrDash(compact[5]),
    yellowLeagueCup: numberOrDash(compact[6]),
    goals: numberOrDash(compact[7]),
    games: numberOrDash(compact[8]),
    playerName: compact[9],
  }
}

export function buildPlayerStatsPreview(text = '', existingPlayers = []) {
  const playersByName = new Map()
  const playersByKey = new Map()

  existingPlayers.forEach(player => {
    const name = player.fullName || player.playerName
    const exact = normalizeName(name)
    const words = nameKey(name)

    if (exact) playersByName.set(exact, player)
    if (!words) return

    if (!playersByKey.has(words)) playersByKey.set(words, [])
    playersByKey.get(words).push(player)
  })

  const rows = clean(text)
    .split(/\r?\n/)
    .map(line => line.split('\t').map(clean))
    .filter(cells => cells.some(Boolean))
    .filter(cells => !isHeaderRow(cells))
    .map((cells, index) => {
      const stats = readStatsRow(cells)
      stats.playerUrl = playerUrl(cells)
      stats.externalPlayerId = playerIdFromUrl(stats.playerUrl)
      const exactPlayer = playersByName.get(normalizeName(stats.playerName))
      const keyPlayers = playersByKey.get(nameKey(stats.playerName)) || []
      const matchedPlayer = exactPlayer || (keyPlayers.length === 1 ? keyPlayers[0] : null)
      const issues = []

      if (!stats.playerName) issues.push('missingPlayerName')
      if (!matchedPlayer && keyPlayers.length > 1) issues.push('ambiguousPlayerName')
      if (!matchedPlayer && keyPlayers.length <= 1) issues.push('playerNotFound')

      return {
        rowId: `stats-row-${index + 1}`,
        rowNumber: index + 1,
        cells,
        stats,
        playerId: matchedPlayer?.playerId || matchedPlayer?.id || '',
        playerSeasonId: matchedPlayer?.id || '',
        matchMode: exactPlayer ? 'exactName' : matchedPlayer ? 'nameWords' : '',
        valid: issues.length === 0,
        issues,
      }
    })

  const summary = {
    total: rows.length,
    valid: rows.filter(row => row.valid).length,
    error: rows.filter(row => !row.valid).length,
    matchedPlayers: rows.filter(row => row.playerId).length,
  }

  return {
    ok: summary.total > 0 && summary.error === 0,
    rows,
    summary,
  }
}
