const warningColor = '#f7d397'
const succssesColor = '#11eb61'
const dangerColor = '#f80303'
const white = '#ffffff'
const black = '#000000'
const gray = '#5b5b5b'

export const PLAYERS_TYPES = [
  { id: 'project', label: 'פרויקט', labelH: 'פרויקט', idIcon: 'project', disabled: false },
  { id: 'noneType', label: 'כללי', labelH: 'כללי', idIcon: 'noneType', disabled: false },
]

export const PROJECT_STATUS_CANDIDATE = [
  { id: 'candidate', labelH: 'מועמד', idIcon: 'candidate', color: succssesColor, icCol: black },
  { id: 'messageSent', labelH: 'נשלחה הודעה ראשונית', idIcon: 'messageSent', color: '#a5c9ea', icCol: black },
  { id: 'awaitingReply', labelH: 'בהמתנה לתגובה', idIcon: 'awaitingReply',  color: warningColor, icCol: gray },
  { id: 'callscheduled', labelH: 'שיחה מתואמת', idIcon: 'callscheduled',  color: warningColor, icCol: gray },
  { id: 'reschedule', labelH: 'דחיית שיחה', idIcon: 'reschedule', color: dangerColor, icCol: white },
  { id: 'thinking', labelH: 'זמן מחשבה', idIcon: 'thinking', color: warningColor, icCol: gray },
  { id: 'approved', labelH: 'אושרה הצטרפות', idIcon: 'approved', color: succssesColor, icCol: black },
  { id: 'declined', labelH: 'סירוב הצטרפות', idIcon: 'declined', color: dangerColor, icCol: white },
];

export const POSITION_LAYERS = {
  attack: [{ code: 'S', label: 'חלוץ', layerCode: 'S' }],
  atMidfield: [
    { code: 'AL', label: 'כנף שמאל', layerCode: 'AM' },
    { code: 'AC', label: 'קשר התקפי', layerCode: 'AM' },
    { code: 'AR', label: 'כנף ימין', layerCode: 'AM' },
  ],
  midfield: [
    { code: 'MCL', label: 'קשר אמצע שמאל', layerCode: 'M' },
    { code: 'MCR', label: 'קשר אמצע ימין', layerCode: 'M' },
  ],
  dmMid: [
    { code: 'DML', label: 'מגן / כנף שמאל', layerCode: 'DM' },
    { code: 'DM', label: 'קשר אחורי', layerCode: 'DM' },
    { code: 'DMR', label: 'מגן / כנף ימין', layerCode: 'DM' },
  ],

  defense: [
    { code: 'DL', label: 'מגן שמאל', layerCode: 'D' },
    { code: 'DCL', label: 'בלם שמאלי', layerCode: 'D' },
    { code: 'DCR', label: 'בלם ימני', layerCode: 'D' },
    { code: 'DR', label: 'מגן ימין', layerCode: 'D' },
  ],
  goalkeeper: [{ code: 'GK', label: 'שוער', layerCode: 'GK' }],
};

export const POSITION_ORDER = [ 'attack', 'atMidfield', 'midfield', 'dmMid', 'defense', 'goalkeeper',];

export const LAYER_TITLES = {
  goalkeeper: 'שוער',
  defense: 'הגנה',
  dmMid: 'קישור',
  midfield: 'קישור',
  atMidfield: 'קישור',
  attack: 'התקפה',
};
