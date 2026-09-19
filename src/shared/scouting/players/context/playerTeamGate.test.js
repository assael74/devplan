import {
  evaluatePlayerScoutTeamGate,
  PLAYER_TEAM_GATE_MODE,
  PLAYER_TEAM_GATE_REASON,
} from './playerTeamGate.js'
import { TEAM_FILTER } from '../ids.js'
import { buildPlayerScoutSignals } from '../engine.js'

const backThreatProfile = {
  teamFilter: TEAM_FILTER.DEFENSE_POSITIVE,
}

const adverseDefenseTeam = {
  defense: {
    priorityLevel: 'negative',
  },
}

const evaluateGate = competitionContext => evaluatePlayerScoutTeamGate({
  profile: backThreatProfile,
  team: adverseDefenseTeam,
  metrics: { goals: 4 },
  competitionContext,
})

test('opens the team gate for נערים ג and younger through league level 3', () => {
  const result = evaluateGate({
    ageGroupId: 'u15',
    clubStrengthLevel: 2,
    leagueLevel: 3,
  })

  expect(result).toMatchObject({
    passed: true,
    mode: PLAYER_TEAM_GATE_MODE.OPEN_CONTEXT,
    reason: PLAYER_TEAM_GATE_REASON.YOUTH_LEAGUE_LEVEL,
    legacyFilterPassed: null,
  })
})

test('keeps the team gate open for younger age groups at league level 3', () => {
  const result = evaluateGate({
    ageGroupId: 'u13',
    clubStrengthLevel: 2,
    leagueLevel: 3,
  })

  expect(result.passed).toBe(true)
  expect(result.reason).toBe(PLAYER_TEAM_GATE_REASON.YOUTH_LEAGUE_LEVEL)
})

test('keeps the legacy team filter for נערים ב and for league level 4', () => {
  const olderAgeGroup = evaluateGate({
    ageGroupId: 'u16',
    clubStrengthLevel: 2,
    leagueLevel: 3,
  })
  const higherLeague = evaluateGate({
    ageGroupId: 'u15',
    clubStrengthLevel: 2,
    leagueLevel: 4,
  })

  expect(olderAgeGroup).toMatchObject({
    passed: false,
    mode: PLAYER_TEAM_GATE_MODE.LEGACY_FILTER,
    reason: PLAYER_TEAM_GATE_REASON.LEGACY_FILTER,
  })
  expect(higherLeague).toMatchObject({
    passed: false,
    mode: PLAYER_TEAM_GATE_MODE.LEGACY_FILTER,
    reason: PLAYER_TEAM_GATE_REASON.LEGACY_FILTER,
  })
})

test('keeps back_threat eligible in ילדים א league level 3 despite adverse team defense', () => {
  const signals = buildPlayerScoutSignals({
    player: {
      primaryPosition: 'defense',
      games: 20,
      goals: 4,
      minutes: 1407,
    },
    team: {
      ageGroupId: 'u14',
      clubLevel: 2,
      clubStrengthLevel: 2,
      leagueLevel: 3,
      gamesPlayed: 23,
      leagueGameTime: 80,
      defense: { priorityLevel: 'negative' },
    },
    season: {
      seasonStatus: 'completed',
      leagueNumGames: 23,
    },
  })

  const backThreat = signals.find(signal => signal.profileId === 'back_threat')

  expect(backThreat?.scoutContext?.teamGate).toMatchObject({
    passed: true,
    mode: PLAYER_TEAM_GATE_MODE.OPEN_CONTEXT,
    reason: PLAYER_TEAM_GATE_REASON.YOUTH_LEAGUE_LEVEL,
  })
})
