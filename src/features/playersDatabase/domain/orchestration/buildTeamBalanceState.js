// src/features/playersDatabase/domain/orchestration/buildTeamBalanceState.js

import {
  buildTeamBalance,
} from '../../../../shared/scouting/teams/index.js'
import {
  TEAM_BALANCE_OUTPUT_CONTRACT_VERSION,
} from '../../../../shared/scouting/scouting.version.js'
import {
  adaptTeamBalanceInput,
} from '../adapters/teamBalanceInput.adapter.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

export const buildTeamBalanceState = ({
  teamDocument = {},
  seasonDocument = {},
  seasonTarget = null,
} = {}) => {
  const teamSource = teamDocument && typeof teamDocument === 'object'
    ? teamDocument
    : {}
  const seasonSource = seasonDocument && typeof seasonDocument === 'object'
    ? seasonDocument
    : {}
  const input = adaptTeamBalanceInput({
    teamPlayers: seasonSource.teamPlayers,
  })
  const balance = buildTeamBalance(input)

  return {
    ...balance,
    outputContractVersion: TEAM_BALANCE_OUTPUT_CONTRACT_VERSION,
    source: {
      collection: 'birthTeams',
      teamDocumentId: clean(
        teamSource.birthTeamDocumentId ||
        teamSource.teamDocumentId ||
        teamSource.id
      ),
      seasonId: clean(seasonSource.seasonId),
      seasonKey: clean(seasonSource.seasonKey),
      seasonTarget: clean(
        seasonTarget ||
        seasonSource.target ||
        seasonSource.seasonTarget
      ) || null,
      sourceType: 'teamDocumentStats',
      updatedAt: seasonSource.updatedAt || teamSource.updatedAt || null,
    },
  }
}
