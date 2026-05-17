// teamProfile/sharedUi/insights/teamPlayers/takeaways/takeaways.model.js

const emptyArray = []

const hasItems = (items) => {
  return Array.isArray(items) && items.length > 0
}

export const buildStructureTakeaway = ({
  alignment = {},
  structure = {},
} = {}) => {
  const positionStructure = alignment?.positionStructure || {}

  const thin = positionStructure.thin || emptyArray
  const overloaded = positionStructure.overloaded || emptyArray
  const keyOverload = positionStructure.keyOverload || emptyArray

  const squad = structure?.squad || {}

  if (thin.length) {
    return {
      id: 'structure_thin_positions',
      label: 'חוסר עומק בעמדות',
      actionLabel: 'בדיקת עומק סגל',
      tone: 'warning',
      text: `קיימות ${thin.length} עמדות מתחת למינימום של 2 שחקנים בעמדה. לפני ניתוח דקות וביצועים, צריך לבדוק האם מדובר בחוסר אמיתי או בשחקנים שמכסים כמה עמדות.`,
    }
  }

  if (overloaded.length) {
    return {
      id: 'structure_overloaded_positions',
      label: 'עומס יתר בעמדות',
      actionLabel: 'בדיקת איזון סגל',
      tone: 'warning',
      text: `קיימות ${overloaded.length} עמדות עם יותר מ־4 שחקנים. זה יכול להעיד על עומס בסגל, כפילות תפקידים או צורך בהגדרה מדויקת יותר של עמדות.`,
    }
  }

  if (keyOverload.length) {
    return {
      id: 'structure_key_overload',
      label: 'ריכוז שחקני מפתח בעמדה',
      actionLabel: 'בדיקת מעמד לפי עמדה',
      tone: 'warning',
      text: `קיימות ${keyOverload.length} עמדות עם יותר משחקן מפתח אחד. היעד הוא עד שחקן מפתח אחד בכל עמדה כדי למנוע כפילות במעמד ובציפיות.`,
    }
  }

  if ((squad.withoutRole || 0) > 0) {
    return {
      id: 'structure_missing_roles',
      label: 'שחקנים ללא מעמד',
      actionLabel: 'השלמת הגדרות',
      tone: 'warning',
      text: `${squad.withoutRole} שחקנים ללא מעמד מוגדר. קשה לנתח שימוש מול יעד בלי לדעת מה הציפייה המקצועית מהם.`,
    }
  }

  if ((squad.withoutPosition || 0) > 0) {
    return {
      id: 'structure_missing_positions',
      label: 'שחקנים ללא עמדה',
      actionLabel: 'השלמת עמדות',
      tone: 'warning',
      text: `${squad.withoutPosition} שחקנים ללא עמדה מוגדרת. ללא שיוך עמדה קשה לבדוק עומק, עומס וריכוז שחקני מפתח לפי עמדה.`,
    }
  }

  return {
    id: 'structure_ok',
    label: 'מבנה סגל תקין',
    actionLabel: 'מבנה מאוזן',
    tone: 'success',
    text: 'מבנה הסגל עומד ביעדי הכיסוי הבסיסיים: 2–4 שחקנים לעמדה ועד שחקן מפתח אחד בכל עמדה.',
  }
}

export const buildProjectTakeaway = ({
  alignment = {},
  structure = {},
} = {}) => {
  const project = structure?.project || {}
  const lowOpportunity =
    alignment?.projectOpportunity?.lowOpportunity || emptyArray

  if (lowOpportunity.length) {
    return {
      id: 'project_low_opportunity',
      label: 'פרויקט ללא הזדמנות מספקת',
      actionLabel: 'בדיקת מסלול פרויקט',
      tone: 'warning',
      text: `${lowOpportunity.length} שחקני פרויקט מקבלים פחות מ־25% דקות או לא שותפו בפועל. המשמעות היא שהפרויקט קיים ברישום, אבל לא בהכרח מתורגם להזדמנות משחק.`,
    }
  }

  if ((project.totalProject || 0) === 0) {
    return {
      id: 'project_empty',
      label: 'אין שחקני פרויקט',
      actionLabel: 'אין פרויקט פעיל',
      tone: 'neutral',
      text: 'לא נמצאו שחקני פרויקט פעילים בסגל. אזור זה ישמש בעיקר לאחר שיוגדרו שחקני פרויקט או מועמדים.',
    }
  }

  return {
    id: 'project_ok',
    label: 'פרויקט משולב בסגל',
    actionLabel: 'שילוב תקין',
    tone: 'success',
    text: 'שחקני הפרויקט קיימים בסגל ולא זוהתה חריגה משמעותית בהזדמנות המשחק שלהם לפי המודל הנוכחי.',
  }
}

export const buildUsageTakeaway = ({
  alignment = {},
  usage = {},
} = {}) => {
  const underUsed = alignment?.underUsedByRole || emptyArray
  const overUsed = alignment?.overUsedByRole || emptyArray
  const squadButNotPlayed = usage?.squadButNotPlayed || emptyArray

  if (underUsed.length) {
    return {
      id: 'usage_under_used',
      label: 'פער בין מעמד לשימוש',
      actionLabel: 'בדיקת שימוש חסר',
      tone: 'warning',
      text: `יש ${underUsed.length} שחקנים שנמצאים מתחת לטווח הדקות הצפוי למעמד שלהם. זהו סימן לפער בין ההגדרה המקצועית לבין השימוש בפועל.`,
    }
  }

  if (squadButNotPlayed.length) {
    return {
      id: 'usage_squad_no_minutes',
      label: 'שחקנים בסגל ללא דקות',
      actionLabel: 'בדיקת שיתוף',
      tone: 'warning',
      text: `${squadButNotPlayed.length} שחקנים הופיעו בסגל אך לא קיבלו דקות. כדאי לבדוק האם מדובר בשחקני קצה, חוסר אמון, או ניהול סגל נקודתי.`,
    }
  }

  if (overUsed.length) {
    return {
      id: 'usage_over_used',
      label: 'שימוש גבוה מהגדרה',
      actionLabel: 'בדיקת עומס',
      tone: 'primary',
      text: `${overUsed.length} שחקנים מקבלים שימוש גבוה יותר מהטווח שהוגדר למעמד שלהם. זה יכול להעיד על התקדמות, או על עומס שנוצר מחוסר עומק.`,
    }
  }

  return {
    id: 'usage_ok',
    label: 'שימוש תואם למעמד',
    actionLabel: 'שימוש מאוזן',
    tone: 'success',
    text: 'חלוקת הדקות והפתיחות נראית תואמת יחסית למעמדות שהוגדרו לשחקנים.',
  }
}

export const buildProductionTakeaway = ({
  production = {},
} = {}) => {
  const attack = production?.attack || {}
  const contributors = attack?.contributors || emptyArray
  const highMinutesNoProduction =
    attack?.highMinutesNoProduction || emptyArray

  if (highMinutesNoProduction.length) {
    return {
      id: 'production_minutes_no_output',
      label: 'דקות ללא תרומה ישירה',
      actionLabel: 'בדיקת תפוקה',
      tone: 'warning',
      text: `${highMinutesNoProduction.length} שחקנים עם נפח דקות גבוה לא רשמו שער או בישול. חשוב לבדוק זאת לפי עמדה: אצל שחקני הגנה זה פחות חריג, אצל שחקני התקפה זה משמעותי יותר.`,
    }
  }

  if (!contributors.length) {
    return {
      id: 'production_no_contributors',
      label: 'אין תרומה ישירה',
      actionLabel: 'בדיקת התקפה',
      tone: 'warning',
      text: 'לא נמצאו שחקנים עם שערים או בישולים. אם קיימים משחקים משוחקים, זה מצביע על חוסר בפיזור תרומה התקפית או על חסר בנתוני המשחק.',
    }
  }

  return {
    id: 'production_ok',
    label: 'יש תרומה ישירה בסגל',
    actionLabel: 'תרומה קיימת',
    tone: 'success',
    text: `${contributors.length} שחקנים תרמו ישירות בשערים או בישולים. השלב הבא הוא לבדוק האם התרומה תואמת את העמדה והמעמד של כל שחקן.`,
  }
}

export const buildFlagsTakeaway = ({
  flags = {},
} = {}) => {
  const critical = flags?.critical || emptyArray
  const warning = flags?.warning || emptyArray
  const info = flags?.info || emptyArray

  const primary =
    critical[0] ||
    warning[0] ||
    info[0] ||
    null

  if (!primary) {
    return {
      item: {
        id: 'flags_ok',
        label: 'אין חריגים מרכזיים',
        actionLabel: 'מצב תקין',
        tone: 'success',
        text: 'לא נמצאו חריגים בולטים במבנה הסגל, שימוש בפועל או תפקוד לפי המודל הנוכחי.',
      },
      details: [],
    }
  }

  const details = [
    ...critical,
    ...warning,
    ...info,
  ].map((item) => ({
    id: item.id,
    label: item.label,
    text: item.text,
  }))

  return {
    item: {
      ...primary,
      actionLabel: primary.label || 'חריג לבדיקה',
      tone: hasItems(critical)
        ? 'danger'
        : hasItems(warning)
          ? 'warning'
          : 'primary',
    },
    details,
  }
}

export const buildTakeawaysModel = ({
  structure,
  usage,
  production,
  alignment,
  flags,
} = {}) => {
  return {
    structure: buildStructureTakeaway({
      structure,
      alignment,
    }),

    project: buildProjectTakeaway({
      structure,
      alignment,
    }),

    usage: buildUsageTakeaway({
      usage,
      alignment,
    }),

    production: buildProductionTakeaway({
      production,
    }),

    flags: buildFlagsTakeaway({
      flags,
    }),
  }
}
