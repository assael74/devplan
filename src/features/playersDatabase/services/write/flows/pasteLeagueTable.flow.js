// features/playersDatabase/services/write/flows/pasteLeagueTable.flow.js

import {
  ensureLeagueDoc,
  updateLeagueSeasonTableRank,
} from '../leagues/index.js'
import {
  upsertTeamSeasonSearchIndexMany,
} from '../searchIndex/index.js'

export async function pasteLeagueTableFlow(payload = {}) {
  await ensureLeagueDoc(payload.league || {})
  const leagueResult = await updateLeagueSeasonTableRank(payload)
  const searchIndexResult = await upsertTeamSeasonSearchIndexMany(payload)

  return {
    ...leagueResult,
    leagueResult,
    searchIndexResult,
  }
}
