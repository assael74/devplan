// src/features/playersDatabase/ui/components/modals/playerScoutAuditHealth.model.js

const HEALTH_CATEGORY_ORDER = ['sync', 'schema', 'engine']

const HEALTH_CATEGORIES = {
  sync: {
    id: 'sync',
    title: 'בעיות סנכרון',
    description: 'אותו מידע אינו תואם בין מסמך הקבוצה, מסמך השחקן או אינדקס החיפוש.',
    impact: 'המסכים עלולים להציג מצב שונה, או שהיסטוריה ומעקב לא יישמרו במקום הנכון.',
    tone: 'warning',
  },
  schema: {
    id: 'schema',
    title: 'בעיות מבנה',
    description: 'מסמך אינו תואם למבנה הנתונים הנוכחי של המערכת.',
    impact: 'שדות נדרשים עלולים להיות חסרים או ששדות ישנים יישארו במסמך.',
    tone: 'warning',
  },
  engine: {
    id: 'engine',
    title: 'פערי מצב מנוע',
    description: 'המנוע הנוכחי מחשב מצב שונה מהמצב המחושב ששמור במסמכים.',
    impact: 'החלטות הסקאוטינג עצמן אינן משתנות אוטומטית, אבל המצב המחושב של המנוע דורש חישוב מחדש.',
    tone: 'neutral',
  },
}

const ISSUE_DEFINITIONS = {
  birth_team_mismatch: {
    category: 'engine',
    title: 'פער מול חישוב המנוע',
    explanation: 'החישוב הנוכחי של המנוע שונה מהמצב ששמור במסמך הקבוצה.',
    impact: 'ה-Computed State השמור עלול להיות ישן ביחס לקוד הנוכחי.',
  },
  missing_player_document: {
    category: 'sync',
    title: 'מסמך שחקן חסר',
    explanation: 'השחקן מזוהה ככזה שדורש מעקב, אבל אין עבורו מסמך שחקן מרכזי.',
    impact: 'היסטוריה, בדיקה מקצועית והחלטות ידניות לא יכולות להישמר במקום המרכזי של השחקן.',
  },
  player_document_mismatch: {
    category: 'sync',
    title: 'מסמך השחקן לא מסונכרן',
    explanation: 'המידע במסמך השחקן אינו תואם למידע הקנוני של הקבוצה והעונה.',
    impact: 'עמוד השחקן והיסטוריית הסקאוטינג עלולים להציג מידע ישן.',
  },
  missing_search_index: {
    category: 'sync',
    title: 'אינדקס חיפוש חסר',
    explanation: 'לשחקן או לקבוצה חסרה רשומה באינדקס החיפוש.',
    impact: 'הישות עלולה לא להופיע בחיפוש או להופיע ללא מצב הסקאוטינג הנוכחי.',
  },
  search_index_mismatch: {
    category: 'sync',
    title: 'אינדקס החיפוש לא מעודכן',
    explanation: 'אינדקס החיפוש אינו משקף את המידע המרכזי של הקבוצה או השחקן.',
    impact: 'תוצאות החיפוש עלולות להציג נתונים ישנים.',
  },
  missing_team_performance_context: {
    category: 'sync',
    title: 'חסר הקשר ביצועי קבוצה',
    explanation: 'במסמך השחקן חסר חלק מההקשר המקצועי של הקבוצה והעונה.',
    impact: 'הסיפור המקצועי והקשר הביצועים של השחקן עלולים להיות חלקיים.',
  },
  current_season_status_invalid: {
    category: 'sync',
    title: 'סטטוס העונה הנוכחית לא תקין',
    explanation: 'סטטוס העונה הפעילה חסר או אינו תואם לחוזה הנתונים.',
    impact: 'לוגיקה שתלויה בעונה פעילה או שהסתיימה עלולה להתנהג לא נכון.',
  },
  history_season_status_invalid: {
    category: 'sync',
    title: 'סטטוס עונת עבר לא תקין',
    explanation: 'סטטוס של עונה היסטורית אינו תואם לחוזה הנתונים.',
    impact: 'חישובי היסטוריה, persistence או decay עלולים לקבל הקשר עונה שגוי.',
  },
  player_season_context_outdated: {
    category: 'sync',
    title: 'הקשר העונה של השחקן לא מסונכרן',
    explanation: 'פרטי הקבוצה, הליגה או ביצועי הקבוצה בעונת השחקן אינם מעודכנים.',
    impact: 'היסטוריית הקריירה והקשר הסקאוטינג עלולים להציג מידע ישן.',
  },
  team_player_state_outdated: {
    category: 'engine',
    title: 'מצב הסקאוטינג בקבוצה מיושן',
    explanation: 'מצב הסקאוטינג המחושב במסמך הקבוצה אינו תואם לחישוב הנוכחי.',
    impact: 'הפרופיל או מצב ההזדמנות המוצגים מהקבוצה עלולים להיות ישנים.',
  },
  team_scout_state_mismatch: {
    category: 'engine',
    title: 'מצב מנוע בקבוצה לא מעודכן',
    explanation: 'המנוע מחשב מצב סקאוטינג שונה מהמצב ששמור בקבוצה.',
    impact: 'נדרש Refresh ממוקד של מצב המנוע.',
  },
  player_scout_state_mismatch: {
    category: 'engine',
    title: 'מצב מנוע במסמך השחקן לא מעודכן',
    explanation: 'המנוע מחשב מצב סקאוטינג שונה מהמצב ששמור במסמך השחקן.',
    impact: 'עמוד השחקן עלול להציג מצב מחושב ישן עד לרענון.',
  },
  search_index_scout_projection_mismatch: {
    category: 'sync',
    title: 'מצב הסקאוטינג בחיפוש לא מעודכן',
    explanation: 'מצב הסקאוטינג באינדקס החיפוש אינו תואם למצב המרכזי.',
    impact: 'החיפוש עלול להציג פרופיל, חוזק פרופיל או מידיות שאינם מעודכנים.',
  },
  team_stats_measurement_outdated: {
    category: 'sync',
    title: 'מדידת הסטטיסטיקה בקבוצה לא מסונכרנת',
    explanation: 'שתי מדידות הסטטיסטיקה האחרונות אינן תואמות למצב העונה.',
    impact: 'מגמת השיפור בין טעינות עלולה להישען על נקודת השוואה לא נכונה.',
  },
  player_measurement_history_outdated: {
    category: 'sync',
    title: 'היסטוריית המדידות של השחקן לא מסונכרנת',
    explanation: 'היסטוריית המדידות במסמך השחקן אינה תואמת למדידות הקבוצה.',
    impact: 'מגמות והיסטוריית התקדמות עלולות להיות חסרות או ישנות.',
  },
  player_tracking_mismatch: {
    category: 'sync',
    title: 'סיבות המעקב לא מסונכרנות',
    explanation: 'סיבות המעקב של השחקן אינן תואמות לסיבות שבגללן מסמך השחקן צריך להתקיים.',
    impact: 'המערכת עלולה לשמור או להסיר את מסמך השחקן בזמן לא נכון.',
  },
  player_season_status_mismatch: {
    category: 'sync',
    title: 'סטטוס העונה במסמך השחקן לא מסונכרן',
    explanation: 'סטטוס העונה במסמך השחקן שונה מהסטטוס המרכזי.',
    impact: 'לוגיקה היסטורית עלולה לפרש את העונה באופן שגוי.',
  },
  search_index_season_status_mismatch: {
    category: 'sync',
    title: 'סטטוס העונה בחיפוש לא מסונכרן',
    explanation: 'אינדקס החיפוש מחזיק סטטוס עונה שונה מהמצב המרכזי.',
    impact: 'פילטרים ותצוגות חיפוש עלולים לסווג את העונה לא נכון.',
  },
  player_schema_outdated: {
    category: 'schema',
    title: 'מבנה מסמך השחקן מיושן',
    explanation: 'מסמך השחקן חסר שדות נדרשים או אינו תואם למבנה הנתונים הנוכחי.',
    impact: 'קוד חדש עלול לקבל מסמך חלקי או ישן.',
  },
  team_player_schema_outdated: {
    category: 'schema',
    title: 'מבנה השחקן במסמך הקבוצה מיושן',
    explanation: 'מבנה השחקן בתוך מסמך הקבוצה אינו תואם למבנה הנתונים הנוכחי.',
    impact: 'טעינה וחישוב עתידיים עלולים לפעול מול מבנה ישן.',
  },
  search_index_schema_outdated: {
    category: 'schema',
    title: 'מבנה אינדקס החיפוש מיושן',
    explanation: 'מסמך האינדקס חסר שדות נדרשים או מכיל מבנה ישן.',
    impact: 'החיפוש עלול להציג מידע שאינו תואם למבנה הנתונים הנוכחי.',
  },
  player_narrative_schema_invalid: {
    category: 'schema',
    title: 'מבנה סיפור השחקן לא תקין',
    explanation: 'סיפור השחקן אינו תואם למבנה שנדרש על ידי שכבת הבינה המלאכותית.',
    impact: 'הסיפור עלול לא להיטען או לא לעבור עריכה ואישור בצורה תקינה.',
  },
  birth_team_reliability_mismatch: {
    category: 'schema',
    title: 'שדה ישן נשאר במסמך הקבוצה',
    explanation: 'נמצא פער בשדה רמת הוודאות הישן שאינו חלק מהחוזה הפעיל.',
    impact: 'זהו סימן למבנה ישן שדורש ניקוי או דיווח.',
  },
  player_document_reliability_mismatch: {
    category: 'schema',
    title: 'שדה ישן נשאר במסמך השחקן',
    explanation: 'נמצא פער בשדה רמת הוודאות הישן שאינו חלק מהחוזה הפעיל.',
    impact: 'זהו סימן למבנה ישן שדורש ניקוי או דיווח.',
  },
  search_index_reliability_mismatch: {
    category: 'schema',
    title: 'שדה ישן נשאר באינדקס החיפוש',
    explanation: 'נמצא פער בשדה רמת הוודאות הישן שאינו חלק מהחוזה הפעיל.',
    impact: 'זהו סימן ל-מבנה אינדקס ישן שדורש ניקוי או דיווח.',
  },
}

const FALLBACK_DEFINITION = {
  category: 'sync',
  title: 'פער נתונים',
  explanation: 'האודיט מצא חוסר התאמה בין הנתונים השמורים לבין החוזה הנוכחי.',
  impact: 'יש לפתוח את הפירוט הטכני כדי להבין את מקור הפער.',
}

export function getPlayerScoutIssueDefinition(type) {
  return ISSUE_DEFINITIONS[type] || FALLBACK_DEFINITION
}

const COLLECTION_DEFINITIONS = [
  { id: 'teams', title: 'מסמכי קבוצות', keys: ['dbBirthTeams'] },
  { id: 'players', title: 'מסמכי שחקנים', keys: ['dbPlayers'] },
  { id: 'search', title: 'אינדקס החיפוש', keys: ['dbSearchIndexes'] },
]

function resolveIssueCollection(issue) {
  const candidates = [
    issue?.source,
    issue?.collection,
    issue?.sourceCollection,
    issue?.targetCollection,
  ].map(value => String(value || '').trim())

  return COLLECTION_DEFINITIONS.find(definition => (
    definition.keys.some(key => candidates.includes(key))
  ))?.id || ''
}

export function buildPlayerScoutCollectionHealth({ issues = [], auditCost = {} }) {
  const observed = auditCost.documentsObserved || {}
  const checkedById = {
    teams: Number(observed.teamDocuments || 0),
    players: Number(observed.playerDocuments || 0),
    search: Number(observed.playerSearchIndexes || 0) + Number(observed.teamSearchIndexes || 0),
  }

  const issuesById = issues.reduce((counts, issue) => {
    const definition = getPlayerScoutIssueDefinition(String(issue?.type || '').trim())
    const shouldCount = issue?.repairable !== false || definition.category === 'engine'
    if (!shouldCount) return counts

    const collectionId = resolveIssueCollection(issue)
    if (!collectionId) return counts

    counts[collectionId] = (counts[collectionId] || 0) + 1
    return counts
  }, {})

  return COLLECTION_DEFINITIONS.map(definition => ({
    ...definition,
    checked: checkedById[definition.id] || 0,
    issues: issuesById[definition.id] || 0,
  }))
}

export function buildPlayerScoutHealthSummary({ issues = [], summary = {} }) {
  const issueCounts = issues.reduce((counts, issue) => {
    const type = String(issue?.type || '').trim()
    if (!type) return counts

    const definition = getPlayerScoutIssueDefinition(type)
    const shouldShow = issue?.repairable !== false || definition.category === 'engine'
    if (!shouldShow) return counts

    counts[type] = (counts[type] || 0) + 1
    return counts
  }, {})

  const groupedIssues = HEALTH_CATEGORY_ORDER.map(categoryId => {
    const category = HEALTH_CATEGORIES[categoryId]
    const entries = Object.entries(issueCounts)
      .map(([type, count]) => ({
        type,
        count,
        ...getPlayerScoutIssueDefinition(type),
      }))
      .filter(item => item.category === categoryId)
      .sort((first, second) => second.count - first.count)

    return {
      ...category,
      count: entries.reduce((sum, item) => sum + item.count, 0),
      entries,
    }
  })

  const repairableCount = Number(summary.repairableIssuesCount || 0)
  const engineCount = Number(summary.engineDiagnosticIssuesCount || 0)
  const attentionCount = repairableCount + engineCount

  return {
    attentionCount,
    repairableCount,
    engineCount,
    syncCount: Number(summary.syncIssuesCount || 0),
    schemaCount: Number(summary.schemaAutoRepairIssuesCount || 0),
    reportOnlyCount: Number(summary.schemaReportOnlyIssuesCount || 0),
    isHealthy: attentionCount === 0,
    groups: groupedIssues.filter(group => group.count > 0),
  }
}
