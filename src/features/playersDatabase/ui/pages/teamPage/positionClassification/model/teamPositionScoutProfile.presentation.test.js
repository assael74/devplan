// src/features/playersDatabase/ui/pages/teamPage/positionClassification/model/teamPositionScoutProfile.presentation.test.js

import { buildTableScoutProfileChip } from './teamPositionScoutProfile.presentation.js'

test('connects the persisted profile depth to the table chip', () => {
  expect(buildTableScoutProfileChip({
    scoutProfiles: [
      { profileId: 'double_digit_threat', depthPct: 73 },
      { profileId: 'last_station', depthPct: 48 },
    ],
    scoutProfileDisplay: {
      label: 'double_digit_threat',
      profileStrength: 73,
    },
  })).toEqual(expect.objectContaining({
    profileId: 'double_digit_threat',
    depthPct: 73,
    extraCount: 1,
  }))
})

test('uses the display depth when the compact profile omits it', () => {
  expect(buildTableScoutProfileChip({
    scoutProfiles: [
      { profileId: 'double_digit_threat' },
    ],
    scoutProfileDisplay: {
      label: 'double_digit_threat',
      profileStrength: { depthPct: 73 },
    },
  })).toEqual(expect.objectContaining({
    profileId: 'double_digit_threat',
    depthPct: 73,
  }))
})

test('uses the highest component depth for a combination profile', () => {
  expect(buildTableScoutProfileChip({
    scoutProfiles: [
      { profileId: 'killer_efficiency', depthPct: 84 },
      { profileId: 'clear_scorer', depthPct: 42 },
    ],
    scoutCombinations: ['elite_finisher'],
    scoutProfileDisplay: {
      label: 'killer_efficiency',
      profileStrength: 84,
    },
  })).toEqual(expect.objectContaining({
    profileId: 'elite_finisher',
    depthPct: 84,
    isCombination: true,
  }))
})
