// src/features/playersDatabase/services/auditV2/system/orphans/evaluate.js

import { cleanValue } from '../../../../model/shared/value.model.js'
import {
  buildOrphanPlayerSeasonIdentity,
  buildOrphanPlayerSeasonIdentityKey,
} from './identity.js'
import {
  buildOrphanAuditFindingV2,
  ORPHAN_AUDIT_V2_TARGET,
} from './contract.js'

const clean = cleanValue

const teamIdOf = value => clean(
  value?.birthTeamDocumentId ||
  value?.teamDocumentId ||
  value?.teamId ||
  value?.birthTeamId
)

const seasonKeyOf = value => clean(value?.seasonKey || value?.seasonId)

const buildCanonicalPlayerIndexKeys = teamSeasons => {
  const keys = new Set()

  teamSeasons.forEach(({ data: season = {} }) => {
    const team = {
      birthTeamId: clean(season.birthTeamId),
      birthTeamDocumentId: clean(season.birthTeamDocumentId),
      birthTeamSlot: Number(season?.scoutIdentityContext?.birthTeamSlot || 1) || 1,
    }

    ;(Array.isArray(season.teamPlayers) ? season.teamPlayers : []).forEach(player => {
      const key = buildOrphanPlayerSeasonIdentityKey(
        buildOrphanPlayerSeasonIdentity({
          player,
          season,
          team,
        })
      )

      if (key) keys.add(key)
    })
  })

  return keys
}

const appendTeamSearchIndexFindings = ({
  teamSearchIndexes,
  teamSeasonIds,
  findings,
}) => {
  teamSearchIndexes.forEach(({ id, data = {} }) => {
    const teamSeasonDocumentId = clean(data.teamSeasonDocumentId)

    // League-only Team SearchIndexes intentionally have no Team Season relation.
    if (!teamSeasonDocumentId || teamSeasonIds.has(teamSeasonDocumentId)) return

    findings.push(buildOrphanAuditFindingV2({
      target: ORPHAN_AUDIT_V2_TARGET.TEAM_SEARCH_INDEXES,
      documentId: id,
      relatedDocumentId: teamSeasonDocumentId,
      teamId: teamIdOf(data),
      seasonKey: seasonKeyOf(data),
      title: 'Team SearchIndex מצביע ל-Team Season שאינו קיים',
      reason: 'teamSeasonDocumentId קיים באינדקס אך מסמך ה-Team Season שאליו הוא מצביע אינו קיים.',
      expected: { teamSeasonExists: true },
      actual: { teamSeasonExists: false },
    }))
  })
}

const appendPlayerSearchIndexFindings = ({
  playerSearchIndexes,
  canonicalPlayerIndexKeys,
  findings,
}) => {
  playerSearchIndexes.forEach(({ id, data = {} }) => {
    const identity = buildOrphanPlayerSeasonIdentity({ row: data })
    const identityKey = buildOrphanPlayerSeasonIdentityKey(identity)

    if (!identityKey) {
      findings.push(buildOrphanAuditFindingV2({
        type: 'invalid_identity',
        target: ORPHAN_AUDIT_V2_TARGET.PLAYER_SEARCH_INDEXES,
        documentId: id,
        teamId: teamIdOf(data),
        playerId: clean(data.playerId),
        seasonKey: seasonKeyOf(data),
        title: 'Player SearchIndex ללא זהות קנונית מלאה',
        reason: 'לא ניתן לקשר את האינדקס לשחקן סגל משום שחסרים שדות זהות הנדרשים ל-player-season identity.',
        expected: {
          playerId: 'non-empty',
          seasonId: 'non-empty',
          birthTeamId: 'non-empty',
          birthTeamSlot: 'positive',
        },
        actual: identity,
      }))
      return
    }

    if (canonicalPlayerIndexKeys.has(identityKey)) return

    findings.push(buildOrphanAuditFindingV2({
      target: ORPHAN_AUDIT_V2_TARGET.PLAYER_SEARCH_INDEXES,
      documentId: id,
      teamId: teamIdOf(data),
      playerId: clean(data.playerId),
      seasonKey: seasonKeyOf(data),
      title: 'Player SearchIndex ללא שחקן סגל קנוני',
      reason: 'לא נמצא Team Season שמכיל שחקן עם אותה player-season identity.',
      expected: { canonicalRosterOwner: true },
      actual: { canonicalRosterOwner: false },
    }))
  })
}

const appendClubsMasterFindings = ({
  clubs,
  clubsMaster,
  findings,
}) => {
  const clubIds = new Set(
    clubs
      .map(({ id, data = {} }) => clean(data.clubId || id))
      .filter(Boolean)
  )

  ;(Array.isArray(clubsMaster?.clubs) ? clubsMaster.clubs : []).forEach(entry => {
    const clubId = clean(entry?.clubId)
    if (!clubId || clubIds.has(clubId)) return

    findings.push(buildOrphanAuditFindingV2({
      target: ORPHAN_AUDIT_V2_TARGET.CLUBS_MASTER,
      documentId: 'all',
      relatedDocumentId: clubId,
      clubId,
      title: 'ClubsMaster מכיל Club שאינו קיים',
      reason: 'רשומת ClubsMaster חייבת להצביע למסמך Club קיים.',
      expected: { clubExists: true },
      actual: { clubExists: false },
    }))
  })
}

export function evaluateOrphanDataV2({
  teamSearchIndexes = [],
  playerSearchIndexes = [],
  teamSeasons = [],
  clubs = [],
  clubsMaster = null,
} = {}) {
  const findings = []
  const teamSeasonIds = new Set(teamSeasons.map(row => clean(row.id)).filter(Boolean))
  const canonicalPlayerIndexKeys = buildCanonicalPlayerIndexKeys(teamSeasons)

  appendTeamSearchIndexFindings({
    teamSearchIndexes,
    teamSeasonIds,
    findings,
  })
  appendPlayerSearchIndexFindings({
    playerSearchIndexes,
    canonicalPlayerIndexKeys,
    findings,
  })
  appendClubsMasterFindings({
    clubs,
    clubsMaster,
    findings,
  })

  return findings
}
