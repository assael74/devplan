// src/shared/players/insights/insights.config.js

/*
|--------------------------------------------------------------------------
| Player Insights Engine / Config
|--------------------------------------------------------------------------
|
| אחריות:
| ריכוז ספי הסיווג של פרופיל ביצוע שחקן.
|
| חשוב:
| אלו אינם מעמדות שהמאמן בחר.
| אלו ספי פלט של המערכת, על בסיס scoring בפועל.
*/

export const PLAYER_INSIGHTS_THRESHOLDS = {
  hardOutOfSampleMinutes: 120,
  softOutOfSampleMinutes: 300,

  reliableMinutes: 270,
  strongMinutes: 700,
  coreMinutes: 600,
  heavyMinutes: 800,
  highMinutes: 900,

  statAnchorRating: 6.25,
  statAnchorTva: 3,
  statAnchorMinutes: 900,

  jokerRating: 6.15,
  jokerMinTva: -0.25,
  jokerMinMinutes: 150,
  jokerMaxMinutes: 700,

  weakSpotRating: 5.95,
  weakSpotTva: -0.75,
  weakSpotHeavyTva: -0.6,

  coreWorkerRating: 5.95,
  coreWorkerMinTva: -0.5,

  secondaryContributorFallback: true,

  volatilityStd: 0.45,
  volatilityRange: 1.4,
  crashMinRating: 5.3,

  highGameRating: 6.5,
  lowGameRating: 5.8,

  scope: {
    minScopeGames: 5,

    hardOutOfSamplePct: 0.12,
    softOutOfSamplePct: 0.22,

    reliablePct: 0.3,
    strongPct: 0.5,
    corePct: 0.45,
    heavyPct: 0.6,
    highPct: 0.6,
    statAnchorPct: 0.6,

    statAnchorTvaPerGame: 0.15,
    minStatAnchorTva: 0.8,

    jokerMinPct: 0.15,
    jokerMaxPct: 0.55,

    minHardOutOfSampleMinutes: 60,
    minSoftOutOfSampleMinutes: 120,
    minReliableMinutes: 150,
    minStrongMinutes: 240,
    minCoreMinutes: 240,
    minHeavyMinutes: 270,
    minHighMinutes: 270,
    minStatAnchorMinutes: 270,
    minJokerMinutes: 90,
  }
}
