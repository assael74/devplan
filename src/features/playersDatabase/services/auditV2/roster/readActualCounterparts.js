import { getTeamById } from '../../read/entities/team.js'
import { getTeamSeason } from '../../read/entities/teamSeason.js'
import { getLeagueById } from '../../read/entities/league.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const unique = values => [...new Set(
  (Array.isArray(values) ? values : []).map(clean).filter(Boolean)
)]

const readCandidate = async ({
  birthTeamDocumentId = '',
  seasonKey = '',
} = {}) => {
  const teamRoot = await getTeamById(birthTeamDocumentId, { bypassCache: true })
  const teamSeason = await getTeamSeason({
    birthTeamDocumentId,
    seasonKey,
    bypassCache: true,
  })

  const leagueId = clean(teamSeason?.leagueId || teamRoot?.leagueId)
  const league = leagueId
    ? await getLeagueById(leagueId, { bypassCache: true })
    : null

  return {
    birthTeamDocumentId,
    seasonKey,
    teamRoot: teamRoot || null,
    teamSeason: teamSeason || null,
    league: league || null,
  }
}

export async function readActualRosterCounterpartsV2({
  expectedCounterparts = [],
} = {}) {
  const byTeam = new Map()

  ;(Array.isArray(expectedCounterparts) ? expectedCounterparts : [])
    .forEach(row => {
      const teamId = clean(row?.target?.birthTeamDocumentId)
      if (!teamId) return
      const current = byTeam.get(teamId) || []
      current.push(row)
      byTeam.set(teamId, current)
    })

  const actual = []

  for (const [teamId, rows] of byTeam.entries()) {
    const root = await getTeamById(teamId, { bypassCache: true })
    const rootSeasonKeys = (Array.isArray(root?.seasons) ? root.seasons : [])
      .map(row => clean(row?.seasonKey || row?.seasonId))
      .filter(Boolean)
    const explicitKeys = rows.map(row => clean(row?.target?.seasonKey))
    const seasonKeys = unique([...explicitKeys, ...rootSeasonKeys])

    for (const seasonKey of seasonKeys) {
      actual.push(await readCandidate({
        birthTeamDocumentId: teamId,
        seasonKey,
      }))
    }
  }

  return actual
}
