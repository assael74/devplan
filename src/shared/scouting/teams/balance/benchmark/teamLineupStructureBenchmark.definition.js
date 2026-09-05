// src/shared/scouting/teams/balance/benchmark/teamLineupStructureBenchmark.definition.js

// This is a reference lineup, not a tactical requirement or a scouting verdict.
// Keep the reference in one versioned definition so contexts can select a
// different definition later without changing the evaluator.
export const TEAM_LINEUP_STRUCTURE_BENCHMARK = Object.freeze({
  definitionId: 'reference-lineup-structure',
  definitionVersion: 'reference-lineup-structure-v1',
  metrics: Object.freeze({
    goalkeeper: Object.freeze({ reference: 1 }),
    defense: Object.freeze({ reference: 4 }),
    midfieldCore: Object.freeze({ reference: 3 }),
    attackingMidfielder: Object.freeze({ reference: 1 }),
    attack: Object.freeze({ reference: 3 }),
  }),
})
