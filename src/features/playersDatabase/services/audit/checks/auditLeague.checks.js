import { buildLeaguesMasterLeagueEntry, buildLeaguesMasterSummary } from '../audit.projections.js'
import { buildAuditFinding, AUDIT_FINDING_TYPE } from '../audit.contract.js'
import { AUDIT_SCOPE_TYPE } from '../audit.scope.js'

export function appendLeagueAuditFindings({
  normalizedScope,
  leagues,
  leaguesMaster,
  findings,
  helpers,
}) {
  if (![AUDIT_SCOPE_TYPE.FULL_SYSTEM, AUDIT_SCOPE_TYPE.LEAGUE_SEASON].includes(normalizedScope.type)) return

  const { clean, seasonKeyOf, masterLeagueCounts, masterSummaryCounts, same } = helpers

    leagues.forEach(({ id, data }) => {
      const leagueId = clean(data?.leagueId || id)
      const current = data?.current && typeof data.current === 'object'
        ? data.current
        : null
      const history = Array.isArray(data?.history) ? data.history : []
      const currentSeasonKey = seasonKeyOf(current)

      if (current && clean(current.seasonStatus) === 'completed') {
        findings.push(buildAuditFinding({
          type: AUDIT_FINDING_TYPE.SOURCE_MISMATCH,
          entityType: 'leagueSeason',
          documentId: id,
          seasonKey: currentSeasonKey,
          title: 'עונה שהסתיימה נמצאת ב-current של מסמך הליגה',
          explanation: 'עונה שסומנה כהסתיימה חייבת להישמר כאובייקט מלא ב-history ולא להישאר ב-current.',
          source: 'League season lifecycle',
          expected: { location: 'history', seasonStatus: 'completed' },
          actual: { leagueId, location: 'current', seasonStatus: 'completed' },
        }))
      }

      if (currentSeasonKey && history.some(season => seasonKeyOf(season) === currentSeasonKey)) {
        findings.push(buildAuditFinding({
          type: AUDIT_FINDING_TYPE.SOURCE_MISMATCH,
          entityType: 'leagueSeason',
          documentId: id,
          seasonKey: currentSeasonKey,
          title: 'אותה עונת ליגה קיימת גם ב-current וגם ב-history',
          explanation: 'לאותה עונה מותר להיות מיקום אחד בלבד במסמך הליגה.',
          source: 'League season lifecycle',
          expected: { locations: ['current'] },
          actual: { leagueId, locations: ['current', 'history'] },
        }))
      }
    })

    if (normalizedScope.type !== AUDIT_SCOPE_TYPE.FULL_SYSTEM) return
    const master = leaguesMaster.find(row => row.id === 'all')?.data
    if (master) {
      const expectedEntries = leagues.map(({ id, data }) => buildLeaguesMasterLeagueEntry({ id, ...data }))
      const actualEntries = Array.isArray(master.leagues) ? master.leagues : []
      expectedEntries.forEach(entry => {
        const expected = masterLeagueCounts(entry)
        const actualEntry = actualEntries.find(row => clean(row?.leagueId || row?.leagueDocumentId) === expected.leagueId)
        const actual = actualEntry ? masterLeagueCounts(actualEntry) : null
        if (!same(expected, actual)) findings.push(buildAuditFinding({
          type: AUDIT_FINDING_TYPE.SOURCE_MISMATCH,
          entityType: 'leaguesMasterLeague',
          documentId: 'all',
          relatedDocumentId: expected.leagueId,
          title: 'המאסטר של הליגה אינו תואם למסמך הליגה',
          source: 'League Documents → buildLeaguesMasterLeagueEntry',
          expected,
          actual,
        }))
      })
      const expectedSummary = masterSummaryCounts(buildLeaguesMasterSummary(expectedEntries))
      const actualSummary = masterSummaryCounts(master.summary)
      if (!same(expectedSummary, actualSummary)) findings.push(buildAuditFinding({
        type: AUDIT_FINDING_TYPE.SOURCE_MISMATCH,
        entityType: 'leaguesMaster',
        documentId: 'all',
        title: 'סיכום המאסטר אינו תואם למסמכי הליגה',
        source: 'League Documents → buildLeaguesMasterSummary',
        expected: expectedSummary,
        actual: actualSummary,
      }))
    }
}
