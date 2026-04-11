// functions/src/domain/abilities/abilities.list.js

// קובץ מקביל: src/shared/abilities/abilities.list.js
// הערה: בכל שינוי בקובץ זה יש לבדוק ולעדכן גם את הקובץ המקביל בצד ה־src.

const abilitiesList = [
  { id: 'speed', label: 'מהירות בסיסית', domain: 'physical', domainLabel: 'פיסי', weight: 1.2 },
  { id: 'agility', label: 'זריזות', domain: 'physical', domainLabel: 'פיסי', weight: 1 },
  { id: 'coordination', label: 'קואורדינציה', domain: 'physical', domainLabel: 'פיסי', weight: 1 },
  { id: 'endurance', label: 'סיבולת', domain: 'physical', domainLabel: 'פיסי', weight: 1.3 },
  { id: 'explosiveness', label: 'כוח מתפרץ', domain: 'physical', domainLabel: 'פיסי', weight: 1.3 },

  { id: 'ballComfort', label: 'נוחות עם כדור', domain: 'technical', domainLabel: 'טכני', weight: 1 },
  { id: 'firstTouch', label: 'נגיעה ראשונה', domain: 'technical', domainLabel: 'טכני', weight: 1 },
  { id: 'passingSkill', label: 'טכניקת מסירה', domain: 'technical', domainLabel: 'טכני', weight: 1 },
  { id: 'dribbleConfidence', label: 'ביטחון בדריבל', domain: 'technical', domainLabel: 'טכני', weight: 1 },
  { id: 'ballStriking', label: 'טכניקת בעיטה', domain: 'technical', domainLabel: 'טכני', weight: 1 },

  { id: 'spatialAwareness', label: 'הבנת מרחבים', domain: 'gameUnderstanding', domainLabel: 'הבנת משחק', weight: 1 },
  { id: 'vision', label: 'ראיית משחק', domain: 'gameUnderstanding', domainLabel: 'הבנת משחק', weight: 1 },
  { id: 'basicPositioning', label: 'הבנת מיקום בסיסית', domain: 'gameUnderstanding', domainLabel: 'הבנת משחק', weight: 1 },
  { id: 'offBallMovement', label: 'תנועה ללא כדור', domain: 'gameUnderstanding', domainLabel: 'הבנת משחק', weight: 1 },

  { id: 'effort', label: 'השקעה והתמדה', domain: 'mental', domainLabel: 'מנטלי', weight: 1 },
  { id: 'coachability', label: 'פתיחות ללמידה', domain: 'mental', domainLabel: 'מנטלי', weight: 1 },
  { id: 'emotionalControl', label: 'שליטה רגשית', domain: 'mental', domainLabel: 'מנטלי', weight: 1 },
  { id: 'teamPlay', label: 'שיתוף פעולה קבוצתי', domain: 'mental', domainLabel: 'מנטלי', weight: 1 },
  { id: 'confidenceLevel', label: 'ביטחון עצמי', domain: 'mental', domainLabel: 'מנטלי', weight: 1 },
  { id: 'aggressiveness', label: 'אגרסיביות', domain: 'mental', domainLabel: 'מנטלי', weight: 1 },
  { id: 'communication', label: 'תקשורתיות', domain: 'mental', domainLabel: 'מנטלי', weight: 1 },

  { id: 'decisionSpeed', label: 'מהירות החלטות', domain: 'cognitive', domainLabel: 'קוגניטיבי', weight: 1 },
  { id: 'learningCurve', label: 'יכולת למידה', domain: 'cognitive', domainLabel: 'קוגניטיבי', weight: 1 },
  { id: 'adaptability', label: 'גמישות מחשבתית', domain: 'cognitive', domainLabel: 'קוגניטיבי', weight: 1 },

  { id: 'growthStage', label: 'שלב התפתחות ביולוגית', domain: 'development', domainLabel: 'התפתחות', weight: 0 },
]

module.exports = { abilitiesList }
