// src/shared/scouting/teams/signals/teamSignalCalibration.js

// Bump the version when a threshold or aggregation rule changes so persisted
// summaries cannot silently retain a result from the previous calibration.
export const TEAM_SIGNAL_CALIBRATION = Object.freeze({
  version: 'team-signals-calibration-v1',
  performance: Object.freeze({ rankChange: 5, priorityChange: 2, profileCountChange: 3 }),
  balance: Object.freeze({ strongSignalCount: 2 }),
  movement: Object.freeze({
    topClubDepartureReference: 3,
    middleClubDepartureReference: 2,
    otherClubDepartureReference: 1,
    strongSignalCount: 2,
  }),
  futureCompetition: Object.freeze({ changedLevel: 1 }),
  clubGap: Object.freeze({ levelDifference: 1, signalLevel: 1 }),
  clubComparison: Object.freeze({
    leagueLevel: 1,
    rankPercentile: 25,
    successRate: 15,
    goalsForPerGame: 1,
    goalsAgainstPerGame: 1,
    offense: 2,
    defense: 2,
    professionalRate: 15,
    underuseRate: 15,
    minPlayerGap: 3,
    strongFamilyCount: 2,
  }),
})
