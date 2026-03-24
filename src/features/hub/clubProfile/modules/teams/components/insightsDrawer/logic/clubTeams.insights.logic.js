// clubProfile/modules/teams/components/insightsDrawer/logic/clubTeams.insights.logic.js

const toNum = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const pct = (part, total) => {
  if (!total) return '0%'
  return `${Math.round((part / total) * 100)}%`
}

const safeArr = (v) => (Array.isArray(v) ? v : [])

const buildProjectByStage = (rows) => {
  const map = new Map()

  rows.forEach((row) => {
    const chip = row?.projectChipMeta || {}
    const id = chip?.id || 'noneType'
    const label = chip?.labelH || 'כללי'

    if (!map.has(id)) {
      map.set(id, {
        id,
        label,
        count: 0,
        icon: chip?.idIcon || 'noneType',
      })
    }

    map.get(id).count += 1
  })

  return Array.from(map.values()).sort((a, b) => b.count - a.count)
}

const buildLayers = (rows) => {
  const map = new Map()

  rows.forEach((row) => {
    const key = row?.generalPositionKey || 'none'
    const label = row?.generalPositionLabel || 'ללא שכבה'

    if (!map.has(key)) {
      map.set(key, {
        id: key,
        label,
        count: 0,
      })
    }

    map.get(key).count += 1
  })

  return Array.from(map.values()).sort((a, b) => b.count - a.count)
}

const buildExactPositions = (rows) => {
  const map = new Map()

  rows.forEach((row) => {
    safeArr(row?.positions).forEach((pos) => {
      const key = String(pos || '').trim()
      if (!key) return

      if (!map.has(key)) {
        map.set(key, {
          id: key,
          label: key,
          count: 0,
        })
      }

      map.get(key).count += 1
    })
  })

  return Array.from(map.values()).sort((a, b) => b.count - a.count)
}

export const buildClubTeamsInsights = ({ rows = [], summary = {} }) => {
  const total = rows.length
  const keyCount = rows.filter((row) => row?.isKey === true).length

  const over70 = rows.filter((row) => toNum(row?.playerFullStats?.playTimeRate) >= 70).length
  const under30 = rows.filter((row) => toNum(row?.playerFullStats?.playTimeRate) <= 30).length
  const withGoals = rows.filter((row) => toNum(row?.playerFullStats?.goals) > 0).length
  const withPotential = rows.filter((row) => toNum(row?.level) > 0).length

  return {
    squad: {
      total,
      keyCount,
      keyRate: pct(keyCount, total),
      active: summary?.active ?? rows.filter((row) => row?.active === true).length,
      nonActive: summary?.nonActive ?? rows.filter((row) => row?.active !== true).length,
    },

    positions: {
      layers: buildLayers(rows),
      exactPositions: buildExactPositions(rows),
    },

    quickStats: {
      over70,
      under30,
      withGoals,
      withPotential,
    },

    project: {
      totalProject: summary?.project ?? rows.filter((row) => row?.projectChipMeta?.id === 'project').length,
      totalCandidate:
        summary?.candidate ?? rows.filter((row) => row?.projectChipMeta?.id === 'candidateFlow').length,
      byStage: buildProjectByStage(rows),
    },
  }
}
