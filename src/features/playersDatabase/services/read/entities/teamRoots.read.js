import { readClubsMasterDocument } from '../masters/clubsMaster.read.js'
import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../../catalog/clubs.catalog.js'
import { buildBirthTeamId } from '../../../catalog/teamIdentity.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()
const catalogOrderByClubId = new Map(
  PLAYERS_DATABASE_CLUBS_CATALOG.map((club, index) => [clean(club?.id), index])
)

// The all-Club Master supplies the user-facing club list. A club's valid
// slots are derived only after it is chosen, from its matching age group and
// season entry. teamId is the Team Root id used by Team Season writes.
export async function listExistingTeamRootOptions({
  seasonKey = '',
  ageGroupId = '',
  birthYear = 0,
  excludedBirthTeamDocumentId = '',
} = {}) {
  const master = await readClubsMasterDocument()
  const targetSeasonKey = clean(seasonKey)
  const targetAgeGroupId = clean(ageGroupId)
  const excludedId = clean(excludedBirthTeamDocumentId)

  return (Array.isArray(master?.clubs) ? master.clubs : [])
    .map(club => {
      const clubId = clean(club?.clubId)
      const clubLevel = Number(club?.clubLevel) || Number.MAX_SAFE_INTEGER
      const availableTeamsById = new Map()

      ;(Array.isArray(club?.ageGroups) ? club.ageGroups : [])
        .filter(ageGroup => clean(ageGroup?.ageGroupId) === targetAgeGroupId)
        .flatMap(ageGroup => [
          ...(Array.isArray(ageGroup?.current) ? ageGroup.current : []),
          ...(Array.isArray(ageGroup?.previous) ? ageGroup.previous : []),
        ])
        .filter(team => clean(team?.seasonKey || team?.seasonId) === targetSeasonKey)
        .forEach(team => {
          const birthTeamDocumentId = clean(team?.teamId || team?.birthTeamId)
          if (!birthTeamDocumentId || birthTeamDocumentId === excludedId) return

          availableTeamsById.set(birthTeamDocumentId, {
            clubId,
            clubLevel,
            birthTeamId: birthTeamDocumentId,
            birthTeamDocumentId,
            birthTeamSlot: Number(team?.teamSlot || team?.birthTeamSlot || 1) || 1,
            birthYear: Number(team?.birthYear || birthYear) || 0,
          })
        })

      const clubName = clean(club?.shortName || club?.name || clubId)
      const buildTeamOption = ({ slot = 1, knownInScope = false } = {}) => {
        const birthTeamSlot = Number(slot) || 1
        const birthTeamDocumentId = buildBirthTeamId({
          clubId,
          birthYear,
          birthTeamSlot,
        })

        return {
          clubId,
          clubLevel,
          birthTeamId: birthTeamDocumentId,
          birthTeamDocumentId,
          birthTeamSlot,
          birthYear: Number(birthYear) || 0,
          knownInScope,
        }
      }
      const knownTeams = [...availableTeamsById.values()]
      const knownSlots = new Set(knownTeams.map(team => team.birthTeamSlot))
      const selectableSlots = [1, 2, 3]
      const availableTeams = [
        ...selectableSlots.map(slot => (
          knownTeams.find(team => team.birthTeamSlot === slot)
          || buildTeamOption({ slot })
        )),
        ...knownTeams.filter(team => !selectableSlots.includes(team.birthTeamSlot)),
      ]

      return {
        clubId,
        clubLevel,
        clubName,
        displayName: clubName,
        label: clubName,
        availableTeams: availableTeams
          .sort((left, right) => left.birthTeamSlot - right.birthTeamSlot),
      }
    })
    .filter(option => option.clubId && option.clubName)
    .sort((left, right) => {
      const leftOrder = catalogOrderByClubId.get(left.clubId)
      const rightOrder = catalogOrderByClubId.get(right.clubId)
      const leftRank = Number.isInteger(leftOrder) ? leftOrder : Number.MAX_SAFE_INTEGER
      const rightRank = Number.isInteger(rightOrder) ? rightOrder : Number.MAX_SAFE_INTEGER

      if (leftRank !== rightRank) return leftRank - rightRank

      return String(left.label || '').localeCompare(String(right.label || ''), 'he', {
        numeric: true,
        sensitivity: 'base',
      })
    })
}
