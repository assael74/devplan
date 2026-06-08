// src/features/squadSimulator/ui/simulatorUi.constants.js

import { SQUAD_ROLE_OPTIONS } from '../../../shared/players/players.constants.js'
export { CONFIDENCE_LEVEL_OPTIONS } from '../engine/simulator.confidence.js'

export const TARGET_PROFILE_OPTIONS = [
  { value: 'top', label: 'צמרת · מקומות 1-4' },
  { value: 'midTop', label: 'אמצע עליון · מקומות 5-8' },
  { value: 'midLow', label: 'מרכז-תחתון · מקומות 9-13' },
  { value: 'bottom', label: 'תחתית · מקום 14 ומטה' },
]

export const ROLE_OPTIONS = SQUAD_ROLE_OPTIONS

export const SIMULATOR_POSITION_OPTIONS = [
  { value: 'GK', label: 'שוער' },
  { value: 'DR', label: 'מגן ימין' },
  { value: 'DL', label: 'מגן שמאל' },
  { value: 'DC', label: 'בלם' },
  { value: 'DMR', label: 'מגן/כנף ימין' },
  { value: 'DML', label: 'מגן/כנף שמאל' },
  { value: 'DM', label: 'קשר אחורי' },
  { value: 'MC', label: 'קשר מרכזי' },
  { value: 'AR', label: 'כנף ימין' },
  { value: 'AL', label: 'כנף שמאל' },
  { value: 'AC', label: 'קשר התקפי' },
  { value: 'S', label: 'חלוץ' },
]

export const GOAL_TIER_ICON_IDS = {
  scorer: 'scorer',
  doubleDigitScorer: 'doubleDigitScorer',
  supportScorer: 'complementaryScorer',
  occasionalScorer: 'occasionalScorer',
  none: 'noGoalTarget',
}

export const EXACT_TARGET_OPTIONS = Array.from({ length: 16 }, (_, index) => ({
  value: index + 1,
  label: `מקום ${index + 1}`,
}))

export const GAME_TIME_OPTIONS = [
  { value: 70, label: '70' },
  { value: 80, label: '80' },
  { value: 90, label: '90' },
]

const slot = (slotId, primaryPosition = slotId, label = slotId) => ({
  slotId,
  primaryPosition,
  label,
})

export const FORMATION_OPTIONS = [
  {
    value: '4-1-2-3-1',
    label: '4-1-2-3-1',
    slots: [
      slot('GK', 'GK', 'שוער'),
      slot('DR', 'DR', 'מגן ימין'),
      slot('DC', 'DC', 'בלם'),
      slot('DC', 'DC', 'בלם'),
      slot('DL', 'DL', 'מגן שמאל'),
      slot('DM', 'DM', 'קשר אחורי'),
      slot('MC', 'MC', 'קשר מרכזי'),
      slot('MC', 'MC', 'קשר מרכזי'),
      slot('AR', 'AR', 'כנף ימין'),
      slot('AL', 'AL', 'כנף שמאל'),
      slot('S', 'S', 'חלוץ'),
    ],
  },
  {
    value: '4-2-3-1',
    label: '4-2-3-1',
    slots: [
      slot('GK', 'GK', 'שוער'),
      slot('DR', 'DR', 'מגן ימין'),
      slot('DC', 'DC', 'בלם'),
      slot('DC', 'DC', 'בלם'),
      slot('DL', 'DL', 'מגן שמאל'),
      slot('DM', 'DM', 'קשר אחורי'),
      slot('DM', 'DM', 'קשר אחורי'),
      slot('AR', 'AR', 'כנף ימין'),
      slot('AC', 'AC', 'קשר התקפי'),
      slot('AL', 'AL', 'כנף שמאל'),
      slot('S', 'S', 'חלוץ'),
    ],
  },
  {
    value: '4-1-2-1-2',
    label: '4-1-2-1-2',
    slots: [
      slot('GK', 'GK', 'שוער'),
      slot('DR', 'DR', 'מגן ימין'),
      slot('DC', 'DC', 'בלם'),
      slot('DC', 'DC', 'בלם'),
      slot('DL', 'DL', 'מגן שמאל'),
      slot('DM', 'DM', 'קשר אחורי'),
      slot('MC', 'MC', 'קשר מרכזי'),
      slot('MC', 'MC', 'קשר מרכזי'),
      slot('AC', 'AC', 'קשר התקפי'),
      slot('S', 'S', 'חלוץ'),
      slot('S', 'S', 'חלוץ'),
    ],
  },
  {
    value: '5-1-2-1-2',
    label: '5-1-2-1-2',
    slots: [
      slot('GK', 'GK', 'שוער'),
      slot('DC', 'DC', 'בלם'),
      slot('DC', 'DC', 'בלם'),
      slot('DC', 'DC', 'בלם'),
      slot('DML', 'DML', 'מגן/כנף שמאל'),
      slot('DMR', 'DMR', 'מגן/כנף ימין'),
      slot('DM', 'DM', 'קשר אחורי'),
      slot('MC', 'MC', 'קשר מרכזי'),
      slot('MC', 'MC', 'קשר מרכזי'),
      slot('S', 'S', 'חלוץ'),
      slot('S', 'S', 'חלוץ'),
    ],
  },
  {
    value: '5-2-1-2',
    label: '5-2-1-2',
    slots: [
      slot('GK', 'GK', 'שוער'),
      slot('DC', 'DC', 'בלם'),
      slot('DC', 'DC', 'בלם'),
      slot('DC', 'DC', 'בלם'),
      slot('DML', 'DML', 'מגן/כנף שמאל'),
      slot('DMR', 'DMR', 'מגן/כנף ימין'),
      slot('MC', 'MC', 'קשר מרכזי'),
      slot('MC', 'MC', 'קשר מרכזי'),
      slot('AC', 'AC', 'קשר התקפי'),
      slot('S', 'S', 'חלוץ'),
      slot('S', 'S', 'חלוץ'),
    ],
  },
]

export const BENCH_SLOT_COUNT = 5

export const DEFAULT_SIMULATOR_STATE = {
  teamName: '',
  targetMode: 'range',
  targetProfile: 'midTop',
  targetPosition: 5,
  leagueNumGames: 30,
  leagueGameTime: 90,
  formation: '4-2-3-1',
}
