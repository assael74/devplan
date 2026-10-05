// src/features/playersDatabase/ui/pages/teamPage/stats/import/logic/teamStatsPreview.model.test.js

import {
  buildStatsMovementPreviewModel,
  buildStatsPreviewModel,
  resolveStatsPreviewLeagueLevel,
} from './teamStatsPreview.model.js'
import { getMinutesPct } from '../../table/logic/teamStatsScoutMarks.logic.js'
import { buildTableScoutProfileChip } from '../../../positionClassification/model/teamPositionScoutProfile.presentation.js'

describe('Stats import preview model', () => {
  test('resolves league level from the canonical Team Page league context', () => {
    expect(resolveStatsPreviewLeagueLevel({
      team: {
        league: { leagueLevel: 3 },
      },
    })).toBe(3)
  })

  test('does not block an approved younger-age-group participant', () => {
    const preview = buildStatsMovementPreviewModel({
      rows: [{
        identityStatus: 'new_player',
        externalPlayerId: '12345',
        rosterStatus: 'youngerAgeGroup',
        statsMovementDecision: 'youngerAgeGroup',
      }],
    })

    expect(preview).toMatchObject({
      decisionRequiredCount: 0,
      youngerAgeGroupCount: 1,
      requiresDecision: false,
    })
  })

  test('keeps joined and left participants blocked until their team is selected', () => {
    const preview = buildStatsMovementPreviewModel({
      rows: [{
        identityStatus: 'system_match',
        externalPlayerId: '12345',
        statsMovementDecision: 'joined',
      }],
    })

    expect(preview.decisionRequiredCount).toBe(1)
    expect(preview.requiresDecision).toBe(true)
  })

  test('projects minutes percentage context, position and scout profiles from the approved plan', () => {
    const [row] = buildStatsPreviewModel({
      rows: [{ playerId: 'player-1', minutes: 450 }],
      seasonMinutes: 900,
      approvedStatsPlan: {
        canonicalTeamSeason: {
          roster: {
            playersById: {
              'player-1': { fullName: 'שחקן בדיקה' },
            },
          },
          stats: {
            playersById: {
              'player-1': {
                statsStatus: 'loaded',
                playerStats: { minutes: 450 },
                lineClassification: { line: 'MIDFIELD' },
              },
            },
          },
          scouting: {
            playersById: {
              'player-1': {
                primaryPosition: 'CM',
                positionLayer: 'CENTER',
                primary: { profileId: 'playmaker', strengthDepthPct: 80 },
                professionalProfileIds: ['playmaker'],
                preliminaryProfileIds: ['runner'],
                profileDepthsById: { playmaker: 80, runner: 0 },
                combinationIds: ['midfield-engine'],
              },
            },
          },
        },
      },
    })

    expect(row.scoutCalculationContract.seasonMinutes).toBe(900)
    expect(row.lineClassification).toEqual({ line: 'MIDFIELD' })
    expect(row.primaryPosition).toBe('CM')
    expect(row.positionLayer).toBe('CENTER')
    expect(row.scoutProfiles).toEqual([
      {
        profileId: 'playmaker',
        profileStrength: { depthPct: 80 },
      },
      {
        profileId: 'runner',
        profileStrength: { depthPct: 0 },
      },
    ])
    expect(row.scoutCombinations).toEqual(['midfield-engine'])
    expect(row.scoutProfileDisplay.profileStrength).toEqual({ depthPct: 80 })
  })

  test('calculates minutes percentage and professional fields before approval', () => {
    const [row] = buildStatsPreviewModel({
      rows: [{
        id: 'preview-1',
        fullName: 'שחקן בדיקה',
        games: 22,
        goals: 1,
        yellowCards: 2,
        minutes: 1521,
        starts: 20,
        substituteIn: 2,
        substitutedOut: 12,
        rosterStatus: 'regular',
      }],
      seasonMinutes: 1760,
      previewContext: {
        teamSeason: {
          identity: {
            teamId: 'team-1',
            clubId: 'club-1',
            leagueId: 'league-1',
            ageGroupId: 'u14',
            birthYear: 2012,
            teamSlot: 1,
            seasonId: '2025_2026',
            seasonKey: '25/26',
            seasonStatus: 'active',
          },
          competitionSnapshot: {
            clubLevel: 2,
            clubStrengthLevel: 2,
          },
        },
        leagueLevel: 2,
        leagueTotalRound: 30,
        leagueContext: {
          teamGamePlayed: 22,
          gameDurationMinutes: 80,
          teamMinutes: 1760,
          goalsFor: 35,
          goalsAgainst: 20,
          tableRank: 5,
          seasonStatus: 'active',
        },
      },
    })

    expect(getMinutesPct(row)).toBeCloseTo(1521 / 1760)
    expect(row.lineClassification?.line).toBeTruthy()
    expect(row.scoutProfiles.length).toBeGreaterThan(0)
    expect(row.scoutSeasonProjection?.evidence?.actual?.minutes).toBe(1521)
    expect(buildTableScoutProfileChip(row)).not.toBeNull()
  })

  test('opens the youth league context without blocking a non-regular participant', () => {
    const [row] = buildStatsPreviewModel({
      rows: [{
        id: 'preview-low-output',
        fullName: 'שחקן הגנה',
        games: 23,
        goals: 1,
        minutes: 1664,
        starts: 22,
        substituteIn: 1,
        substitutedOut: 9,
        rosterStatus: 'left',
      }],
      seasonMinutes: 1920,
      previewContext: {
        teamSeason: {
          identity: {
            teamId: 'team-1',
            clubId: 'club-1',
            leagueId: 'league-1',
            ageGroupId: 'u14',
            birthYear: 2012,
            teamSlot: 1,
            seasonId: '2025_2026',
            seasonKey: '25/26',
            seasonStatus: 'active',
          },
          competitionSnapshot: {
            clubLevel: 4,
            clubStrengthLevel: 4,
          },
        },
        leagueLevel: 3,
        leagueTotalRound: 30,
        leagueContext: {
          teamGamePlayed: 24,
          gameDurationMinutes: 80,
          teamMinutes: 1920,
          goalsFor: 20,
          goalsAgainst: 50,
          tableRank: 12,
          seasonStatus: 'active',
          team: {
            performance: {
              offense: { priorityLevel: 'negative' },
              defense: { priorityLevel: 'negative' },
            },
          },
        },
      },
    })

    expect(row.scoutProfiles.map(profile => profile.profileId)).toContain('last_station')
  })
})
