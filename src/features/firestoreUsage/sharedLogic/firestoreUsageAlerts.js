// src/features/firestoreUsage/sharedLogic/firestoreUsageAlerts.js

import { FIRESTORE_USAGE_THRESHOLDS, resolveUsageStatus } from './firestoreUsageThresholds.js'

export function buildFirestoreUsageAlerts(viewModel) {
  const alerts = []
  const { totals, collections, expensiveActions } = viewModel

  if (totals.failures > 0) {
    alerts.push({
      id: 'failures',
      color: 'danger',
      title: 'נרשמו פעולות שנכשלו',
      description: `${totals.failures} שגיאות נרשמו בסשן. פרטי השגיאות זמינים בקובץ JSON.`,
    })
  }

  const heavyStatus = expensiveActions.some(action => action.risk === 'danger')
    ? 'danger'
    : expensiveActions.some(action => action.risk === 'warning') ? 'warning' : 'normal'

  if (heavyStatus !== 'normal') {
    alerts.push({
      id: 'expensive-actions',
      color: heavyStatus,
      title: 'נמדדו פעולות עם נפח נתונים גדול',
      description: `${expensiveActions.length} פעולות ברשימה. החומרה נקבעת לפי גודל הפעולה הבודדת, באותו סף כמו בטבלה.`,
      note: 'זהו סף לבדיקת ביצועים, ולא מגבלת גודל מסמך או התראת חיוב.',
    })
  }

  const listenerStatus = resolveUsageStatus(totals.listenerUpdates, FIRESTORE_USAGE_THRESHOLDS.listenerUpdates)
  if (listenerStatus !== 'normal') {
    alerts.push({
      id: 'listeners',
      color: listenerStatus,
      title: 'כמות גבוהה של עדכוני האזנה מהשרת',
      description: `${totals.listenerUpdates} עדכונים נרשמו, ללא טעינות ראשוניות ואירועי מטמון.`,
    })
  }

  const collection = collections.reduce((heaviest, row) => (
    row.estimatedReadKb > (heaviest?.estimatedReadKb || 0) ? row : heaviest
  ), null)
  if (collection) {
    alerts.push({
      id: 'top-collection',
      color: 'primary',
      title: `${collection.name} הוא מקור נפח הקריאה הגדול ביותר בסשן`,
      description: 'הנפח מצטבר לאורך הסשן ואינו מעיד בפני עצמו על פעולה חריגה.',
      metrics: [
        { label: 'קריאות שרת שנמדדו', value: collection.reads.toLocaleString('he-IL') },
        { label: 'נפח קריאה משוער', value: `${collection.estimatedReadKb.toFixed(2)} KB` },
      ],
      note: 'האומדן מבוסס על נתונים שהתקבלו באפליקציה; הוא אינו מדידת תעבורה או חיוב רשמית.',
    })
  }

  if (alerts.length === 0) {
    alerts.push({
      id: 'healthy',
      color: 'success',
      title: 'לא זוהו חריגות במדידה',
      description: totals.cacheReads > 0
        ? 'נמדדו אירועי מטמון. הם מוצגים בנפרד מקריאות השרת.'
        : 'לא נמדדו פעולות שחצו את ספי ההתראה בסשן הנוכחי.',
    })
  }

  return alerts.slice(0, 4)
}
