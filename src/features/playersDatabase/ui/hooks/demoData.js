// features/playersDatabase/ui/hooks/demoData.js

export const demoLeagues = [
  { id: 'u16-regional-south', name: 'נערים ב ארצית דרום', ageGroup: 'U16', seasonKey: '2025/2026', teamsCount: 14, tableStatus: 'full', teamsStatus: 'partial', statsStatus: 'partial', playersWithProfiles: 68 },
  { id: 'u16-national', name: 'נערים ב לאומית', ageGroup: 'U16', seasonKey: '2025/2026', teamsCount: 16, tableStatus: 'full', teamsStatus: 'full', statsStatus: 'full', playersWithProfiles: 121 },
  { id: 'u15-national', name: 'נערים ג לאומית', ageGroup: 'U15', seasonKey: '2025/2026', teamsCount: 14, tableStatus: 'full', teamsStatus: 'partial', statsStatus: 'missing', playersWithProfiles: 77 },
]

export const demoTeams = [
  { id: 'hapoel-kfar-saba_u16', tableRank: 1, name: 'הפועל כפר סבא', points: 72, goalsFor: 81, goalsAgainst: 10, playersCount: 22, attackPriority: 'high', defensePriority: 'elite', scoutStatus: 'loaded' },
  { id: 'maccabi-herzliya_u16', tableRank: 2, name: 'מכבי הרצליה', points: 64, goalsFor: 63, goalsAgainst: 19, playersCount: 19, attackPriority: 'high', defensePriority: 'high', scoutStatus: 'loaded' },
  { id: 'beitar-tubruk_u16', tableRank: 3, name: 'ביתר טוברוק', points: 52, goalsFor: 59, goalsAgainst: 21, playersCount: 0, attackPriority: 'high', defensePriority: 'high', scoutStatus: 'notLoaded' },
  { id: 'hapoel-raanana_u16_2', tableRank: 12, name: 'הפועל רעננה 2', points: 35, goalsFor: 43, goalsAgainst: 51, playersCount: 18, attackPriority: 'neutral', defensePriority: 'low', scoutStatus: 'partial' },
]

export const demoPlayers = [
  { id: 'ori-levi', number: 1, fullName: 'אורי לוי', positionLayer: 'שוער', primaryPosition: 'שוער', games: 14, goals: 0, starts: 14, yellowCards: 1, minutes: 1260, reliability: 'גבוהה', priority: 'high', profile: 'שוער מודרני' },
  { id: 'yoav-cohen', number: 4, fullName: 'יואב כהן', positionLayer: 'בלם', primaryPosition: 'בלם', games: 14, goals: 1, starts: 13, yellowCards: 2, minutes: 1182, reliability: 'גבוהה', priority: 'positive', profile: 'בלם יציב' },
  { id: 'daniel-peretz', number: 5, fullName: 'דניאל פרץ', positionLayer: 'בלם', primaryPosition: 'בלם', games: 14, goals: 2, starts: 14, yellowCards: 3, minutes: 1260, reliability: 'בינונית', priority: 'neutral', profile: 'תחנה אחרונה' },
  { id: 'noam-hazan', number: 3, fullName: 'נועם חזן', positionLayer: 'מגן ימני', primaryPosition: 'מגן', games: 14, goals: 4, starts: 13, yellowCards: 1, minutes: 1134, reliability: 'גבוהה', priority: 'high', profile: 'איום משני' },
  { id: 'eidan-barak', number: 6, fullName: 'עידן ברק', positionLayer: 'קשר אחורי', primaryPosition: 'קשר', games: 14, goals: 3, starts: 13, yellowCards: 4, minutes: 1174, reliability: 'גבוהה', priority: 'positive', profile: 'עוגן מקצועי' },
]

export const demoSearchResults = [
  { id: 'eidan-barak', playerName: 'עידן ברק', teamName: 'מכבי הרצליה', leagueName: 'ליגה לאומית', primaryProfile: 'יוצר משחק', secondaryProfile: 'סים התקפי', reliability: 'גבוהה', score: 92, note: 'מוביל יצירת מצבים בשליש האחרון' },
  { id: 'roi-levi', playerName: 'רועי לוי', teamName: 'הפועל פתח תקוה', leagueName: 'ליגה לאומית', primaryProfile: 'יוצר משחק', secondaryProfile: 'שובר קווים', reliability: 'גבוהה', score: 88, note: 'דיוק במסירות מפתח מעל הממוצע' },
  { id: 'oriel-shmueli', playerName: 'אוריאל שמואלי', teamName: 'ביתר תל אביב רמלה', leagueName: 'ליגה לאומית', primaryProfile: 'סים התקפי', secondaryProfile: 'כנף גבוהה', reliability: 'בינונית', score: 83, note: 'מהירות גבוהה ודריבל באחד על אחד' },
]

export const demoPlayer = {
  id: 'eidan-barak',
  fullName: 'עידן ברק',
  teamName: 'מכבי הרצליה',
  leagueName: 'ליגה לאומית לנוער',
  ageLabel: 'בן 17',
  position: 'קשר מרכזי',
  reliability: 'גבוהה',
  minutes: 1248,
  goals: 6,
  startsPct: 80,
  scoutProfiles: [
    { id: 'creator', label: 'שחקן איכותי שלא מצליח לפרוץ', score: 85, reliability: 'גבוהה' },
    { id: 'anchor', label: 'באנקר הרכב', score: 78, reliability: 'גבוהה' },
    { id: 'threat', label: 'איום משני', score: 64, reliability: 'בינונית' },
  ],
}
