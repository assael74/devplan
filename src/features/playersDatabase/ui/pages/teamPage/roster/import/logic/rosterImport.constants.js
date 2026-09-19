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
