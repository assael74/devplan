// Removes only Club projections that disappeared from a corrected League table.
// The operation is deliberately scoped to identity-index removals; it never
// scans or rebuilds every Club document.

const { admin, db } = require('../../../config/admin')
const { runForCurrentLeagueProjectionAttempt } = require('./leagueProjectionJob.repository')

const CLUBS_COLLECTION = 'dbClubs'
const CLUBS_MASTER_COLLECTION = 'dbClubsMaster'
const CLUBS_MASTER_DOCUMENT_ID = 'all'
const LEAGUES_COLLECTION = 'dbLeagues'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const seasonKeyOf = season => clean(season?.seasonKey || season?.seasonId)

const resolveCanonicalSeason = ({ league = {}, seasonKey = '', target = 'current' } = {}) => (
  target === 'history'
    ? (Array.isArray(league.history) ? league.history : []).find(season => (
        seasonKeyOf(season) === clean(seasonKey)
      )) || null
    : league.current || null
)

const groupRemovalsByClub = ({ source = {} } = {}) => {
  const byClub = new Map()
  ;(Array.isArray(source?.removedLeagueEntries) ? source.removedLeagueEntries : []).forEach(entry => {
    const clubId = clean(entry?.clubId)
    const teamId = clean(entry?.teamId || entry?.birthTeamId)
    const ageGroupId = clean(entry?.ageGroupId || source?.league?.ageGroupId || source?.season?.ageGroupId)
    const seasonKey = clean(entry?.seasonKey || source?.season?.seasonKey || source?.season?.seasonId)
    const leagueId = clean(entry?.leagueId || source?.league?.id || source?.league?.leagueId)
    if (!clubId || !teamId || !ageGroupId || !seasonKey || !leagueId) return

    const removals = byClub.get(clubId) || []
    removals.push({ ageGroupId, seasonKey, leagueId, teamId })
    byClub.set(clubId, removals)
  })
  return byClub
}

const matchesRemoval = ({ removal = {}, ageGroupId = '', season = {}, leagueField = 'league' } = {}) => (
  clean(removal.ageGroupId) === clean(ageGroupId) &&
  clean(removal.seasonKey) === seasonKeyOf(season) &&
  clean(removal.teamId) === clean(season?.teamId) &&
  clean(removal.leagueId) === clean(leagueField === 'league'
    ? season?.league?.leagueId
    : season?.leagueId)
)

const removeClubProjections = ({ club = {}, removals = [] } = {}) => ({
  ...club,
  ageGroups: (Array.isArray(club?.ageGroups) ? club.ageGroups : [])
    .map(ageGroup => ({
      ...ageGroup,
      seasons: (Array.isArray(ageGroup?.seasons) ? ageGroup.seasons : [])
        .filter(season => !removals.some(removal => matchesRemoval({
          removal, ageGroupId: ageGroup?.ageGroupId, season, leagueField: 'league',
        }))),
    }))
    .filter(ageGroup => Array.isArray(ageGroup.seasons) && ageGroup.seasons.length),
  competitionPaths: (Array.isArray(club?.competitionPaths) ? club.competitionPaths : [])
    .map(path => ({
      ...path,
      seasons: (Array.isArray(path?.seasons) ? path.seasons : [])
        .filter(season => !removals.some(removal => matchesRemoval({
          removal, ageGroupId: season?.ageGroupId, season, leagueField: 'leagueId',
        }))),
    })),
})

// Clubs Master is a compact projection. Its age-group entries are updated in
// the same transaction as the matching Club document, so the audit cannot see
// a cleaned Club together with a stale Master row.
const removeMasterProjections = ({ master = {}, clubId = '', removals = [] } = {}) => ({
  ...master,
  clubs: (Array.isArray(master?.clubs) ? master.clubs : []).map(entry => {
    if (clean(entry?.clubId) !== clean(clubId)) return entry
    return {
      ...entry,
      ageGroups: (Array.isArray(entry?.ageGroups) ? entry.ageGroups : []).map(ageGroup => ({
        ...ageGroup,
        current: (Array.isArray(ageGroup?.current) ? ageGroup.current : []).filter(season => (
          !removals.some(removal => matchesRemoval({
            removal, ageGroupId: ageGroup?.ageGroupId, season, leagueField: 'league',
          }))
        )),
        previous: (Array.isArray(ageGroup?.previous) ? ageGroup.previous : []).filter(season => (
          !removals.some(removal => matchesRemoval({
            removal, ageGroupId: ageGroup?.ageGroupId, season, leagueField: 'league',
          }))
        )),
      })),
    }
  }),
})

async function cleanupClubProjectionsFromLeagueTable({
  source = {}, jobId = '', sourceRevision = '', attemptToken = '',
} = {}) {
  const removalsByClub = groupRemovalsByClub({ source })
  if (!removalsByClub.size) return { removedProjectionCount: 0, updatedClubCount: 0, skipped: true }

  const leagueId = clean(source?.league?.id || source?.league?.leagueId)
  const seasonKey = clean(source?.season?.seasonKey || source?.season?.seasonId)
  const target = clean(source?.target) || 'current'
  if (!leagueId || !seasonKey) throw new Error('Missing League identity for Club projection cleanup')

  let removedProjectionCount = 0
  let updatedClubCount = 0
  for (const [clubId, removals] of removalsByClub) {
    const result = await runForCurrentLeagueProjectionAttempt({
      jobId,
      sourceRevision,
      attemptToken,
      callback: async ({ transaction }) => {
        const leagueSnapshot = await transaction.get(db.collection(LEAGUES_COLLECTION).doc(leagueId))
        const canonicalSeason = leagueSnapshot.exists
          ? resolveCanonicalSeason({ league: leagueSnapshot.data() || {}, seasonKey, target })
          : null
        if (clean(canonicalSeason?.sourceRevision) !== clean(sourceRevision)) {
          return { applied: false, reason: 'staleCanonicalSource' }
        }

        const clubReference = db.collection(CLUBS_COLLECTION).doc(clubId)
        const masterReference = db.collection(CLUBS_MASTER_COLLECTION).doc(CLUBS_MASTER_DOCUMENT_ID)
        const [clubSnapshot, masterSnapshot] = await Promise.all([
          transaction.get(clubReference),
          transaction.get(masterReference),
        ])
        if (!clubSnapshot.exists) return { applied: true, updated: false }

        const currentClub = clubSnapshot.data() || {}
        const nextClub = removeClubProjections({ club: currentClub, removals })
        const changedClub = JSON.stringify(currentClub.ageGroups || []) !== JSON.stringify(nextClub.ageGroups || []) ||
          JSON.stringify(currentClub.competitionPaths || []) !== JSON.stringify(nextClub.competitionPaths || [])
        if (!changedClub) return { applied: true, updated: false }

        transaction.set(clubReference, {
          ...nextClub,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          lastWriteAction: 'LEAGUE_PROJECTION_JOB_CLUB_CLEANUP',
          lastWriteAt: admin.firestore.FieldValue.serverTimestamp(),
        })
        if (masterSnapshot.exists) {
          const currentMaster = masterSnapshot.data() || {}
          transaction.set(masterReference, {
            ...removeMasterProjections({ master: currentMaster, clubId, removals }),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            lastWriteAction: 'LEAGUE_PROJECTION_JOB_CLUB_CLEANUP',
            lastWriteAt: admin.firestore.FieldValue.serverTimestamp(),
          })
        }
        return { applied: true, updated: true }
      },
    })
    if (!result.applied) return { removedProjectionCount, updatedClubCount, stale: true }
    if (result.updated) {
      updatedClubCount += 1
      removedProjectionCount += removals.length
    }
  }

  return { removedProjectionCount, updatedClubCount, skipped: false }
}

module.exports = {
  cleanupClubProjectionsFromLeagueTable,
  groupRemovalsByClub,
  removeClubProjections,
}
