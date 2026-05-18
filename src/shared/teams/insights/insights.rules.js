// src/shared/teams/insights/insights.rules.js

import {
  hasDangerRisk,
  hasHighDamage,
  hasInfoRisk,
  hasLowSample,
  hasNegativeImpact,
  hasNoProfessionalRisk,
  hasNoSample,
  hasPartialSample,
  hasPositiveImpact,
  hasPositionOverload,
  hasReliableSample,
  hasStrongSample,
  hasStrongScore,
  hasWarningRisk,
  hasWeakPlayers,
  isBadQuality,
  isKeyRole,
  isLimitedGroup,
  isLimitedGroupWithRisk,
  isOkGroupWithRisk,
  isPositionCollapse,
  isPositionWeak,
  isPositionWithRisk,
  isStableGroup,
  isStablePosition,
  isStrongGroup,
  isStrongGroupWithRisk,
  isStrongPosition,
  isWeakQuality,
} from './insights.predicates.js'

// תובנות איכות מדגם ואמינות החישוב
export const TEAM_PLAYERS_SAMPLE_INSIGHT_RULES = [
  {
    id: 'noSample',
    family: 'sample',
    priority: 1000,
    ruleLabel: 'אין מדגם',
    ruleText: 'מופעל כאשר אין מספיק שחקנים שנבדקו כדי להסיק מסקנה מקצועית.',
    conditions: [
      'אין שחקנים עם נתוני scoring תקפים',
    ],
    when: hasNoSample,
  },

  {
    id: 'lowSample',
    family: 'sample',
    priority: 800,
    ruleLabel: 'מדגם נמוך',
    ruleText: 'מופעל כאשר יש נתונים ראשוניים בלבד, אך הם עדיין לא מספיקים למסקנה יציבה.',
    conditions: [
      'sampleLevel שווה low',
    ],
    when: hasLowSample,
  },

  {
    id: 'partialSample',
    family: 'sample',
    priority: 700,
    ruleLabel: 'מדגם חלקי',
    ruleText: 'מופעל כאשר יש מספיק מידע לתצוגה ראשונית, אך רמת האמינות עדיין מוגבלת.',
    conditions: [
      'sampleLevel שווה partial',
    ],
    when: hasPartialSample,
  },

  {
    id: 'strongSample',
    family: 'sample',
    priority: 600,
    ruleLabel: 'מדגם חזק',
    ruleText: 'מופעל כאשר המדגם רחב מספיק כדי לבסס מסקנה מקצועית ברמת ביטחון גבוהה.',
    conditions: [
      'sampleLevel שווה strong',
    ],
    when: hasStrongSample,
  },

  {
    id: 'reliableSample',
    family: 'sample',
    priority: 500,
    ruleLabel: 'מדגם תקין',
    ruleText: 'מופעל כאשר כמות הנתונים מאפשרת להסיק תובנה מקצועית ברמת אמינות סבירה.',
    conditions: [
      'sampleLevel שווה reliable',
    ],
    when: hasReliableSample,
  },
]

// תובנות ביצוע לפי קבוצת שחקנים מוגדרת
export const TEAM_PLAYERS_PERFORMANCE_INSIGHT_RULES = [
  {
    id: 'groupCollapse',
    family: 'performance',
    priority: 1000,
    ruleLabel: 'קריסת קבוצת שחקנים',
    ruleText: 'מופעל כאשר קבוצת שחקנים מציגה איכות ביצוע נמוכה מאוד או השפעה שלילית מובהקת.',
    conditions: [
      'qualityLevel שווה bad',
    ],
    when: isBadQuality,
  },

  {
    id: 'groupWeak',
    family: 'performance',
    priority: 900,
    ruleLabel: 'קבוצת שחקנים פוגעת בתפקוד',
    ruleText: 'מופעל כאשר קבוצת שחקנים נמצאת מתחת לציפייה ומשפיעה שלילית על התפקוד הקבוצתי.',
    conditions: [
      'qualityLevel שווה weak',
    ],
    when: isWeakQuality,
  },

  {
    id: 'strongRisk',
    family: 'performance',
    priority: 800,
    ruleLabel: 'קבוצת שחקנים חזקה עם סיכון פנימי',
    ruleText: 'מופעל כאשר קבוצת שחקנים שאינה עמדה מציגה ביצוע כולל חזק, אך יש בה שחקנים מתחת לציפייה.',
    conditions: [
      'החתך אינו position',
      'qualityLevel שווה strong',
      'riskLevel שונה מ-none',
    ],
    when: isStrongGroupWithRisk,
  },

  {
    id: 'okRisk',
    family: 'performance',
    priority: 700,
    ruleLabel: 'קבוצת שחקנים תקינה עם חריגות',
    ruleText: 'מופעל כאשר קבוצת שחקנים עומדת בציפייה הכללית, אך קיימות בה חריגות נקודתיות.',
    conditions: [
      'החתך אינו position',
      'qualityLevel שווה ok',
      'riskLevel שונה מ-none',
    ],
    when: isOkGroupWithRisk,
  },

  {
    id: 'limitedRisk',
    family: 'performance',
    priority: 650,
    ruleLabel: 'השפעה מוגבלת עם סיכון',
    ruleText: 'מופעל כאשר קבוצת שחקנים אינה מייצרת מספיק ערך ובמקביל כוללת שחקנים מתחת לציפייה.',
    conditions: [
      'החתך אינו position',
      'qualityLevel שווה limited',
      'riskLevel שונה מ-none',
    ],
    when: isLimitedGroupWithRisk,
  },

  {
    id: 'strongGroup',
    family: 'performance',
    priority: 500,
    ruleLabel: 'קבוצת שחקנים חזקה',
    ruleText: 'מופעל כאשר קבוצת שחקנים שאינה עמדה מייצרת ציון טוב והשפעה חיובית ללא סיכון פנימי.',
    conditions: [
      'החתך אינו position',
      'qualityLevel שווה strong',
      'riskLevel שווה none',
    ],
    when: isStrongGroup,
  },

  {
    id: 'stableGroup',
    family: 'performance',
    priority: 400,
    ruleLabel: 'קבוצת שחקנים יציבה',
    ruleText: 'מופעל כאשר קבוצת שחקנים שאינה עמדה עומדת בציפייה ואין בה סיכון מקצועי משמעותי.',
    conditions: [
      'החתך אינו position',
      'qualityLevel שווה ok',
      'riskLevel שווה none',
    ],
    when: isStableGroup,
  },

  {
    id: 'limitedImpact',
    family: 'performance',
    priority: 300,
    ruleLabel: 'השפעה מוגבלת',
    ruleText: 'מופעל כאשר קבוצת שחקנים אינה פוגעת משמעותית, אך גם לא מייצרת השפעה חיובית מספקת.',
    conditions: [
      'החתך אינו position',
      'qualityLevel שווה limited',
      'riskLevel שווה none',
    ],
    when: isLimitedGroup,
  },

  {
    id: 'positionCollapse',
    family: 'performance',
    priority: 1000,
    ruleLabel: 'קריסת עמדה',
    ruleText: 'מופעל כאשר ניתוח לפי עמדה מציג איכות ביצוע נמוכה מאוד או השפעה שלילית מובהקת.',
    conditions: [
      'החתך הוא position',
      'qualityLevel שווה bad',
    ],
    when: isPositionCollapse,
  },

  {
    id: 'positionWeak',
    family: 'performance',
    priority: 900,
    ruleLabel: 'עמדה פוגעת בתפקוד',
    ruleText: 'מופעל כאשר עמדה נמצאת מתחת לציפייה ומשפיעה שלילית על תפקוד הקבוצה.',
    conditions: [
      'החתך הוא position',
      'qualityLevel שווה weak',
    ],
    when: isPositionWeak,
  },

  {
    id: 'positionRisk',
    family: 'performance',
    priority: 800,
    ruleLabel: 'עמדה עם סיכון',
    ruleText: 'מופעל כאשר עמדה כוללת שחקנים מתחת לציפייה או נזק מקצועי פנימי.',
    conditions: [
      'החתך הוא position',
      'riskLevel שונה מ-none',
    ],
    when: isPositionWithRisk,
  },

  {
    id: 'strongPosition',
    family: 'performance',
    priority: 600,
    ruleLabel: 'עמדה חזקה',
    ruleText: 'מופעל כאשר עמדה מייצרת תרומה חיובית ברורה וללא סיכון פנימי.',
    conditions: [
      'החתך הוא position',
      'qualityLevel שווה strong',
      'riskLevel שווה none',
    ],
    when: isStrongPosition,
  },

  {
    id: 'stablePosition',
    family: 'performance',
    priority: 500,
    ruleLabel: 'עמדה יציבה',
    ruleText: 'מופעל כאשר עמדה מתפקדת בטווח תקין ואין בה סיכון מקצועי משמעותי.',
    conditions: [
      'החתך הוא position',
      'qualityLevel שווה ok או limited',
      'riskLevel שווה none',
    ],
    when: isStablePosition,
  },
]

// תובנות סיכון מקצועי בתוך קבוצת שחקנים
export const TEAM_PLAYERS_RISK_INSIGHT_RULES = [
  {
    id: 'criticalRisk',
    family: 'risk',
    priority: 1000,
    ruleLabel: 'סיכון קריטי',
    ruleText: 'מופעל כאשר קיימת רמת סיכון גבוהה וגם נזק מקצועי משמעותי.',
    conditions: [
      'riskLevel שווה danger',
      'damageScore גבוה',
    ],
    when: context => hasDangerRisk(context) && hasHighDamage(context),
  },

  {
    id: 'highRisk',
    family: 'risk',
    priority: 900,
    ruleLabel: 'סיכון גבוה',
    ruleText: 'מופעל כאשר רמת הסיכון המקצועי היא גבוהה.',
    conditions: [
      'riskLevel שווה danger',
    ],
    when: hasDangerRisk,
  },

  {
    id: 'checkRequired',
    family: 'risk',
    priority: 700,
    ruleLabel: 'דורש בדיקה',
    ruleText: 'מופעל כאשר יש מספיק סימנים לפתוח דרילדאון ולבדוק את מקור הבעיה.',
    conditions: [
      'riskLevel הוא warning ומעלה',
    ],
    when: hasWarningRisk,
  },

  {
    id: 'lightRisk',
    family: 'risk',
    priority: 500,
    ruleLabel: 'חריגה קלה',
    ruleText: 'מופעל כאשר קיימת חריגה ראשונית שאינה מחייבת שינוי משמעותי.',
    conditions: [
      'riskLevel שווה info',
    ],
    when: hasInfoRisk,
  },

  {
    id: 'noRisk',
    family: 'risk',
    priority: 100,
    ruleLabel: 'אין סיכון משמעותי',
    ruleText: 'מופעל כאשר לא זוהה סיכון מקצועי פנימי בקבוצת השחקנים.',
    conditions: [
      'riskLevel שווה none',
    ],
    when: hasNoProfessionalRisk,
  },
]

// תובנות פירוט שחקנים בתוך קבוצת שחקנים
export const TEAM_PLAYERS_DRILLDOWN_INSIGHT_RULES = [
  {
    id: 'highDamagePlayers',
    family: 'drilldown',
    priority: 900,
    ruleLabel: 'שחקנים עם נזק גבוה',
    ruleText: 'מופעל כאשר השחקנים החלשים מייצרים נזק מקצועי משמעותי.',
    conditions: [
      'damageScore גבוה',
    ],
    when: hasHighDamage,
  },

  {
    id: 'weakPlayers',
    family: 'drilldown',
    priority: 800,
    ruleLabel: 'שחקנים לא תקינים',
    ruleText: 'מופעל כאשר קיימים שחקנים מתחת לציפייה בתוך קבוצת השחקנים.',
    conditions: [
      'weakCount גדול מ-0',
    ],
    when: hasWeakPlayers,
  },

  {
    id: 'positiveImpactPlayers',
    family: 'drilldown',
    priority: 600,
    ruleLabel: 'שחקנים עם השפעה חיובית',
    ruleText: 'מופעל כאשר קבוצת השחקנים מייצרת TVA חיובי.',
    conditions: [
      'totalTva גדול מ-0',
    ],
    when: hasPositiveImpact,
  },

  {
    id: 'noSamplePlayers',
    family: 'drilldown',
    priority: 500,
    ruleLabel: 'שחקנים ללא מדגם',
    ruleText: 'מופעל כאשר אין מספיק נתונים כדי לקבוע תקינות שחקנים.',
    conditions: [
      'אין שחקנים עם מדגם תקף',
    ],
    when: hasNoSample,
  },

  {
    id: 'okPlayers',
    family: 'drilldown',
    priority: 100,
    ruleLabel: 'שחקנים תקינים',
    ruleText: 'מופעל כאשר אין שחקנים חלשים ואין בעיית מדגם.',
    conditions: [
      'weakCount שווה 0',
      'קיים מדגם',
    ],
    when: context => !hasWeakPlayers(context) && !hasNoSample(context),
  },
]

// תובנות המלצה לפעולה
export const TEAM_PLAYERS_RECOMMEND_INSIGHT_RULES = [
  {
    id: 'completeMissingSample',
    family: 'recommendation',
    priority: 300,
    ruleLabel: 'להשלים מדגם',
    ruleText: 'מופעל כאשר אין מספיק נתונים כדי לקבל החלטה מקצועית.',
    conditions: [
      'אין מדגם או sampleLevel נמוך',
    ],
    when: context => hasNoSample(context) || hasLowSample(context),
  },

  {
    id: 'replaceWeakKeyPlayer',
    family: 'recommendation',
    priority: 900,
    ruleLabel: 'לבחון שחקן מפתח חלש',
    ruleText: 'מופעל כאשר קבוצת שחקני המפתח מציגה סיכון מקצועי משמעותי.',
    conditions: [
      'roleId שווה key',
      'riskLevel הוא warning ומעלה',
    ],
    when: context => isKeyRole(context) && hasWarningRisk(context),
  },

  {
    id: 'strengthenPosition',
    family: 'recommendation',
    priority: 850,
    ruleLabel: 'לחזק עמדה',
    ruleText: 'מופעל כאשר עמדה מציגה ביצוע נמוך או סיכון מקצועי משמעותי.',
    conditions: [
      'החתך הוא position',
      'qualityLevel חלש או bad, או riskLevel warning ומעלה',
    ],
    when: context => (
      isPositionWithRisk(context) ||
      isPositionWeak(context) ||
      isPositionCollapse(context)
    ),
  },

  {
    id: 'reducePositionLoad',
    family: 'recommendation',
    priority: 700,
    ruleLabel: 'להפחית עומס מעמדה',
    ruleText: 'מופעל כאשר יש עומס מבני או ריכוז גבוה מדי של שחקנים באותה עמדה.',
    conditions: [
      'החתך הוא position',
      'structureStatus שווה overload',
    ],
    when: context => isPositionWithRisk(context) && hasPositionOverload(context),
  },

  {
    id: 'reduceMinutesForDamagingPlayer',
    family: 'recommendation',
    priority: 650,
    ruleLabel: 'להפחית דקות לשחקן פוגע',
    ruleText: 'מופעל כאשר קיימת השפעה שלילית או נזק מקצועי משמעותי.',
    conditions: [
      'damageScore גבוה או totalTva שלילי',
    ],
    when: context => hasHighDamage(context) || hasNegativeImpact(context),
  },

  {
    id: 'increaseMinutesForStablePlayer',
    family: 'recommendation',
    priority: 500,
    ruleLabel: 'להגדיל דקות לשחקן יציב',
    ruleText: 'מופעל כאשר קיימת איכות ביצוע גבוהה, השפעה חיובית ואין סיכון מקצועי.',
    conditions: [
      'score גבוה',
      'totalTva חיובי',
      'riskLevel שווה none',
    ],
    when: context => (
      hasStrongScore(context) &&
      hasPositiveImpact(context) &&
      hasNoProfessionalRisk(context)
    ),
  },

  {
    id: 'adjustPlayerRole',
    family: 'recommendation',
    priority: 400,
    ruleLabel: 'לעדכן מעמד שחקן',
    ruleText: 'מופעל כאשר הביצוע בפועל של קבוצת מעמד מסוימת לא תואם את הציפייה המקצועית.',
    conditions: [
      'קיים roleId',
      'qualityLevel שווה bad',
    ],
    when: context => context?.roleId && isBadQuality(context),
  },
]

export const TEAM_PLAYERS_INSIGHT_RULES = [
  ...TEAM_PLAYERS_SAMPLE_INSIGHT_RULES,
  ...TEAM_PLAYERS_PERFORMANCE_INSIGHT_RULES,
  ...TEAM_PLAYERS_RISK_INSIGHT_RULES,
  ...TEAM_PLAYERS_DRILLDOWN_INSIGHT_RULES,
  ...TEAM_PLAYERS_RECOMMEND_INSIGHT_RULES,
]

export const TEAM_PLAYERS_INSIGHT_RULES_BY_FAMILY = {
  sample: TEAM_PLAYERS_SAMPLE_INSIGHT_RULES,
  performance: TEAM_PLAYERS_PERFORMANCE_INSIGHT_RULES,
  risk: TEAM_PLAYERS_RISK_INSIGHT_RULES,
  drilldown: TEAM_PLAYERS_DRILLDOWN_INSIGHT_RULES,
  recommendation: TEAM_PLAYERS_RECOMMEND_INSIGHT_RULES,
}

export const resolveTeamPlayersInsightId = ({ family, context, fallback = null } = {}) => {
  const rules = family
    ? TEAM_PLAYERS_INSIGHT_RULES_BY_FAMILY[family] || []
    : TEAM_PLAYERS_INSIGHT_RULES

  const match = [...rules]
    .sort((a, b) => b.priority - a.priority)
    .find(rule => rule.when(context || {}))

  return match?.id || fallback
}

export const resolveTeamPlayersInsights = ({ context, families = [] } = {}) => {
  return families.reduce((acc, family) => {
    acc[family] = resolveTeamPlayersInsightId({
      family,
      context,
      fallback: null,
    })

    return acc
  }, {})
}
