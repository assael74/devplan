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
