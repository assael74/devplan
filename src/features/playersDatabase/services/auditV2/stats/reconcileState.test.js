import {
  buildStatsReconcileStageStateV2,
  STATS_RECONCILE_STAGE,
} from './reconcileState.js'

const stateByStage = audit => Object.fromEntries(
  buildStatsReconcileStageStateV2(audit).map(row => [row.stage, row])
)

describe('Stats Audit V2 reconcile stage state', () => {
  test('groups Team + League findings into one sync stage', () => {
    const state = stateByStage({
      findings: [
        { target: 'teamSearchIndex' },
        { target: 'leagueMetadata' },
        { target: 'leaguesMaster' },
      ],
    })

    expect(state[STATS_RECONCILE_STAGE.TEAM_LEAGUE].status).toBe('needs_sync')
  })

  test('blocks Clubs only while Counterparts needs sync', () => {
    const state = stateByStage({
      findings: [{ target: 'counterpart' }, { target: 'club' }],
    })

    expect(state[STATS_RECONCILE_STAGE.COUNTERPARTS].status).toBe('needs_sync')
    expect(state[STATS_RECONCILE_STAGE.CLUBS].status).toBe('blocked')
  })
})
