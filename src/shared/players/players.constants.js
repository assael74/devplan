const warningColor = '#f7d397'
const successColor = '#11eb61'
const dangerColor = '#f80303'
const white = '#ffffff'
const black = '#000000'
const gray = '#5b5b5b'

export const SQUAD_ROLE_OPTIONS = [
  {
    value: 'key',
    label: 'שחקן מפתח',
    idIcon: 'keyPlayer',
    color: '#2563EB',
    weight: 1,
  },
  {
    value: 'core',
    label: 'שחקן מרכזי',
    idIcon: 'corePlayer',
    color: '#16A34A',
    weight: 0.8,
  },
  {
    value: 'rotation',
    label: 'רוטציה',
    idIcon: 'rotation',
    color: '#F59E0B',
    weight: 0.65,
  },
  {
    value: 'fringe',
    label: 'אחרון בסגל',
    idIcon: 'fringe',
    color: '#6B7280',
    weight: 0.3,
  },
]

export const SEASON_PLAN_STATUS = {
  NOT_REVIEWED: 'notReviewed',
  UNDER_REVIEW: 'underReview',
  IN_SQUAD: 'inSquad',
  UNDECIDED: 'undecided',
  NOT_SUITABLE: 'notSuitable',
  WANTS_TO_LEAVE: 'wantsToLeave',
}

export const SEASON_PLAN_STATUS_OPTIONS = [
  {
    value: SEASON_PLAN_STATUS.NOT_REVIEWED,
    label: 'טרם נבחן',
    shortLabel: 'לא נבחן',
    idIcon: 'notReviewed',
    tone: 'neutral',
    color: '#64748B',
    reviewed: false,
  },
  {
    value: SEASON_PLAN_STATUS.UNDER_REVIEW,
    label: 'בתהליך בחינה',
    shortLabel: 'בבחינה',
    idIcon: 'underReviewed',
    tone: 'primary',
    color: '#2563EB',
    reviewed: true,
  },
  {
    value: SEASON_PLAN_STATUS.IN_SQUAD,
    label: 'בתוכניות לעונה',
    shortLabel: 'בתוכניות',
    idIcon: 'inSquad',
    tone: 'success',
    color: '#16A34A',
    reviewed: true,
  },
  {
    value: SEASON_PLAN_STATUS.UNDECIDED,
    label: 'טרם התקבלה החלטה',
    shortLabel: 'בהתלבטות',
    idIcon: 'undecided',
    tone: 'warning',
    color: '#D97706',
    reviewed: true,
  },
  {
    value: SEASON_PLAN_STATUS.NOT_SUITABLE,
    label: 'לא מתאים מקצועית',
    shortLabel: 'לא מתאים',
    idIcon: 'notSuitable',
    tone: 'danger',
    color: '#DC2626',
    reviewed: true,
  },
  {
    value: SEASON_PLAN_STATUS.WANTS_TO_LEAVE,
    label: 'מעוניין לעזוב',
    shortLabel: 'רוצה לעזוב',
    idIcon: 'wantsToLeave',
    tone: 'warning',
    color: '#EA580C',
    reviewed: true,
  },
]

export const PLAYERS_TYPES = [
  {
    id: 'project',
    label: 'פרויקט',
    labelH: 'פרויקט',
    idIcon: 'project',
    disabled: false,
  },
  {
    id: 'noneType',
    label: 'כללי',
    labelH: 'כללי',
    idIcon: 'noneType',
    disabled: false,
  },
]

export const PROJECT_STATUS_CANDIDATE = [
  {
    id: 'candidate',
    labelH: 'מועמד',
    idIcon: 'candidate',
    color: successColor,
    icCol: black,
  },
  {
    id: 'messageSent',
    labelH: 'נשלחה הודעה',
    idIcon: 'messageSent',
    color: '#a5c9ea',
    icCol: black,
  },
  {
    id: 'awaitingReply',
    labelH: 'בהמתנה לתגובה',
    idIcon: 'awaitingReply',
    color: warningColor,
    icCol: gray,
  },
  {
    id: 'callscheduled',
    labelH: 'שיחה מתואמת',
    idIcon: 'callscheduled',
    color: warningColor,
    icCol: gray,
  },
  {
    id: 'reschedule',
    labelH: 'דחיית שיחה',
    idIcon: 'reschedule',
    color: dangerColor,
    icCol: white,
  },
  {
    id: 'thinking',
    labelH: 'זמן מחשבה',
    idIcon: 'thinking',
    color: warningColor,
    icCol: gray,
  },
  {
    id: 'approved',
    labelH: 'אושרה הצטרפות',
    idIcon: 'approved',
    color: successColor,
    icCol: black,
  },
  {
    id: 'declined',
    labelH: 'סירוב',
    idIcon: 'declined',
    color: dangerColor,
    icCol: white,
  },
]

export const POSITION_LAYERS = {
  attack: [
    {
      code: 'S',
      label: 'חלוץ',
      layerCode: 'S',
    },
  ],

  atMidfield: [
    {
      code: 'AR',
      label: 'כנף ימין',
      layerCode: 'AM',
    },
    {
      code: 'AC',
      label: 'קשר התקפי',
      layerCode: 'AM',
    },
    {
      code: 'AL',
      label: 'כנף שמאל',
      layerCode: 'AM',
    },
  ],

  midfield: [
    {
      code: 'MCR',
      label: 'קשר אמצע ימין',
      layerCode: 'M',
    },
    {
      code: 'MCL',
      label: 'קשר אמצע שמאל',
      layerCode: 'M',
    },
  ],

  dmMid: [
    {
      code: 'DMR',
      label: 'מגן / כנף ימין',
      layerCode: 'DM',
    },
    {
      code: 'DM',
      label: 'קשר אחורי',
      layerCode: 'DM',
    },
    {
      code: 'DML',
      label: 'מגן / כנף שמאל',
      layerCode: 'DM',
    },
  ],

  defense: [
    {
      code: 'DR',
      label: 'מגן ימין',
      layerCode: 'D',
    },
    {
      code: 'DCR',
      label: 'בלם ימני',
      layerCode: 'D',
    },
    {
      code: 'DCL',
      label: 'בלם שמאלי',
      layerCode: 'D',
    },
    {
      code: 'DL',
      label: 'מגן שמאל',
      layerCode: 'D',
    },
  ],

  goalkeeper: [
    {
      code: 'GK',
      label: 'שוער',
      layerCode: 'GK',
    },
  ],
}

export const POSITION_ORDER = [
  'attack',
  'atMidfield',
  'midfield',
  'dmMid',
  'defense',
  'goalkeeper',
]

export const LAYER_TITLES = {
  goalkeeper: 'שוער',
  defense: 'הגנה',
  dmMid: 'קישור',
  midfield: 'קישור',
  atMidfield: 'קישור',
  attack: 'התקפה',
}

export const FULL_WIDTH_LAYERS = [
  'defense',
  'atMidfield',
  'dmMid',
]

export const SEASON_PLAN_LAYER_TARGETS = [
  { value: 'goalkeeper', label: 'שוער', requirement: '2 שחקנים', mode: 'fixed', target: 2 },
  { value: 'defense', label: 'הגנה', requirement: 'לפחות 8 שחקנים', mode: 'min', target: 8 },
  { value: 'dmMid', label: 'קישור אחורי', requirement: '2-4 שחקנים', mode: 'range', min: 2, max: 4 },
  { value: 'atMidfield', label: 'קישור התקפי', requirement: '2-4 שחקנים', mode: 'range', min: 2, max: 4 },
  { value: 'attack', label: 'התקפה', requirement: 'לפחות 6 שחקנים', mode: 'min', target: 6 },
]

export const SEASON_PLAN_POSITION_TARGETS = [
  { value: 'GK', label: 'שוער', layerKey: 'goalkeeper', codes: ['GK'], requirement: '2 שחקנים', mode: 'fixed', target: 2 },
  { value: 'DCR', label: 'בלמים', layerKey: 'defense', codes: ['DCR', 'DCL', 'DC'], requirement: '4-5 שחקנים', mode: 'range', min: 4, max: 5 },
  { value: 'DR', label: 'מגן ימני', layerKey: 'defense', codes: ['DR'], requirement: '2 שחקנים', mode: 'fixed', target: 2 },
  { value: 'DL', label: 'מגן שמאלי', layerKey: 'defense', codes: ['DL'], requirement: '2 שחקנים', mode: 'fixed', target: 2 },
  { value: 'DM', label: 'קשרים אחוריים', layerKey: 'dmMid', codes: ['DMR', 'DM', 'DML', 'DMC'], requirement: '2-4 שחקנים', mode: 'range', min: 2, max: 4 },
  { value: 'AC', label: 'קשרים התקפיים', layerKey: 'atMidfield', codes: ['AC'], requirement: '2-4 שחקנים', mode: 'range', min: 2, max: 4 },
  { value: 'AR', label: 'כנף ימין', layerKey: 'atMidfield', codes: ['AR'], requirement: '2-3 שחקנים', mode: 'range', min: 2, max: 3 },
  { value: 'AL', label: 'כנף שמאל', layerKey: 'atMidfield', codes: ['AL'], requirement: '2-3 שחקנים', mode: 'range', min: 2, max: 3 },
  { value: 'S', label: 'חלוץ', layerKey: 'attack', codes: ['S'], requirement: '2-3 שחקנים', mode: 'range', min: 2, max: 3 },
]
