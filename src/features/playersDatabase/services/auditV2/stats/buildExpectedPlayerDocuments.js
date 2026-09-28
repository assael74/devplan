import { buildPlayerDocumentId } from '../../../model/player/playerIdentity.model.js'
import {
  shouldProjectStatsPlayerDocument,
} from '../../../domain/statsV2/playerDocumentStats.projection.js'
import {
  buildStatsCanonicalPlayerDocumentProjection,
} from '../../../domain/statsV2/playerDocumentCanonical.projection.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

export function buildExpectedStatsPlayerDocumentsV2({
  canonical = {},
  existingPlayerDocumentIds = null,
} = {}) {
  const teamSeason = canonical.teamSeason || {}

  return (Array.isArray(teamSeason.teamPlayers) ? teamSeason.teamPlayers : [])
    .map(player => {
      const playerDocumentId = clean(
        player?.playerDocumentId ||
        buildPlayerDocumentId(player)
      )

      if (!playerDocumentId) return null

      const projection = buildStatsCanonicalPlayerDocumentProjection({
        player,
        teamRoot: canonical.teamRoot,
        teamSeason,
        league: canonical.league,
        club: canonical.club,
        seasonKey: canonical.seasonKey,
        leagueId: canonical.leagueId,
        birthTeamDocumentId: canonical.birthTeamDocumentId,
      })

      if (existingPlayerDocumentIds instanceof Set) {
        const shouldExist = shouldProjectStatsPlayerDocument({
          player: projection.player,
          documentExists: existingPlayerDocumentIds.has(playerDocumentId),
        })

        if (!shouldExist) return null
      }

      return {
        playerDocumentId,
        player: projection.player,
        target: projection.target,
        seasonRow: projection.seasonRow,
      }
    })
    .filter(Boolean)
}
