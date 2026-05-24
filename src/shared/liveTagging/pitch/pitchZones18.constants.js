// src/shared/liveTagging/pitch/pitchZones18.constants.js

import { PITCH_LAYOUT_IDS } from './pitchLayouts.constants.js'

export const PITCH_ZONES_18_GRID = [
  [16, 17, 18],
  [13, 14, 15],
  [10, 11, 12],
  [7, 8, 9],
  [4, 5, 6],
  [1, 2, 3],
]

export const PITCH_ZONE_LENGTH_BANDS = {
  DEFENSIVE: 'defensive',
  BUILD_UP: 'buildUp',
  MIDDLE_DEFENSIVE: 'middleDefensive',
  MIDDLE_ATTACKING: 'middleAttacking',
  FINAL_THIRD: 'finalThird',
  FINISHING: 'finishing',
}

export const PITCH_ZONE_WIDTH_BANDS = {
  LEFT: 'left',
  CENTER: 'center',
  RIGHT: 'right',
}

export const PITCH_ZONES_18 = [
  { number: 1, row: 6, col: 1, lengthBand: 'defensive', widthBand: 'left' },
  { number: 2, row: 6, col: 2, lengthBand: 'defensive', widthBand: 'center' },
  { number: 3, row: 6, col: 3, lengthBand: 'defensive', widthBand: 'right' },

  { number: 4, row: 5, col: 1, lengthBand: 'buildUp', widthBand: 'left' },
  { number: 5, row: 5, col: 2, lengthBand: 'buildUp', widthBand: 'center' },
  { number: 6, row: 5, col: 3, lengthBand: 'buildUp', widthBand: 'right' },

  { number: 7, row: 4, col: 1, lengthBand: 'middleDefensive', widthBand: 'left' },
  { number: 8, row: 4, col: 2, lengthBand: 'middleDefensive', widthBand: 'center' },
  { number: 9, row: 4, col: 3, lengthBand: 'middleDefensive', widthBand: 'right' },

  { number: 10, row: 3, col: 1, lengthBand: 'middleAttacking', widthBand: 'left' },
  { number: 11, row: 3, col: 2, lengthBand: 'middleAttacking', widthBand: 'center' },
  { number: 12, row: 3, col: 3, lengthBand: 'middleAttacking', widthBand: 'right' },

  { number: 13, row: 2, col: 1, lengthBand: 'finalThird', widthBand: 'left' },
  { number: 14, row: 2, col: 2, lengthBand: 'finalThird', widthBand: 'center' },
  { number: 15, row: 2, col: 3, lengthBand: 'finalThird', widthBand: 'right' },

  { number: 16, row: 1, col: 1, lengthBand: 'finishing', widthBand: 'left' },
  { number: 17, row: 1, col: 2, lengthBand: 'finishing', widthBand: 'center' },
  { number: 18, row: 1, col: 3, lengthBand: 'finishing', widthBand: 'right' },
].map((zone) => ({
  ...zone,
  id: `z${zone.number}`,
  layoutId: PITCH_LAYOUT_IDS.ZONES_18,
  label: `אזור ${zone.number}`,
}))

export const PITCH_ZONES_18_BY_NUMBER = PITCH_ZONES_18.reduce(
  (acc, zone) => {
    acc[zone.number] = zone
    return acc
  },
  {},
)
