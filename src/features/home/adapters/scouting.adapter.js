import { safeArr } from './_utils/array.utils'
import { parseDdMmYyyy, formatCheckLabel, toIso } from './_utils/date.utils'

export function buildScoutingPreview({ scouting } = {}, limit = 5) {
  const s = safeArr(scouting).slice()

  s.sort((a, b) => {
    const ad = parseDdMmYyyy(a?.lastCheck) || new Date(toIso(a?.created) || 0)
    const bd = parseDdMmYyyy(b?.lastCheck) || new Date(toIso(b?.created) || 0)
    return bd.getTime() - ad.getTime()
  })

  return s.slice(0, limit).map((x) => ({
    id: x?.id || `${x?.playerName || 'player'}-${Math.random()}`,
    title: x?.playerName || 'ללא שם',
    subtitle: x?.teamName || x?.clubName || '',
    rightMeta: formatCheckLabel(x?.lastCheck),
    // meta2: safeArr(x?.games).length ? `משחקים: ${safeArr(x?.games).length}` : '',
  }))
}
