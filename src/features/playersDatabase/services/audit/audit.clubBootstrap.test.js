import { buildClubsMasterClubProjection } from '../../domain/projections/club/index.js'
import { buildClubDataRepairIssues } from '../dataRepair/club/clubDataRepair.diagnosis.js'

const baseClub = {
  clubId: 'club-a',
  name: 'מועדון א',
  shortName: 'מ. א',
  sourceName: 'מועדון א',
  clubLevel: 3,
  clubStrengthLevel: 3.5,
  // These are optional enrichment values. They must not affect integrity.
  externalClubId: '',
  clubUrl: '',
  aliases: [],
  searchAliases: [],
  ageGroups: [],
  competitionPaths: [],
}

describe('Club bootstrap audit contract', () => {
  test('a catalog-seeded Club without teams, seasons, or external link has no repair finding', () => {
    const masterEntry = buildClubsMasterClubProjection({ club: baseClub })

    expect(buildClubDataRepairIssues({
      clubDocument: baseClub,
      masterEntry,
    })).toEqual([])
  })

  test('optional URL enrichment is not part of the Club-to-Master consistency contract', () => {
    const linkedClub = {
      ...baseClub,
      externalClubId: '6098',
      clubUrl: 'https://www.football.org.il/clubs/club/?club_id=6098',
    }

    expect(buildClubDataRepairIssues({
      clubDocument: linkedClub,
      masterEntry: buildClubsMasterClubProjection({ club: linkedClub }),
    })).toEqual([])
  })
})
