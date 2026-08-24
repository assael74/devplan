// src/features/playersDatabase/ui/components/modals/playerScoutAuditHealth.model.js

const HEALTH_CATEGORY_ORDER = ['sync', 'schema', 'scoutState']

const HEALTH_CATEGORIES = {
  sync: {
    id: 'sync',
    title: 'פערי התאמה בין מסמכים',
    description: 'אותו מידע אינו תואם בין מסמך הקבוצה, מסמך השחקן או אינדקס החיפוש.',
    impact: 'מסכים שונים עלולים להציג מצב שונה או להסתמך על מידע שאינו מעודכן.',
    tone: 'warning',
  },
  schema: {
    id: 'schema',
    title: 'פערים במבנה המסמך',
    description: 'מסמך אינו תואם למבנה הנתונים הנוכחי שהמערכת מצפה לקבל.',
    impact: 'שדות נדרשים עלולים להיות חסרים או ששדות ישנים עלולים להישאר במסמך.',
    tone: 'warning',
  },
  scoutState: {
    id: 'scoutState',
    title: 'מצב סקאוטינג לא מעודכן',
    description: 'החישוב הנוכחי של מודל הסקאוט שונה מהמצב המחושב ששמור במסמכים.',
    impact: 'המידע המחושב שמוצג למשתמש עלול להיות ישן עד לרענון ממוקד.',
    tone: 'neutral',
  },
}

const ISSUE_DEFINITIONS = {
  birth_team_mismatch: {
    category: 'scoutState',
    title: 'מצב הסקאוטינג בקבוצה אינו מעודכן',
    explanation: 'החישוב הנוכחי שונה מהמצב ששמור במסמך הקבוצה.',
    impact: 'הפרופיל או מצב הסקאוטינג בקבוצה עלולים להיות ישנים.',
  },
  missing_player_document: {
    category: 'sync',
    title: 'מסמך שחקן חסר',
    explanation: 'לפי מצב השחקן אמור להיות מסמך שחקן, אך המסמך אינו קיים.',
    impact: 'היסטוריה ומידע שנשמר ברמת השחקן עלולים להיות חסרים.',
  },
  player_document_mismatch: {
    category: 'sync',
    title: 'מסמך השחקן אינו תואם למקור',
    explanation: 'המידע במסמך השחקן אינו תואם למידע הקנוני של הקבוצה והעונה.',
    impact: 'עמוד השחקן והיסטוריית הסקאוטינג עלולים להציג מידע ישן.',
  },
  missing_search_index: {
    category: 'sync',
    title: 'מסמך חיפוש חסר',
    explanation: 'לשחקן או לקבוצה חסרה רשומה באינדקס החיפוש.',
    impact: 'השחקן או הקבוצה עלולים לא להופיע בחיפוש או להופיע באופן חלקי.',
  },
  search_index_mismatch: {
    category: 'sync',
    title: 'מסמך החיפוש אינו מעודכן',
    explanation: 'אינדקס החיפוש אינו משקף את המידע הקנוני של הקבוצה או השחקן.',
    impact: 'תוצאות החיפוש עלולות להציג נתונים ישנים.',
  },
  missing_team_performance_context: {
    category: 'sync',
    title: 'חסר הקשר ביצועי קבוצה',
    explanation: 'במסמך השחקן חסר חלק מההקשר המקצועי של הקבוצה והעונה.',
    impact: 'ההקשר המקצועי של השחקן עלול להיות חלקי.',
  },
  current_season_status_invalid: {
    category: 'sync',
    title: 'מצב העונה הנוכחית אינו תקין',
    explanation: 'מצב העונה הפעילה חסר או אינו תואם למבנה הנתונים הנוכחי.',
    impact: 'לוגיקה שתלויה בעונה פעילה או שהסתיימה עלולה לפעול באופן שגוי.',
  },
  history_season_status_invalid: {
    category: 'sync',
    title: 'מצב עונת עבר אינו תקין',
    explanation: 'מצב של עונה היסטורית אינו תואם למבנה הנתונים הנוכחי.',
    impact: 'חישובי היסטוריה עלולים לקבל הקשר עונה שגוי.',
  },
  player_season_context_outdated: {
    category: 'sync',
    title: 'הקשר העונה במסמך השחקן אינו מעודכן',
    explanation: 'פרטי הקבוצה, הליגה או ביצועי הקבוצה בעונת השחקן אינם מעודכנים.',
    impact: 'היסטוריית הקריירה והקשר הסקאוטינג עלולים להציג מידע ישן.',
  },
  team_player_state_outdated: {
    category: 'scoutState',
    title: 'מצב הסקאוטינג של השחקן בקבוצה מיושן',
    explanation: 'מצב הסקאוטינג המחושב במסמך הקבוצה אינו תואם לחישוב הנוכחי.',
    impact: 'הפרופיל או מצב ההזדמנות המוצגים מהקבוצה עלולים להיות ישנים.',
  },
  team_scout_state_mismatch: {
    category: 'scoutState',
    title: 'מצב הסקאוטינג בקבוצה אינו מעודכן',
    explanation: 'מודל הסקאוט מחשב מצב שונה מהמצב ששמור בקבוצה.',
    impact: 'נדרש רענון ממוקד של המצב המחושב.',
  },
  player_scout_state_mismatch: {
    category: 'scoutState',
    title: 'מצב הסקאוטינג במסמך השחקן אינו מעודכן',
    explanation: 'מודל הסקאוט מחשב מצב שונה מהמצב ששמור במסמך השחקן.',
    impact: 'עמוד השחקן עלול להציג מצב מחושב ישן עד לרענון.',
  },
  search_index_scout_projection_mismatch: {
    category: 'sync',
    title: 'מצב הסקאוטינג בחיפוש אינו מעודכן',
    explanation: 'מצב הסקאוטינג באינדקס החיפוש אינו תואם למצב הקנוני.',
    impact: 'החיפוש עלול להציג פרופיל או מצב שאינם מעודכנים.',
  },
  team_stats_measurement_outdated: {
    category: 'sync',
    title: 'מדידת הסטטיסטיקה בקבוצה אינה מסונכרנת',
    explanation: 'מדידות הסטטיסטיקה האחרונות אינן תואמות למצב העונה.',
    impact: 'מגמת השיפור עלולה להישען על נקודת השוואה לא נכונה.',
  },
  player_measurement_history_outdated: {
    category: 'sync',
    title: 'היסטוריית המדידות של השחקן אינה מסונכרנת',
    explanation: 'היסטוריית המדידות במסמך השחקן אינה תואמת למדידות הקבוצה.',
    impact: 'מגמות והיסטוריית התקדמות עלולות להיות חסרות או ישנות.',
  },
  player_tracking_mismatch: {
    category: 'sync',
    title: 'סיבות שמירת מסמך השחקן אינן מסונכרנות',
    explanation: 'סיבות השמירה במסמך השחקן אינן תואמות למצב שמצדיק את קיומו.',
    impact: 'המערכת עלולה לשמור או להסיר מסמך שחקן בזמן לא נכון.',
  },
  player_season_status_mismatch: {
    category: 'sync',
    title: 'מצב העונה במסמך השחקן אינו מסונכרן',
    explanation: 'מצב העונה במסמך השחקן שונה מהמצב הקנוני.',
    impact: 'היסטוריית השחקן עלולה לפרש את העונה באופן שגוי.',
  },
  search_index_season_status_mismatch: {
    category: 'sync',
    title: 'מצב העונה בחיפוש אינו מסונכרן',
    explanation: 'אינדקס החיפוש מחזיק מצב עונה שונה מהמצב הקנוני.',
    impact: 'סינון ותצוגות חיפוש עלולים לסווג את העונה לא נכון.',
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
    title: 'מבנה מסמך החיפוש מיושן',
    explanation: 'מסמך החיפוש חסר שדות נדרשים או מכיל מבנה ישן.',
    impact: 'החיפוש עלול להציג מידע שאינו תואם למבנה הנתונים הנוכחי.',
  },
  player_narrative_schema_invalid: {
    category: 'schema',
    title: 'מבנה סיפור השחקן אינו תקין',
    explanation: 'סיפור השחקן אינו תואם למבנה שהמערכת מצפה לקבל.',
    impact: 'הסיפור עלול לא להיטען או לא לעבור עריכה ואישור בצורה תקינה.',
  },
  birth_team_reliability_mismatch: {
    category: 'schema',
    title: 'שדה ישן נשאר במסמך הקבוצה',
    explanation: 'נמצא שדה ישן שאינו חלק מהמבנה הפעיל.',
    impact: 'זהו סימן למבנה ישן שדורש ניקוי או דיווח.',
  },
  player_document_reliability_mismatch: {
    category: 'schema',
    title: 'שדה ישן נשאר במסמך השחקן',
    explanation: 'נמצא שדה ישן שאינו חלק מהמבנה הפעיל.',
    impact: 'זהו סימן למבנה ישן שדורש ניקוי או דיווח.',
  },
  search_index_reliability_mismatch: {
    category: 'schema',
    title: 'שדה ישן נשאר במסמך החיפוש',
    explanation: 'נמצא שדה ישן שאינו חלק מהמבנה הפעיל.',
    impact: 'זהו סימן למבנה ישן שדורש ניקוי או דיווח.',
  },
}

const FALLBACK_DEFINITION = {
  category: 'sync',
  title: 'פער נתונים',
  explanation: 'נמצא חוסר התאמה בין הנתונים השמורים לבין המצב שהמערכת מצפה לקבל.',
  impact: 'יש לפתוח את הפירוט כדי להבין את מקור הפער.',
}

export function getPlayerScoutIssueDefinition(type) {
  return ISSUE_DEFINITIONS[type] || FALLBACK_DEFINITION
}

const COLLECTION_DEFINITIONS = [
  {
    id: 'teams',
    title: 'מסמכי קבוצות',
    collectionName: 'dbBirthTeams',
    keys: ['dbBirthTeams'],
  },
  {
    id: 'players',
    title: 'מסמכי שחקנים',
    collectionName: 'dbPlayers',
    keys: ['dbPlayers'],
  },
  {
    id: 'search',
    title: 'מסמכי חיפוש',
    collectionName: 'dbSearchIndexes',
    keys: ['dbSearchIndexes'],
  },
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

function resolveIssueDocumentKey(issue, collectionId) {
  if (collectionId === 'teams') {
    return String(
      issue?.teamDocumentId ||
      issue?.birthTeamDocumentId ||
      issue?.birthTeamId ||
      ''
    ).trim()
  }

  if (collectionId === 'players') {
    return String(issue?.playerDocumentId || '').trim()
  }

  if (collectionId === 'search') {
    const directDocumentId = String(
      issue?.searchIndexDocumentId ||
      issue?.documentId ||
      issue?.searchDocumentId ||
      ''
    ).trim()
    if (directDocumentId) return directDocumentId

    const entityId = String(
      issue?.playerId ||
      issue?.teamDocumentId ||
      issue?.birthTeamDocumentId ||
      ''
    ).trim()
    const seasonKey = String(issue?.seasonKey || issue?.seasonId || '').trim()

    return entityId ? `search:${entityId}:${seasonKey}` : ''
  }

  return ''
}

function resolveMissingDocumentKey(issue, collectionId) {
  const type = String(issue?.type || '').trim()

  if (collectionId === 'players' && type === 'missing_player_document') {
    return [
      'player',
      issue?.playerId,
    ].map(value => String(value || '').trim()).join(':')
  }

  if (collectionId === 'search' && type === 'missing_search_index') {
    return [
      'search',
      issue?.playerId || issue?.teamDocumentId || issue?.birthTeamDocumentId,
      issue?.seasonKey || issue?.seasonId,
    ].map(value => String(value || '').trim()).join(':')
  }

  return ''
}

function shouldIncludeIssue(issue) {
  return Boolean(String(issue?.type || '').trim())
}

export function buildPlayerScoutCollectionHealth({ issues = [], auditCost = {} }) {
  const observed = auditCost.documentsObserved || {}
  const checkedById = {
    teams: Number(observed.teamDocuments || 0),
    players: Number(observed.playerDocuments || 0),
    search: Number(observed.playerSearchIndexes || 0) + Number(observed.teamSearchIndexes || 0),
  }

  const stateById = COLLECTION_DEFINITIONS.reduce((result, definition) => {
    result[definition.id] = {
      affectedDocuments: new Set(),
      missingDocuments: new Set(),
      issueCounts: {},
      issuesCount: 0,
    }
    return result
  }, {})

  issues.forEach(issue => {
    if (!shouldIncludeIssue(issue)) return

    const collectionId = resolveIssueCollection(issue)
    if (!collectionId || !stateById[collectionId]) return

    const state = stateById[collectionId]
    const type = String(issue?.type || '').trim()
    const missingKey = resolveMissingDocumentKey(issue, collectionId)
    const documentKey = resolveIssueDocumentKey(issue, collectionId)

    state.issuesCount += 1
    state.issueCounts[type] = (state.issueCounts[type] || 0) + 1

    if (missingKey) {
      state.missingDocuments.add(missingKey)
    } else if (documentKey) {
      state.affectedDocuments.add(documentKey)
    }
  })

  return COLLECTION_DEFINITIONS.map(definition => {
    const state = stateById[definition.id]
    const checked = checkedById[definition.id] || 0
    const affected = Math.min(checked, state.affectedDocuments.size)
    const exact = Math.max(0, checked - affected)
    const missing = state.missingDocuments.size
    const denominator = checked + missing
    const exactRate = denominator
      ? Math.round((exact / denominator) * 100)
      : 100
    const issueEntries = Object.entries(state.issueCounts)
      .map(([type, count]) => ({
        type,
        count,
        ...getPlayerScoutIssueDefinition(type),
      }))
      .sort((left, right) => right.count - left.count)

    return {
      ...definition,
      checked,
      exact,
      exactRate,
      affected,
      missing,
      issues: state.issuesCount,
      issueEntries,
    }
  })
}

export function buildPlayerScoutHealthSummary({
  issues = [],
  summary = {},
  collectionHealth = [],
}) {
  const issueCounts = issues.reduce((counts, issue) => {
    const type = String(issue?.type || '').trim()
    if (!type || !shouldIncludeIssue(issue)) return counts

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

  const checkedDocuments = collectionHealth.reduce(
    (sum, item) => sum + Number(item.checked || 0),
    0
  )
  const exactDocuments = collectionHealth.reduce(
    (sum, item) => sum + Number(item.exact || 0),
    0
  )
  const missingDocuments = collectionHealth.reduce(
    (sum, item) => sum + Number(item.missing || 0),
    0
  )
  const affectedDocuments = collectionHealth.reduce(
    (sum, item) => sum + Number(item.affected || 0),
    0
  )
  const denominator = checkedDocuments + missingDocuments
  const exactRate = denominator
    ? Math.round((exactDocuments / denominator) * 100)
    : 100
  const repairableCount = Number(summary.repairableIssuesCount || 0)
  const scoutStateCount = Number(summary.engineDiagnosticIssuesCount || 0)
  const reviewCount = issues.filter(issue => (
    issue?.repairable === false &&
    getPlayerScoutIssueDefinition(String(issue?.type || '').trim()).category !== 'scoutState'
  )).length
  const attentionCount = Object.values(issueCounts).reduce(
    (sum, count) => sum + Number(count || 0),
    0
  )

  return {
    attentionCount,
    repairableCount,
    engineCount: scoutStateCount,
    syncCount: Number(summary.syncIssuesCount || 0),
    schemaCount: Number(summary.schemaAutoRepairIssuesCount || 0),
    reportOnlyCount: Number(summary.schemaReportOnlyIssuesCount || 0),
    reviewCount,
    checkedDocuments,
    exactDocuments,
    exactRate,
    affectedDocuments,
    missingDocuments,
    isHealthy: attentionCount === 0,
    groups: groupedIssues.filter(group => group.count > 0),
  }
}
