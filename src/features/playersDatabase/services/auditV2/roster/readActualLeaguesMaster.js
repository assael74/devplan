import { readLeaguesMasterDocument } from '../../read/masters/leaguesMaster.read.js'

export async function readActualRosterLeaguesMasterV2() {
  return readLeaguesMasterDocument({ fresh: true })
}
