// Compact advisory index. League documents remain the canonical source.

export const CLUB_SEASON_IDENTITY_INDEX_PROJECTION_VERSION = 1

export const buildClubSeasonIdentityIndexDocumentId = ({ seasonKey = '', birthYear = 0 } = {}) => {
  const safeSeasonKey = String(seasonKey || '').trim().replaceAll('/', '-')
  const safeBirthYear = Number(birthYear) || 0

  return safeSeasonKey && safeBirthYear
    ? `identity__${safeSeasonKey}__${safeBirthYear}`
    : ''
}

export const CLUB_SEASON_IDENTITY_INDEX_DOCUMENT_CATALOG = {
  documentType: 'clubSeasonIdentityIndex',
  projectionVersion: CLUB_SEASON_IDENTITY_INDEX_PROJECTION_VERSION,
  seasonKey: '',
  birthYear: 0,
  entries: [
    {
      clubId: '',
      clubName: '',
      ageGroupId: '',
      teamId: '',
      teamSlot: 1,
      leagueId: '',
      leagueName: '',
      leagueLevel: 0,
    },
  ],
  updatedAt: null,
  lastWriteAction: '',
  lastWriteAt: null,
}
