export const PLAYER_STATS_PLACEHOLDER = [
  'אינדקס\tשם השחקן\tקישור שחקן\tמס. משחקים\tשערים\tכ. צהובים\tטוטו\tכ. אדומים\tהרכב פותח\tנכנס כמחליף\tהוחלף\tדקות משחק',
  '1\tישראל ישראלי\thttps://www.football.org.il/players/player/?player_id=123456\t29\t3\t0\t0\t0\t28\t1\t1\t2458',
].join('\n')

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
