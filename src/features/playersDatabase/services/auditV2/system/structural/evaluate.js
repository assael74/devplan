// src/features/playersDatabase/services/auditV2/system/structural/evaluate.js

import { cleanValue } from '../../../../model/shared/value.model.js'
import {
  isSameSeason,
  resolveSeasonLookupKey,
} from '../../../../model/shared/season.model.js'
import {
  buildStructuralAuditFindingV2,
  STRUCTURAL_AUDIT_V2_TARGET,
} from './contract.js'
import { validateTeamSeasonMovementV2 } from './movementValidation.js'

const clean = cleanValue

const seasonKeyOf = season => resolveSeasonLookupKey(season || {})
const teamIdOf = value => clean(
  value?.birthTeamDocumentId ||
  value?.teamDocumentId ||
  value?.teamId ||
  value?.birthTeamId
)
const leagueIdOf = ({ id = '', data = {} } = {}) => clean(data?.leagueId || id)
const clubIdOf = ({ id = '', data = {} } = {}) => clean(data?.clubId || id)

const leagueSeasons = league => {
  const rows = []
  if (league?.current && typeof league.current === 'object') {
    rows.push({ target: 'current', season: league.current })
  }
  ;(Array.isArray(league?.history) ? league.history : []).forEach(season => {
    rows.push({ target: 'history', season })
  })
  return rows
}

const findLeagueSeason = ({ leaguesById, leagueId, seasonKey }) => {
  const leagueRow = leaguesById.get(clean(leagueId))
  if (!leagueRow) return null

  const lookupKey = seasonKeyOf({ seasonKey })
  const match = leagueSeasons(leagueRow.data)
    .find(row => seasonKeyOf(row.season) === lookupKey)

  return match ? { leagueRow, ...match } : null
}

const findLeagueSeasonTeamRow = ({ leagueSeason, teamId }) => (
  (Array.isArray(leagueSeason?.tableRank) ? leagueSeason.tableRank : [])
    .find(row => teamIdOf(row) === clean(teamId)) || null
)

const appendLeagueLifecycleFindings = ({ leagues, findings }) => {
  leagues.forEach(({ id, data }) => {
    const leagueId = leagueIdOf({ id, data })
    const current = data?.current && typeof data.current === 'object'
      ? data.current
      : null
    const history = Array.isArray(data?.history) ? data.history : []
    const currentSeasonKey = seasonKeyOf(current)

    if (current && !currentSeasonKey) {
      findings.push(buildStructuralAuditFindingV2({
        type: 'invalid_identity',
        target: STRUCTURAL_AUDIT_V2_TARGET.LEAGUES,
        documentId: id,
        leagueId,
        title: 'לעונת current של הליגה חסרה זהות עונה',
        reason: 'כל עונת ליגה חייבת seasonId או seasonKey קנוניים.',
      }))
    }

    if (current && clean(current?.seasonStatus) === 'completed') {
      findings.push(buildStructuralAuditFindingV2({
        type: 'invalid_lifecycle',
        target: STRUCTURAL_AUDIT_V2_TARGET.LEAGUES,
        documentId: id,
        leagueId,
        seasonKey: currentSeasonKey,
        title: 'עונה שהסתיימה נמצאת ב-current של הליגה',
        reason: 'עונה completed צריכה להישמר ב-history ולא ב-current.',
        expected: { location: 'history', seasonStatus: 'completed' },
        actual: { location: 'current', seasonStatus: 'completed' },
      }))
    }

    const historyKeys = new Map()
    history.forEach((season, index) => {
      const seasonKey = seasonKeyOf(season)
      const status = clean(season?.seasonStatus)

      if (!seasonKey) {
        findings.push(buildStructuralAuditFindingV2({
          type: 'invalid_identity',
          target: STRUCTURAL_AUDIT_V2_TARGET.LEAGUES,
          documentId: id,
          leagueId,
          relationKey: `history:${index}`,
          title: 'לעונת history של הליגה חסרה זהות עונה',
          reason: 'כל רשומת history חייבת seasonId או seasonKey קנוניים.',
        }))
        return
      }

      if (status !== 'completed') {
        findings.push(buildStructuralAuditFindingV2({
          type: 'invalid_lifecycle',
          target: STRUCTURAL_AUDIT_V2_TARGET.LEAGUES,
          documentId: id,
          leagueId,
          seasonKey,
          title: 'עונת history אינה מסומנת completed',
          reason: 'כל עונה שנשמרת ב-history חייבת להיות completed.',
          expected: { location: 'history', seasonStatus: 'completed' },
          actual: { location: 'history', seasonStatus: status || null },
        }))
      }

      const previousIndex = historyKeys.get(seasonKey)
      if (previousIndex !== undefined) {
        findings.push(buildStructuralAuditFindingV2({
          type: 'duplicate_relation',
          target: STRUCTURAL_AUDIT_V2_TARGET.LEAGUES,
          documentId: id,
          leagueId,
          seasonKey,
          relationKey: `${previousIndex}:${index}`,
          title: 'אותה עונה מופיעה יותר מפעם אחת ב-history',
          reason: 'לכל seasonKey מותרת רשומת history אחת בלבד.',
        }))
      } else {
        historyKeys.set(seasonKey, index)
      }
    })

    if (currentSeasonKey && historyKeys.has(currentSeasonKey)) {
      findings.push(buildStructuralAuditFindingV2({
        type: 'invalid_lifecycle',
        target: STRUCTURAL_AUDIT_V2_TARGET.LEAGUES,
        documentId: id,
        leagueId,
        seasonKey: currentSeasonKey,
        title: 'אותה עונת ליגה קיימת גם ב-current וגם ב-history',
        reason: 'לאותה עונה מותר להיות מיקום אחד בלבד במסמך הליגה.',
        expected: { locations: ['current'] },
        actual: { locations: ['current', 'history'] },
      }))
    }
  })
}

const appendTeamRelationFindings = ({
  teamRoots,
  teamSeasons,
  leaguesById,
  findings,
}) => {
  const teamRootsById = new Map(teamRoots.map(row => [clean(row.id), row]))
  const teamSeasonsById = new Map(teamSeasons.map(row => [clean(row.id), row]))

  teamSeasons.forEach(({ id, data: season }) => {
    const teamId = teamIdOf(season)
    const seasonKey = seasonKeyOf(season)
    const leagueId = clean(season?.leagueId)
    const root = teamRootsById.get(teamId)

    if (!root) {
      findings.push(buildStructuralAuditFindingV2({
        type: 'broken_relation',
        target: STRUCTURAL_AUDIT_V2_TARGET.TEAM_SEASONS,
        documentId: id,
        relatedDocumentId: teamId,
        teamId,
        seasonKey,
        title: 'Team Season ללא Team Root',
        reason: 'לכל Team Season חייב להיות Team Root קנוני.',
      }))
    } else {
      const hasSeasonReference = (Array.isArray(root.data?.seasons)
        ? root.data.seasons
        : []).some(entry => (
          isSameSeason(entry, season) &&
          clean(entry?.seasonDocumentId) === clean(id)
        ))

      if (!hasSeasonReference) {
        findings.push(buildStructuralAuditFindingV2({
          type: 'broken_relation',
          target: STRUCTURAL_AUDIT_V2_TARGET.TEAM_ROOTS,
          documentId: root.id,
          relatedDocumentId: id,
          teamId,
          seasonKey,
          title: 'Team Root אינו מפנה ל-Team Season',
          reason: 'seasons[] ב-Team Root חייב להכיל את מסמך העונה הקנוני.',
        }))
      }
    }

    const leagueSource = findLeagueSeason({ leaguesById, leagueId, seasonKey })

    if (!leagueSource) {
      findings.push(buildStructuralAuditFindingV2({
        type: 'broken_relation',
        target: STRUCTURAL_AUDIT_V2_TARGET.TEAM_SEASONS,
        documentId: id,
        relatedDocumentId: leagueId,
        teamId,
        leagueId,
        seasonKey,
        title: 'Team Season מצביע לעונת ליגה שאינה קיימת',
        reason: 'leagueId ו-seasonKey חייבים להפנות לעונת League קנונית.',
      }))
    } else if (!findLeagueSeasonTeamRow({ leagueSeason: leagueSource.season, teamId })) {
      findings.push(buildStructuralAuditFindingV2({
        type: 'broken_relation',
        target: STRUCTURAL_AUDIT_V2_TARGET.TEAM_SEASONS,
        documentId: id,
        relatedDocumentId: leagueSource.leagueRow.id,
        teamId,
        leagueId,
        seasonKey,
        title: 'Team Season אינו מחובר לשורת קבוצה בטבלת הליגה',
        reason: 'Team Season קיים חייב להיות מחובר לקבוצה בעונת הליגה הקנונית.',
      }))
    }

    findings.push(...validateTeamSeasonMovementV2({
      documentId: id,
      teamSeason: season,
    }))
  })

  teamRoots.forEach(({ id, data: root }) => {
    ;(Array.isArray(root?.seasons) ? root.seasons : []).forEach(entry => {
      const seasonDocumentId = clean(entry?.seasonDocumentId)
      const seasonKey = seasonKeyOf(entry)
      const seasonRow = seasonDocumentId ? teamSeasonsById.get(seasonDocumentId) : null

      if (!seasonDocumentId || !seasonRow) {
        findings.push(buildStructuralAuditFindingV2({
          type: 'broken_relation',
          target: STRUCTURAL_AUDIT_V2_TARGET.TEAM_ROOTS,
          documentId: id,
          relatedDocumentId: seasonDocumentId,
          teamId: id,
          seasonKey,
          title: 'Team Root מפנה ל-Team Season שאינו קיים',
          reason: 'כל seasonDocumentId ב-Team Root חייב להפנות למסמך Team Season קיים.',
        }))
        return
      }

      const actualTeamId = teamIdOf(seasonRow.data)
      const sameTeam = actualTeamId === clean(id)
      const sameSeason = isSameSeason(entry, seasonRow.data)

      if (!sameTeam || !sameSeason) {
        findings.push(buildStructuralAuditFindingV2({
          type: 'broken_relation',
          target: STRUCTURAL_AUDIT_V2_TARGET.TEAM_ROOTS,
          documentId: id,
          relatedDocumentId: seasonDocumentId,
          teamId: id,
          seasonKey,
          title: 'Team Root מפנה ל-Team Season בעל זהות אחרת',
          reason: 'מסמך העונה חייב להשתייך לאותו Team Root ולאותה עונה.',
          expected: { teamId: clean(id), seasonKey },
          actual: {
            teamId: actualTeamId,
            seasonKey: seasonKeyOf(seasonRow.data),
          },
        }))
      }
    })
  })
}

const appendClubRelationFindings = ({
  clubs,
  teamRoots,
  leaguesById,
  findings,
}) => {
  const clubsById = new Map(clubs.map(row => [clubIdOf(row), row]))
  const rootsById = new Map(teamRoots.map(row => [clean(row.id), row]))

  teamRoots.forEach(({ id, data }) => {
    const clubId = clean(data?.clubId)
    if (!clubId || clubsById.has(clubId)) return

    findings.push(buildStructuralAuditFindingV2({
      type: 'broken_relation',
      target: STRUCTURAL_AUDIT_V2_TARGET.CLUBS,
      documentId: id,
      relatedDocumentId: clubId,
      teamId: id,
      clubId,
      title: 'Team Root מצביע ל-Club שאינו קיים',
      reason: 'clubId ב-Team Root צריך להפנות ל-Club projection קיים.',
    }))
  })

  clubs.forEach(({ id, data: club }) => {
    const clubId = clubIdOf({ id, data: club })

    ;(Array.isArray(club?.ageGroups) ? club.ageGroups : []).forEach(ageGroup => {
      ;(Array.isArray(ageGroup?.seasons) ? ageGroup.seasons : []).forEach(season => {
        const teamId = teamIdOf(season)
        const seasonKey = seasonKeyOf(season)
        const leagueId = clean(season?.league?.leagueId)
        const root = rootsById.get(teamId)
        const leagueSource = findLeagueSeason({ leaguesById, leagueId, seasonKey })
        const leagueTeamRow = leagueSource
          ? findLeagueSeasonTeamRow({ leagueSeason: leagueSource.season, teamId })
          : null

        if (root && clean(root.data?.clubId) !== clubId) {
          findings.push(buildStructuralAuditFindingV2({
            type: 'broken_relation',
            target: STRUCTURAL_AUDIT_V2_TARGET.CLUBS,
            documentId: id,
            relatedDocumentId: teamId,
            teamId,
            leagueId,
            clubId,
            seasonKey,
            title: 'Club מכיל קבוצה ששייכת למועדון אחר',
            reason: 'clubId ב-Team Root חייב להתאים ל-Club שמכיל את עונת הקבוצה.',
            expected: { clubId: clean(root.data?.clubId) },
            actual: { clubId },
          }))
        }

        if (!leagueSource) {
          findings.push(buildStructuralAuditFindingV2({
            type: 'broken_relation',
            target: STRUCTURAL_AUDIT_V2_TARGET.CLUBS,
            documentId: id,
            relatedDocumentId: leagueId,
            teamId,
            leagueId,
            clubId,
            seasonKey,
            title: 'Club מצביע לעונת ליגה שאינה קיימת',
            reason: 'leagueId ו-seasonKey ב-Club חייבים להפנות לעונת League קיימת.',
          }))
          return
        }

        if (!leagueTeamRow) {
          findings.push(buildStructuralAuditFindingV2({
            type: 'broken_relation',
            target: STRUCTURAL_AUDIT_V2_TARGET.CLUBS,
            documentId: id,
            relatedDocumentId: leagueId,
            teamId,
            leagueId,
            clubId,
            seasonKey,
            title: 'Club אינו מחובר לשורת הקבוצה בעונת הליגה',
            reason: 'קבוצת Club חייבת להופיע בטבלת עונת הליגה שאליה היא מצביעה.',
          }))
          return
        }

        const leagueClubId = clean(leagueTeamRow?.clubId)
        if (!leagueClubId || leagueClubId !== clubId) {
          findings.push(buildStructuralAuditFindingV2({
            type: 'broken_relation',
            target: STRUCTURAL_AUDIT_V2_TARGET.CLUBS,
            documentId: id,
            relatedDocumentId: leagueId,
            teamId,
            leagueId,
            clubId,
            seasonKey,
            title: 'Club אינו תואם למועדון שבשורת הליגה',
            reason: 'clubId בשורת הליגה חייב להיות קיים ולהתאים ל-Club שמכיל את הקבוצה.',
            expected: { clubId },
            actual: { clubId: leagueClubId },
          }))
        }
      })
    })
  })
}

const appendDuplicateLeagueTeamFindings = ({ leagues, findings }) => {
  const locationsByTeamSeason = new Map()

  leagues.forEach(row => {
    const leagueId = leagueIdOf(row)
    leagueSeasons(row.data).forEach(({ season }) => {
      const seasonKey = seasonKeyOf(season)
      ;(Array.isArray(season?.tableRank) ? season.tableRank : []).forEach(team => {
        const teamId = teamIdOf(team)
        if (!teamId || !seasonKey) return
        const key = `${teamId}::${seasonKey}`
        if (!locationsByTeamSeason.has(key)) locationsByTeamSeason.set(key, [])
        locationsByTeamSeason.get(key).push({ leagueId, teamId, seasonKey })
      })
    })
  })

  locationsByTeamSeason.forEach((locations, relationKey) => {
    const leagueIds = [...new Set(locations.map(row => row.leagueId).filter(Boolean))]
    if (leagueIds.length < 2) return

    findings.push(buildStructuralAuditFindingV2({
      type: 'duplicate_relation',
      target: STRUCTURAL_AUDIT_V2_TARGET.LEAGUES,
      documentId: leagueIds[0],
      relatedDocumentId: leagueIds.slice(1).join(','),
      teamId: locations[0].teamId,
      seasonKey: locations[0].seasonKey,
      relationKey,
      title: 'אותה קבוצה מופיעה ביותר מליגה אחת באותה עונה',
      reason: 'teamId + seasonKey צריכים להשתייך לעונת ליגה קנונית אחת.',
      expected: { leagueCount: 1 },
      actual: { leagueIds },
    }))
  })
}

export function evaluateStructuralIntegrityV2({
  leagues = [],
  teamRoots = [],
  teamSeasons = [],
  clubs = [],
} = {}) {
  const findings = []
  const leaguesById = new Map(leagues.map(row => [leagueIdOf(row), row]))

  appendLeagueLifecycleFindings({ leagues, findings })
  appendTeamRelationFindings({
    teamRoots,
    teamSeasons,
    leaguesById,
    findings,
  })
  appendClubRelationFindings({
    clubs,
    teamRoots,
    leaguesById,
    findings,
  })
  appendDuplicateLeagueTeamFindings({ leagues, findings })

  return findings
}
