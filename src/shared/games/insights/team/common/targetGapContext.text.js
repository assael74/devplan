// shared/games/insights/team/common/targetGapContext.text.js

const CONTEXT_LABELS = {
  forecast: 'תחזית',
  homeAway: 'בית / חוץ',
  difficulty: 'רמת יריבה',
  squad: 'סגל',
  squadAttack: 'מעורבות התקפית',
  squadLineup: 'יציבות הרכב',
  squadIntegration: 'שילוב שחקנים',
}

const getContextLabel = (context) => {
  return CONTEXT_LABELS[context] || 'המדד'
}

export function getTargetGapContextTone(targetGap) {
  if (targetGap?.isBelowTarget) return 'warning'
  if (targetGap?.isAboveTarget) return 'success'
  if (targetGap?.isOnTarget) return 'primary'

  return 'neutral'
}

export function buildTargetGapContextText(targetGap, context) {
  if (!targetGap || targetGap.relation === 'unknown') return ''

  const contextLabel = getContextLabel(context)

  if (targetGap.isBelowTarget) {
    return `הקבוצה מתחת ליעד הכללי, ולכן ${contextLabel} צריך להיבחן כמוקד אפשרי לשיפור קצב הביצוע.`
  }

  if (targetGap.isAboveTarget) {
    return `הקבוצה מעל היעד הכללי, ולכן ${contextLabel} צריך להיבחן דרך היכולת לשמר את היתרון ולא רק דרך התוצאה הנוכחית.`
  }

  if (targetGap.isOnTarget) {
    return `הקבוצה בתוך יעד הביצוע הכללי, ולכן ${contextLabel} צריך להיבחן דרך השפעתו על שימור הקצב.`
  }

  return ''
}

export function buildTargetGapContextItem(targetGap, context) {
  const text = buildTargetGapContextText(targetGap, context)

  if (!text) return null

  return {
    id: 'target_context',
    type: 'context',
    label: 'הקשר יעד',
    tone: getTargetGapContextTone(targetGap),
    text,
  }
}
