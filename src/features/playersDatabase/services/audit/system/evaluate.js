// src/features/playersDatabase/services/audit/system/evaluate.js

import {
  buildPlayerId,
  buildPlayerSearchIndexDocumentId,
  buildPlayerSeasonDocumentId,
  buildTeamId,
  buildTeamSeasonDocumentId,
  requireSeasonId,
} from '../../../domain/identity/index.js'
import { buildClubDirectoryProjection } from '../../../domain/projections/club/clubDirectory.projection.js'
import { buildClubsCenterTeamProjection } from '../../../domain/league/clubsCenterTeam.builder.js'
import { compareTeamSignalSummaries } from '../signals/compareTeamSignalSummaries.js'
import { buildExpectedTeamSignals, teamSignalAuditKey } from '../signals/buildExpectedTeamSignals.js'
import { arrivalSourceDocumentId, buildArrivalHistory } from '../../../domain/movement/arrivalHistory.projection.js'
import {
  buildClubProfileProjection,
  buildClubsCenterLeague,
  buildLeaguesCenterIdentity,
  buildLeaguesCenterSeason,
} from '../../../domain/league/leagueWritePlan.builder.js'
import {
  buildSystemAuditFinding,
  SYSTEM_AUDIT_TARGET,
} from './contract.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()
const object = value => (value && typeof value === 'object' && !Array.isArray(value) ? value : {})
const rows = value => (Array.isArray(value) ? value : [])
const mapRows = value => new Map(rows(value).map(row => [clean(row && row.id), row]))
const equal = (left, right) => {
  if (Object.is(left, right)) return true
  if (left === null || right === null) return false
  if (typeof left !== 'object' || typeof right !== 'object') return false

  const leftIsArray = Array.isArray(left)
  const rightIsArray = Array.isArray(right)
  if (leftIsArray !== rightIsArray) return false

  if (leftIsArray) {
    return left.length === right.length && left.every((value, index) => (
      equal(value, right[index])
    ))
  }

  if (left instanceof Date || right instanceof Date) {
    return left instanceof Date &&
      right instanceof Date &&
      left.getTime() === right.getTime()
  }

  const leftKeys = Object.keys(left)
  const rightKeys = Object.keys(right)
  if (leftKeys.length !== rightKeys.length) return false

  return leftKeys.every(key => (
    Object.prototype.hasOwnProperty.call(right, key) && equal(left[key], right[key])
  ))
}

const projectionFinding = ({
  target,
  documentId,
  relatedDocumentId = '',
  title,
  expected,
  actual,
  owner,
}) => relationFinding({
  type: 'projection_mismatch',
  target,
  documentId,
  relatedDocumentId,
  title,
  reason: 'התוצר אינו תואם למקורות הקנוניים שמהם הוא נבנה.',
  expected,
  actual,
  owner,
})

const identityFinding = ({ target, documentId, title, expected, actual, owner }) => (
  buildSystemAuditFinding({
    type: 'invalid_identity',
    target,
    documentId,
    title,
    reason: 'מזהה המסמך או שדות הזהות אינם תואמים לחוזה הקנוני.',
    expected,
    actual,
    owner,
    recommendedAction: 'להריץ מחדש את פעולת הבעלים לאחר בדיקת המקור.',
  })
)

const relationFinding = ({
  target,
  documentId,
  relatedDocumentId,
  title,
  reason,
  owner,
  playerId = '',
  teamId = '',
  leagueId = '',
  clubId = '',
  seasonId = '',
  expected = null,
  actual = null,
  type = 'broken_relation',
}) => buildSystemAuditFinding({
  type,
  target,
  documentId,
  relatedDocumentId,
  playerId,
  teamId,
  leagueId,
  clubId,
  seasonId,
  title,
  reason,
  expected,
  actual,
  owner,
  recommendedAction: 'להריץ את פעולת הבעלים הקנונית; הבדיקה עצמה אינה מתקנת.',
})

const safeBuild = callback => {
  try {
    return callback()
  } catch (error) {
    return ''
  }
}

export const getTeamSeasonPlayerIds = teamSeason => {
  const playerIds = new Set()
  ;['roster', 'stats', 'scouting', 'manual'].forEach(section => {
    Object.keys(object(teamSeason && teamSeason[section] && teamSeason[section].playersById))
      .map(clean)
      .filter(Boolean)
      .forEach(playerId => playerIds.add(playerId))
  })
  return playerIds
}

const statsOwnedPlayerIds = teamSeason => new Set([
  ...Object.keys(object(teamSeason && teamSeason.stats && teamSeason.stats.playersById)),
  ...Object.keys(object(teamSeason && teamSeason.scouting && teamSeason.scouting.playersById)),
].map(clean).filter(Boolean))

const appendMovementFindings = ({
  documentId,
  teamSeason,
  teamSeasonsById,
  teamId,
  seasonId,
  findings,
}) => {
  const roster = object(teamSeason && teamSeason.roster)
  const rosterPlayersById = object(roster.playersById)
  const pendingById = object(roster.pendingById)
  const movement = object(teamSeason && teamSeason.movement)

  Object.entries(pendingById).forEach(([pendingKey, pending]) => {
    const playerId = clean(pending && pending.playerId) || clean(pendingKey)
    if (!playerId || !rosterPlayersById[playerId]) return

    findings.push(relationFinding({
      type: 'invalid_canonical_state',
      target: SYSTEM_AUDIT_TARGET.TEAM_SEASONS,
      documentId,
      relatedDocumentId: clean(pendingKey),
      playerId,
      teamId,
      seasonId,
      title: 'Pending פתוח לשחקן שנמצא בסגל',
      reason: 'שחקן שנמצא ב־roster.playersById אינו יכול להישאר גם ב־roster.pendingById.',
      owner: 'roster',
    }))
  })

  ;['transfersInById', 'transfersOutById'].forEach(side => {
    Object.entries(object(movement[side])).forEach(([movementKey, fact]) => {
      const movementId = clean(fact && fact.movementId)
      if (movementId && movementId === clean(movementKey)) return

      findings.push(relationFinding({
        type: 'invalid_identity',
        target: SYSTEM_AUDIT_TARGET.TEAM_SEASONS,
        documentId,
        relatedDocumentId: movementId,
        playerId: clean(fact && fact.playerId),
        teamId,
        seasonId,
        title: 'מזהה Movement אינו תואם למפתח הקנוני',
        reason: `כל רשומה ב־movement.${side} חייבת לשמור movementId הזהה למפתח המפה.`,
        expected: clean(movementKey),
        actual: movementId,
        owner: 'roster',
      }))
    })
  })

  Object.entries(object(movement.arrivalHistoryById)).forEach(([movementId, history]) => {
    const fact = object(movement.transfersInById)[movementId]
    const sourceId = arrivalSourceDocumentId({ teamId: fact && fact.fromTeamId, seasonId })
    const source = teamSeasonsById.get(sourceId)
    if (!fact || !source) return
    const expected = buildArrivalHistory({
      movementId,
      playerId: fact.playerId,
      fromTeamId: fact.fromTeamId,
      seasonId,
      sourceTeamSeason: source.data,
      updatedAt: history.updatedAt,
    })
    if (equal(expected, history)) return
    findings.push(relationFinding({
      type: 'projection_mismatch',
      target: SYSTEM_AUDIT_TARGET.TEAM_SEASONS,
      documentId,
      relatedDocumentId: movementId,
      playerId: fact.playerId,
      teamId,
      seasonId,
      title: 'תקציר העבר של מצטרף אינו תואם למקור',
      reason: 'יש לבנות את פרופיל הסקאוט והחוליה מעונת קבוצת המקור.',
      expected,
      actual: history,
      owner: 'roster',
    }))
  })
}

const appendTeamRootFindings = ({
  teamRoots,
  teamSeasonsById,
  clubProfilesById,
  findings,
}) => {
  rows(teamRoots).forEach(({ id, data = {} }) => {
    const identity = object(data.identity)
    const teamId = clean(identity.teamId)
    const clubId = clean(identity.clubId)
    const expectedId = safeBuild(() => buildTeamId(identity))

    if (!expectedId || expectedId !== clean(id) || teamId !== clean(id)) {
      findings.push(identityFinding({
        target: SYSTEM_AUDIT_TARGET.TEAM_ROOTS,
        documentId: id,
        title: 'זהות Team Root אינה קנונית',
        expected: { documentId: expectedId, teamId: expectedId },
        actual: { documentId: id, teamId },
        owner: 'roster',
      }))
    }

    if (!clubId || !clubProfilesById.has(clubId)) {
      findings.push(relationFinding({
        target: SYSTEM_AUDIT_TARGET.TEAM_ROOTS,
        documentId: id,
        relatedDocumentId: clubId,
        teamId: id,
        clubId,
        title: 'Team Root מפנה ל־ClubProfile חסר',
        reason: 'כל Team Root חייב להפנות ל־ClubProfile קנוני קיים.',
        owner: 'clubProfiles',
      }))
    }

    Object.entries(object(data.seasonRefsById)).forEach(([seasonId, reference]) => {
      const expectedDocumentId = safeBuild(() => buildTeamSeasonDocumentId({
        teamId: id,
        seasonId: requireSeasonId(seasonId),
      }))
      const actualDocumentId = clean(reference && reference.teamSeasonDocumentId)
      const teamSeason = teamSeasonsById.get(actualDocumentId)

      if (!expectedDocumentId || actualDocumentId !== expectedDocumentId || !teamSeason) {
        findings.push(relationFinding({
          target: SYSTEM_AUDIT_TARGET.TEAM_ROOTS,
          documentId: id,
          relatedDocumentId: actualDocumentId,
          teamId: id,
          seasonId,
          title: 'הפניית Team Root לעונת קבוצה חסרה או שגויה',
          reason: 'כל seasonRefsById חייב להפנות למסמך Team Season הקנוני של אותה קבוצה ועונה.',
          expected: expectedDocumentId,
          actual: actualDocumentId,
          owner: 'roster',
        }))
      }
    })
  })
}

const appendTeamSeasonFindings = ({
  teamSeasons,
  teamSeasonsById,
  teamRootsById,
  playerRootsById,
  playerSeasonsById,
  playerSearchIndexesById,
  leaguesById,
  clubProfilesById,
  findings,
}) => {
  rows(teamSeasons).forEach(({ id, data = {} }) => {
    const identity = object(data.identity)
    const teamId = clean(identity.teamId)
    const seasonId = clean(identity.seasonId)
    const leagueId = clean(identity.leagueId)
    const clubId = clean(identity.clubId)
    const expectedId = safeBuild(() => buildTeamSeasonDocumentId({ teamId, seasonId }))
    const root = teamRootsById.get(teamId)

    if (!expectedId || expectedId !== clean(id) || clean(identity.teamSeasonDocumentId) !== clean(id)) {
      findings.push(identityFinding({
        target: SYSTEM_AUDIT_TARGET.TEAM_SEASONS,
        documentId: id,
        title: 'זהות Team Season אינה קנונית',
        expected: { documentId: expectedId, teamSeasonDocumentId: expectedId },
        actual: { documentId: id, teamSeasonDocumentId: identity.teamSeasonDocumentId },
        owner: 'roster',
      }))
    }

    if (!root) {
      findings.push(relationFinding({
        target: SYSTEM_AUDIT_TARGET.TEAM_SEASONS,
        documentId: id,
        relatedDocumentId: teamId,
        teamId,
        seasonId,
        title: 'Team Season ללא Team Root',
        reason: 'לכל Team Season חייב להיות Team Root קנוני.',
        owner: 'roster',
      }))
    } else {
      const rootReference = object(root.data && root.data.seasonRefsById)[seasonId]
      if (clean(rootReference && rootReference.teamSeasonDocumentId) !== clean(id)) {
        findings.push(relationFinding({
          target: SYSTEM_AUDIT_TARGET.TEAM_SEASONS,
          documentId: id,
          relatedDocumentId: teamId,
          teamId,
          seasonId,
          title: 'Team Root אינו מפנה חזרה ל־Team Season',
          reason: 'הקשר בין מסמך הקבוצה למסמך העונה חייב להיות דו־כיווני ועקבי.',
          owner: 'roster',
        }))
      }
    }

    const league = leaguesById.get(leagueId)
    if (!league || !object(league.data && league.data.seasonsById)[seasonId]) {
      findings.push(relationFinding({
        target: SYSTEM_AUDIT_TARGET.TEAM_SEASONS,
        documentId: id,
        relatedDocumentId: leagueId,
        teamId,
        leagueId,
        seasonId,
        title: 'Team Season מפנה לעונת ליגה חסרה',
        reason: 'leagueId ו־seasonId חייבים להפנות לעונה קיימת במסמך League הקנוני.',
        owner: 'league',
      }))
    }

    if (!clubId || !clubProfilesById.has(clubId)) {
      findings.push(relationFinding({
        target: SYSTEM_AUDIT_TARGET.TEAM_SEASONS,
        documentId: id,
        relatedDocumentId: clubId,
        teamId,
        clubId,
        seasonId,
        title: 'Team Season מפנה ל־ClubProfile חסר',
        reason: 'clubId של עונת הקבוצה חייב להפנות למועדון קנוני קיים.',
        owner: 'clubProfiles',
      }))
    }

    appendMovementFindings({
      documentId: id,
      teamSeason: data,
      teamSeasonsById,
      teamId,
      seasonId,
      findings,
    })

    const playerIds = getTeamSeasonPlayerIds(data)
    const statsPlayerIds = statsOwnedPlayerIds(data)
    playerIds.forEach(playerId => {
      const playerSeasonDocumentId = safeBuild(() => buildPlayerSeasonDocumentId({ playerId, seasonId }))
      const searchIndexDocumentId = safeBuild(() => buildPlayerSearchIndexDocumentId({
        playerId,
        teamSeasonDocumentId: id,
      }))

      if (!playerSeasonDocumentId || !playerSeasonsById.has(playerSeasonDocumentId)) {
        findings.push(relationFinding({
          type: 'missing_projection',
          target: SYSTEM_AUDIT_TARGET.PLAYER_SEASONS,
          documentId: playerSeasonDocumentId,
          relatedDocumentId: id,
          playerId,
          teamId,
          seasonId,
          title: 'חסר Player Season לשחקן בעונת הקבוצה',
          reason: 'שחקן בעל הקשר עונתי ב־Team Season חייב להופיע בתוצר Player Season.',
          owner: statsPlayerIds.has(playerId) ? 'stats' : 'roster',
        }))
      }

      if (!searchIndexDocumentId || !playerSearchIndexesById.has(searchIndexDocumentId)) {
        findings.push(relationFinding({
          type: 'missing_projection',
          target: SYSTEM_AUDIT_TARGET.PLAYER_SEARCH_INDEXES,
          documentId: searchIndexDocumentId,
          relatedDocumentId: id,
          playerId,
          teamId,
          seasonId,
          title: 'חסר Player SearchIndex לשחקן בעונת הקבוצה',
          reason: 'שחקן בעל הקשר עונתי ב־Team Season חייב להופיע בתוצר החיפוש הדטרמיניסטי.',
          owner: statsPlayerIds.has(playerId) ? 'stats' : 'roster',
        }))
      }

      if (statsPlayerIds.has(playerId) && !playerRootsById.has(playerId)) {
        findings.push(relationFinding({
          type: 'missing_canonical',
          target: SYSTEM_AUDIT_TARGET.PLAYER_ROOTS,
          documentId: playerId,
          relatedDocumentId: id,
          playerId,
          teamId,
          seasonId,
          title: 'חסר Player Root לשחקן בעל נתונים סטטיסטיים',
          reason: 'Stats יוצר Player Root; הופעת סגל בלבד אינה יוצרת אותו.',
          owner: 'stats',
        }))
      }
    })
  })
}

const appendPlayerRootFindings = ({ playerRoots, playerSeasonsById, findings }) => {
  rows(playerRoots).forEach(({ id, data = {} }) => {
    const identity = object(data.identity)
    const expectedId = safeBuild(() => buildPlayerId(identity))

    if (!expectedId || expectedId !== clean(id) || clean(identity.playerId) !== clean(id)) {
      findings.push(identityFinding({
        target: SYSTEM_AUDIT_TARGET.PLAYER_ROOTS,
        documentId: id,
        title: 'זהות Player Root אינה קנונית',
        expected: { documentId: expectedId, playerId: expectedId },
        actual: { documentId: id, playerId: identity.playerId },
        owner: 'stats',
      }))
    }

    Object.entries(object(data.seasonRefsById)).forEach(([seasonId, reference]) => {
      const expectedDocumentId = safeBuild(() => buildPlayerSeasonDocumentId({
        playerId: id,
        seasonId: requireSeasonId(seasonId),
      }))
      const actualDocumentId = clean(reference && reference.playerSeasonDocumentId)
      if (!expectedDocumentId || actualDocumentId !== expectedDocumentId || !playerSeasonsById.has(actualDocumentId)) {
        findings.push(relationFinding({
          target: SYSTEM_AUDIT_TARGET.PLAYER_ROOTS,
          documentId: id,
          relatedDocumentId: actualDocumentId,
          playerId: id,
          seasonId,
          title: 'הפניית Player Root לעונת שחקן חסרה או שגויה',
          reason: 'כל seasonRefsById חייב להפנות למסמך Player Season הקנוני.',
          expected: expectedDocumentId,
          actual: actualDocumentId,
          owner: 'stats',
        }))
      }
    })
  })
}

const appendPlayerSeasonFindings = ({ playerSeasons, teamSeasonsById, findings }) => {
  rows(playerSeasons).forEach(({ id, data = {} }) => {
    const identity = object(data.identity)
    const playerId = clean(identity.playerId)
    const seasonId = clean(identity.seasonId)
    const expectedId = safeBuild(() => buildPlayerSeasonDocumentId({ playerId, seasonId }))

    if (!expectedId || expectedId !== clean(id) || clean(identity.playerSeasonDocumentId) !== clean(id)) {
      findings.push(identityFinding({
        target: SYSTEM_AUDIT_TARGET.PLAYER_SEASONS,
        documentId: id,
        title: 'זהות Player Season אינה קנונית',
        expected: { documentId: expectedId, playerSeasonDocumentId: expectedId },
        actual: { documentId: id, playerSeasonDocumentId: identity.playerSeasonDocumentId },
        owner: 'roster/stats',
      }))
    }

    Object.entries(object(data.teamsById)).forEach(([teamId, team]) => {
      const expectedTeamSeasonId = safeBuild(() => buildTeamSeasonDocumentId({ teamId, seasonId }))
      const actualTeamSeasonId = clean(team && team.teamSeasonDocumentId)
      const canonicalTeamSeason = expectedTeamSeasonId
        ? teamSeasonsById.get(expectedTeamSeasonId)
        : null
      const playerExistsInTeamSeason = Boolean(
        canonicalTeamSeason
        && getTeamSeasonPlayerIds(canonicalTeamSeason.data).has(playerId)
      )
      if (!canonicalTeamSeason || !playerExistsInTeamSeason) {
        findings.push(relationFinding({
          type: 'orphan_projection',
          target: SYSTEM_AUDIT_TARGET.PLAYER_SEASONS,
          documentId: id,
          relatedDocumentId: actualTeamSeasonId,
          playerId,
          teamId,
          seasonId,
          title: canonicalTeamSeason
            ? 'קשר קבוצה יתום ב־Player Season'
            : 'Player Season מפנה ל־Team Season חסר',
          reason: canonicalTeamSeason
            ? 'השחקן אינו קיים בנתוני ה־Team Season ולכן הקשר אינו בבעלות מקור קנוני.'
            : 'כל teamsById חייב להפנות לעונת קבוצה קנונית קיימת.',
          expected: expectedTeamSeasonId,
          actual: actualTeamSeasonId,
          owner: 'roster/stats',
        }))
      } else if (actualTeamSeasonId !== expectedTeamSeasonId) {
        findings.push(relationFinding({
          target: SYSTEM_AUDIT_TARGET.PLAYER_SEASONS,
          documentId: id,
          relatedDocumentId: actualTeamSeasonId,
          playerId,
          teamId,
          seasonId,
          title: 'Player Season מפנה ל־Team Season שגוי',
          reason: 'הקבוצה קיימת בעונה, אך ההפניה אינה מצביעה למסמך הקנוני שלה.',
          expected: expectedTeamSeasonId,
          actual: actualTeamSeasonId,
          owner: 'roster/stats',
        }))
      }
    })
  })
}

const appendSearchIndexFindings = ({
  playerSearchIndexes,
  playerSeasonsById,
  teamSeasonsById,
  findings,
}) => {
  rows(playerSearchIndexes).forEach(({ id, data = {} }) => {
    const playerId = clean(data.playerId)
    const seasonId = clean(data.seasonId)
    const references = object(data.references)
    const teamSeasonDocumentId = clean(references.teamSeasonDocumentId)
    const playerSeasonDocumentId = clean(references.playerSeasonDocumentId)
    const expectedId = safeBuild(() => buildPlayerSearchIndexDocumentId({
      playerId,
      teamSeasonDocumentId,
    }))
    const expectedPlayerSeasonId = safeBuild(() => buildPlayerSeasonDocumentId({ playerId, seasonId }))
    const teamSeason = teamSeasonsById.get(teamSeasonDocumentId)

    if (!expectedId || expectedId !== clean(id)) {
      findings.push(identityFinding({
        target: SYSTEM_AUDIT_TARGET.PLAYER_SEARCH_INDEXES,
        documentId: id,
        title: 'זהות Player SearchIndex אינה קנונית',
        expected: expectedId,
        actual: id,
        owner: 'roster/stats',
      }))
    }

    if (!teamSeason) {
      findings.push(relationFinding({
        type: 'orphan_projection',
        target: SYSTEM_AUDIT_TARGET.PLAYER_SEARCH_INDEXES,
        documentId: id,
        relatedDocumentId: teamSeasonDocumentId,
        playerId,
        seasonId,
        title: 'Player SearchIndex מפנה ל־Team Season חסר',
        reason: 'תוצר החיפוש חייב להפנות למסמך Team Season קיים.',
        owner: 'roster/stats',
      }))
    }

    if (
      !expectedPlayerSeasonId ||
      playerSeasonDocumentId !== expectedPlayerSeasonId ||
      !playerSeasonsById.has(playerSeasonDocumentId)
    ) {
      findings.push(relationFinding({
        type: 'orphan_projection',
        target: SYSTEM_AUDIT_TARGET.PLAYER_SEARCH_INDEXES,
        documentId: id,
        relatedDocumentId: playerSeasonDocumentId,
        playerId,
        seasonId,
        title: 'Player SearchIndex מפנה ל־Player Season חסר או שגוי',
        reason: 'הפניית Player Season חייבת להיות דטרמיניסטית ולהצביע למסמך קיים.',
        expected: expectedPlayerSeasonId,
        actual: playerSeasonDocumentId,
        owner: 'roster/stats',
      }))
    }

    const teamIdentity = object(teamSeason && teamSeason.data && teamSeason.data.identity)
    if (teamSeason && clean(teamIdentity.seasonId) !== seasonId) {
      findings.push(relationFinding({
        target: SYSTEM_AUDIT_TARGET.PLAYER_SEARCH_INDEXES,
        documentId: id,
        relatedDocumentId: teamSeasonDocumentId,
        playerId,
        seasonId,
        title: 'עונת Player SearchIndex אינה תואמת ל־Team Season',
        reason: 'seasonId בתוצר החיפוש חייב להתאים לעונת הקבוצה שאליה הוא מפנה.',
        expected: clean(teamIdentity.seasonId),
        actual: seasonId,
        owner: 'roster/stats',
      }))
    }
  })
}

const appendCanonicalIdentityFindings = ({ leagues, clubProfiles, findings }) => {
  rows(leagues).forEach(({ id, data = {} }) => {
    if (clean(data.leagueId) === clean(id)) return
    findings.push(identityFinding({
      target: SYSTEM_AUDIT_TARGET.LEAGUES,
      documentId: id,
      title: 'זהות League אינה תואמת למזהה המסמך',
      expected: clean(id),
      actual: clean(data.leagueId),
      owner: 'league',
    }))
  })

  rows(clubProfiles).forEach(({ id, data = {} }) => {
    if (clean(data.clubId) === clean(id)) return
    findings.push(identityFinding({
      target: SYSTEM_AUDIT_TARGET.CLUB_PROFILES,
      documentId: id,
      title: 'זהות ClubProfile אינה תואמת למזהה המסמך',
      expected: clean(id),
      actual: clean(data.clubId),
      owner: 'clubProfiles',
    }))
  })
}

const leagueCenterSeasonFields = value => {
  const source = object(value)
  return {
    seasonKey: clean(source.seasonKey),
    seasonStatus: clean(source.seasonStatus),
    birthYear: source.birthYear === undefined ? null : source.birthYear,
    seasonUrl: clean(source.seasonUrl),
    hasCompetitionRules: Boolean(source.hasCompetitionRules),
    tableState: clean(source.tableState),
    tableImportedAt: source.tableImportedAt || null,
  }
}

const centerTeamStateFields = value => {
  const source = object(value)
  return {
    clubId: clean(source.clubId),
    teamSlot: source.teamSlot === undefined ? null : source.teamSlot,
    documentationState: clean(source.documentationState),
  }
}

const teamSeasonsFor = ({ teamSeasons, leagueId, seasonId }) => {
  const result = new Map()
  rows(teamSeasons).forEach(({ data = {} }) => {
    const identity = object(data.identity)
    if (clean(identity.leagueId) !== leagueId || clean(identity.seasonId) !== seasonId) return
    const teamId = clean(identity.teamId)
    if (teamId) result.set(teamId, data)
  })
  return result
}

const appendLeaguesCenterFindings = ({
  leagues,
  teamSeasons,
  leaguesCenter,
  findings,
}) => {
  const centerRowsById = mapRows(leaguesCenter)
  const centerRow = centerRowsById.get('all')

  rows(leaguesCenter).forEach(({ id }) => {
    if (clean(id) === 'all') return
    findings.push(relationFinding({
      type: 'unexpected_projection',
      target: SYSTEM_AUDIT_TARGET.LEAGUES_CENTER,
      documentId: id,
      title: 'מסמך לא צפוי במרכז הליגות',
      reason: 'מרכז הליגות נשמר במסמך יחיד שמזההו all.',
      owner: 'league',
    }))
  })

  if (!centerRow) {
    findings.push(relationFinding({
      type: 'missing_projection',
      target: SYSTEM_AUDIT_TARGET.LEAGUES_CENTER,
      documentId: 'all',
      title: 'חסר מסמך מרכז הליגות',
      reason: 'המסמך all חייב להיבנות ממסמכי הליגה ועונות הקבוצה.',
      owner: 'league',
    }))
    return
  }

  const projectedLeagues = object(centerRow.data && centerRow.data.leaguesById)
  const canonicalLeagueIds = new Set(rows(leagues).map(row => clean(row.id)).filter(Boolean))

  rows(leagues).forEach(({ id, data = {} }) => {
    const leagueId = clean(id)
    const projectedLeague = object(projectedLeagues[leagueId])
    if (!projectedLeagues[leagueId]) {
      findings.push(relationFinding({
        type: 'missing_projection',
        target: SYSTEM_AUDIT_TARGET.LEAGUES_CENTER,
        documentId: 'all',
        relatedDocumentId: leagueId,
        leagueId,
        title: 'ליגה חסרה במרכז הליגות',
        reason: 'כל מסמך League קנוני חייב להופיע במרכז הליגות.',
        owner: 'league',
      }))
      return
    }

    const expectedIdentity = buildLeaguesCenterIdentity(data)
    const actualIdentity = object(projectedLeague.identity)
    if (!equal(expectedIdentity, actualIdentity)) {
      findings.push(projectionFinding({
        target: SYSTEM_AUDIT_TARGET.LEAGUES_CENTER,
        documentId: 'all',
        relatedDocumentId: leagueId,
        title: 'זהות הליגה במרכז אינה מסונכרנת',
        expected: expectedIdentity,
        actual: actualIdentity,
        owner: 'league',
      }))
    }

    const projectedSeasons = object(projectedLeague.seasonsById)
    const canonicalSeasons = object(data.seasonsById)
    Object.entries(canonicalSeasons).forEach(([seasonId, season]) => {
      const projectedSeason = projectedSeasons[seasonId]
      if (!projectedSeason) {
        findings.push(relationFinding({
          type: 'missing_projection',
          target: SYSTEM_AUDIT_TARGET.LEAGUES_CENTER,
          documentId: 'all',
          relatedDocumentId: `${leagueId}:${seasonId}`,
          leagueId,
          seasonId,
          title: 'עונת ליגה חסרה במרכז הליגות',
          reason: 'כל עונה קנונית של League חייבת להופיע במרכז הליגות.',
          owner: 'league',
        }))
        return
      }

      const seasonTeamSeasons = teamSeasonsFor({ teamSeasons, leagueId, seasonId })
      const expectedSeason = buildLeaguesCenterSeason({
        season,
        teamSeasonsByTeamId: seasonTeamSeasons,
        previousLeaguesCenterTeamsById: object(projectedSeason.teamsById),
        updatedAt: projectedSeason.updatedAt || null,
      })
      const expectedSeasonFields = leagueCenterSeasonFields(expectedSeason)
      const actualSeasonFields = leagueCenterSeasonFields(projectedSeason)
      if (!equal(expectedSeasonFields, actualSeasonFields)) {
        findings.push(projectionFinding({
          target: SYSTEM_AUDIT_TARGET.LEAGUES_CENTER,
          documentId: 'all',
          relatedDocumentId: `${leagueId}:${seasonId}`,
          title: 'עונת הליגה במרכז אינה מסונכרנת',
          expected: expectedSeasonFields,
          actual: actualSeasonFields,
          owner: 'league',
        }))
      }

      const projectedTeams = object(projectedSeason.teamsById)
      Object.entries(object(expectedSeason.teamsById)).forEach(([teamId, expectedTeam]) => {
        const actualTeam = projectedTeams[teamId]
        if (!actualTeam) {
          findings.push(relationFinding({
            type: 'missing_projection',
            target: SYSTEM_AUDIT_TARGET.LEAGUES_CENTER,
            documentId: 'all',
            relatedDocumentId: teamId,
            teamId,
            leagueId,
            seasonId,
            title: 'קבוצה חסרה במרכז הליגות',
            reason: 'כל קבוצה בטבלת הליגה חייבת להופיע בעונת המרכז.',
            owner: 'league',
          }))
          return
        }
        const expectedTeamFields = centerTeamStateFields(expectedTeam)
        const actualTeamFields = centerTeamStateFields(actualTeam)
        if (!equal(expectedTeamFields, actualTeamFields)) {
          findings.push(projectionFinding({
            target: SYSTEM_AUDIT_TARGET.LEAGUES_CENTER,
            documentId: 'all',
            relatedDocumentId: teamId,
            title: 'מצב הקבוצה במרכז הליגות אינו מסונכרן',
            expected: expectedTeamFields,
            actual: actualTeamFields,
            owner: 'league/roster/stats',
          }))
        }
      })

      Object.keys(projectedTeams).forEach(teamId => {
        if (object(expectedSeason.teamsById)[teamId]) return
        findings.push(relationFinding({
          type: 'orphan_projection',
          target: SYSTEM_AUDIT_TARGET.LEAGUES_CENTER,
          documentId: 'all',
          relatedDocumentId: teamId,
          teamId,
          leagueId,
          seasonId,
          title: 'קבוצה מיותרת במרכז הליגות',
          reason: 'הקבוצה אינה קיימת עוד בטבלת הליגה הקנונית.',
          owner: 'league',
        }))
      })
    })

    Object.keys(projectedSeasons).forEach(seasonId => {
      if (canonicalSeasons[seasonId]) return
      findings.push(relationFinding({
        type: 'orphan_projection',
        target: SYSTEM_AUDIT_TARGET.LEAGUES_CENTER,
        documentId: 'all',
        relatedDocumentId: `${leagueId}:${seasonId}`,
        leagueId,
        seasonId,
        title: 'עונה מיותרת במרכז הליגות',
        reason: 'העונה אינה קיימת עוד במסמך הליגה הקנוני.',
        owner: 'league',
      }))
    })
  })

  Object.keys(projectedLeagues).forEach(leagueId => {
    if (canonicalLeagueIds.has(leagueId)) return
    findings.push(relationFinding({
      type: 'orphan_projection',
      target: SYSTEM_AUDIT_TARGET.LEAGUES_CENTER,
      documentId: 'all',
      relatedDocumentId: leagueId,
      leagueId,
      title: 'ליגה מיותרת במרכז הליגות',
      reason: 'הליגה אינה קיימת עוד בקולקשיין הליגות הקנוני.',
      owner: 'league',
    }))
  })
}

const directoryEntryFields = value => {
  const source = object(value)
  return buildClubDirectoryProjection({
    profile: source,
    updatedAt: source.updatedAt || null,
  })
}

const appendClubsDirectoryFindings = ({ clubProfiles, clubsDirectory, findings }) => {
  const directoryRowsById = mapRows(clubsDirectory)
  const directoryRow = directoryRowsById.get('all')

  rows(clubsDirectory).forEach(({ id }) => {
    if (clean(id) === 'all') return
    findings.push(relationFinding({
      type: 'unexpected_projection',
      target: SYSTEM_AUDIT_TARGET.CLUBS_DIRECTORY,
      documentId: id,
      title: 'מסמך לא צפוי בספריית המועדונים',
      reason: 'ספריית המועדונים נשמרת במסמך יחיד שמזההו all.',
      owner: 'clubProfiles',
    }))
  })

  if (!directoryRow) {
    findings.push(relationFinding({
      type: 'missing_projection',
      target: SYSTEM_AUDIT_TARGET.CLUBS_DIRECTORY,
      documentId: 'all',
      title: 'חסרה ספריית המועדונים',
      reason: 'המסמך all חייב להיבנות מפרופילי המועדונים.',
      owner: 'clubProfiles',
    }))
    return
  }

  const projectedClubs = object(directoryRow.data && directoryRow.data.clubsById)
  const canonicalClubIds = new Set(rows(clubProfiles).map(row => clean(row.id)).filter(Boolean))
  rows(clubProfiles).forEach(({ id, data = {} }) => {
    const clubId = clean(id)
    const actualEntry = projectedClubs[clubId]
    if (!actualEntry) {
      findings.push(relationFinding({
        type: 'missing_projection',
        target: SYSTEM_AUDIT_TARGET.CLUBS_DIRECTORY,
        documentId: 'all',
        relatedDocumentId: clubId,
        clubId,
        title: 'מועדון חסר בספריית המועדונים',
        reason: 'כל ClubProfile קנוני חייב להופיע בספריית המועדונים.',
        owner: 'clubProfiles',
      }))
      return
    }

    const expectedEntry = buildClubDirectoryProjection({
      profile: data,
      updatedAt: actualEntry.updatedAt || null,
    })
    const actualFields = directoryEntryFields(actualEntry)
    if (!equal(expectedEntry, actualFields)) {
      findings.push(projectionFinding({
        target: SYSTEM_AUDIT_TARGET.CLUBS_DIRECTORY,
        documentId: 'all',
        relatedDocumentId: clubId,
        title: 'פרטי המועדון בספרייה אינם מסונכרנים',
        expected: expectedEntry,
        actual: actualFields,
        owner: 'clubProfiles',
      }))
    }
  })

  Object.keys(projectedClubs).forEach(clubId => {
    if (canonicalClubIds.has(clubId)) return
    findings.push(relationFinding({
      type: 'orphan_projection',
      target: SYSTEM_AUDIT_TARGET.CLUBS_DIRECTORY,
      documentId: 'all',
      relatedDocumentId: clubId,
      clubId,
      title: 'מועדון מיותר בספריית המועדונים',
      reason: 'המועדון אינו קיים עוד בקולקשיין ClubProfile.',
      owner: 'clubProfiles',
    }))
  })
}

const clubsCenterTeamFields = value => {
  const source = object(value)
  const transfers = object(source.transfers)
  return {
    teamSeasonDocumentId: clean(source.teamSeasonDocumentId),
    birthYear: source.birthYear === undefined ? null : source.birthYear,
    ageGroupId: clean(source.ageGroupId),
    teamSlot: source.teamSlot === undefined ? null : source.teamSlot,
    leagueId: clean(source.leagueId),
    documentationState: clean(source.documentationState),
    performance: object(source.performance),
    competitionProjection: object(source.competitionProjection),
    transfers: {
      coverageStatus: clean(transfers.coverageStatus),
      external: object(transfers.external),
      internal: object(transfers.internal),
      pending: object(transfers.pending),
    },
  }
}

const clubsCenterClubFields = value => {
  const source = object(value)
  return {
    displayName: clean(source.displayName),
    shortName: clean(source.shortName),
    clubLevel: source.clubLevel === undefined ? null : source.clubLevel,
    clubStrengthLevel: source.clubStrengthLevel === undefined
      ? null
      : source.clubStrengthLevel,
  }
}

const clubsCenterLeagueFields = value => {
  const source = object(value)
  return {
    displayName: clean(source.displayName),
    ageGroupLabel: clean(source.ageGroupLabel),
    leagueLevel: source.leagueLevel === undefined ? null : source.leagueLevel,
    seasonStatus: clean(source.seasonStatus),
    tableImportedAt: source.tableImportedAt || null,
  }
}

const canonicalSeasons = leagues => {
  const result = new Map()
  rows(leagues).forEach(({ id, data = {} }) => {
    const leagueId = clean(id)
    Object.entries(object(data.seasonsById)).forEach(([seasonId, season]) => {
      if (!result.has(seasonId)) result.set(seasonId, [])
      result.get(seasonId).push({ leagueId, league: data, season })
    })
  })
  return result
}

const duplicateSeasonTeamOwners = seasonEntries => {
  const ownersByTeamId = new Map()

  seasonEntries.forEach(({ leagueId, season }) => {
    Object.keys(object(season && season.table && season.table.teamsById)).forEach(teamId => {
      if (!ownersByTeamId.has(teamId)) ownersByTeamId.set(teamId, new Set())
      ownersByTeamId.get(teamId).add(leagueId)
    })
  })

  return new Map(
    [...ownersByTeamId.entries()]
      .filter(([, leagueIds]) => leagueIds.size > 1)
      .map(([teamId, leagueIds]) => [teamId, [...leagueIds].sort()])
  )
}

const appendClubsCenterFindings = ({
  leagues,
  clubProfiles,
  teamSeasons,
  clubsCenter,
  findings,
}) => {
  const centersById = mapRows(clubsCenter)
  const seasonsById = canonicalSeasons(leagues)
  const clubProfilesById = mapRows(clubProfiles)
  const teamSeasonsById = mapRows(teamSeasons)

  seasonsById.forEach((seasonEntries, seasonId) => {
    const duplicateOwners = duplicateSeasonTeamOwners(seasonEntries)
    duplicateOwners.forEach((leagueIds, teamId) => {
      findings.push(relationFinding({
        target: SYSTEM_AUDIT_TARGET.LEAGUES,
        documentId: seasonId,
        relatedDocumentId: teamId,
        teamId,
        seasonId,
        title: 'קבוצה משויכת ליותר מליגה קנונית אחת באותה עונה',
        reason: 'לכל Team ID מותר בעל ליגה קנוני אחד בלבד בכל עונה.',
        expected: 'one canonical league',
        actual: leagueIds,
        owner: 'league',
      }))
    })

    const centerRow = centersById.get(seasonId)
    if (!centerRow) {
      findings.push(relationFinding({
        type: 'missing_projection',
        target: SYSTEM_AUDIT_TARGET.CLUBS_CENTER,
        documentId: seasonId,
        seasonId,
        title: 'מרכז המועדונים חסר לעונה',
        reason: 'לכל עונה קנונית חייב להיות מסמך ClubsCenter.',
        owner: 'league/clubProfiles',
      }))
      return
    }

    const center = object(centerRow.data)
    const firstSeason = object(seasonEntries[0] && seasonEntries[0].season)
    const expectedSeasonIdentity = {
      seasonId,
      seasonKey: clean(firstSeason.seasonKey),
    }
    const actualSeasonIdentity = {
      seasonId: clean(center.seasonId),
      seasonKey: clean(center.seasonKey),
    }
    if (!equal(expectedSeasonIdentity, actualSeasonIdentity)) {
      findings.push(projectionFinding({
        target: SYSTEM_AUDIT_TARGET.CLUBS_CENTER,
        documentId: seasonId,
        title: 'זהות העונה במרכז המועדונים אינה מסונכרנת',
        expected: expectedSeasonIdentity,
        actual: actualSeasonIdentity,
        owner: 'league',
      }))
    }

    const projectedLeagues = object(center.leaguesById)
    const expectedLeagueIds = new Set()
    const expectedTeamLocations = new Set()

    seasonEntries.forEach(({ leagueId, league, season }) => {
      expectedLeagueIds.add(leagueId)
      const expectedLeague = clubsCenterLeagueFields(buildClubsCenterLeague({ league, season }))
      const actualLeague = clubsCenterLeagueFields(projectedLeagues[leagueId])
      if (!projectedLeagues[leagueId]) {
        findings.push(relationFinding({
          type: 'missing_projection',
          target: SYSTEM_AUDIT_TARGET.CLUBS_CENTER,
          documentId: seasonId,
          relatedDocumentId: leagueId,
          leagueId,
          seasonId,
          title: 'ליגה חסרה במרכז המועדונים',
          reason: 'כל ליגה בעונה חייבת להופיע במרכז המועדונים.',
          owner: 'league',
        }))
      } else if (!equal(expectedLeague, actualLeague)) {
        findings.push(projectionFinding({
          target: SYSTEM_AUDIT_TARGET.CLUBS_CENTER,
          documentId: seasonId,
          relatedDocumentId: leagueId,
          title: 'פרטי הליגה במרכז המועדונים אינם מסונכרנים',
          expected: expectedLeague,
          actual: actualLeague,
          owner: 'league',
        }))
      }

      Object.entries(object(season && season.table && season.table.teamsById))
        .forEach(([teamId, teamRow]) => {
          const clubId = clean(teamRow && teamRow.clubId)
          const locationKey = `${clubId}:${teamId}`
          expectedTeamLocations.add(locationKey)
          const projectedClub = object(object(center.clubsById)[clubId])
          const actualTeam = object(projectedClub.teamsById)[teamId]
          const clubProfileRow = clubProfilesById.get(clubId)

          if (duplicateOwners.has(teamId)) return

          if (!clubProfileRow) {
            findings.push(relationFinding({
              type: 'missing_canonical',
              target: SYSTEM_AUDIT_TARGET.CLUB_PROFILES,
              documentId: clubId,
              relatedDocumentId: teamId,
              clubId,
              teamId,
              leagueId,
              seasonId,
              title: 'חסר ClubProfile לקבוצה במרכז המועדונים',
              reason: 'פרטי המועדון במרכז נבנים מ־ClubProfile קנוני.',
              owner: 'clubProfiles',
            }))
          } else {
            const expectedClub = clubsCenterClubFields(
              buildClubProfileProjection(clubProfileRow.data)
            )
            const actualClub = clubsCenterClubFields(projectedClub)
            if (!equal(expectedClub, actualClub)) {
              findings.push(projectionFinding({
                target: SYSTEM_AUDIT_TARGET.CLUBS_CENTER,
                documentId: seasonId,
                relatedDocumentId: clubId,
                title: 'פרטי המועדון במרכז העונה אינם מסונכרנים',
                expected: expectedClub,
                actual: actualClub,
                owner: 'clubProfiles',
              }))
            }
          }

          if (!actualTeam) {
            findings.push(relationFinding({
              type: 'missing_projection',
              target: SYSTEM_AUDIT_TARGET.CLUBS_CENTER,
              documentId: seasonId,
              relatedDocumentId: teamId,
              clubId,
              teamId,
              leagueId,
              seasonId,
              title: 'קבוצה חסרה במרכז המועדונים',
              reason: 'כל קבוצה בטבלת הליגה חייבת להופיע תחת המועדון שלה.',
              owner: 'league',
            }))
            return
          }

          const teamSeasonDocumentId = safeBuild(() => buildTeamSeasonDocumentId({
            teamId,
            seasonId,
          }))
          const teamSeasonRow = teamSeasonsById.get(teamSeasonDocumentId)
          const expectedTeam = safeBuild(() => buildClubsCenterTeamProjection({
            league,
            season,
            seasonId,
            teamId,
            teamRow,
            teamSeason: teamSeasonRow ? teamSeasonRow.data : null,
            previousTeamProjection: actualTeam,
            updatedAt: actualTeam.updatedAt || null,
          }))
          const expectedTeamFields = expectedTeam ? clubsCenterTeamFields(expectedTeam) : null
          const actualTeamFields = clubsCenterTeamFields(actualTeam)
          if (!expectedTeamFields || !equal(expectedTeamFields, actualTeamFields)) {
            findings.push(projectionFinding({
              target: SYSTEM_AUDIT_TARGET.CLUBS_CENTER,
              documentId: seasonId,
              relatedDocumentId: teamId,
              title: 'מצב הקבוצה במרכז המועדונים אינו מסונכרן',
              expected: expectedTeamFields,
              actual: actualTeamFields,
              owner: 'league/roster/stats',
            }))
          }
        })
    })

    Object.keys(projectedLeagues).forEach(leagueId => {
      if (expectedLeagueIds.has(leagueId)) return
      findings.push(relationFinding({
        type: 'orphan_projection',
        target: SYSTEM_AUDIT_TARGET.CLUBS_CENTER,
        documentId: seasonId,
        relatedDocumentId: leagueId,
        leagueId,
        seasonId,
        title: 'ליגה מיותרת במרכז המועדונים',
        reason: 'הליגה אינה קיימת עוד בעונה קנונית.',
        owner: 'league',
      }))
    })

    Object.entries(object(center.clubsById)).forEach(([clubId, club]) => {
      Object.keys(object(club && club.teamsById)).forEach(teamId => {
        if (expectedTeamLocations.has(`${clubId}:${teamId}`)) return
        findings.push(relationFinding({
          type: 'orphan_projection',
          target: SYSTEM_AUDIT_TARGET.CLUBS_CENTER,
          documentId: seasonId,
          relatedDocumentId: teamId,
          clubId,
          teamId,
          seasonId,
          title: 'קבוצה מיותרת במרכז המועדונים',
          reason: 'הקבוצה אינה קיימת עוד בטבלת ליגה קנונית של העונה.',
          owner: 'league',
        }))
      })
    })
  })

  rows(clubsCenter).forEach(({ id }) => {
    if (seasonsById.has(clean(id))) return
    findings.push(relationFinding({
      type: 'orphan_projection',
      target: SYSTEM_AUDIT_TARGET.CLUBS_CENTER,
      documentId: id,
      seasonId: id,
      title: 'מסמך עונה מיותר במרכז המועדונים',
      reason: 'העונה אינה קיימת עוד באף מסמך League קנוני.',
      owner: 'league',
    }))
  })
}

const appendTeamSignalFindings = ({
  leagues,
  teamSeasons,
  clubProfiles,
  leaguesCenter,
  clubsCenter,
  findings,
}) => {
  const seasonsById = mapRows(teamSeasons)
  const leagueCenter = mapRows(leaguesCenter).get('all')?.data
  const clubCentersById = mapRows(clubsCenter)
  const clubIds = new Set()
  rows(leagues).forEach(({ data }) => {
    Object.values(object(data?.seasonsById)).forEach(season => {
      Object.values(object(season?.table?.teamsById)).forEach(team => {
        if (team?.clubId) clubIds.add(team.clubId)
      })
    })
  })
  const expectedSignals = buildExpectedTeamSignals({
    leagues: rows(leagues).map(({ id, data }) => ({ ...data, id })),
    teamSeasons: rows(teamSeasons).map(({ id, data }) => ({ ...data, id })),
    profilesById: Object.fromEntries(rows(clubProfiles).map(({ id, data }) => [id, data])),
    clubIds: [...clubIds],
  })
  rows(leagues).forEach(({ id: leagueId, data: league }) => {
    Object.entries(object(league?.seasonsById)).forEach(([seasonId, season]) => {
      Object.entries(object(season?.table?.teamsById)).forEach(([teamId, leagueTeam]) => {
        const documentId = safeBuild(() => buildTeamSeasonDocumentId({ teamId, seasonId }))
        const teamSeason = seasonsById.get(documentId)?.data
        const mismatches = compareTeamSignalSummaries({
          teamId, clubId: leagueTeam.clubId, seasonId, leagueTeam, teamSeason,
          expectedSummary: expectedSignals.get(teamSignalAuditKey(teamId, seasonId)) || null,
          leaguesCenterTeam: leagueCenter?.leaguesById?.[leagueId]?.seasonsById?.[seasonId]?.teamsById?.[teamId],
          clubsCenterTeam: clubCentersById.get(seasonId)?.data?.clubsById?.[leagueTeam.clubId]?.teamsById?.[teamId],
        })
        const targets = {
          league: { target: SYSTEM_AUDIT_TARGET.LEAGUES, documentId: leagueId },
          teamSeason: { target: SYSTEM_AUDIT_TARGET.TEAM_SEASONS, documentId },
          leaguesCenter: { target: SYSTEM_AUDIT_TARGET.LEAGUES_CENTER, documentId: 'all' },
          clubsCenter: { target: SYSTEM_AUDIT_TARGET.CLUBS_CENTER, documentId: seasonId },
        }
        mismatches.forEach(mismatch => findings.push(buildSystemAuditFinding({
          ...mismatch,
          ...(targets[mismatch.field.split('.')[0]] || (teamSeason ? targets.teamSeason : targets.league)),
          leagueId,
          relatedDocumentId: teamId,
          title: 'סיכום האיתותים חסר או אינו מסונכרן',
          owner: 'teamSignals',
          recommendedAction: 'לרענן את סיכומי האיתותים דרך פעולת הבעלים או התיקון הממוקד הקיים.',
        })))
      })
    })
  })
}

export const evaluateSystemIntegrity = ({
  teamRoots = [],
  teamSeasons = [],
  playerRoots = [],
  playerSeasons = [],
  playerSearchIndexes = [],
  leagues = [],
  clubProfiles = [],
  leaguesCenter = [],
  clubsCenter = [],
  clubsDirectory = [],
} = {}) => {
  const findings = []
  const teamRootsById = mapRows(teamRoots)
  const teamSeasonsById = mapRows(teamSeasons)
  const playerRootsById = mapRows(playerRoots)
  const playerSeasonsById = mapRows(playerSeasons)
  const playerSearchIndexesById = mapRows(playerSearchIndexes)
  const leaguesById = mapRows(leagues)
  const clubProfilesById = mapRows(clubProfiles)

  appendTeamRootFindings({ teamRoots, teamSeasonsById, clubProfilesById, findings })
  appendTeamSeasonFindings({
    teamSeasons,
    teamSeasonsById,
    teamRootsById,
    playerRootsById,
    playerSeasonsById,
    playerSearchIndexesById,
    leaguesById,
    clubProfilesById,
    findings,
  })
  appendPlayerRootFindings({ playerRoots, playerSeasonsById, findings })
  appendPlayerSeasonFindings({ playerSeasons, teamSeasonsById, findings })
  appendSearchIndexFindings({
    playerSearchIndexes,
    playerSeasonsById,
    teamSeasonsById,
    findings,
  })
  appendCanonicalIdentityFindings({ leagues, clubProfiles, findings })
  appendLeaguesCenterFindings({ leagues, teamSeasons, leaguesCenter, findings })
  appendClubsCenterFindings({
    leagues,
    clubProfiles,
    teamSeasons,
    clubsCenter,
    findings,
  })
  appendClubsDirectoryFindings({ clubProfiles, clubsDirectory, findings })
  appendTeamSignalFindings({ leagues, teamSeasons, clubProfiles, leaguesCenter, clubsCenter, findings })

  return findings
}
