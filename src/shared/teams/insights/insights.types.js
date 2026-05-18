// src/shared/teams/insights/insights.types.js

export const TEAM_INSIGHT_FAMILIES = {
  structure: {
    id: 'structure',
    label: 'בניית סגל',
    description: 'בודק האם הסגל בנוי נכון מבחינת מעמד, עמדה, כיסוי ותכנון מקצועי.',
  },

  performance: {
    id: 'performance',
    label: 'תפקוד בפועל',
    description: 'בודק איך מקבצי שחקנים מתפקדים בפועל לפי ציון, TVA, מדגם ונזק מצטבר.',
  },

  risk: {
    id: 'risk',
    label: 'סיכון מקצועי',
    description: 'בודק האם קיימת בעיה פנימית במקבץ, גם אם הביצוע הכולל נראה תקין.',
  },

  sample: {
    id: 'sample',
    label: 'איכות מדגם',
    description: 'בודק האם יש מספיק דקות ומשחקים כדי להסיק מסקנה מקצועית אמינה.',
  },

  drilldown: {
    id: 'drilldown',
    label: 'פירוט שחקנים',
    description: 'מציג את השחקנים שמרכיבים את התובנה ומבדיל בין תקינים, חלשים וחסרי מדגם.',
  },

  recommendation: {
    id: 'recommendation',
    label: 'המלצה',
    description: 'מתרגם את האבחנה לפעולה מקצועית אפשרית עבור המאמן או המנהל המקצועי.',
  },
}

// תובנות לבניית סגל
// אחריות: אבחון המבנה המתוכנן של הסגל לפי מעמד, עמדה וכיסוי.
// דוגמאות: חוסר בעמדה, עומס במעמד, שחקנים ללא מעמד.
export const TEAM_PLAYERS_STRUCTURE_INSIGHT_TYPES = {
  structureOk: {
    id: 'structureOk',
    family: 'structure',
    label: 'מבנה סגל תקין',
    description: 'חלוקת השחקנים במקבץ נמצאת בטווח הרצוי ואין חריגה משמעותית בכמות או באיזון.',
  },

  roleShortage: {
    id: 'roleShortage',
    family: 'structure',
    label: 'חוסר במעמד',
    description: 'יש פחות שחקנים מהנדרש במעמד מסוים, ולכן עומק הסגל באותו אזור אינו מספק.',
  },

  roleOverload: {
    id: 'roleOverload',
    family: 'structure',
    label: 'עומס במעמד',
    description: 'יש יותר מדי שחקנים באותו מעמד, דבר שעלול ליצור חוסר איזון בדקות, בציפיות ובניהול הסגל.',
  },

  keyPlayerShortage: {
    id: 'keyPlayerShortage',
    family: 'structure',
    label: 'חוסר בשחקני מפתח',
    description: 'אין מספיק שחקנים שמוגדרים כשחקני מפתח, ולכן חסרים עוגנים מקצועיים שעליהם הקבוצה יכולה להישען.',
  },

  keyPlayerOverload: {
    id: 'keyPlayerOverload',
    family: 'structure',
    label: 'עומס בשחקני מפתח',
    description: 'יותר מדי שחקנים מוגדרים כשחקני מפתח, מה שעלול לטשטש היררכיה וליצור ציפיות לא ריאליות.',
  },

  rotationShortage: {
    id: 'rotationShortage',
    family: 'structure',
    label: 'חוסר ברוטציה',
    description: 'אין מספיק שחקני רוטציה שיכולים לתת עומק, מנוחה וגיבוי לאורך העונה.',
  },

  rotationOverload: {
    id: 'rotationOverload',
    family: 'structure',
    label: 'עומס ברוטציה',
    description: 'יש כמות גבוהה מדי של שחקני רוטציה, מה שעלול להעיד על סגל רחב אך לא מספיק איכותי.',
  },

  fringeOverload: {
    id: 'fringeOverload',
    family: 'structure',
    label: 'עודף שחקני קצה סגל',
    description: 'יש יותר מדי שחקנים בקצה הסגל, דבר שעלול להכביד על ניהול האימונים והדקות.',
  },

  unassignedRole: {
    id: 'unassignedRole',
    family: 'structure',
    label: 'שחקנים ללא מעמד',
    description: 'יש שחקנים שלא קיבלו הגדרת מעמד, ולכן קשה לנתח את מקומם בסגל ואת הציפייה מהם.',
  },

  positionOk: {
    id: 'positionOk',
    family: 'structure',
    label: 'עמדה תקינה',
    description: 'כמות השחקנים בעמדה נמצאת בטווח הרצוי ויש כיסוי מספק לעמדה.',
  },

  positionShortage: {
    id: 'positionShortage',
    family: 'structure',
    label: 'חוסר בעמדה',
    description: 'יש פחות שחקנים מהנדרש בעמדה, ולכן הקבוצה חשופה לפציעות, עומס או חוסר פתרונות.',
  },

  positionOverload: {
    id: 'positionOverload',
    family: 'structure',
    label: 'עומס בעמדה',
    description: 'יש יותר מדי שחקנים באותה עמדה, דבר שעלול לייצר תחרות לא מאוזנת וחלוקת דקות בעייתית.',
  },

  keyOverload: {
    id: 'keyOverload',
    family: 'structure',
    label: 'ריבוי שחקני מפתח בעמדה',
    description: 'יותר מדי שחקני מפתח מרוכזים באותה עמדה, מה שעלול ליצור עודף איכות באזור אחד וחוסר באחר.',
  },

  noKeyPlayerInPosition: {
    id: 'noKeyPlayerInPosition',
    family: 'structure',
    label: 'אין שחקן מפתח בעמדה',
    description: 'עמדה חשובה חסרה שחקן מוביל, ולכן ייתכן שאין בה עוגן מקצועי ברור.',
  },

  noPrimaryCoverage: {
    id: 'noPrimaryCoverage',
    family: 'structure',
    label: 'אין כיסוי ראשי לעמדה',
    description: 'אין שחקן שהעמדה מוגדרת כעמדה הראשית שלו, גם אם קיימים שחקנים שיכולים לכסות אותה.',
  },

  secondaryCoverageOnly: {
    id: 'secondaryCoverageOnly',
    family: 'structure',
    label: 'כיסוי משני בלבד',
    description: 'העמדה מכוסה רק על ידי שחקנים שזו אינה העמדה הראשית שלהם, ולכן הכיסוי קיים אך פחות יציב.',
  },
}

// תובנות ביצוע לפי הגדרות בניית הסגל
// אחריות: אבחון התפקוד בפועל של מקבצי שחקנים שנבנו מראש.
// דוגמאות: מקבץ חזק, מקבץ יציב, מקבץ פוגע בתפקוד, קריסת מקבץ.
export const TEAM_PLAYERS_PERFORMANCE_INSIGHT_TYPES = {
  stableGroup: {
    id: 'stableGroup',
    family: 'performance',
    label: 'מקבץ יציב',
    description: 'המקבץ עומד בציפייה, אין נזק משמעותי, ורוב השחקנים נמצאים בטווח תקין.',
  },

  strongGroup: {
    id: 'strongGroup',
    family: 'performance',
    label: 'מקבץ חזק',
    description: 'המקבץ מייצר ציון טוב והשפעה חיובית ברורה על תפקוד הקבוצה.',
  },

  strongRisk: {
    id: 'strongRisk',
    family: 'performance',
    label: 'מקבץ חזק עם סיכון פנימי',
    description: 'הביצוע הכולל של המקבץ טוב, אך קיימים בתוכו שחקנים מתחת לציפייה שדורשים בדיקה.',
  },

  okRisk: {
    id: 'okRisk',
    family: 'performance',
    label: 'תקין עם שחקנים לבדיקה',
    description: 'המקבץ עומד בציפייה הכללית, אך קיימות חריגות נקודתיות אצל חלק מהשחקנים.',
  },

  limitedImpact: {
    id: 'limitedImpact',
    family: 'performance',
    label: 'השפעה מוגבלת',
    description: 'המקבץ לא פוגע בצורה משמעותית, אך גם לא מייצר השפעה חיובית מספקת.',
  },

  limitedRisk: {
    id: 'limitedRisk',
    family: 'performance',
    label: 'השפעה מוגבלת עם סיכון',
    description: 'המקבץ לא מייצר מספיק ערך ובמקביל כולל שחקנים שנמצאים מתחת לציפייה.',
  },

  groupWeak: {
    id: 'groupWeak',
    family: 'performance',
    label: 'מקבץ פוגע בתפקוד',
    description: 'המקבץ נמצא מתחת לציפייה ומייצר השפעה שלילית על התפקוד הקבוצתי.',
  },

  groupCollapse: {
    id: 'groupCollapse',
    family: 'performance',
    label: 'קריסת מקבץ',
    description: 'המקבץ מציג ציון נמוך, TVA שלילי או נזק משמעותי שמחייב טיפול מקצועי.',
  },

  stablePosition: {
    id: 'stablePosition',
    family: 'performance',
    label: 'עמדה יציבה',
    description: 'העמדה מתפקדת בטווח תקין ואין בה סיכון מקצועי משמעותי.',
  },

  strongPosition: {
    id: 'strongPosition',
    family: 'performance',
    label: 'עמדה חזקה',
    description: 'העמדה מייצרת תרומה חיובית ברורה ביחס לציפייה ולמדגם.',
  },

  positionRisk: {
    id: 'positionRisk',
    family: 'performance',
    label: 'עמדה עם סיכון',
    description: 'העמדה כוללת שחקנים מתחת לציפייה או נזק מצטבר, גם אם חלק מהמדדים עדיין נראים סבירים.',
  },

  positionWeak: {
    id: 'positionWeak',
    family: 'performance',
    label: 'עמדה פוגעת בתפקוד',
    description: 'העמדה מציגה ביצוע נמוך והשפעה שלילית על הקבוצה.',
  },

  positionCollapse: {
    id: 'positionCollapse',
    family: 'performance',
    label: 'קריסת עמדה',
    description: 'העמדה נמצאת במצב בעייתי מובהק מבחינת ציון, TVA, מדגם או כמות שחקנים מתחת לציפייה.',
  },
}

// תובנות סיכון מקצועי בתוך מקבץ
// אחריות: זיהוי סיכון פנימי לפי כמות שחקנים מתחת לציפייה ועומק הנזק,
export const TEAM_PLAYERS_RISK_INSIGHT_TYPES = {
  noRisk: {
    id: 'noRisk',
    family: 'risk',
    label: 'אין סיכון משמעותי',
    description: 'לא זוהה במקבץ נזק מקצועי או כמות חריגה של שחקנים מתחת לציפייה.',
  },

  lightRisk: {
    id: 'lightRisk',
    family: 'risk',
    label: 'חריגה קלה',
    description: 'יש סימן ראשוני לבעיה, אך עדיין לא מדובר במצב שמחייב שינוי משמעותי.',
  },

  checkRequired: {
    id: 'checkRequired',
    family: 'risk',
    label: 'דורש בדיקה',
    description: 'קיימים מספיק סימנים כדי לפתוח דרילדאון ולבדוק אילו שחקנים מושכים את המקבץ למטה.',
  },

  highRisk: {
    id: 'highRisk',
    family: 'risk',
    label: 'סיכון גבוה',
    description: 'המקבץ כולל בעיה משמעותית בכמות השחקנים החלשים או בעומק הנזק המצטבר.',
  },

  criticalRisk: {
    id: 'criticalRisk',
    family: 'risk',
    label: 'סיכון קריטי',
    description: 'המקבץ נמצא ברמת סיכון גבוהה מאוד ודורש פעולה מקצועית מיידית.',
  },
}

// תובנות איכות מדגם ואמינות החישוב
// אחריות: קביעה האם יש מספיק דקות, משחקים ונתוני scoring כדי להסיק מסקנה.
// דוגמאות: אין מדגם, מדגם נמוך, מדגם חלקי, מדגם תקין.
export const TEAM_PLAYERS_SAMPLE_INSIGHT_TYPES = {
  noSample: {
    id: 'noSample',
    family: 'sample',
    label: 'אין מדגם',
    description: 'אין מספיק נתונים כדי להסיק מסקנה מקצועית על המקבץ או העמדה.',
  },

  lowSample: {
    id: 'lowSample',
    family: 'sample',
    label: 'מדגם נמוך',
    description: 'קיימים נתונים חלקיים בלבד, ולכן התובנה צריכה להיחשב בזהירות.',
  },

  partialSample: {
    id: 'partialSample',
    family: 'sample',
    label: 'מדגם חלקי',
    description: 'יש מספיק מידע ראשוני לתצוגה, אך לא מספיק כדי לקבוע מסקנה חזקה.',
  },

  reliableSample: {
    id: 'reliableSample',
    family: 'sample',
    label: 'מדגם תקין',
    description: 'כמות הדקות והמשחקים מאפשרת להסיק תובנה מקצועית ברמת אמינות סבירה.',
  },

  strongSample: {
    id: 'strongSample',
    family: 'sample',
    label: 'מדגם חזק',
    description: 'המדגם רחב מספיק כדי לבסס מסקנה מקצועית ברמת ביטחון גבוהה.',
  },
}

// תובנות פירוט שחקנים בתוך מקבץ
// אחריות: פירוק התובנה לרמת השחקנים שמרכיבים את המקבץ.
// דוגמאות: שחקנים לא תקינים, שחקנים תקינים, שחקנים עם נזק גבוה.
export const TEAM_PLAYERS_DRILLDOWN_INSIGHT_TYPES = {
  weakPlayers: {
    id: 'weakPlayers',
    family: 'drilldown',
    label: 'שחקנים לא תקינים',
    description: 'שחקנים שנמצאים מתחת לציפייה לפי ציון, TVA, נזק מצטבר או שילוב ביניהם.',
  },

  okPlayers: {
    id: 'okPlayers',
    family: 'drilldown',
    label: 'שחקנים תקינים',
    description: 'שחקנים שנמצאים בטווח הציפייה ואינם מייצרים נזק משמעותי למקבץ.',
  },

  noSamplePlayers: {
    id: 'noSamplePlayers',
    family: 'drilldown',
    label: 'שחקנים ללא מדגם',
    description: 'שחקנים שאין עליהם מספיק דקות או נתונים כדי לקבוע האם הם עומדים בציפייה.',
  },

  highDamagePlayers: {
    id: 'highDamagePlayers',
    family: 'drilldown',
    label: 'שחקנים עם נזק גבוה',
    description: 'שחקנים שההשפעה השלילית שלהם על המקבץ גבוהה ביחס לדקות ולתפקיד שלהם.',
  },

  positiveImpactPlayers: {
    id: 'positiveImpactPlayers',
    family: 'drilldown',
    label: 'שחקנים עם השפעה חיובית',
    description: 'שחקנים שמייצרים TVA חיובי או תרומה ברורה שמחזקת את המקבץ.',
  },
}

// תובנות המלצה לפעולה
// אחריות: תרגום האבחנה המקצועית לפעולה אפשרית למאמן / מנהל מקצועי.
// דוגמאות: לחזק עמדה, להפחית עומס, לעדכן מעמד, להפחית דקות לשחקן פוגע.
export const TEAM_PLAYERS_RECOMMEND_INSIGHT_TYPES = {
  strengthenPosition: {
    id: 'strengthenPosition',
    family: 'recommendation',
    label: 'לחזק עמדה',
    description: 'העמדה מציגה חוסר, סיכון או ביצוע נמוך, ולכן מומלץ לשקול חיזוק מקצועי.',
  },

  reducePositionLoad: {
    id: 'reducePositionLoad',
    family: 'recommendation',
    label: 'להפחית עומס מעמדה',
    description: 'יש עומס או ריכוז גבוה מדי של שחקנים באותה עמדה, ולכן כדאי לבחון חלוקת תפקידים מחדש.',
  },

  replaceWeakKeyPlayer: {
    id: 'replaceWeakKeyPlayer',
    family: 'recommendation',
    label: 'לבחון מעמד של שחקן מפתח חלש',
    description: 'שחקן מפתח מתפקד מתחת לציפייה, ולכן ההשפעה שלו עלולה להיות גדולה במיוחד.',
  },

  increaseMinutesForStablePlayer: {
    id: 'increaseMinutesForStablePlayer',
    family: 'recommendation',
    label: 'להגדיל דקות לשחקן יציב',
    description: 'שחקן מציג יציבות או השפעה חיובית, ולכן ייתכן שכדאי להגדיל את חלקו ברוטציה.',
  },

  reduceMinutesForDamagingPlayer: {
    id: 'reduceMinutesForDamagingPlayer',
    family: 'recommendation',
    label: 'להפחית דקות לשחקן שעומד מתחת לציפייה',
    description: 'שחקן מייצר נזק מקצועי משמעותי, ולכן כדאי לשקול הפחתת דקות או שינוי תפקיד.',
  },

  completeMissingSample: {
    id: 'completeMissingSample',
    family: 'recommendation',
    label: 'להשלים מדגם',
    description: 'אין מספיק נתונים על שחקנים או מקבץ, ולכן מומלץ להמתין למדגם נוסף לפני החלטה.',
  },

  adjustPlayerRole: {
    id: 'adjustPlayerRole',
    family: 'recommendation',
    label: 'לעדכן מעמד שחקן',
    description: 'הביצוע בפועל לא תואם את המעמד שהוגדר לשחקן, ולכן כדאי לבחון שינוי היררכיה.',
  },
}

export const TEAM_PLAYERS_INSIGHT_TYPES = {
  ...TEAM_PLAYERS_STRUCTURE_INSIGHT_TYPES,
  ...TEAM_PLAYERS_PERFORMANCE_INSIGHT_TYPES,
  ...TEAM_PLAYERS_RISK_INSIGHT_TYPES,
  ...TEAM_PLAYERS_SAMPLE_INSIGHT_TYPES,
  ...TEAM_PLAYERS_DRILLDOWN_INSIGHT_TYPES,
  ...TEAM_PLAYERS_RECOMMEND_INSIGHT_TYPES,
}

export const getTeamPlayersInsightType = id => {
  return TEAM_PLAYERS_INSIGHT_TYPES[id] || {
    id: id || 'unknown',
    family: 'unknown',
    label: 'תובנה לא מוגדרת',
    description: 'לא נמצאה הגדרה לקטגוריית התובנה הזאת.',
  }
}
