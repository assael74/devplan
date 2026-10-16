// src/features/playersDatabase/ui/pages/teamPage/information/model/teamInsights.presentation.test.js

import { buildRosterBalanceSeasonView, buildTeamInsightsPresentation } from './teamInsights.presentation.js'

test('season selection reverses roster balance counts and comparison text together', () => {
  const oldStructure = { availability: 'available', lines: { attack: 1, defense: 7 } }
  const currentView = {
    selectedSeasonKey: '26/27',
    structure: { availability: 'available', lines: { attack: 2, defense: 6 } },
    previousRosterBalance: { seasonKey: '25/26', structure: oldStructure },
  }
  const oldView = { selectedSeasonKey: '25/26', structure: oldStructure, positionClassificationRows: [{ id: 'historical' }] }
  const reversed = buildRosterBalanceSeasonView(currentView, oldView)
  expect(reversed.structure).toBe(oldStructure)
  expect(reversed.positionClassificationRows).toBe(oldView.positionClassificationRows)
  expect(buildTeamInsightsPresentation({ view: reversed }).rosterBalanceComparison.positions.attack)
    .toEqual({ text: 'בעונת 26/27: 2 · ירידה ב־1', iconId: 'sortDown' })
  expect(buildTeamInsightsPresentation({ view: buildRosterBalanceSeasonView(currentView, currentView) }).rosterBalanceComparison.positions.attack)
    .toEqual({ text: 'בעונת 25/26: 1 · עלייה ב־1', iconId: 'sortUp' })
})

test('balance cards compare prior counts and usage state without treating missing counts as zero', () => {
  const previousStructure = {
    availability: 'available',
    lines: { defense: 4, midfield: 0, attack: null },
    classificationCoverageBenchmark: { state: 'typical' },
  }
  const comparison = buildTeamInsightsPresentation({
    view: {
      structure: {
        availability: 'available',
        lines: { defense: 6, midfield: 0, attack: 3 },
        classificationCoverageBenchmark: { state: 'typical' },
      },
      previousRosterBalance: { seasonKey: '25/26', structure: previousStructure },
    },
  }).rosterBalanceComparison

  expect(comparison.positions.defense).toEqual({ text: 'בעונת 25/26: 4 · עלייה ב־2', iconId: 'sortUp' })
  expect(comparison.positions.midfield).toEqual({ text: 'בעונת 25/26: 0 · ללא שינוי', iconId: 'equal' })
  expect(comparison.positions.attack).toEqual({ text: 'בעונת 25/26: אין נתון להשוואה', iconId: 'info' })
  expect(comparison.minutes.squad).toEqual({ text: 'בעונת 25/26: בסיס סגל מאוזן · ללא שינוי', iconId: 'equal' })
})

test('balance comparison is unavailable when the previous season sample is insufficient', () => {
  const comparison = buildTeamInsightsPresentation({
    view: {
      structure: { availability: 'available', lines: { defense: 6 } },
      previousRosterBalance: {
        seasonKey: '25/26',
        structure: {
          availability: 'unavailable',
          availabilityReason: 'season_sample_insufficient',
          lines: { defense: 4 },
        },
      },
    },
  }).rosterBalanceComparison

  expect(comparison.positions.defense).toEqual({ text: 'בעונת 25/26: המדגם אינו מספיק להשוואה', iconId: 'info' })
  expect(comparison.minutes.defense).toEqual({ text: 'בעונת 25/26: המדגם אינו מספיק להשוואה', iconId: 'info' })
})

const presentMovements = (clubLevel, movement = {}) => buildTeamInsightsPresentation({
  club: { clubLevel },
  view: {
    selectedSeasonKey: '26/27',
    yearDevelopment: { movementSeasons: [{
      seasonKey: '26/27',
      movementDataAvailable: true,
      higherLevelDepartures: 0,
      sameLevelDepartures: 0,
      higherOrSameLevelDepartures: 0,
      professionalProfileDepartures: 0,
      comparableDepartures: 0,
      profileKnownDepartures: 0,
      outgoingPlayerCount: 0,
      ...movement,
    }] },
  },
})

test.each([
  [1, 3],
  [1.5, 3],
  [2, 2],
  [2.5, 2],
  [3, 1],
  [4, 1],
])('club level %s signals only above balance point %s', (clubLevel, balancePoint) => {
  const atBalance = presentMovements(clubLevel, {
    higherLevelDepartures: balancePoint,
    higherOrSameLevelDepartures: balancePoint,
    professionalProfileDepartures: balancePoint,
  }).movementSignal
  const aboveBalance = presentMovements(clubLevel, {
    higherLevelDepartures: balancePoint + 1,
    higherOrSameLevelDepartures: balancePoint + 1,
    professionalProfileDepartures: balancePoint + 1,
  }).movementSignal

  expect(atBalance).toMatchObject({
    balancePoint,
    directionActive: false,
    professionalActive: false,
    count: 0,
    status: 'none',
  })
  expect(aboveBalance).toMatchObject({
    balancePoint,
    directionActive: true,
    professionalActive: true,
    count: 2,
    status: 'multiple',
  })
})

test('direction and professional profile departures each activate one signal independently', () => {
  const directionOnly = presentMovements(2, {
    higherLevelDepartures: 3,
    higherOrSameLevelDepartures: 3,
    professionalProfileDepartures: 1,
  }).movementSignal
  const profileOnly = presentMovements(2, {
    higherLevelDepartures: 1,
    higherOrSameLevelDepartures: 1,
    professionalProfileDepartures: 3,
  }).movementSignal

  expect(directionOnly).toMatchObject({
    directionActive: true, professionalActive: false, count: 1, status: 'single',
  })
  expect(profileOnly).toMatchObject({
    directionActive: false, professionalActive: true, count: 1, status: 'single',
  })
})

test('same-level departures count toward direction only for a level-1 club', () => {
  const levelOne = presentMovements(1, {
    sameLevelDepartures: 4,
    higherOrSameLevelDepartures: 4,
  }).movementSignal
  const levelOneAndHalf = presentMovements(1.5, {
    sameLevelDepartures: 4,
    higherOrSameLevelDepartures: 4,
  }).movementSignal

  expect(levelOne).toMatchObject({ directionDepartureCount: 4, directionActive: true })
  expect(levelOneAndHalf).toMatchObject({ directionDepartureCount: 0, directionActive: false })
})

test('upcoming season and missing club level do not activate movement signals', () => {
  const upcoming = presentMovements(2, {
    higherLevelDepartures: 3,
    higherOrSameLevelDepartures: 3,
    professionalProfileDepartures: 3,
    isUpcoming: true,
  }).movementSignal
  const unknownLevel = presentMovements(null, {
    higherLevelDepartures: 3,
    higherOrSameLevelDepartures: 3,
    professionalProfileDepartures: 3,
  }).movementSignal

  expect(upcoming).toMatchObject({ count: 0, status: 'limited' })
  expect(unknownLevel).toMatchObject({ count: 0, status: 'limited', balancePoint: null })
})

test('league-only season without movement data remains unavailable', () => {
  const presentation = presentMovements(2, { movementDataAvailable: false })

  expect(presentation.movementSignal).toMatchObject({ count: 0, status: 'limited' })
  expect(presentation.signalSummaries['year-movements']).toBe('נתוני העברות טרם זמינים')
})

test('movement insight is calculated independently for each displayed season', () => {
  const presentation = buildTeamInsightsPresentation({
    club: { clubLevel: 2 },
    view: {
      selectedSeasonKey: '26/27',
      yearDevelopment: {
        movementSeasons: [
          {
            seasonKey: '26/27',
            movementDataAvailable: true,
            higherLevelDepartures: 1,
            professionalProfileDepartures: 3,
          },
          {
            seasonKey: '25/26',
            movementDataAvailable: true,
            higherLevelDepartures: 4,
            professionalProfileDepartures: 4,
          },
        ],
      },
    },
  })

  expect(presentation.movementSeasonSignals).toMatchObject([
    { seasonKey: '26/27', count: 1, status: 'single' },
    { seasonKey: '25/26', count: 2, status: 'multiple' },
  ])
  expect(presentation.movementSignal.seasonKey).toBe('26/27')
})
