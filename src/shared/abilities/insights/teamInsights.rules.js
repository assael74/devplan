export const TEAM_INSIGHTS_RULES = {
  minPlayersForTeamInsight: 5,
  minUsedCountForLevelInsight: 5,
  minUsedCountForPotentialInsight: 5,
  minPlayersForTopContributors: 3,
  minPlayersForMatrix: 4,
  minPlayersForDomainInsight: 4,
  minRatedPlayersForDomainGap: 4,

  level: {
    bands: [
      { id: 'elite', min: 4.5 },
      { id: 'upside', min: 4.0 },
      { id: 'stable', min: 3.0 },
      { id: 'weak', min: 2.0 },
      { id: 'critical', min: 0 },
    ],
  },

  potential: {
    bands: [
      { id: 'elite', min: 4.5 },
      { id: 'upside', min: 4.0 },
      { id: 'stable', min: 3.0 },
      { id: 'weak', min: 2.0 },
      { id: 'critical', min: 0 },
    ],
  },

  potentialGap: {
    bands: [
      { id: 'upside', min: 0.8 },
      { id: 'stable', min: 0.35 },
      { id: 'weak', min: 0.1 },
      { id: 'critical', min: -99 },
    ],
  },

  topAbilityContributors: {
    dominantSharePct: 45,
    balancedSharePct: 28,
  },

  topPotentialContributors: {
    dominantSharePct: 45,
    balancedSharePct: 28,
  },

  matrix: {
    highAbilityMin: 3.5,
    highPotentialMin: 4.0,
  },

  strongestDomain: {
    eliteMin: 4.2,
    strongMin: 3.6,
    stableMin: 3.0,
  },

  biggestPotentialGapDomain: {
    highGapMin: 0.7,
    midGapMin: 0.35,
    lowGapMin: 0.1,
  },
}
