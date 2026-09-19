import { getTeamDiagnosticSignalLabel } from './teamDiagnosticSignalTask.presentation.js'

export const SIGNAL_GROUPS = Object.freeze({
  minutes: Object.freeze({
    title: 'סוגי איתותים באיזון חלוקת הדקות',
    description: 'האיתותים המקצועיים שנבדקים באזור זה.',
    groups: Object.freeze([
      Object.freeze({
        title: 'התקפה',
        items: Object.freeze([
          Object.freeze({ id: 'ATTACK_CONCENTRATION', label: getTeamDiagnosticSignalLabel('ATTACK_CONCENTRATION'), conditions: 'ביצוע התקפי חיובי ומעלה · מספר שחקני התקפה מתחת ליעד.' }),
          Object.freeze({ id: 'ATTACK_ESTABLISHED', label: getTeamDiagnosticSignalLabel('ATTACK_ESTABLISHED'), conditions: 'ביצוע התקפי חיובי ומעלה · מספר שחקני התקפה בהתאם ליעד.' }),
          Object.freeze({ id: 'ATTACK_HIGH_COMPETITION', label: getTeamDiagnosticSignalLabel('ATTACK_HIGH_COMPETITION'), conditions: 'ביצוע התקפי חיובי ומעלה · מספר שחקני התקפה מעל היעד.' }),
          Object.freeze({ id: 'ATTACK_DEPTH_REVIEW', label: getTeamDiagnosticSignalLabel('ATTACK_DEPTH_REVIEW'), conditions: 'ביצוע התקפי רגיל · מספר שחקני התקפה מתחת ליעד.' }),
          Object.freeze({ id: 'ATTACK_POSSIBLE_GAP', label: getTeamDiagnosticSignalLabel('ATTACK_POSSIBLE_GAP'), conditions: 'ביצוע התקפי נמוך · מספר שחקני התקפה מתחת ליעד.' }),
          Object.freeze({ id: 'ATTACK_QUALITY_REVIEW', label: getTeamDiagnosticSignalLabel('ATTACK_QUALITY_REVIEW'), conditions: 'ביצוע התקפי נמוך · מספר שחקני התקפה בהתאם ליעד.' }),
          Object.freeze({ id: 'ATTACK_CLASSIFICATION_MISSING', label: getTeamDiagnosticSignalLabel('ATTACK_CLASSIFICATION_MISSING'), conditions: 'נתוני מבנה זמינים · 0 שחקני התקפה מסווגים.' }),
        ]),
      }),
      Object.freeze({
        title: 'הגנה',
        items: Object.freeze([
          Object.freeze({ id: 'DEFENSE_CONCENTRATION', label: getTeamDiagnosticSignalLabel('DEFENSE_CONCENTRATION'), conditions: 'ביצוע הגנתי חיובי ומעלה · מספר שחקני הגנה מתחת ליעד.' }),
          Object.freeze({ id: 'DEFENSE_ESTABLISHED', label: getTeamDiagnosticSignalLabel('DEFENSE_ESTABLISHED'), conditions: 'ביצוע הגנתי חיובי ומעלה · מספר שחקני הגנה בהתאם ליעד.' }),
          Object.freeze({ id: 'DEFENSE_DEPTH_REVIEW', label: getTeamDiagnosticSignalLabel('DEFENSE_DEPTH_REVIEW'), conditions: 'ביצוע הגנתי רגיל · מספר שחקני הגנה מתחת ליעד.' }),
          Object.freeze({ id: 'DEFENSE_POSSIBLE_GAP', label: getTeamDiagnosticSignalLabel('DEFENSE_POSSIBLE_GAP'), conditions: 'ביצוע הגנתי נמוך · מספר שחקני הגנה מתחת ליעד.' }),
          Object.freeze({ id: 'DEFENSE_QUALITY_REVIEW', label: getTeamDiagnosticSignalLabel('DEFENSE_QUALITY_REVIEW'), conditions: 'ביצוע הגנתי נמוך · מספר שחקני הגנה בהתאם ליעד.' }),
          Object.freeze({ id: 'DEFENSE_QUALITY_SEARCH', label: getTeamDiagnosticSignalLabel('DEFENSE_QUALITY_SEARCH'), conditions: 'ביצוע הגנתי חיובי ומעלה · מספר שחקני הגנה מעל היעד.' }),
          Object.freeze({ id: 'DEFENSE_LOW_QUALITY_OVERLOAD', label: getTeamDiagnosticSignalLabel('DEFENSE_LOW_QUALITY_OVERLOAD'), conditions: 'ביצוע הגנתי נמוך · מספר שחקני הגנה מעל היעד.' }),
          Object.freeze({ id: 'DEFENSE_CLASSIFICATION_MISSING', label: getTeamDiagnosticSignalLabel('DEFENSE_CLASSIFICATION_MISSING'), conditions: 'נתוני מבנה זמינים · 0 שחקני הגנה מסווגים.' }),
        ]),
      }),
      Object.freeze({
        title: 'כללי',
        items: Object.freeze([
          Object.freeze({ id: 'REVIEW_REQUIRED', label: getTeamDiagnosticSignalLabel('REVIEW_REQUIRED'), conditions: 'בהתקפה: ביצוע רגיל או נמוך ומספר שחקנים מעל היעד · בהגנה: מספר שחקנים מעל היעד.' }),
          Object.freeze({ id: 'NO_CLEAR_FINDING', label: getTeamDiagnosticSignalLabel('NO_CLEAR_FINDING'), conditions: 'ביצוע רגיל · מספר שחקנים בהתאם ליעד.' }),
        ]),
      }),
    ]),
  }),
  structure: {
    title: 'סוגי איתותים באיזון מבנה העמדות',
    description: 'האיתותים המקצועיים שנבדקים באזור זה.',
    groups: null,
  },
  squad: Object.freeze({
    title: 'סוגי איתותים בשימוש בסגל',
    description: 'האירועים המוגדרים לפי ביצוע קבוצתי וכמות השחקנים המסווגים בסגל.',
    groups: Object.freeze([
      Object.freeze({
        title: 'שימוש בסגל',
        items: Object.freeze([
          Object.freeze({
            id: 'LOW_CLASSIFICATION_COVERAGE',
            label: 'מעט באנקרים בסגל.',
            explanation: 'מעט שחקנים עם מעמד סטטיסטי ברור.',
          }),
          Object.freeze({
            id: 'HIGH_CLASSIFICATION_COVERAGE',
            label: 'סגל רחב.',
            explanation: 'הרבה שחקנים עם מעמד סטטיסטי ברור.',
          }),
        ]),
      }),
    ]),
  }),
})

SIGNAL_GROUPS.structure.groups = SIGNAL_GROUPS.minutes.groups

export const SIGNAL_MATRIX = Object.freeze({
  attack: Object.freeze([
    Object.freeze({ performance: 'חיובי ומעלה', performanceBand: 'positive_or_above', cells: Object.freeze(['ATTACK_CONCENTRATION', 'ATTACK_ESTABLISHED', 'ATTACK_HIGH_COMPETITION']) }),
    Object.freeze({ performance: 'רגיל', performanceBand: 'regular', cells: Object.freeze(['ATTACK_DEPTH_REVIEW', 'NO_CLEAR_FINDING', 'REVIEW_REQUIRED']) }),
    Object.freeze({ performance: 'נמוך', performanceBand: 'low', cells: Object.freeze(['ATTACK_POSSIBLE_GAP', 'ATTACK_QUALITY_REVIEW', 'REVIEW_REQUIRED']) }),
  ]),
  defense: Object.freeze([
    Object.freeze({ performance: 'חיובי ומעלה', performanceBand: 'positive_or_above', cells: Object.freeze(['DEFENSE_CONCENTRATION', 'DEFENSE_ESTABLISHED', 'DEFENSE_QUALITY_SEARCH']) }),
    Object.freeze({ performance: 'רגיל', performanceBand: 'regular', cells: Object.freeze(['DEFENSE_DEPTH_REVIEW', 'NO_CLEAR_FINDING', 'REVIEW_REQUIRED']) }),
    Object.freeze({ performance: 'נמוך', performanceBand: 'low', cells: Object.freeze(['DEFENSE_POSSIBLE_GAP', 'DEFENSE_QUALITY_REVIEW', 'DEFENSE_LOW_QUALITY_OVERLOAD']) }),
  ]),
  squad: Object.freeze([
    Object.freeze({ performance: '2 חיוביים', performanceBand: 'two_positive', cells: Object.freeze([
      Object.freeze({ id: 'LOW_CLASSIFICATION_COVERAGE', label: 'בסיס סגל פגיע.', explanation: 'הקבוצה מצליחה משני הצדדים, אך תלויה במספר מצומצם של שחקנים מובילים.' }),
      Object.freeze({ id: 'HIGH_CLASSIFICATION_COVERAGE', label: 'תחרות גבוהה לצד הצלחה קבוצתית.', explanation: 'יש תחרות גבוהה על תפקידי הובלה, ושחקנים עשויים לחפש תפקיד מוביל במקום אחר.' }),
    ]) }),
    Object.freeze({ performance: '1 חיובי · 1 שלילי', performanceBand: 'positive_and_low', cells: Object.freeze([
      Object.freeze({ id: 'LOW_CLASSIFICATION_COVERAGE', label: 'בסיס סגל מעורער.', explanation: 'מעט שחקנים מובילים לצד תמונת ביצועים מעורבת.' }),
      Object.freeze({ id: 'HIGH_CLASSIFICATION_COVERAGE', label: 'קבוצה לא מאוזנת עם הצלחה מוגבלת.', explanation: 'יש הרבה שחקנים משמעותיים, אך הביצועים אינם מאוזנים בין חלקי המשחק.' }),
    ]) }),
    Object.freeze({ performance: '2 שליליים', performanceBand: 'two_low', cells: Object.freeze([
      Object.freeze({ id: 'LOW_CLASSIFICATION_COVERAGE', label: 'בסיס סגל רעוע.', explanation: 'מעט שחקנים מובילים לצד שני ביצועים נמוכים.' }),
      Object.freeze({ id: 'HIGH_CLASSIFICATION_COVERAGE', label: 'קבוצה חסרת זהות ולא מצליחה.', explanation: 'יש הרבה שחקנים משמעותיים, אך אין איכות מובילה בשני חלקי המשחק.' }),
    ]) }),
  ]),
})

export const BENCHMARK_STATE_BY_COLUMN = Object.freeze(['below_reference', 'at_reference', 'above_reference'])
