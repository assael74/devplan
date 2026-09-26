import { getTeamById } from './team.js'
import { getTeamSeason } from './teamSeason.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

export async function resolveRosterCounterpartCandidateV2({ request = {} } = {}) {
  const teamId = clean(request.counterpartBirthTeamDocumentId || request.sourceBirthTeamDocumentId)
  if (!teamId) return null
  const teamRoot = await getTeamById(teamId, { bypassCache: true })
  const explicit = clean(request.counterpartSeasonKey)
  const same = clean(request.seasonKey)
  const rootKeys = (Array.isArray(teamRoot?.seasons) ? teamRoot.seasons : [])
    .map(row => clean(row?.seasonKey || row?.seasonId)).filter(Boolean)
  const keys = explicit ? [explicit] : request.counterpartSeasonUnknown === true
    ? [...new Set([same, ...rootKeys].filter(Boolean))] : [same].filter(Boolean)
  const checkedSeasons = []
  for (const seasonKey of keys) {
    const teamSeason = await getTeamSeason({ birthTeamDocumentId: teamId, seasonKey, bypassCache: true })
    checkedSeasons.push({ seasonKey, teamSeason: teamSeason || null })
    if (teamSeason) return { birthTeamDocumentId: teamId, seasonKey, teamRoot, teamSeason, checkedSeasons }
  }
  return { birthTeamDocumentId: teamId, seasonKey: explicit || same, teamRoot, teamSeason: null, checkedSeasons }
}
