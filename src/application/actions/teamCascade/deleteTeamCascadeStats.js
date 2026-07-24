// src/application/actions/teamCascade/deleteTeamCascadeStats.js
import { deleteGameStatsDoc } from '../../../services/firestore/shorts/gameStats/index.js'

const isMissingStatsDocError = error => {
  const msg = String(error?.message || '')
  return msg.includes('gameStats doc not found')
}

const buildStatsPayload = ({ ref, game, teamId }) => ({
  gameId: ref?.gameId || game?.id || '',
  teamId,
  gameStatsDocId: ref?.statsDocId || game?.statsDocId || game?.gameStatsDocId || '',
  statsDocId: ref?.statsDocId || game?.statsDocId || game?.gameStatsDocId || '',
})

const hasDeleteCandidate = ({ ref, game }) => {
  if (ref?.statsDocId || game?.statsDocId || game?.gameStatsDocId) return true
  if (ref?.hasStats || game?.hasStats) return true
  return false
}

const findGameById = ({ plan, gameId }) => {
  return (plan?.games || []).find(game => game?.id === gameId) || null
}

export async function deleteTeamCascadeStats({
  plan,
  ignoreMissingStatsDoc = true,
} = {}) {
  const refs = Array.isArray(plan?.statsRefs) ? plan.statsRefs : []

  if (!refs.length) {
    return {
      label: 'stats',
      skipped: true,
      total: 0,
      deleted: 0,
      ignored: 0,
      failed: 0,
      items: [],
    }
  }

  const items = []

  for (const ref of refs) {
    const game = findGameById({ plan, gameId: ref?.gameId })

    if (!hasDeleteCandidate({ ref, game })) {
      items.push({
        gameId: ref?.gameId || '',
        statsDocId: ref?.statsDocId || '',
        skipped: true,
        reason: 'NO_STATS_REFERENCE',
      })
      continue
    }

    const payload = buildStatsPayload({
      ref,
      game,
      teamId: plan.teamId,
    })

    try {
      const res = await deleteGameStatsDoc({ payload })

      items.push({
        gameId: payload.gameId,
        statsDocId: payload.gameStatsDocId || payload.statsDocId,
        ok: true,
        result: res,
      })
    } catch (error) {
      const missing = isMissingStatsDocError(error)

      if (missing && ignoreMissingStatsDoc) {
        items.push({
          gameId: payload.gameId,
          statsDocId: payload.gameStatsDocId || payload.statsDocId,
          ok: false,
          ignored: true,
          reason: 'MISSING_STATS_DOC',
          error,
        })
        continue
      }

      items.push({
        gameId: payload.gameId,
        statsDocId: payload.gameStatsDocId || payload.statsDocId,
        ok: false,
        ignored: false,
        error,
      })

      throw error
    }
  }

  return {
    label: 'stats',
    skipped: false,
    total: items.length,
    deleted: items.filter(x => x.ok).length,
    ignored: items.filter(x => x.ignored).length,
    failed: items.filter(x => x.ok === false && !x.ignored).length,
    items,
  }
}
