// src/features/playersDatabase/ui/components/scout/profile/scoutProfileChip.model.test.js

import { buildScoutProfileChipModel } from './scoutProfileChip.model.js'

describe('Scout profile chip model', () => {
  test('shows a valid profile that matches its threshold exactly', () => {
    expect(buildScoutProfileChipModel({
      profileId: 'double_digit_threat',
      depthPct: 0,
    })).toEqual(expect.objectContaining({
      profileId: 'double_digit_threat',
      depthPct: 0,
    }))
  })

  test('still hides a profile when its depth is unavailable', () => {
    expect(buildScoutProfileChipModel({
      profileId: 'double_digit_threat',
    })).toBeNull()
  })

  test('keeps the depth visible when more profiles are available', () => {
    expect(buildScoutProfileChipModel({
      profileId: 'double_digit_threat',
      depthPct: 73,
      extraCount: 2,
    })).toEqual(expect.objectContaining({
      depthPct: 73,
      extraCount: 2,
      endLabel: '73%',
    }))
  })
})
