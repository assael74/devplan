import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../catalog/clubs.catalog.js'
import { cleanValue } from '../../model/shared/value.model.js'
import { buildTeamLoadStatus } from '../../model/team/teamLoadStatus.model.js'
import { CLUB_TRANSFER_COVERAGE_STATUS } from '../contracts/club.contract.js'

const clean = cleanValue

export const buildRosterClubIdentity = (team = {}) => {
  const clubId = clean(team?.clubId)
  if (!clubId) return null
  const catalogClub = PLAYERS_DATABASE_CLUBS_CATALOG.find(club => clean(club?.id) === clubId) || null
  return {
    clubId,
    externalClubId: clean(team?.externalClubId || catalogClub?.externalClubId),
    clubUrl: clean(team?.clubUrl || catalogClub?.clubUrl),
    name: clean(team?.clubName || catalogClub?.name),
    shortName: clean(team?.clubShortName || catalogClub?.shortName),
    clubLevel: team?.clubLevel ?? catalogClub?.clubLevel ?? null,
    clubStrengthLevel: team?.clubStrengthLevel ?? catalogClub?.clubStrengthLevel ?? null,
  }
}

export const resolveRosterClubTransferCoverageStatus = teamSeason => {
  const loadStatus = buildTeamLoadStatus(teamSeason?.teamPlayers)
  if (loadStatus.statsComplete) return CLUB_TRANSFER_COVERAGE_STATUS.COMPLETE
  if (loadStatus.hasStats) return CLUB_TRANSFER_COVERAGE_STATUS.PARTIAL
  return CLUB_TRANSFER_COVERAGE_STATUS.NOT_LOADED
}
