// src/features/playersDatabase/services/write/flows/__tests__/writeCompletionContract.characterization.test.mjs
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { loadFlowModule } from './flowModuleHarness.mjs';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const flowsDirectory = path.resolve(testDirectory, '..');
const writeDirectory = path.resolve(flowsDirectory, '..');

const resolveFlow = (...segments) => path.resolve(flowsDirectory, ...segments);

const writeResult = (overrides = {}) => ({
  updated: true,
  ...overrides,
});

test('Scout Review returns recovery after a required SearchIndex projection failure', async () => {
  const { updatePlayerScoutReviewFlow } = await loadFlowModule({
    entryPath: resolveFlow('player', 'updatePlayerScoutReview.flow.js'),
    mocks: {
      '../../../read/entities/teamSeason.js': {
        getTeamSeason: async () => ({ players: [] }),
      },
      '../../players/index.js': {
        ensureManualScoutingPlayerDoc: async () => writeResult({
          playerDocument: { scoutProfiles: [] },
        }),
        updateScoutingPlayerReview: async () => writeResult({
          playerDocument: { scoutProfiles: [] },
          seasonPlayer: { id: 'player-1' },
        }),
      },
      '../../searchIndex/index.js': {
        updatePlayerSeasonSearchIndexScoutProfiles: async () => writeResult({ updated: false }),
      },
      '../../leagues/leagueDoc.js': {
        clean: value => String(value || '').trim(),
      },
    },
  });

  const result = await updatePlayerScoutReviewFlow({
    leagueId: 'league-1',
    teamId: 'team-1',
    seasonKey: '2025',
    playerId: 'player-1',
    scoutProfiles: [{ key: 'scout' }],
  });

  assert.equal(result.humanStateCommitted, true);
  assert.equal(result.playerCanonicalCommitted, true);
  assert.equal(result.projectionsCompleted, false);
  assert.equal(result.completed, false);
  assert.equal(result.recoveryRequired, true);
  assert.equal(result.stoppedAt, 'playerSearchIndex');
});

test('Verification returns recovery after a failed post-canonical player projection', async () => {
  const { updatePlayerVerificationFlow } = await loadFlowModule({
    entryPath: resolveFlow('player', 'updatePlayerVerification.flow.js'),
    mocks: {
      '../../leagues/index.js': {
        updateLeagueSeasonTableRankScoutProfilesSummary: async () => writeResult(),
      },
      '../../players/index.js': {
        ensureManualScoutingPlayerDoc: async () => writeResult(),
        syncPlayerRoleAndScoutProfileDoc: async () => {
          throw new Error('player projection failed');
        },
        updateScoutingPlayerVerificationAnswer: async () => writeResult({
          verificationAnswers: [],
          playerDocumentId: 'player-document-1',
        }),
      },
      '../../searchIndex/index.js': {
        updatePlayerSeasonSearchIndexScoutProfiles: async () => writeResult(),
        updateTeamSeasonSearchIndexScoutProfilesSummary: async () => writeResult(),
      },
      '../../clubs/index.js': {
        ensureRequiredClubProjectionCompleted: () => {},
        syncClubProjectionFromTeamSeason: async () => writeResult(),
      },
      '../../teams/index.js': {
        updateTeamSeasonPlayerVerificationAndScout: async () => writeResult({
          player: { id: 'player-1' },
          seasonDocument: { players: [] },
          teamSeasonDocumentId: 'team-season-1',
        }),
        updateTeamSeasonPlayerScoutProjection: async () => writeResult(),
      },
      '../../leagues/leagueDoc.js': { clean: value => String(value || '').trim() },
    },
  });

  const result = await updatePlayerVerificationFlow({
    leagueId: 'league-1',
    teamId: 'team-1',
    seasonKey: '2025',
    playerId: 'player-1',
    answer: 'yes',
  });

  assert.equal(result.teamCanonicalCommitted, true);
  assert.equal(result.projectionsCompleted, false);
  assert.equal(result.completed, false);
  assert.equal(result.recoveryRequired, true);
  assert.equal(result.stoppedAt, 'playerDocument');
});

test('Role returns its post-canonical projection failure instead of throwing it', async () => {
  const { updatePlayerRoleFlow } = await loadFlowModule({
    entryPath: resolveFlow('player', 'updatePlayerRole.flow.js'),
    mocks: {
      '../../leagues/index.js': {
        updateLeagueSeasonTableRankScoutProfilesSummary: async () => writeResult(),
      },
      '../../players/index.js': {
        syncPlayerRoleAndScoutProfileDoc: async () => {
          throw new Error('player projection failed');
        },
      },
      '../../searchIndex/index.js': {
        updatePlayerSeasonSearchIndexRole: async () => writeResult(),
        updateTeamSeasonSearchIndexScoutProfilesSummary: async () => writeResult(),
      },
      '../../clubs/index.js': {
        ensureRequiredClubProjectionCompleted: () => {},
        syncClubProjectionFromTeamSeason: async () => writeResult(),
      },
      '../../teams/index.js': {
        updateTeamSeasonPlayerRoleAndScoutProfiles: async () => writeResult({
          player: { id: 'player-1' },
          seasonDocument: { players: [] },
          teamSeasonDocumentId: 'team-season-1',
          scoutProfilesSummary: {},
        }),
        updateTeamSeasonPlayerScoutProjection: async () => writeResult(),
      },
    },
  });

  const result = await updatePlayerRoleFlow({
    leagueId: 'league-1',
    teamId: 'team-1',
    seasonKey: '2025',
    playerId: 'player-1',
    role: 'CM',
  });

  assert.equal(result.teamCanonicalCommitted, true);
  assert.equal(result.projectionsCompleted, false);
  assert.equal(result.completed, false);
  assert.equal(result.recoveryRequired, true);
});

test('clear League season teams returns League recovery for an incomplete Club projection', async () => {
  const { clearLeagueSeasonTeamsFlow } = await loadFlowModule({
    entryPath: resolveFlow('league', 'clearLeagueSeasonTeams.flow.js'),
    mocks: {
      '../../leagues/index.js': {
        getLeagueSeasonTeams: async () => [{ id: 'team-1' }],
        clearLeagueSeasonTeams: async () => writeResult(),
        syncLeaguesMasterDocument: async () => writeResult(),
      },
      '../../teams/index.js': {
        removeTeamSeason: async () => writeResult(),
      },
      '../../players/index.js': {
        removePlayerSeasonDocsMany: async () => writeResult(),
      },
      '../../searchIndex/index.js': {
        deleteSearchIndexesForLeagueSeason: async () => writeResult(),
        getSearchIndexMetaForLeagueSeason: async () => ({}),
      },
      '../../clubs/index.js': {
        removeLeagueClubSeasonIdentityIndex: async () => writeResult(),
        removeClubProjectionsForLeagueSeason: async () => ({
          completed: false,
          projectionsCompleted: false,
        }),
        syncClubsMasterDocument: async () => writeResult(),
      },
      '../../../read/entities/teamSeason.js': { getTeamSeason: async () => ({ players: [] }) },
      '../writeFlowReport.js': {
        attachWriteFlowReport: (error) => error,
      },
    },
  });

  const result = await clearLeagueSeasonTeamsFlow({ leagueId: 'league-1', seasonKey: '2025' });

  assert.equal(result.leagueCanonicalCommitted, true);
  assert.equal(result.projectionsCompleted, false);
  assert.equal(result.completed, false);
  assert.equal(result.recoveryRequired, true);
});

test('delete League season returns League recovery for an incomplete Club projection', async () => {
  const { deleteLeagueSeasonFlow } = await loadFlowModule({
    entryPath: resolveFlow('league', 'deleteLeagueSeason.flow.js'),
    mocks: {
      '../../leagues/index.js': {
        getLeagueSeasonDeleteDependencies: async () => ({
          seasonExists: true,
          canDelete: true,
          dependencies: {},
        }),
        getLeagueSeasonTeams: async () => [],
        removeLeagueSeason: async () => writeResult(),
        syncLeaguesMasterDocument: async () => writeResult(),
      },
      '../../clubs/index.js': {
        removeLeagueClubSeasonIdentityIndex: async () => writeResult(),
        removeClubProjectionsForLeagueSeason: async () => ({
          completed: false,
          projectionsCompleted: false,
        }),
        syncClubsMasterDocument: async () => writeResult(),
      },
      '../writeFlowReport.js': {
        attachWriteFlowReport: (error) => error,
      },
    },
  });

  const result = await deleteLeagueSeasonFlow({ leagueId: 'league-1', seasonKey: '2025' });

  assert.equal(result.leagueCanonicalCommitted, true);
  assert.equal(result.projectionsCompleted, false);
  assert.equal(result.completed, false);
  assert.equal(result.recoveryRequired, true);
});

test('paste League table exposes a League completion envelope', async () => {
  const source = await readFile(resolveFlow('league', 'pasteLeagueTable.flow.js'), 'utf8');

  assert.equal(source.includes('leagueCanonicalCommitted'), true);
  assert.match(source, /status: 'canonical_complete'/);
  assert.equal(source.includes('projectionsCompleted'), true);
  assert.equal(source.includes('backgroundSyncPending'), true);
  assert.equal(source.includes('recoveryRequired'), true);
  assert.equal(source.includes('completed:'), true);
  assert.match(source, /queueLeagueProjectionJob/);
});

test('paste League table returns completion on success and throws a League recovery contract after canonical failure', async () => {
  const { pasteLeagueTableFlow } = await loadFlowModule({
    entryPath: resolveFlow('league', 'pasteLeagueTable.flow.js'),
    mocks: {
      '../../leagues/index.js': {
        ensureLeagueDoc: async () => writeResult({ changed: false }),
        updateLeagueSeasonTableRank: async () => writeResult({
          seasonDocument: { tableRank: [] },
          changed: false,
        }),
      },
      '../../clubs/index.js': {
        syncLeagueClubSeasonIdentityIndex: async () => writeResult({ failedCount: 0 }),
      },
      '../../leagueProjectionJobs/leagueProjectionJob.write.js': {
        queueLeagueProjectionJob: async () => ({ id: 'job-1' }),
      },
      '../writeFlowReport.js': {
        assertWriteResultClean: ({ result, stage }) => {
          if (!result?.failedCount) return
          const error = new Error('projection failed')
          error.stage = stage
          throw error
        },
        attachWriteFlowReport: ({ error, results }) => {
          error.results = results
          return error
        },
      },
    },
  });

  const payload = { league: { id: 'league-1' }, season: { seasonStatus: 'not_started' } }
  const success = await pasteLeagueTableFlow(payload)
  assert.equal(success.leagueCanonicalCommitted, true)
  assert.equal(success.projectionsCompleted, false)
  assert.equal(success.backgroundSyncPending, true)
  assert.equal(success.completed, false)
  assert.equal(success.recoveryRequired, false)
});

const teamUrlPayload = {
  league: { id: 'league-1' },
  season: { seasonKey: '2025' },
  team: { birthTeamId: 'team-1', teamUrl: 'https://x' },
}

const loadTeamUrlFlow = ({
  teamSeason = async () => writeResult({ teamSeasonDocumentId: 'team-season-1' }),
  leagueTable = async () => writeResult(),
  teamIndex = async () => writeResult(),
  playerIndexes = async () => writeResult(),
} = {}) => (
  loadFlowModule({
    entryPath: resolveFlow('team', 'updateTeamUrl.flow.js'),
    mocks: {
      '../writeFlowSyncError.js': {
        buildWriteFlowSyncError: ({ stage, cause, results }) => Object.assign(new Error(cause.message), { stage, results }),
      },
      '../../leagues/index.js': {
        updateLeagueSeasonTableRankTeamUrl: leagueTable,
      },
      '../../teams/index.js': {
        updateTeamSeasonTeamUrl: teamSeason,
      },
      '../../searchIndex/index.js': {
        updateTeamSeasonSearchIndexTeamUrl: teamIndex,
        updatePlayerSeasonSearchIndexTeamUrl: playerIndexes,
      },
    },
  })
)

test('Team URL canonical write failure does not request recovery', async () => {
  const { updateTeamUrlFlow } = await loadTeamUrlFlow({
    teamSeason: async () => {
      throw new Error('team season failed')
    },
  })

  await assert.rejects(() => updateTeamUrlFlow(teamUrlPayload), error => {
    assert.equal(error.stage, 'updateTeamSeasonTeamUrl')
    assert.equal(error.teamCanonicalCommitted, undefined)
    assert.equal(error.recoveryRequired, undefined)
    return true
  })
})

for (const [label, stage, override] of [
  ['League Table', 'updateLeagueSeasonTableRankTeamUrl', {
    leagueTable: async () => { throw new Error('league projection failed') },
  }],
  ['Team SearchIndex', 'updateTeamSeasonSearchIndexTeamUrl', {
    teamIndex: async () => { throw new Error('team index failed') },
  }],
  ['Player SearchIndexes', 'updatePlayerSeasonSearchIndexTeamUrl', {
    playerIndexes: async () => { throw new Error('player indexes failed') },
  }],
]) {
  test(`Team URL ${label} projection failure requests Team recovery`, async () => {
    const { updateTeamUrlFlow } = await loadTeamUrlFlow(override)

    await assert.rejects(() => updateTeamUrlFlow(teamUrlPayload), error => {
      assert.equal(error.stage, stage)
      assert.equal(error.teamCanonicalCommitted, true)
      assert.equal(error.completed, false)
      assert.equal(error.projectionsCompleted, false)
      assert.equal(error.recoveryRequired, true)
      return true
    })
  })
}

test('Team URL reports complete only after every required projection succeeds', async () => {
  const { updateTeamUrlFlow } = await loadTeamUrlFlow()

  const result = await updateTeamUrlFlow(teamUrlPayload)

  assert.equal(result.teamCanonicalCommitted, true)
  assert.equal(result.completed, true)
  assert.equal(result.projectionsCompleted, true)
  assert.equal(result.recoveryRequired, false)
})

test('Player URL and notes required projection failures carry their canonical recovery flags', async () => {
  const { updatePlayerSeasonUrlFlow } = await loadFlowModule({
    entryPath: resolveFlow('player', 'updatePlayerSeasonUrl.flow.js'),
    mocks: {
      '../writeFlowSyncError.js': {
        buildWriteFlowSyncError: ({ stage, cause, results }) => Object.assign(new Error(cause.message), { stage, results }),
      },
      '../../teams/index.js': {
        updateTeamSeasonPlayerUrl: async () => writeResult(),
      },
      '../../players/index.js': {
        updatePlayerSeasonUrl: async () => {
          throw new Error('player document failed');
        },
      },
      '../../searchIndex/index.js': {
        updatePlayerSeasonSearchIndexPlayerUrl: async () => writeResult(),
      },
    },
  });

  await assert.rejects(
    () => updatePlayerSeasonUrlFlow({
      player: { id: 'player-1', playerUrl: 'https://x' },
    }),
    (error) => {
      assert.equal(error.stage, 'updatePlayerSeasonUrl');
      assert.equal(error.teamCanonicalCommitted, true);
      assert.equal(error.projectionsCompleted, false);
      assert.equal(error.completed, false);
      assert.equal(error.recoveryRequired, true);
      return true;
    },
  );

  const { updatePlayerSeasonNotesFlow } = await loadFlowModule({
    entryPath: resolveFlow('player', 'updatePlayerSeasonNotes.flow.js'),
    mocks: {
      '../writeFlowSyncError.js': {
        buildWriteFlowSyncError: ({ stage, cause, results }) => Object.assign(new Error(cause.message), { stage, results }),
      },
      '../../players/index.js': {
        updatePlayerSeasonNotes: async () => writeResult(),
      },
      '../../searchIndex/index.js': {
        updatePlayerSeasonSearchIndexNotes: async () => {
          throw new Error('player index failed');
        },
      },
    },
  });

  await assert.rejects(
    () => updatePlayerSeasonNotesFlow({ playerId: 'player-1', seasonKey: '2025', notes: 'note' }),
    (error) => {
      assert.equal(error.stage, 'updatePlayerSeasonSearchIndexNotes');
      assert.equal(error.playerCanonicalCommitted, true);
      assert.equal(error.projectionsCompleted, false);
      assert.equal(error.completed, false);
      assert.equal(error.recoveryRequired, true);
      return true;
    },
  );
});

test('Player URL and notes failures before canonical commit do not request recovery', async () => {
  const syncError = ({ stage, cause, results }) => Object.assign(new Error(cause.message), { stage, results })
  const { updatePlayerSeasonUrlFlow } = await loadFlowModule({
    entryPath: resolveFlow('player', 'updatePlayerSeasonUrl.flow.js'),
    mocks: {
      '../writeFlowSyncError.js': { buildWriteFlowSyncError: syncError },
      '../../teams/index.js': {
        updateTeamSeasonPlayerUrl: async () => { throw new Error('canonical failed'); },
      },
      '../../players/index.js': { updatePlayerSeasonUrl: async () => writeResult() },
      '../../searchIndex/index.js': { updatePlayerSeasonSearchIndexPlayerUrl: async () => writeResult() },
    },
  });

  await assert.rejects(
    () => updatePlayerSeasonUrlFlow({ player: { id: 'player-1' } }),
    error => {
      assert.equal(error.teamCanonicalCommitted, undefined);
      assert.equal(error.recoveryRequired, undefined);
      return true;
    },
  );

  const { updatePlayerSeasonNotesFlow } = await loadFlowModule({
    entryPath: resolveFlow('player', 'updatePlayerSeasonNotes.flow.js'),
    mocks: {
      '../writeFlowSyncError.js': { buildWriteFlowSyncError: syncError },
      '../../players/index.js': {
        updatePlayerSeasonNotes: async () => { throw new Error('canonical failed'); },
      },
      '../../searchIndex/index.js': { updatePlayerSeasonSearchIndexNotes: async () => writeResult() },
    },
  });

  await assert.rejects(
    () => updatePlayerSeasonNotesFlow({}),
    error => {
      assert.equal(error.playerCanonicalCommitted, undefined);
      assert.equal(error.recoveryRequired, undefined);
      return true;
    },
  );
});

test('Player URL and notes return complete contracts only after their required projections finish', async () => {
  const { updatePlayerSeasonUrlFlow } = await loadFlowModule({
    entryPath: resolveFlow('player', 'updatePlayerSeasonUrl.flow.js'),
    mocks: {
      '../writeFlowSyncError.js': { buildWriteFlowSyncError: () => new Error('unexpected') },
      '../../teams/index.js': { updateTeamSeasonPlayerUrl: async () => writeResult() },
      '../../players/index.js': { updatePlayerSeasonUrl: async () => writeResult() },
      '../../searchIndex/index.js': { updatePlayerSeasonSearchIndexPlayerUrl: async () => writeResult() },
    },
  });
  const urlResult = await updatePlayerSeasonUrlFlow({ player: { id: 'player-1', playerUrl: 'https://x' } })
  assert.equal(urlResult.teamCanonicalCommitted, true)
  assert.equal(urlResult.projectionsCompleted, true)
  assert.equal(urlResult.completed, true)
  assert.equal(urlResult.recoveryRequired, false)

  const { updatePlayerSeasonNotesFlow } = await loadFlowModule({
    entryPath: resolveFlow('player', 'updatePlayerSeasonNotes.flow.js'),
    mocks: {
      '../writeFlowSyncError.js': { buildWriteFlowSyncError: () => new Error('unexpected') },
      '../../players/index.js': { updatePlayerSeasonNotes: async () => writeResult() },
      '../../searchIndex/index.js': { updatePlayerSeasonSearchIndexNotes: async () => writeResult() },
    },
  });
  const notesResult = await updatePlayerSeasonNotesFlow({})
  assert.equal(notesResult.playerCanonicalCommitted, true)
  assert.equal(notesResult.projectionsCompleted, true)
  assert.equal(notesResult.completed, true)
  assert.equal(notesResult.recoveryRequired, false)
});

test('router journals thrown team and League post-canonical failures, including nested results', async () => {
  const journalEntries = [];
  let scenario;
  const runner = async () => scenario();
  const flowMocks = Object.fromEntries([
    'addFavoriteFlow', 'clearLeagueSeasonTeamsFlow', 'clearTeamSeasonPlayersFlow',
    'clearTeamSeasonStatsFlow', 'createLeagueSeasonFlow', 'createTeamDisplayPlayerFlow',
    'deleteLeagueSeasonFlow', 'deleteTeamPlayerFromSeasonFlow', 'pasteLeagueTableFlow',
    'pasteTeamPlayersFlow', 'pasteTeamPlayerStatsFlow', 'removeFavoriteFlow',
    'removePlayerScoutProfileFlow', 'updateLeagueSeasonUrlFlow', 'updateLeagueSeasonSettingsFlow',
    'updatePlayerRoleFlow', 'updatePlayerScoutReviewFlow', 'updatePlayerAgentFlow',
    'updatePlayerSeasonGoalDistributionFlow', 'updatePlayerSeasonNotesFlow',
    'updatePlayerSeasonUrlFlow', 'updateTeamUrlFlow',
  ].map((name) => [name, runner]));
  const { runPlayersDatabaseWriteAction } = await loadFlowModule({
    entryPath: path.resolve(writeDirectory, 'router.js'),
    mocks: {
      '../cache/index.js': { invalidatePlayersDatabaseWriteCache: () => {} },
      '../audit/audit.lastWrite.js': {
        buildLastWriteAuditScope: () => ({ type: 'teamSeason' }),
        rememberLastWriteAuditScopeFromResult: () => {},
      },
      '../audit/audit.writeJournal.js': {
        recordPlayersDatabaseWriteAction: async (entry) => journalEntries.push(entry),
      },
      './leagues/index.js': {
        ensureLeagueDoc: runner,
        updateLeagueSeasonTableRank: runner,
      },
      './flows/index.js': flowMocks,
    },
  });

  for (const { actionType, error } of [
    { actionType: 'updateTeamUrl', error: Object.assign(new Error('team projection'), { teamCanonicalCommitted: true, stage: 'teamProjection' }) },
    { actionType: 'pasteTeamPlayers', error: Object.assign(new Error('league projection'), { leagueCanonicalCommitted: true, stage: 'leagueProjection' }) },
    { actionType: 'pasteTeamPlayers', error: Object.assign(new Error('player projection'), { playerCanonicalCommitted: true, stage: 'playerProjection' }) },
    { actionType: 'pasteTeamPlayers', error: Object.assign(new Error('nested team projection'), { results: { teamCanonicalCommitted: true }, stage: 'nestedProjection' }) },
  ]) {
    scenario = () => { throw error; };
    await assert.rejects(() => runPlayersDatabaseWriteAction({ actionType, payload: {} }));
  }

  assert.equal(journalEntries.length, 4);
  for (const entry of journalEntries) {
    assert.equal(entry.status, 'failed_after_canonical_commit');
    assert.equal(entry.recoveryRequired, true);
    assert.deepEqual(entry.auditScope, { type: 'teamSeason' });
    assert.ok(entry.failedStage);
  }
});

test('router journals a returned recovery-required partial result without hiding it', async () => {
  const journalEntries = [];
  const partialResult = {
    completed: false,
    projectionsCompleted: false,
    recoveryRequired: true,
    teamCanonicalCommitted: true,
  };
  const runner = async () => partialResult;
  const flowMocks = Object.fromEntries([
    'addFavoriteFlow', 'clearLeagueSeasonTeamsFlow', 'clearTeamSeasonPlayersFlow',
    'clearTeamSeasonStatsFlow', 'createLeagueSeasonFlow', 'createTeamDisplayPlayerFlow',
    'deleteLeagueSeasonFlow', 'deleteTeamPlayerFromSeasonFlow', 'pasteLeagueTableFlow',
    'pasteTeamPlayersFlow', 'pasteTeamPlayerStatsFlow', 'removeFavoriteFlow',
    'removePlayerScoutProfileFlow', 'updateLeagueSeasonUrlFlow', 'updateLeagueSeasonSettingsFlow',
    'updatePlayerRoleFlow', 'updatePlayerScoutReviewFlow', 'updatePlayerAgentFlow',
    'updatePlayerSeasonGoalDistributionFlow', 'updatePlayerSeasonNotesFlow',
    'updatePlayerSeasonUrlFlow', 'updateTeamUrlFlow',
  ].map((name) => [name, runner]));
  const { runPlayersDatabaseWriteAction } = await loadFlowModule({
    entryPath: path.resolve(writeDirectory, 'router.js'),
    mocks: {
      '../cache/index.js': { invalidatePlayersDatabaseWriteCache: () => {} },
      '../audit/audit.lastWrite.js': {
        buildLastWriteAuditScope: () => ({ type: 'teamSeason' }),
        rememberLastWriteAuditScopeFromResult: () => {},
      },
      '../audit/audit.writeJournal.js': {
        recordPlayersDatabaseWriteAction: async (entry) => journalEntries.push(entry),
      },
      './leagues/index.js': { ensureLeagueDoc: runner, updateLeagueSeasonTableRank: runner },
      './flows/index.js': flowMocks,
    },
  });

  const result = await runPlayersDatabaseWriteAction({ actionType: 'updatePlayerSeasonRole', payload: {} });

  assert.equal(result, partialResult);
  assert.equal(journalEntries.length, 1);
  assert.equal(journalEntries[0].status, 'failed_after_canonical_commit');
  assert.equal(journalEntries[0].recoveryRequired, true);
});

test('required-projection completion contracts cannot report completed with incomplete projections', async () => {
  const flows = [
    resolveFlow('player', 'updatePlayerScoutReview.flow.js'),
    resolveFlow('player', 'updatePlayerVerification.flow.js'),
    resolveFlow('player', 'updatePlayerRole.flow.js'),
    resolveFlow('league', 'clearLeagueSeasonTeams.flow.js'),
    resolveFlow('league', 'deleteLeagueSeason.flow.js'),
    resolveFlow('league', 'pasteLeagueTable.flow.js'),
  ]

  const sources = await Promise.all(flows.map(filePath => readFile(filePath, 'utf8')))

  for (const source of sources) {
    assert.doesNotMatch(source, /projectionsCompleted:\s*false,\s*completed:\s*true/)
  }
});
