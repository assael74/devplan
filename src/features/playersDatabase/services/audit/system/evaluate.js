// src/features/playersDatabase/services/audit/system/evaluate.js

import {
  buildPlayerId,
  buildPlayerSearchIndexDocumentId,
  buildPlayerSeasonDocumentId,
  buildTeamId,
  buildTeamSeasonDocumentId,
  requireSeasonId,
} from '../../../domain/identity/index.js'
import {
  buildSystemAuditFinding,
  SYSTEM_AUDIT_TARGET,
} from './contract.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()
const object = value => (value && typeof value === 'object' && !Array.isArray(value) ? value : {})
const rows = value => (Array.isArray(value) ? value : [])
const mapRows = value => new Map(rows(value).map(row => [clean(row && row.id), row]))

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

const teamSeasonPlayerIds = teamSeason => {
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
        owner: 'clubsBootstrap',
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
        owner: 'clubsBootstrap',
      }))
    }

    appendMovementFindings({
      documentId: id,
      teamSeason: data,
      teamId,
      seasonId,
      findings,
    })

    const playerIds = teamSeasonPlayerIds(data)
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
      if (!expectedTeamSeasonId || actualTeamSeasonId !== expectedTeamSeasonId || !teamSeasonsById.has(actualTeamSeasonId)) {
        findings.push(relationFinding({
          type: 'orphan_projection',
          target: SYSTEM_AUDIT_TARGET.PLAYER_SEASONS,
          documentId: id,
          relatedDocumentId: actualTeamSeasonId,
          playerId,
          teamId,
          seasonId,
          title: 'Player Season מפנה ל־Team Season חסר או שגוי',
          reason: 'כל teamsById חייב להפנות לעונת הקבוצה הקנונית של אותה עונה.',
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

export const evaluateSystemIntegrity = ({
  teamRoots = [],
  teamSeasons = [],
  playerRoots = [],
  playerSeasons = [],
  playerSearchIndexes = [],
  leagues = [],
  clubProfiles = [],
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

  return findings
}
