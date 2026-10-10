// src/features/playersDatabase/ui/pages/DataOpsPage/logic/systemAuditFindings.presentation.js

const hasOwn = (value, key) => (
  value && typeof value === 'object' && Object.prototype.hasOwnProperty.call(value, key)
)

const normalizeForComparison = value => {
  if (Array.isArray(value)) return value.map(normalizeForComparison)
  if (!value || typeof value !== 'object') return value

  return Object.keys(value)
    .sort()
    .reduce((normalized, key) => ({
      ...normalized,
      [key]: normalizeForComparison(value[key]),
    }), {})
}

export const areFindingValuesEquivalent = finding => {
  if (!hasOwn(finding, 'expected') || !hasOwn(finding, 'actual')) return false
  return JSON.stringify(normalizeForComparison(finding.expected))
    === JSON.stringify(normalizeForComparison(finding.actual))
}

export const getFindingDisplayImpact = finding => {
  if (areFindingValuesEquivalent(finding)) {
    return {
      tone: 'neutral',
      label: 'ללא השפעה',
      text: 'הערכים זהים. הממצא נוצר רק בגלל סדר שדות שונה ואינו משנה את התצוגה.',
    }
  }

  if (finding.target === 'playerSeasons') {
    return {
      tone: 'warning',
      label: 'עונת שחקן',
      text: 'שיוך הקבוצה עלול להיות חסר או שגוי בפרופיל השחקן ובהיסטוריית העונות שלו.',
    }
  }

  if (finding.target === 'clubsCenter') {
    const isSeasonIdentity = String(finding.title || '').includes('זהות העונה')
    return isSeasonIdentity
      ? {
        tone: 'warning',
        label: 'מרכז המועדונים',
        text: 'סטטוס העונה או פרטי העונה במרכז המועדונים עלולים להיות מוצגים באופן שגוי.',
      }
      : {
        tone: 'warning',
        label: 'מרכז המועדונים',
        text: 'נתוני הקבוצה במרכז המועדונים עלולים להיות ישנים, למשל דירוג, נקודות, רמה או מעברים.',
      }
  }

  if (finding.target === 'leaguesCenter') {
    return {
      tone: 'warning',
      label: 'מרכז הליגות',
      text: 'שם הליגה, האזור, קבוצת הגיל או הרמה עלולים להיות מוצגים באופן שגוי במרכז הליגות.',
    }
  }

  if (finding.target === 'playerSearchIndexes') {
    return {
      tone: 'warning',
      label: 'חיפוש שחקנים',
      text: 'השחקן עלול לא להופיע בחיפוש, להופיע פעמיים או להציג פרטי חיפוש ישנים.',
    }
  }

  return {
    tone: 'warning',
    label: 'השפעה אפשרית',
    text: 'מסך שקורא את המסמך הזה עלול להציג מידע חסר או לא מעודכן.',
  }
}
