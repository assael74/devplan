import { readClubDocumentV2 } from '../../read/entities/clubV2.js'
import { readClubsMasterDocument } from '../../read/masters/clubsMaster.read.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

export async function readActualRosterClubsV2({ expectedClubs = [] } = {}) {
  const clubIds = [...new Set(
    (Array.isArray(expectedClubs) ? expectedClubs : [])
      .map(row => clean(row?.clubId))
      .filter(Boolean)
  )]
  const clubs = await Promise.all(clubIds.map(clubId => readClubDocumentV2({ clubId })))
  const clubsMaster = await readClubsMasterDocument({ fresh: true })
  return { clubs, clubsMaster }
}
