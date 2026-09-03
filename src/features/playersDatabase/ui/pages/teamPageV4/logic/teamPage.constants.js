// src/features/playersDatabase/ui/pages/teamPage/logic/teamPage.constants.js

import { TEAM_STATS_IMPORT_TABLE_WIDTHS } from '../../../components/modals/sx/statsImportTableWidths.sx.js'

export {
  POSITION_LAYER_OPTIONS,
  POSITION_OPTIONS,
} from '../../../components/playerMeta/playerRole.options.js'

export const PLAYER_ROSTER_PLACEHOLDER = [
  'אינדקס\tשם השחקן\tמזהה שחקן חיצוני\tקישור שחקן',
  '1\tישראל ישראלי\t123456\t/players/player/?player_id=123456&season_id=27',
].join('\n')

export const PLAYER_ROSTER_COLUMNS = [
  {
    key: 'index',
    label: 'אינדקס',
    readOnly: true,
  },
  {
    key: 'fullName',
    label: 'שם השחקן',
    required: true,
  },
  {
    key: 'externalPlayerId',
    label: 'מזהה שחקן חיצוני',
  },
  {
    key: 'playerUrl',
    label: 'קישור שחקן',
  },
]

export const PLAYER_STATS_PLACEHOLDER = [
  'אינדקס\tשם השחקן\tקישור שחקן\tמס. משחקים\tשערים\tכ. צהובים\tטוטו\tכ. אדומים\tהרכב פותח\tנכנס כמחליף\tהוחלף\tדקות משחק',
  '1\tישראל ישראלי\thttps://www.football.org.il/players/player/?player_id=123456\t29\t3\t0\t0\t0\t28\t1\t1\t2458',
].join('\n')

export const PLAYER_STATS_BASE_COLUMNS = [
  {
    key: 'index',
    label: 'אינדקס',
    readOnly: true,
    sx: TEAM_STATS_IMPORT_TABLE_WIDTHS.index,
  },
  {
    key: 'fullName',
    label: 'שם השחקן',
    required: true,
    sx: {
      ...TEAM_STATS_IMPORT_TABLE_WIDTHS.fullName,
      textAlign: 'left !important',
    },
  },
  {
    key: 'games',
    label: 'משחקים',
    sx: TEAM_STATS_IMPORT_TABLE_WIDTHS.games,
  },
  {
    key: 'goals',
    label: 'שערים',
    sx: TEAM_STATS_IMPORT_TABLE_WIDTHS.goals,
  },
  {
    key: 'starts',
    label: 'הרכב פותח',
    sx: TEAM_STATS_IMPORT_TABLE_WIDTHS.starts,
  },
  {
    key: 'minutes',
    label: 'דקות משחק',
    sx: TEAM_STATS_IMPORT_TABLE_WIDTHS.minutes,
  },
]


export const STATS_SEASON_STATUS_OPTIONS = [
  {
    value: 'active',
    label: 'עדכון עונה פעילה',
    description: 'תחזית לפי מספר משחקי הליגה ועדכון מלא של פרופילי הסקאוט.',
  },
  {
    value: 'completed',
    label: 'טעינת עונה מלאה',
    description: 'ללא תחזית, עם חישוב מחדש מלא של מצב הסקאוט לפי הנתונים שנטענו.',
  },
]

export const STATS_ROSTER_STATUS_OPTIONS = [
  {
    value: 'regular',
    label: 'כן בסגל',
  },
  {
    value: 'transferredOut',
    label: 'עבר קבוצה',
  },
  {
    value: 'transferredIn',
    label: 'הגיע מקבוצה אחרת',
  },
  {
    value: 'retired',
    label: 'פרש',
  },
  {
    value: 'youngerAgeGroup',
    label: 'שנתון צעיר',
  },
]

export const STATS_TRANSFER_DIRECTION_OPTIONS = [
  {
    value: 'unknown',
    label: 'לא ידוע',
  },
  {
    value: 'up',
    label: 'התקדם',
  },
  {
    value: 'lateral',
    label: 'אותה רמה',
  },
  {
    value: 'down',
    label: 'הלך אחורה',
  },
]
