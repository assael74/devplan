// shared/games/insights/team/sections/homeAway/homeAway.texts.js

import {
  formatNumber,
  formatPercent,
} from '../../common/index.js'

import {
  getBetterSide,
  hasHomeAwaySystemicRisk,
  hasStrongHomeAwayProfile,
} from './homeAway.rules.js'

export function buildHomeAwayStateText(metrics) {
  if (!metrics.hasHomeData && !metrics.hasAwayData) {
    return 'אין מספיק נתוני משחקים כדי לבנות תמונת בית / חוץ.'
  }

  if (!metrics.hasHomeData) {
    return `קיימים נתוני חוץ בלבד, עם קצב צבירת נקודות של ${formatPercent(
      metrics.away.pointsRate
    )}.`
  }

  if (!metrics.hasAwayData) {
    return `קיימים נתוני בית בלבד, עם קצב צבירת נקודות של ${formatPercent(
      metrics.home.pointsRate
    )}.`
  }

  return `הקבוצה צוברת ${formatPercent(
    metrics.home.pointsRate
  )} מהנקודות בבית לעומת ${formatPercent(
    metrics.away.pointsRate
  )} בחוץ, פער של ${formatNumber(metrics.absGap, 1)} נקודות אחוז.`
}

export function buildHomeAwayAdvantageText(metrics, evaluationState) {
  const betterSide = getBetterSide(metrics, evaluationState)
  const targetLabel = evaluationState.targetLabel
  const evaluation = evaluationState.evaluation

  if (hasStrongHomeAwayProfile(evaluationState)) {
    return targetLabel
      ? `הקבוצה עומדת בפרופיל בית / חוץ חיובי ביחס ל${targetLabel}: בסיס ביתי חזק, תחרותיות בחוץ ופער מאוזן.`
      : 'הקבוצה מציגה פרופיל בית / חוץ חיובי: בסיס ביתי חזק, תחרותיות בחוץ ופער מאוזן.'
  }

  if (evaluation.away.isGreen) {
    return targetLabel
      ? `אחוז ההצלחה בחוץ גבוה ביחס ל${targetLabel}, וזה סימן לבגרות תחרותית וליכולת לקחת נקודות גם בתנאים פחות נוחים.`
      : 'אחוז ההצלחה בחוץ גבוה, וזה סימן לבגרות תחרותית וליכולת לקחת נקודות גם בתנאים פחות נוחים.'
  }

  if (evaluation.home.isGreen) {
    return targetLabel
      ? `משחקי הבית מייצרים בסיס נקודות חזק ביחס ל${targetLabel}.`
      : 'משחקי הבית מייצרים בסיס נקודות חזק.'
  }

  if (betterSide === 'balanced' && metrics.hasHomeData && metrics.hasAwayData) {
    return 'אין כרגע פער חריג בין משחקי בית למשחקי חוץ, וזה מצביע על איזון יחסי.'
  }

  return ''
}

export function buildHomeAwayRecommendationText(metrics, evaluationState) {
  const betterSide = getBetterSide(metrics, evaluationState)
  const targetLabel = evaluationState.targetLabel
  const evaluation = evaluationState.evaluation

  if (!metrics.hasAnyData) return ''

  if (!evaluationState.hasEnoughData && metrics.hasHomeData && metrics.hasAwayData) {
    return 'מומלץ להתייחס לפילוח בית / חוץ בזהירות עד שיצטברו עוד משחקים בכל אחד מהמצבים.'
  }

  if (hasHomeAwaySystemicRisk(evaluationState)) {
    return targetLabel
      ? `גם הבית וגם החוץ נמצאים מתחת לסף האדום ביחס ל${targetLabel}; זה מצביע על חולשה מערכתית ולא על בעיית בית / חוץ נקודתית.`
      : 'גם הבית וגם החוץ נמצאים מתחת לסף האדום; זה מצביע על חולשה מערכתית ולא על בעיית בית / חוץ נקודתית.'
  }

  if (evaluation.away.isRed && evaluation.gap.isRed) {
    return targetLabel
      ? `אחוז ההצלחה בחוץ נמוך ביחס ל${targetLabel}, והפער מול משחקי הבית גבוה. זהו מוקד פעולה שעלול לפגוע בתחזית הכללית.`
      : 'אחוז ההצלחה בחוץ נמוך והפער מול משחקי הבית גבוה. זהו מוקד פעולה שעלול לפגוע בתחזית הכללית.'
  }

  if (evaluation.home.isRed && evaluation.gap.isRed) {
    return targetLabel
      ? `אחוז ההצלחה בבית נמוך ביחס ל${targetLabel}, למרות שמצופה מהבית להיות בסיס הנקודות המרכזי.`
      : 'אחוז ההצלחה בבית נמוך, למרות שמצופה מהבית להיות בסיס הנקודות המרכזי.'
  }

  if (evaluation.away.isRed) {
    return targetLabel
      ? `מומלץ לבחון את משחקי החוץ: אחוז ההצלחה בחוץ נמוך ביחס ל${targetLabel} ועלול להגביל את היכולת להתקדם בטבלה.`
      : 'מומלץ לבחון את משחקי החוץ: אחוז ההצלחה בחוץ נמוך ועלול להגביל את היכולת להתקדם בטבלה.'
  }

  if (evaluation.home.isRed) {
    return targetLabel
      ? `מומלץ לבחון את משחקי הבית: אחוז ההצלחה בבית נמוך ביחס ל${targetLabel}, ולכן אין כרגע בסיס נקודות יציב מספיק.`
      : 'מומלץ לבחון את משחקי הבית: אחוז ההצלחה בבית נמוך, ולכן אין כרגע בסיס נקודות יציב מספיק.'
  }

  if (evaluation.gap.isRed) {
    if (betterSide === 'home') {
      return 'מומלץ לצמצם את התלות במשחקי הבית ולשפר את היכולת לקחת נקודות בחוץ.'
    }

    if (betterSide === 'away') {
      return 'מומלץ לוודא שמשחקי הבית אינם הופכים לנקודת חולשה ביחס ליכולת שהקבוצה מציגה בחוץ.'
    }
  }

  if (hasStrongHomeAwayProfile(evaluationState)) {
    return targetLabel
      ? `מומלץ לשמר את האיזון בין בית לחוץ, משום שהוא תומך בפרופיל ביצועים חיובי ביחס ל${targetLabel}.`
      : 'מומלץ לשמר את האיזון בין בית לחוץ, משום שהוא תומך בפרופיל ביצועים חיובי.'
  }

  if (evaluation.gap.isGreen) {
    return 'מומלץ לשמר את האיזון בין משחקי הבית והחוץ ולבחון האם הוא ממשיך לתמוך בקצב הנקודות הכללי.'
  }

  return 'מומלץ להמשיך לעקוב אחרי פערי בית / חוץ, משום שהנתונים נמצאים באזור ביניים ולא מייצרים כרגע דגל חד.'
}

export function buildHomeAwayRiskText(metrics, evaluationState) {
  const betterSide = getBetterSide(metrics, evaluationState)
  const evaluation = evaluationState.evaluation

  if (!evaluationState.hasEnoughData) return ''

  if (hasHomeAwaySystemicRisk(evaluationState)) {
    return 'הבעיה אינה ממוקדת רק בבית או בחוץ: שני המצבים נמוכים ביחס לסף הנדרש.'
  }

  if (evaluation.away.isRed) {
    return 'הפער המרכזי נמצא במשחקי החוץ, שבהם קצב צבירת הנקודות נמוך ביחס לרמת היעד.'
  }

  if (evaluation.home.isRed) {
    return 'הפער המרכזי נמצא במשחקי הבית, שבהם הקבוצה לא מייצרת בסיס נקודות מספיק יציב.'
  }

  if (evaluation.gap.isRed && betterSide === 'home') {
    return 'הפער בין בית לחוץ מצביע על תלות גבוהה במשחקי הבית.'
  }

  if (evaluation.gap.isRed && betterSide === 'away') {
    return 'הפער בין חוץ לבית מצביע על חולשה יחסית במשחקי הבית.'
  }

  return ''
}
