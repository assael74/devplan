// src/features/playersDatabase/ui/pages/teamPage/notes/preview/teamNotebookPreview.data.js

// Fictional view data for the isolated preview only.
export const notebookPreviewData = {
  teamId: 'notebook-ui-example',
  teamName: 'קבוצת הדגמה',
  birthYear: '2012',
  mentionOptions: [
    { id: 'preview-player-1', label: 'שחקן לדוגמה', href: '/players-database/players/preview-player-1' },
  ],
  notes: {
    generalText: 'יש לבדוק שוב את התמונה הכוללת אחרי סיום העונה.',
    routeTextsById: {
      performance: 'ההגנה השתפרה בעונה האחרונה. כדאי לבדוק אם השינוי נובע מהסגל או מרמת היריבות.',
      'roster-balance': 'חלוקת הדקות בהגנה מרוכזת במספר קטן של שחקנים.',
      'year-movements': 'יש לעקוב אחרי שחקנים שעזבו ולבחון את ההתפתחות שלהם בעונה הבאה.',
      'future-competition': '',
      'club-gap': 'השנתון נראה חזק ביחס לשנתונים אחרים במועדון, אך ההשוואה עדיין חלקית.',
    },
  },
}
