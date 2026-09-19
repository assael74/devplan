// src/features/playersDatabase/services/audit/checks/auditClub.checks.js

import { buildLeagueTeamPerformanceProjection, resolveLeagueTeamPoints } from '../audit.projections.js'
import { buildAuditFinding, AUDIT_FINDING_TYPE, AUDIT_REPAIR_TYPE } from '../audit.contract.js'
import { AUDIT_SCOPE_TYPE } from '../audit.scope.js'
import { buildClubDataRepairIssues } from '../../dataRepair/club/clubDataRepair.diagnosis.js'
import { buildClubScoutPerformanceProjection } from '../../../domain/projections/club/clubAgeGroupSeason.projection.js'
import { buildLeagueTeamSeasons } from '../../../domain/orchestration/buildLeagueTeamSeasons.js'

export function appendClubAuditFindings({
  normalizedScope,
  clubs,
  clubsMaster,
  leagues,
  rootsById,
  teamSeasonsByTeamSeasonKey,
  findings,
  helpers,
}) {
  if (normalizedScope.type !== AUDIT_SCOPE_TYPE.FULL_SYSTEM) return

  const {
    clean,
    seasonKeyOf,
    same,
    clubSeasonKeyOf,
    findLeagueSeason,
    leagueSeasonHasTeam,
  } = helpers

  // Club Documents and Clubs Master are projections. Audit them against the
  // canonical Team/League relation and the pure Master builder; no repair is
  // attempted from this read-only flow.
  const clubsMasterDocument = clubsMaster.find(row => row.id === 'all')?.data || null
  const masterClubEntries = Array.isArray(clubsMasterDocument?.clubs) ? clubsMasterDocument.clubs : []
  const clubsById = new Map(clubs.map(row => [clean(row.data?.clubId || row.id), row]))
  const masterClubsById = new Map(masterClubEntries
    .map(entry => [clean(entry?.clubId), entry])
    .filter(([clubId]) => clubId))
  const leagueScoutPerformanceBySeason = new Map()

  // The full priority calculation belongs to the League table.  The audit
  // deliberately rebuilds it from the persisted League season context, never
  // from a Team Season or a SearchIndex projection.
  const scoutPerformanceFor = ({ leagueSource, seasonKey, teamId }) => {
    const leagueId = clean(leagueSource?.league?.data?.leagueId || leagueSource?.league?.id)
    const cacheKey = `${leagueId}::${clean(seasonKey)}`
    if (!leagueScoutPerformanceBySeason.has(cacheKey)) {
      const calculated = buildLeagueTeamSeasons({
        leagueDocument: leagueSource?.league?.data || {},
        seasonDocument: leagueSource?.season || {},
        target: leagueSource?.target || 'current',
      })
      leagueScoutPerformanceBySeason.set(cacheKey, new Map(calculated.map(item => [
        clean(item?.identity?.teamId || item?.identity?.teamDocumentId),
        item?.performance || null,
      ])))
    }
    return leagueScoutPerformanceBySeason.get(cacheKey)?.get(clean(teamId)) || null
  }

  if (!clubsMasterDocument && clubs.length) {
    findings.push(buildAuditFinding({
      type: AUDIT_FINDING_TYPE.MISSING_DOCUMENT,
      entityType: 'clubsMaster',
      documentId: 'all',
      title: 'חסר מסמך Clubs Master',
      explanation: 'כאשר קיימים מסמכי מועדון חייב להיות Clubs Master projection יחיד.',
      source: 'Club Documents → Clubs Master',
    }))
  }

  const masterClubIdCounts = masterClubEntries.reduce((counts, entry) => {
    const clubId = clean(entry?.clubId)
    if (clubId) counts.set(clubId, Number(counts.get(clubId) || 0) + 1)
    return counts
  }, new Map())
  masterClubIdCounts.forEach((count, clubId) => {
    if (count > 1) findings.push(buildAuditFinding({
      type: AUDIT_FINDING_TYPE.UNEXPECTED_DOCUMENT,
      entityType: 'clubsMasterClub',
      documentId: 'all',
      relatedDocumentId: clubId,
      relationKey: clubId,
      title: 'קיימות רשומות כפולות של מועדון ב-Clubs Master',
      explanation: 'כל clubId רשאי להופיע פעם אחת בלבד ב-Clubs Master.',
      source: 'Clubs Master identity',
    }))
  })
  masterClubEntries.forEach(entry => {
    const clubId = clean(entry?.clubId)
    if (clubId && !clubsById.has(clubId)) findings.push(buildAuditFinding({
      type: AUDIT_FINDING_TYPE.BROKEN_RELATION,
      entityType: 'clubsMasterClub',
      documentId: 'all',
      relatedDocumentId: clubId,
      relationKey: clubId,
      title: 'רשומת Clubs Master מצביעה למועדון שאינו קיים',
      explanation: 'לכל רשומת Clubs Master חייב להיות Club Document קנוני תואם.',
      source: 'Clubs Master → Club Document',
    }))
  })

  clubs.forEach(({ id, data: club }) => {
    const clubId = clean(club?.clubId || id)
    const masterEntry = masterClubsById.get(clubId) || null
    if (clubsMasterDocument && !masterEntry) {
      findings.push(buildAuditFinding({
        type: AUDIT_FINDING_TYPE.MISSING_DOCUMENT,
        entityType: 'clubsMasterClub',
        documentId: 'all',
        relatedDocumentId: clubId,
        relationKey: clubId,
        title: 'חסרה רשומת מועדון ב-Clubs Master',
        explanation: 'לכל Club Document חייבת להיות רשומה תואמת ב-Clubs Master.',
        source: 'Club Document → Clubs Master',
      }))
    }

    buildClubDataRepairIssues({ clubDocument: { ...club, id }, masterEntry }).forEach(issue => {
      findings.push(buildAuditFinding({
        type: issue.code === 'master_entry_mismatch'
          ? AUDIT_FINDING_TYPE.SOURCE_MISMATCH
          : AUDIT_FINDING_TYPE.UNEXPECTED_DOCUMENT,
        entityType: issue.code === 'master_entry_mismatch' ? 'clubsMasterClub' : 'clubDocument',
        documentId: issue.code === 'master_entry_mismatch' ? 'all' : id,
        relatedDocumentId: issue.code === 'master_entry_mismatch' ? clubId : '',
        seasonKey: issue.seasonKey,
        relationKey: [issue.code, issue.ageGroupId, issue.birthYear, issue.teamId].filter(Boolean).join('::'),
        title: issue.title,
        explanation: issue.action,
        source: issue.code === 'master_entry_mismatch'
          ? 'Club Document → buildClubsMasterClubProjection'
          : 'Club Document projection identity',
        repairType: issue.code === 'master_entry_mismatch'
          ? AUDIT_REPAIR_TYPE.REBUILD_CLUBS_MASTER
          : '',
        severity: issue.severity === 'danger' ? 'high' : 'medium',
      }))
    })

    const clubSeasonKeys = new Set()
    ;(Array.isArray(club?.ageGroups) ? club.ageGroups : []).forEach(ageGroup => {
      const ageGroupId = clean(ageGroup?.ageGroupId)
      ;(Array.isArray(ageGroup?.seasons) ? ageGroup.seasons : []).forEach(season => {
        const teamId = clean(season?.teamId)
        const seasonKey = seasonKeyOf(season)
        const leagueId = clean(season?.league?.leagueId)
        const identity = clubSeasonKeyOf({ ageGroupId, season })
        if (identity) clubSeasonKeys.add(identity)
        const missingIdentity = !ageGroupId || !teamId || !seasonKey || !leagueId || !Number(season?.birthYear)
        if (missingIdentity) findings.push(buildAuditFinding({
          type: AUDIT_FINDING_TYPE.BROKEN_RELATION,
          entityType: 'clubAgeGroupSeason',
          documentId: id,
          relatedDocumentId: teamId,
          teamDocumentId: teamId,
          seasonKey,
          relationKey: identity || `${ageGroupId}::${seasonKey}::${teamId}`,
          title: 'עונת קבוצת גיל במועדון חסרה זהות קנונית',
          explanation: 'Club age-group season חייב לכלול ageGroupId, teamId, seasonKey, birthYear ו-leagueId.',
          source: 'Club projection identity',
        }))

        const team = rootsById.get(teamId)
        const leagueSource = findLeagueSeason({ leagues, leagueId, seasonKey })
        if (team && clean(team?.clubId) !== clubId) findings.push(buildAuditFinding({
          type: AUDIT_FINDING_TYPE.SOURCE_MISMATCH,
          entityType: 'clubAgeGroupSeason',
          documentId: id,
          relatedDocumentId: teamId,
          teamDocumentId: teamId,
          seasonKey,
          relationKey: identity,
          title: 'קבוצת המועדון אינה תואמת ל-Club Document',
          explanation: 'clubId ב-Team Root חייב להיות זהה ל-clubId של ה-projection.',
          source: 'Team Root → Club Document',
          expected: { clubId: clean(team?.clubId) },
          actual: { clubId },
        }))
        // A League-only team is canonical when it exists in that League
        // table. Team Root is optional until roster/team data is loaded.
        if (!teamId || (!team && !leagueSeasonHasTeam({
          leagueSeason: leagueSource?.season,
          teamId,
        }))) findings.push(buildAuditFinding({
          type: AUDIT_FINDING_TYPE.BROKEN_RELATION,
          entityType: 'clubAgeGroupSeason',
          documentId: id,
          relatedDocumentId: teamId,
          teamDocumentId: teamId,
          seasonKey,
          relationKey: identity,
          title: 'עונת קבוצת גיל מצביעה לקבוצה שאינה קיימת',
          explanation: 'כל teamId ב-Club Document חייב להפנות ל-Team Root קיים, או לשורה קנונית בטבלת הליגה.',
          source: 'Club Document → Team Root',
        }))
        if (!findLeagueSeason({ leagues, leagueId, seasonKey })) findings.push(buildAuditFinding({
          type: AUDIT_FINDING_TYPE.BROKEN_RELATION,
          entityType: 'clubAgeGroupSeason',
          documentId: id,
          relatedDocumentId: leagueId,
          teamDocumentId: teamId,
          seasonKey,
          relationKey: identity,
          title: 'עונת קבוצת גיל מצביעה לליגה או עונה שאינן קיימות',
          explanation: 'leagueId ו-seasonKey ב-Club Document חייבים להפנות לעונת ליגה קנונית.',
          source: 'Club Document → League Document',
        }))
        const canonicalTeamSeason = teamSeasonsByTeamSeasonKey.get(`${teamId}::${seasonKey}`) || {}
        if (teamId && !Object.keys(canonicalTeamSeason).length && !leagueSeasonHasTeam({
          leagueSeason: leagueSource?.season,
          teamId,
        })) findings.push(buildAuditFinding({
          type: AUDIT_FINDING_TYPE.BROKEN_RELATION,
          entityType: 'clubAgeGroupSeason',
          documentId: id,
          relatedDocumentId: teamId,
          teamDocumentId: teamId,
          seasonKey,
          relationKey: identity,
          title: 'עונת קבוצת גיל מצביעה לעונת קבוצה שאינה קיימת',
          explanation: 'Club age-group season חייבת להפנות ל-Team Season, או לשורת קבוצה קנונית בטבלת הליגה של אותה עונה.',
          source: 'Club Document → Team Season',
        }))
        const canonicalPerformance = leagueSource && team
          ? buildLeagueTeamPerformanceProjection({
              league: leagueSource.league.data,
              season: canonicalTeamSeason,
              target: leagueSource.target,
              team: { ...team, ...canonicalTeamSeason },
            })
          : null
        if (canonicalPerformance) {
          const expectedPerformance = {
            tableRank: canonicalPerformance.tableRank,
            tableAttackRank: canonicalPerformance.tableAttackRank,
            tableDefenseRank: canonicalPerformance.tableDefenseRank,
            points: resolveLeagueTeamPoints({
              league: leagueSource.league.data,
              season: canonicalTeamSeason,
              target: leagueSource.target,
              team: { ...team, ...canonicalTeamSeason },
            }),
            teamGamePlayed: canonicalPerformance.teamGamePlayed,
            goalsFor: canonicalPerformance.goalsFor,
            goalsAgainst: canonicalPerformance.goalsAgainst,
            goalsForPerGame: canonicalPerformance.goalsForPerGame,
            goalsAgainstPerGame: canonicalPerformance.goalsAgainstPerGame,
          }
          const actualPerformance = Object.fromEntries(
            Object.keys(expectedPerformance).map(field => [field, season?.performance?.[field]])
          )
          if (!same(expectedPerformance, actualPerformance)) findings.push(buildAuditFinding({
            type: AUDIT_FINDING_TYPE.SOURCE_MISMATCH,
            entityType: 'clubAgeGroupSeason',
            documentId: id,
            relatedDocumentId: leagueId,
            teamDocumentId: teamId,
            seasonKey,
            relationKey: identity,
            title: 'ביצועי המועדון אינם תואמים לטבלת הליגה',
            explanation: 'performance ב-Club Document הוא projection של League Document בלבד.',
            source: 'League table → Club performance',
            repairType: AUDIT_REPAIR_TYPE.REBUILD_CLUB_PROJECTION,
            expected: expectedPerformance,
            actual: actualPerformance,
          }))
        }
        const leagueTeam = (Array.isArray(leagueSource?.season?.tableRank)
          ? leagueSource.season.tableRank
          : []).find(row => clean(row?.teamId) === teamId)

        // Both the official table statistics and scouting priority are facts
        // of the League row. Team Season is deliberately not consulted here.
        const expectedScoutPerformance = buildClubScoutPerformanceProjection({
          leagueTeam: {
            ...leagueTeam,
            offense: scoutPerformanceFor({ leagueSource, seasonKey, teamId })?.offense,
            defense: scoutPerformanceFor({ leagueSource, seasonKey, teamId })?.defense,
          },
          clearMissing: Boolean(leagueTeam),
        })
        if (expectedScoutPerformance) {
          const actualScoutPerformance = Object.fromEntries(
            Object.keys(expectedScoutPerformance).map(side => [side, season?.performance?.[side]])
          )
          if (!same(expectedScoutPerformance, actualScoutPerformance)) findings.push(buildAuditFinding({
            type: AUDIT_FINDING_TYPE.SOURCE_MISMATCH,
            entityType: 'clubAgeGroupSeason',
            documentId: id,
            relatedDocumentId: leagueId,
            teamDocumentId: teamId,
            seasonKey,
            relationKey: identity,
            title: 'עדיפות התקפית או הגנתית במועדון אינה תואמת לטבלת הליגה',
            explanation: 'עדיפות התקפית והגנתית עוברת משורת הקבוצה בליגה אל Club Document ואל Clubs Master.',
            source: 'League table → Club performance',
            repairType: AUDIT_REPAIR_TYPE.REBUILD_CLUB_PROJECTION,
            expected: expectedScoutPerformance,
            actual: actualScoutPerformance,
          }))
        }
        if (leagueTeam) {
          const expectedProfiles = {
            total: Number(leagueTeam?.scoutProfilesSummary?.total) || 0,
            profileCounts: leagueTeam?.scoutProfilesSummary?.profileCounts &&
              typeof leagueTeam.scoutProfilesSummary.profileCounts === 'object'
              ? leagueTeam.scoutProfilesSummary.profileCounts
              : {},
          }
          const actualProfiles = season?.scoutProfilesSummary || {}
          if (!same(expectedProfiles, actualProfiles)) findings.push(buildAuditFinding({
            type: AUDIT_FINDING_TYPE.SOURCE_MISMATCH,
            entityType: 'clubAgeGroupSeason',
            documentId: id,
            relatedDocumentId: leagueId,
            teamDocumentId: teamId,
            seasonKey,
            relationKey: identity,
            title: 'פרופילי הקבוצה במועדון אינם תואמים לטבלת הליגה',
            explanation: 'סיכום הפרופילים עובר משורת הקבוצה בליגה אל Club Document ואל Clubs Master.',
            source: 'League table → Club performance',
            repairType: AUDIT_REPAIR_TYPE.REBUILD_CLUB_PROJECTION,
            expected: expectedProfiles,
            actual: actualProfiles,
          }))
        }
      })
    })

    ;(Array.isArray(club?.competitionPaths) ? club.competitionPaths : []).forEach(path => {
      ;(Array.isArray(path?.seasons) ? path.seasons : []).forEach(season => {
        const identity = clubSeasonKeyOf({ ageGroupId: season?.ageGroupId, season })
        if (identity && !clubSeasonKeys.has(identity)) findings.push(buildAuditFinding({
          type: AUDIT_FINDING_TYPE.BROKEN_RELATION,
          entityType: 'clubCompetitionPathSeason',
          documentId: id,
          relatedDocumentId: clean(season?.teamId),
          teamDocumentId: clean(season?.teamId),
          seasonKey: seasonKeyOf(season),
          relationKey: identity,
          title: 'מסלול הליגה אינו תואם לעונת קבוצת גיל במועדון',
          explanation: 'כל Competition Path season חייב להפנות לרשומת ageGroups זהה לפי ageGroupId, seasonKey ו-teamId.',
          source: 'Club ageGroups → competitionPaths',
          repairType: AUDIT_REPAIR_TYPE.REBUILD_CLUB_COMPETITION_PATH,
        }))
      })
    })
  })

  // Reverse coverage: every canonical League-table team must be represented
  // in its Club Document, including league-only teams that have no roster or
  // Team Season yet. The full identity keeps slots 1–3 separate.
  const clubSeasonKeysByClubId = new Map(clubs.map(({ id, data: club }) => {
    const clubId = clean(club?.clubId || id)
    const keys = new Set()
    ;(Array.isArray(club?.ageGroups) ? club.ageGroups : []).forEach(ageGroup => {
      ;(Array.isArray(ageGroup?.seasons) ? ageGroup.seasons : []).forEach(season => {
        keys.add(clubSeasonKeyOf({ ageGroupId: ageGroup?.ageGroupId, season }))
      })
    })
    return [clubId, keys]
  }))

  const leagueRowsByClubIdentity = new Map()
  leagues.forEach(({ id, data: league }) => {
    const leagueId = clean(league?.leagueId || id)
    const ageGroupId = clean(league?.ageGroupId)
    const leagueSeasons = [league?.current, ...(Array.isArray(league?.history) ? league.history : [])]
      .filter(season => season && typeof season === 'object')

    leagueSeasons.forEach(leagueSeason => {
      const seasonKey = seasonKeyOf(leagueSeason)
      ;(Array.isArray(leagueSeason?.tableRank) ? leagueSeason.tableRank : []).forEach(teamRow => {
        const teamId = clean(teamRow?.teamId || teamRow?.birthTeamId)
        const identity = [ageGroupId, seasonKey, teamId].join('::')
        if (!ageGroupId || !seasonKey || !teamId) return
        const rows = leagueRowsByClubIdentity.get(identity) || []
        rows.push({ leagueId, clubId: clean(teamRow?.clubId), teamId, seasonKey })
        leagueRowsByClubIdentity.set(identity, rows)
      })
    })
  })

  leagues.forEach(({ id, data: league }) => {
    const leagueId = clean(league?.leagueId || id)
    const ageGroupId = clean(league?.ageGroupId)
    const leagueSeasons = [
      league?.current,
      ...(Array.isArray(league?.history) ? league.history : []),
    ].filter(season => season && typeof season === 'object')

    leagueSeasons.forEach(leagueSeason => {
      const seasonKey = seasonKeyOf(leagueSeason)
      ;(Array.isArray(leagueSeason?.tableRank) ? leagueSeason.tableRank : []).forEach(teamRow => {
        const clubId = clean(teamRow?.clubId)
        const teamId = clean(teamRow?.teamId || teamRow?.birthTeamId)
        const relationKey = [ageGroupId, seasonKey, teamId].join('::')
        const matchingLeagueRows = leagueRowsByClubIdentity.get(relationKey) || []
        const distinctLeagueIds = [...new Set(matchingLeagueRows.map(item => item.leagueId))]

        // The Club contract has no leagueId in this identity. A team that
        // appears in two leagues cannot be projected safely until the
        // canonical League membership is resolved.
        if (distinctLeagueIds.length > 1) return

        if (!clubId || !ageGroupId || !seasonKey || !teamId) {
          findings.push(buildAuditFinding({
            type: AUDIT_FINDING_TYPE.BROKEN_RELATION,
            entityType: 'clubAgeGroupSeason',
            documentId: clubId || leagueId,
            relatedDocumentId: teamId,
            teamDocumentId: teamId,
            leagueId,
            seasonKey,
            relationKey,
            title: 'לקבוצה בטבלת הליגה חסרה זהות Club קנונית',
            explanation: 'כדי לבנות Club projection נדרשים clubId, ageGroupId, seasonKey ו-teamId מטבלת הליגה.',
            source: 'League table → Club Document',
            repairType: AUDIT_REPAIR_TYPE.REBUILD_CLUB_PROJECTION,
          }))
          return
        }

        if (!clubsById.has(clubId)) {
          findings.push(buildAuditFinding({
            type: AUDIT_FINDING_TYPE.MISSING_DOCUMENT,
            entityType: 'clubDocument',
            documentId: clubId,
            relatedDocumentId: leagueId,
            teamDocumentId: teamId,
            seasonKey,
            relationKey,
            title: 'חסר מסמך מועדון לקבוצה בטבלת הליגה',
            explanation: 'לכל clubId שמופיע בטבלת ליגה חייב להיות Club Document.',
            source: 'League table → Club Document',
            repairType: AUDIT_REPAIR_TYPE.REBUILD_CLUB_PROJECTION,
          }))
          return
        }

        if (!clubSeasonKeysByClubId.get(clubId)?.has(relationKey)) {
          findings.push(buildAuditFinding({
            type: AUDIT_FINDING_TYPE.MISSING_DOCUMENT,
            entityType: 'clubAgeGroupSeason',
            documentId: clubId,
            relatedDocumentId: leagueId,
            teamDocumentId: teamId,
            seasonKey,
            relationKey,
            title: 'קבוצת ליגה חסרה במסמך המועדון',
            explanation: 'כל שורת קבוצה בטבלת ליגה חייבת להופיע ב-Club לפי ageGroupId, seasonKey ו-teamId.',
            source: 'League table → Club Document',
            repairType: AUDIT_REPAIR_TYPE.REBUILD_CLUB_PROJECTION,
          }))
        }
      })
    })
  })

  leagueRowsByClubIdentity.forEach((entries, relationKey) => {
    const leagueIds = [...new Set(entries.map(item => item.leagueId))]
    if (leagueIds.length < 2) return
    const [ageGroupId, seasonKey, teamId] = relationKey.split('::')

    findings.push(buildAuditFinding({
      type: AUDIT_FINDING_TYPE.BROKEN_RELATION,
      entityType: 'clubAgeGroupSeason',
      documentId: clean(entries[0]?.clubId),
      relatedDocumentId: leagueIds.join(', '),
      teamDocumentId: teamId,
      seasonKey,
      relationKey,
      title: 'קבוצה מופיעה בשתי ליגות באותה עונה',
      explanation: `הזהות ${ageGroupId} / ${seasonKey} / ${teamId} קיימת בליגות: ${leagueIds.join(', ')}. יש להכריע איזו ליגה קנונית לפני סנכרון Club.`,
      source: 'League table identity',
      actual: { leagueIds },
    }))
  })
}
