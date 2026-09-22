import {
  MOVEMENT_TIMING,
  ROSTER_IMPORT_MODE,
  buildRosterSnapshotContentHash,
  buildRosterSnapshotEventKey,
  reconcileRosterMovement,
  resolveRosterPlayersLocally,
} from './index.js'

describe('Movement reconciliation', () => {
  test('resolves continuing players from Team Season before broad identity lookup', () => {
    const result = resolveRosterPlayersLocally({
      players: [{ fullName: 'Player A', externalPlayerId: '12345' }],
      previousPlayers: [{
        playerId: 'player__2012__12345',
        externalPlayerId: '12345',
        fullName: 'Player A',
      }],
    })

    expect(result.unresolved).toHaveLength(0)
    expect(result.resolved[0].player.playerId).toBe('player__2012__12345')
  })

  test('identical roster content hash is deterministic while event keys stay distinct', () => {
    const first = buildRosterSnapshotContentHash({
      seasonKey: '26/27',
      birthTeamDocumentId: 'club_2012_1',
      players: [
        { externalPlayerId: '2', fullName: 'B' },
        { externalPlayerId: '1', fullName: 'A' },
      ],
    })
    const second = buildRosterSnapshotContentHash({
      seasonKey: '26/27',
      birthTeamDocumentId: 'club_2012_1',
      players: [
        { externalPlayerId: '1', fullName: 'A' },
        { externalPlayerId: '2', fullName: 'B' },
      ],
    })

    expect(first).toBe(second)
    expect(buildRosterSnapshotEventKey({ contentHash: first, eventNonce: 'one' }))
      .not.toBe(buildRosterSnapshotEventKey({ contentHash: second, eventNonce: 'two' }))
  })

  test('creates open Pending for an absent player on authoritative reload', () => {
    const result = reconcileRosterMovement({
      seasonKey: '26/27',
      team: {
        clubId: 'club-a',
        clubLevel: 3,
        birthTeamDocumentId: 'club-a_2012_1',
      },
      incomingPlayers: [],
      currentSeason: {
        seasonKey: '26/27',
        rosterImport: {
          sourceSnapshotKey: 'r1',
        },
        teamPlayers: [{
          playerId: 'p1',
          externalPlayerId: '12345',
          fullName: 'Player A',
        }],
      },
      rosterImport: {
        mode: ROSTER_IMPORT_MODE.AUTHORITATIVE_SNAPSHOT,
        sourceSnapshotKey: 'r2',
      },
    })

    expect(result.pendingPlayers).toHaveLength(1)
    expect(result.pendingPlayers[0]).toEqual(expect.objectContaining({
      playerId: 'p1',
      detectedSnapshotKey: 'r2',
    }))
  })

  test('closes Pending when the player returns to the same team', () => {
    const result = reconcileRosterMovement({
      seasonKey: '26/27',
      team: {
        clubId: 'club-a',
        birthTeamDocumentId: 'club-a_2012_1',
      },
      incomingPlayers: [{ playerId: 'p1' }],
      currentSeason: {
        seasonKey: '26/27',
        pendingPlayers: [{
          pendingId: 'pending__p1',
          playerId: 'p1',
        }],
        teamPlayers: [{ playerId: 'p1' }],
      },
      rosterImport: {
        mode: ROSTER_IMPORT_MODE.AUTHORITATIVE_SNAPSHOT,
        sourceSnapshotKey: 'r3',
      },
    })

    expect(result.pendingPlayers).toHaveLength(0)
    expect(result.transfersIn).toHaveLength(0)
  })

  test('creates between-season incoming movement from certain historical membership', () => {
    const result = reconcileRosterMovement({
      seasonKey: '26/27',
      team: {
        clubId: 'club-b',
        birthTeamId: 'club-b_2012_1',
        birthTeamDocumentId: 'club-b_2012_1',
        birthTeamSlot: 1,
      },
      incomingPlayers: [{
        playerId: 'p1',
        identityMemberships: [{
          playerId: 'p1',
          seasonKey: '25/26',
          clubId: 'club-a',
          birthTeamId: 'club-a_2012_1',
          birthTeamDocumentId: 'club-a_2012_1',
          birthTeamSlot: 1,
        }],
      }],
      rosterImport: {
        mode: ROSTER_IMPORT_MODE.AUTHORITATIVE_SNAPSHOT,
        sourceSnapshotKey: 'r1',
      },
    })

    expect(result.transfersIn).toHaveLength(1)
    expect(result.transfersIn[0].timing).toBe(MOVEMENT_TIMING.BETWEEN_SEASONS)
    expect(result.counterpartRequests).toHaveLength(1)
    expect(result.counterpartRequests[0].outgoing.movementId)
      .toBe(result.transfersIn[0].movementId)
  })

  test('creates an outgoing fact for a stats participant explicitly classified as left', () => {
    const result = reconcileRosterMovement({
      seasonKey: '25/26',
      team: {
        clubId: 'club-a',
        clubLevel: 3,
        birthTeamId: 'club-a_2012_1',
        birthTeamDocumentId: 'club-a_2012_1',
        birthTeamSlot: 1,
      },
      incomingPlayers: [{
        playerId: 'p1',
        rosterStatus: 'left',
        statsMovementDecision: 'left',
        statsMovementTeam: {
          clubId: 'club-b',
          clubLevel: 1,
          birthTeamId: 'club-b_2012_1',
          birthTeamDocumentId: 'club-b_2012_1',
          birthTeamSlot: 1,
        },
      }],
      rosterImport: { mode: ROSTER_IMPORT_MODE.PATCH },
    })

    expect(result.pendingPlayers).toEqual([])
    expect(result.transfersOut).toEqual([expect.objectContaining({
      playerId: 'p1',
      toBirthTeamDocumentId: 'club-b_2012_1',
      fromClubLevel: 3,
      toClubLevel: 1,
      direction: 'up',
    })])
    expect(result.counterpartRequests[0]).toEqual(expect.objectContaining({
      counterpartBirthTeamDocumentId: 'club-b_2012_1',
      incoming: expect.objectContaining({ playerId: 'p1' }),
    }))
  })

  test('creates an incoming fact for a stats participant explicitly classified as joined', () => {
    const result = reconcileRosterMovement({
      seasonKey: '25/26',
      team: { clubId: 'club-b', birthTeamDocumentId: 'club-b_2012_1' },
      incomingPlayers: [{
        playerId: 'p1', rosterStatus: 'regular', statsMovementDecision: 'joined',
        statsMovementTeam: {
          clubId: 'club-a', birthTeamId: 'club-a_2012_1',
          clubLevel: 3,
          birthTeamDocumentId: 'club-a_2012_1', birthTeamSlot: 1,
        },
      }],
      rosterImport: { mode: ROSTER_IMPORT_MODE.PATCH },
    })

    expect(result.pendingPlayers).toEqual([])
    expect(result.transfersIn).toEqual([expect.objectContaining({
      playerId: 'p1', fromBirthTeamDocumentId: 'club-a_2012_1',
    })])
  })

  test('keeps an external move to a secondary team unresolved', () => {
    const result = reconcileRosterMovement({
      seasonKey: '25/26',
      team: {
        clubId: 'club-a', clubLevel: 1, birthTeamDocumentId: 'club-a_2012_1',
      },
      incomingPlayers: [{
        playerId: 'p1', rosterStatus: 'left', statsMovementDecision: 'left',
        statsMovementTeam: {
          clubId: 'club-b', clubLevel: 1, birthTeamDocumentId: 'club-b_2012_2',
          birthTeamSlot: 2,
        },
      }],
      rosterImport: { mode: ROSTER_IMPORT_MODE.PATCH },
    })

    expect(result.transfersOut[0].direction).toBe('unknown')
  })

  test('creates an outgoing fact only for a confirmed missing roster player', () => {
    const result = reconcileRosterMovement({
      seasonKey: '26/27',
      team: { clubId: 'club-a', birthTeamDocumentId: 'club-a_2012_1' },
      incomingPlayers: [{ playerId: 'p2' }],
      missingPlayers: [{
        playerId: 'p1',
        statsMovementTeam: {
          clubId: 'club-b', birthTeamDocumentId: 'club-b_2012_1', birthTeamSlot: 1,
        },
      }],
      previousSeason: { teamPlayers: [{ playerId: 'p1' }, { playerId: 'p2' }] },
      rosterImport: { mode: ROSTER_IMPORT_MODE.AUTHORITATIVE_SNAPSHOT },
    })

    expect(result.transfersOut).toEqual([expect.objectContaining({ playerId: 'p1' })])
    expect(result.pendingPlayers).toEqual([])
  })

  test('resolves an older-age exception without Movement or Pending', () => {
    const result = reconcileRosterMovement({
      seasonKey: '26/27',
      team: { clubId: 'club-a', birthTeamDocumentId: 'club-a_2012_1' },
      incomingPlayers: [{ playerId: 'p2' }],
      missingPlayers: [{
        playerId: 'p1',
        externalPlayerId: '254043',
        fullName: 'מורן מיקי',
        birthYear: 2011,
        missingResolution: 'olderAgeException',
      }],
      previousSeason: {
        seasonKey: '25/26',
        teamPlayers: [{ playerId: 'p1' }, { playerId: 'p2' }],
      },
      rosterImport: { mode: ROSTER_IMPORT_MODE.AUTHORITATIVE_SNAPSHOT },
    })

    expect(result.transfersIn).toEqual([])
    expect(result.transfersOut).toEqual([])
    expect(result.pendingPlayers).toEqual([])
    expect(result.resolvedRosterAbsences).toEqual([expect.objectContaining({
      playerId: 'p1',
      birthYear: 2011,
      resolution: 'olderAgeException',
      previousSeasonKey: '25/26',
    })])
  })

  test('creates Pending for an explicitly unknown missing roster player', () => {
    const result = reconcileRosterMovement({
      seasonKey: '26/27',
      team: { birthTeamDocumentId: 'club-a_2012_1' },
      incomingPlayers: [{ playerId: 'p2' }],
      missingPlayers: [{ playerId: 'p1', missingResolution: 'unknown' }],
      previousSeason: { teamPlayers: [{ playerId: 'p1' }, { playerId: 'p2' }] },
      rosterImport: {
        mode: ROSTER_IMPORT_MODE.AUTHORITATIVE_SNAPSHOT,
        sourceSnapshotKey: 'roster-26-27',
      },
    })

    expect(result.transfersIn).toEqual([])
    expect(result.transfersOut).toEqual([])
    expect(result.pendingPlayers).toEqual([expect.objectContaining({ playerId: 'p1' })])
  })

  test('does not create Movement or Pending for a younger stats participant', () => {
    const result = reconcileRosterMovement({
      seasonKey: '25/26',
      team: { birthTeamDocumentId: 'club-a_2012_1' },
      incomingPlayers: [{
        playerId: 'p1', rosterStatus: 'youngerAgeGroup',
        statsMovementDecision: 'youngerAgeGroup',
      }],
      rosterImport: { mode: ROSTER_IMPORT_MODE.PATCH },
    })

    expect(result.transfersIn).toEqual([])
    expect(result.transfersOut).toEqual([])
    expect(result.pendingPlayers).toEqual([])
  })
  test('creates a new return episode after a confirmed same-season outgoing movement', () => {
    const result = reconcileRosterMovement({
      seasonKey: '26/27',
      team: {
        clubId: 'club-a',
        birthTeamId: 'club-a_2012_1',
        birthTeamDocumentId: 'club-a_2012_1',
      },
      incomingPlayers: [{ playerId: 'p1' }],
      currentSeason: {
        seasonKey: '26/27',
        rosterImport: {
          sourceSnapshotKey: 'r2',
        },
        teamPlayers: [{ playerId: 'p1' }],
        transfersOut: [{
          movementId: 'movement-away',
          playerId: 'p1',
          toClubId: 'club-b',
          toBirthTeamId: 'club-b_2012_1',
          toBirthTeamDocumentId: 'club-b_2012_1',
          toBirthTeamSlot: 1,
          timing: MOVEMENT_TIMING.UNKNOWN,
        }],
      },
      rosterImport: {
        mode: ROSTER_IMPORT_MODE.AUTHORITATIVE_SNAPSHOT,
        sourceSnapshotKey: 'r3',
      },
    })

    expect(result.transfersIn).toHaveLength(1)
    expect(result.transfersIn[0]).toEqual(expect.objectContaining({
      playerId: 'p1',
      fromBirthTeamDocumentId: 'club-b_2012_1',
    }))
    expect(result.transfersIn[0].movementId).not.toBe('movement-away')
  })

  test('marks a same-season transfer IN_SEASON only with source effective time', () => {
    const result = reconcileRosterMovement({
      seasonKey: '26/27',
      team: { clubId: 'club-b', birthTeamDocumentId: 'club-b_2012_1' },
      incomingPlayers: [{
        playerId: 'p1',
        identityMemberships: [{
          playerId: 'p1', seasonKey: '26/27', clubId: 'club-a',
          birthTeamDocumentId: 'club-a_2012_1',
        }],
      }],
      rosterImport: {
        mode: ROSTER_IMPORT_MODE.AUTHORITATIVE_SNAPSHOT,
        sourceSnapshotKey: 'snapshot-2',
        effectiveAt: '2026-11-01',
      },
    })

    expect(result.transfersIn[0].timing).toBe(MOVEMENT_TIMING.IN_SEASON)
    expect(result.transfersIn[0].effectiveAt).toBe('2026-11-01')
  })

  test('keeps an identical reload idempotent and creates distinct leave-return-leave episodes', () => {
    const teamB = { clubId: 'club-b', birthTeamDocumentId: 'club-b_2012_1' }
    const player = {
      playerId: 'p1',
      identityMemberships: [{
        playerId: 'p1', seasonKey: '26/27', clubId: 'club-a',
        birthTeamDocumentId: 'club-a_2012_1',
      }],
    }
    const first = reconcileRosterMovement({
      seasonKey: '26/27', team: teamB, incomingPlayers: [player],
      rosterImport: { mode: ROSTER_IMPORT_MODE.AUTHORITATIVE_SNAPSHOT, sourceSnapshotKey: 'b-arrival-1' },
    })
    const identicalReload = reconcileRosterMovement({
      seasonKey: '26/27', team: teamB, incomingPlayers: [player],
      currentSeason: { transfersIn: first.transfersIn },
      rosterImport: { mode: ROSTER_IMPORT_MODE.AUTHORITATIVE_SNAPSHOT, sourceSnapshotKey: 'b-arrival-1' },
    })
    const afterReturnAndNewLeave = reconcileRosterMovement({
      seasonKey: '26/27', team: teamB, incomingPlayers: [player],
      currentSeason: { transfersIn: first.transfersIn },
      rosterImport: { mode: ROSTER_IMPORT_MODE.AUTHORITATIVE_SNAPSHOT, sourceSnapshotKey: 'b-arrival-2' },
    })

    expect(identicalReload.transfersIn).toHaveLength(1)
    expect(afterReturnAndNewLeave.transfersIn).toHaveLength(2)
    expect(afterReturnAndNewLeave.transfersIn[1].movementId)
      .not.toBe(first.transfersIn[0].movementId)
  })

})
test('derives an internal move direction from Team slots', () => {
  const down = reconcileRosterMovement({
    seasonKey: '26/27',
    team: { clubId: 'club-a', clubLevel: 1, birthTeamDocumentId: 'club-a_2', birthTeamSlot: 2 },
    incomingPlayers: [{
      playerId: 'p1', statsMovementDecision: 'joined',
      statsMovementTeam: { clubId: 'club-a', clubLevel: 1, birthTeamDocumentId: 'club-a_1', birthTeamSlot: 1 },
    }],
    rosterImport: { mode: ROSTER_IMPORT_MODE.PATCH },
  })
  expect(down.transfersIn[0].direction).toBe('down')

  const up = reconcileRosterMovement({
    seasonKey: '26/27',
    team: { clubId: 'club-a', clubLevel: 1, birthTeamDocumentId: 'club-a_1', birthTeamSlot: 1 },
    incomingPlayers: [{
      playerId: 'p1', statsMovementDecision: 'joined',
      statsMovementTeam: { clubId: 'club-a', clubLevel: 1, birthTeamDocumentId: 'club-a_3', birthTeamSlot: 3 },
    }],
    rosterImport: { mode: ROSTER_IMPORT_MODE.PATCH },
  })
  expect(up.transfersIn[0].direction).toBe('up')
})
