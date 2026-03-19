import { getFullDateIl } from '../../../../../../../../shared/format/dateUtiles.js'

export const safe = (v) => (v == null ? '' : String(v))

export const toNumOrEmpty = (v) => {
  if (v === '' || v == null) return ''
  const n = Number(v)
  return Number.isFinite(n) ? n : ''
}

export const toNum = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export const normalizeBool = (v) => v === true

export const getGameSource = (game) => game?.game || game || {}

export const buildDrawerMeta = (game) => {
  const source = getGameSource(game)

  return {
    id: source?.id || game?.id || game?.gameId || '',
    rival:
      source?.rivel ||
      source?.rival ||
      source?.rivalName ||
      source?.opponent ||
      '',
    gameDate: source?.gameDate || source?.dateRaw || '',
    gameDateLabel: getFullDateIl(source?.gameDate || source?.dateRaw || ''),
    raw: source,
  }
}

export const getPlayerDisplayName = (player) => {
  return (
    player?.name ||
    [player?.playerFirstName, player?.playerLastName].filter(Boolean).join(' ') ||
    [player?.firstName, player?.lastName].filter(Boolean).join(' ') ||
    'שחקן'
  )
}
