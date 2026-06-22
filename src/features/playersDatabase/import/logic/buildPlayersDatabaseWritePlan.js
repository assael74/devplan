import { PLAYERS_DATABASE_RESOLUTION_MODE } from '../../models/playersDatabaseEntityPolicy.js'
import { buildTeamIdentity } from '../../catalog/teamIdentity.js'

const clean = (value) => String(value ?? '').trim()

const toNumberOrZero = (value) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

const pickPlayerId = (identity) =>
  clean(identity.externalPlayerId) || clean(identity.playerName)

const buildPlayerUpsert = (rowPlan) => {
  const { identity, sourceRow } = rowPlan

  return {
    externalPlayerId: clean(identity.externalPlayerId),
    profileUrl: clean(sourceRow.profileUrl),
    fullName: clean(identity.playerName),
    birthYear: sourceRow.birthYear || '',
    currentClubName: clean(identity.clubName),
    currentTeamName: clean(identity.teamName),
    currentLeagueName: clean(identity.leagueName),
    latestSnapshotAt: null,
    snapshotsCount: 0,
  }
}

const buildSnapshotCreate = (rowPlan) => {
  const { identity, policy, sourceRow } = rowPlan
  const teamSlot = Number(sourceRow.teamSlot) ||
    Number(policy.team?.catalogMatch?.slot?.slot) ||
    1
  const teamIdentity = buildTeamIdentity({
    clubId: policy.club?.catalogMatch?.id,
    clubName: policy.club?.catalogMatch?.name || identity.clubName,
    seasonId: identity.seasonId,
    ageGroupId: sourceRow.ageGroupId || policy.team?.catalogMatch?.slot?.ageGroupId,
    ageGroupLabel: sourceRow.ageGroupLabel || policy.team?.catalogMatch?.slot?.ageGroupLabel,
    teamSlot,
    leagueId: policy.league?.catalogMatch?.id,
    leagueName: policy.league?.catalogMatch?.name || identity.leagueName,
    externalTeamId: sourceRow.externalTeamId,
  })

  return {
    playerExternalId: clean(identity.externalPlayerId),
    seasonId: clean(identity.seasonId),
    checkpoint: clean(sourceRow.checkpoint),
    capturedAt: clean(sourceRow.capturedAt),
    clubCatalogId: clean(policy.club?.catalogMatch?.id),
    clubName: clean(identity.clubName),
    teamCatalogId: clean(policy.team?.catalogMatch?.id),
    teamSlot: teamIdentity.teamSlot,
    teamSlotId: teamIdentity.teamSlotId,
    teamSeasonKey: teamIdentity.teamSeasonKey,
    externalTeamId: clean(sourceRow.externalTeamId),
    ageGroupId: teamIdentity.ageGroupId,
    ageGroupLabel: teamIdentity.ageGroupLabel,
    teamName: clean(identity.teamName),
    leagueCatalogId: clean(policy.league?.catalogMatch?.id),
    leagueName: clean(identity.leagueName),
    context: {
      teamCatalogId: clean(policy.team?.catalogMatch?.id),
      teamSlot: teamIdentity.teamSlot,
      teamSlotId: teamIdentity.teamSlotId,
      teamSeasonKey: teamIdentity.teamSeasonKey,
      externalTeamId: clean(sourceRow.externalTeamId),
      ageGroupId: teamIdentity.ageGroupId,
      ageGroupLabel: teamIdentity.ageGroupLabel,
      teamName: clean(identity.teamName),
      leagueCatalogId: clean(policy.league?.catalogMatch?.id),
      leagueName: clean(identity.leagueName),
      minutes: toNumberOrZero(sourceRow.minutes),
      goals: toNumberOrZero(sourceRow.goals),
      appearances: toNumberOrZero(sourceRow.appearances),
      starts: toNumberOrZero(sourceRow.starts),
      playingUpMinutes: toNumberOrZero(sourceRow.playingUpMinutes),
    },
    source: {
      type: 'import_preview',
      profileUrl: clean(sourceRow.profileUrl),
    },
  }
}

const buildNameOnlyRef = (label, rowPlan) => ({
  label,
  catalogId: '',
  rowId: rowPlan.identity.rowId,
  playerExternalId: clean(rowPlan.identity.externalPlayerId),
  playerName: clean(rowPlan.identity.playerName),
})

const buildCatalogRef = (label, catalogMatch, rowPlan) => ({
  label,
  catalogId: clean(catalogMatch?.id),
  catalogName: clean(catalogMatch?.name),
  confidence: clean(catalogMatch?.confidence),
  rowId: rowPlan.identity.rowId,
  playerExternalId: clean(rowPlan.identity.externalPlayerId),
  playerName: clean(rowPlan.identity.playerName),
})

const addUniqueRef = (target, key, item) => {
  const safeKey = clean(key).toLowerCase()
  if (!safeKey || target.some((ref) => ref.key === safeKey)) return
  target.push({ key: safeKey, ...item })
}

const hasDuplicateManagedPlayer = (importPlan, externalPlayerId) => {
  const key = clean(externalPlayerId).toLowerCase()
  return Boolean(importPlan?.indexes?.duplicateManagedPlayersByExternalId?.[key])
}

export function buildPlayersDatabaseWritePlan(importPlan = {}) {
  const rows = Array.isArray(importPlan?.rows) ? importPlan.rows : []

  const writePlan = {
    playersToUpsert: [],
    snapshotsToCreate: [],
    clubsNameOnlyRefs: [],
    teamsNameOnlyRefs: [],
    leagueRefs: [],
    warnings: [],
    blockedRows: [],
  }

  const upsertedPlayers = new Set()

  rows.forEach((rowPlan) => {
    if (!rowPlan?.valid) {
      writePlan.blockedRows.push({
        rowId: rowPlan?.identity?.rowId,
        reason: 'invalid_import_row',
        issues: rowPlan?.issues || [],
      })
      return
    }

    const { identity, policy } = rowPlan

    if (policy.player.mode === PLAYERS_DATABASE_RESOLUTION_MODE.IGNORED && identity.playerName) {
      writePlan.warnings.push({
        rowId: identity.rowId,
        type: 'player_name_only_ignored',
        message: 'שחקן בשם בלבד לא ייפתח כאובייקט',
        playerName: identity.playerName,
      })
    }

    if (policy.player.mode === PLAYERS_DATABASE_RESOLUTION_MODE.MANAGED) {
      const playerKey = pickPlayerId(identity)

      if (hasDuplicateManagedPlayer(importPlan, identity.externalPlayerId)) {
        writePlan.warnings.push({
          rowId: identity.rowId,
          type: 'duplicate_player_in_import',
          message: 'אותו מזהה שחקן מופיע יותר מפעם אחת בייבוא',
          externalPlayerId: identity.externalPlayerId,
        })
      }

      if (!upsertedPlayers.has(playerKey)) {
        upsertedPlayers.add(playerKey)
        writePlan.playersToUpsert.push(buildPlayerUpsert(rowPlan))
      }
    }

    if (policy.snapshot.mode === PLAYERS_DATABASE_RESOLUTION_MODE.MANAGED) {
      writePlan.snapshotsToCreate.push(buildSnapshotCreate(rowPlan))
    }

    if (policy.snapshot.mode === PLAYERS_DATABASE_RESOLUTION_MODE.CANDIDATE) {
      writePlan.warnings.push({
        rowId: identity.rowId,
        type: 'snapshot_missing_performance_data',
        message: 'יש שחקן מנוהל אך חסרים נתוני ביצוע לצילום',
      })
    }

    if (policy.snapshot.mode === PLAYERS_DATABASE_RESOLUTION_MODE.IGNORED) {
      writePlan.warnings.push({
        rowId: identity.rowId,
        type: 'snapshot_ignored',
        message: 'צילום לא יישמר ללא שחקן מנוהל',
      })
    }

    if (policy.club.mode === PLAYERS_DATABASE_RESOLUTION_MODE.NAME_ONLY) {
      addUniqueRef(
        writePlan.clubsNameOnlyRefs,
        policy.club.catalogMatch?.id || identity.clubName,
        policy.club.catalogMatch?.matched
          ? buildCatalogRef(identity.clubName, policy.club.catalogMatch, rowPlan)
          : buildNameOnlyRef(identity.clubName, rowPlan)
      )
    }

    if (policy.team.mode === PLAYERS_DATABASE_RESOLUTION_MODE.NAME_ONLY) {
      addUniqueRef(
        writePlan.teamsNameOnlyRefs,
        policy.team.catalogMatch?.id || identity.teamName,
        policy.team.catalogMatch?.matched
          ? buildCatalogRef(identity.teamName, policy.team.catalogMatch, rowPlan)
          : buildNameOnlyRef(identity.teamName, rowPlan)
      )
    }

    if (identity.leagueName) {
      addUniqueRef(
        writePlan.leagueRefs,
        policy.league.catalogMatch?.id || `${identity.leagueName}|${identity.seasonId}`,
        policy.league.catalogMatch?.matched
          ? {
            ...buildCatalogRef(identity.leagueName, policy.league.catalogMatch, rowPlan),
            seasonId: identity.seasonId,
            mode: policy.league.mode,
          }
          : {
            ...buildNameOnlyRef(identity.leagueName, rowPlan),
          seasonId: identity.seasonId,
          mode: policy.league.mode,
          }
      )
    }
  })

  return {
    ...writePlan,
    summary: {
      playersToUpsert: writePlan.playersToUpsert.length,
      snapshotsToCreate: writePlan.snapshotsToCreate.length,
      clubsNameOnlyRefs: writePlan.clubsNameOnlyRefs.length,
      teamsNameOnlyRefs: writePlan.teamsNameOnlyRefs.length,
      leagueRefs: writePlan.leagueRefs.length,
      warnings: writePlan.warnings.length,
      blockedRows: writePlan.blockedRows.length,
    },
  }
}
