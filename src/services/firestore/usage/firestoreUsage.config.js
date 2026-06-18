// src/services/firestore/usage/firestoreUsage.config.js

export const FIRESTORE_USAGE_CONFIG = {
  enabled: true,

  // כרגע לא כותבים לפיירסטור — רק מודדים בזיכרון
  persistEnabled: false,

  // שימושי לפיתוח
  consoleEnabled: false,

  maxRecentEntries: 200,
  maxExpensiveActions: 20,
  expensiveActionKbThreshold: 250,
}
