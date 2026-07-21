// features/playersDatabase/ui/pages/teamPage/logic/teamPage.constants.js

import { POSITION_LAYERS } from '../../../../../../shared/players/players.constants.js'

export const PLAYER_ROSTER_PLACEHOLDER = [
  'אינדקס\tשם השחקן\tמזהה שחקן חיצוני\tקישור שחקן\tמספר חולצה',
  '1\tישראל ישראלי\t123456\t/players/player/?player_id=123456&season_id=27\t7',
].join('\n')

export const PLAYER_ROSTER_COLUMNS = [
  { key: 'index', label: 'אינדקס', readOnly: true },
  { key: 'fullName', label: 'שם השחקן', required: true },
  { key: 'externalPlayerId', label: 'מזהה שחקן חיצוני' },
  { key: 'playerUrl', label: 'קישור שחקן' },
  { key: 'numShirt', label: 'מספר חולצה' },
]

export const PLAYER_STATS_PLACEHOLDER = [
  'אינדקס\tשם השחקן\tמס. משחקים\tשערים\tכ. צהובים\tטוטו\tכ. אדומים\tהרכב פותח\tנכנס כמחליף\tהוחלף\tדקות משחק',
  '1\tישראל ישראלי\t29\t3\t0\t0\t0\t28\t1\t1\t2458',
].join('\n')

export const PLAYER_STATS_BASE_COLUMNS = [
  { key: 'index', label: 'אינדקס', readOnly: true, sx: { width: 58, minWidth: 58 } },
  {
    key: 'fullName',
    label: 'שם השחקן',
    required: true,
    sx: { minWidth: 150, textAlign: 'left !important' },
  },
  { key: 'games', label: 'משחקים', sx: { width: 78 } },
  { key: 'goals', label: 'שערים', sx: { width: 78 } },
  { key: 'starts', label: 'הרכב פותח', sx: { width: 92 } },
  { key: 'minutes', label: 'דקות משחק', sx: { width: 92 } },
]

export const STATS_ROSTER_STATUS_OPTIONS = [
  { value: 'transferredOut', label: 'עבר קבוצה' },
  { value: 'transferredIn', label: 'הגיע מקבוצה אחרת' },
  { value: 'retired', label: 'פרש' },
  { value: 'youngerAgeGroup', label: 'שנתון צעיר' },
]

const POSITION_LAYER_LABELS = {
  goalkeeper: 'שוער',
  defense: 'הגנה',
  dmMid: 'קישור אחורי',
  midfield: 'קישור',
  atMidfield: 'קישור התקפי',
  attack: 'התקפה',
}

const POSITION_LABELS = {
  S: 'חלוץ', AR: 'כנף ימין', AC: 'קשר התקפי', AL: 'כנף שמאל',
  MCR: 'קשר אמצע ימין', MCL: 'קשר אמצע שמאל', DMR: 'מגן / כנף ימין',
  DM: 'קשר אחורי', DML: 'מגן / כנף שמאל', DR: 'מגן ימין',
  DCR: 'בלם ימני', DCL: 'בלם שמאלי', DL: 'מגן שמאל', GK: 'שוער',
}

export const POSITION_LAYER_OPTIONS = Object.keys(POSITION_LAYERS).map(key => ({
  value: key,
  label: POSITION_LAYER_LABELS[key] || key,
}))

export const POSITION_OPTIONS = Object.values(POSITION_LAYERS)
  .flat()
  .map(position => ({
    value: position.code,
    label: POSITION_LABELS[position.code] || position.code,
  }))
