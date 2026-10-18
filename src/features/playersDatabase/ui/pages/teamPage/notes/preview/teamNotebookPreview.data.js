// src/features/playersDatabase/ui/pages/teamPage/notes/preview/teamNotebookPreview.data.js

// Fictional display data only. This file is imported by the optional preview, never by the drawer.
export const notebookPreviewData = {
  teamId: 'notebook-ui-example',
  teamName: 'קבוצת הדגמה — נתונים פיקטיביים',
  birthYear: '2012',
  seasonOptions: [
    { id: '2026_2027', label: '2026/27' },
    { id: '2025_2026', label: '2025/26' },
    { id: '2024_2025', label: '2024/25' },
  ],
  playerOptions: [
    { id: 'demo-player-a', label: 'שחקן א׳', description: '2026/27 · 2025/26' },
    { id: 'demo-player-b', label: 'שחקן ב׳', description: '2026/27' },
    { id: 'demo-player-c', label: 'שחקן ג׳', description: '2025/26 · 2024/25' },
    { id: 'demo-player-d', label: 'שחקן ד׳', description: '2024/25 בלבד — אינו בסגל העדכני' },
  ],
  notes: {
    generalText: 'שנתון למעקב רב־עונתי. חשוב לחזור לממצאים הקודמים גם כשהסגל משתנה.\nזהו טקסט הדגמה בלבד, ולא מידע ממסד הנתונים.',
    findingsById: {
      'demo-club-gap': {
        text: 'השנתון משחק ברמת תחרות שונה מהמקובל במועדון. גם בלי הצלחה קבוצתית יוצאת דופן, זה מקום שכדאי לחקור כדי לאתר שחקנים מעניינים.',
        insightIds: ['club-gap'],
        relatedSeasonIds: ['2026_2027', '2025_2026'],
        relatedPlayerIds: ['demo-player-a', 'demo-player-b'],
        focusSeasonId: '2026_2027',
        status: 'open',
        createdAt: '2026-10-14T10:00:00Z',
        updatedAt: '2026-10-16T10:00:00Z',
      },
      'demo-balance': {
        text: 'חלוקת הדקות בהגנה נראית מרוכזת ביחס לעונה הקודמת. כדאי לבחון את שחקן א׳ ואת השינוי במעמד שלו, לפני שמסיקים מה אומר המבנה הקבוצתי.',
        insightIds: ['roster-balance', 'performance'],
        relatedSeasonIds: ['2026_2027', '2025_2026'],
        relatedPlayerIds: ['demo-player-a'],
        focusSeasonId: '2026_2027',
        status: 'open',
        createdAt: '2026-10-13T10:00:00Z',
        updatedAt: '2026-10-15T10:00:00Z',
      },
      'demo-performance': {
        text: 'יש שינוי חד בביצועים ההתקפיים לעומת שתי העונות הקודמות. צריך להשוות את הסגלים ולהבין מי עשוי להיות רלוונטי להמשך חקירה.',
        insightIds: ['performance'],
        relatedSeasonIds: ['2026_2027', '2025_2026', '2024_2025'],
        relatedPlayerIds: ['demo-player-b', 'demo-player-c'],
        focusSeasonId: '2026_2027',
        status: 'confirmed',
        createdAt: '2026-10-12T10:00:00Z',
        updatedAt: '2026-10-14T10:00:00Z',
      },
      'demo-movement': {
        text: 'בדקתי את העזיבה של שחקן ד׳ ביחס לתפקידו בעונה הקודמת. בשלב הזה לא זיהיתי כיוון נוסף להמשך חקירה. הממצא נשאר במחברת גם לאחר העזיבה.',
        insightIds: ['year-movements'],
        relatedSeasonIds: ['2025_2026', '2024_2025'],
        relatedPlayerIds: ['demo-player-d'],
        focusSeasonId: '',
        status: 'closed',
        createdAt: '2026-10-10T10:00:00Z',
        updatedAt: '2026-10-12T10:00:00Z',
      },
      'demo-competition': {
        text: 'שינוי אפשרי ברמת התחרות עשוי לתת הקשר חדש לשחקנים שכבר סימנתי. יש לחזור לממצא לאחר עדכון נתוני העונה.',
        insightIds: ['future-competition'],
        relatedSeasonIds: ['2026_2027'],
        relatedPlayerIds: [],
        focusSeasonId: '2026_2027',
        status: 'open',
        createdAt: '2026-10-09T10:00:00Z',
        updatedAt: '2026-10-11T10:00:00Z',
      },
    },
  },
}
