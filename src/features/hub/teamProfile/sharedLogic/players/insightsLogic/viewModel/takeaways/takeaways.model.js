// teamProfile/sharedLogic/players/insightsLogic/viewModel/takeaways/takeaways.model.js

const emptyArray = []

const safeArr = (value) => {
  return Array.isArray(value) ? value : emptyArray
}

const toNum = (value) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

const hasItems = (value) => {
  return safeArr(value).length > 0
}

const buildItem = ({
  id,
  title,
  text,
  color = 'neutral',
  icon = 'insights',
}) => {
  return {
    id,
    title,
    text,
    color,
    icon,
  }
}

const buildDetail = ({
  id,
  label,
  value,
  color = 'neutral',
  icon = 'details',
}) => {
  return {
    id,
    label,
    value,
    color,
    icon,
  }
}

const getPositionIssuesCount = (positionStructure = {}) => {
  return (
    safeArr(positionStructure.thin).length +
    safeArr(positionStructure.overloaded).length +
    safeArr(positionStructure.keyOverload).length
  )
}

const buildStructureTakeaway = ({
  structure = {},
  alignment = {},
}) => {
  const squad = structure?.squad || {}
  const positionStructure = alignment?.positionStructure?.primary || alignment?.positionStructure || {}

  const withoutRole = toNum(squad.withoutRole)
  const withoutPrimaryPosition = toNum(squad.withoutPrimaryPosition)
  const positionIssues = getPositionIssuesCount(positionStructure)

  if (withoutRole || withoutPrimaryPosition || positionIssues) {
    return buildItem({
      id: 'structureNeedsFix',
      title: 'מבנה הסגל דורש השלמה',
      text: 'יש שחקנים ללא מעמד, ללא עמדה ראשית או חריגות בכיסוי העמדות.',
      color: 'warning',
      icon: 'players',
    })
  }

  return buildItem({
    id: 'structureOk',
    title: 'מבנה הסגל מסודר',
    text: 'הסגל הפעיל מוגדר מבחינת מעמד ועמדה ראשית.',
    color: 'success',
    icon: 'players',
  })
}

const buildProjectTakeaway = ({
  structure = {},
  alignment = {},
}) => {
  const project = structure?.project || {}
  const opportunity = alignment?.projectOpportunity || {}

  const totalProject = toNum(project.totalProject)
  const lowOpportunity = safeArr(opportunity.lowOpportunity)

  if (!totalProject) {
    return buildItem({
      id: 'noProjectPlayers',
      title: 'אין שחקני פרויקט פעילים',
      text: 'הסגל הפעיל לא כולל כרגע שחקנים שמוגדרים בפרויקט.',
      color: 'neutral',
      icon: 'project',
    })
  }

  if (lowOpportunity.length) {
    return buildItem({
      id: 'projectLowOpportunity',
      title: 'שחקני פרויקט עם מעט הזדמנות',
      text: 'יש שחקני פרויקט שלא מקבלים מספיק דקות או שותפות ביחס למסלול שלהם.',
      color: 'warning',
      icon: 'project',
    })
  }

  return buildItem({
    id: 'projectOpportunityOk',
    title: 'שחקני הפרויקט מקבלים הזדמנות',
    text: 'שחקני הפרויקט הפעילים מקבלים מעורבות בפועל.',
    color: 'success',
    icon: 'project',
  })
}

const buildUsageTakeaway = ({
  alignment = {},
}) => {
  const underUsed = safeArr(alignment.underUsedByRole)
  const overUsed = safeArr(alignment.overUsedByRole)

  if (underUsed.length || overUsed.length) {
    return buildItem({
      id: 'usageGaps',
      title: 'פער בין מעמד לשימוש בפועל',
      text: 'יש שחקנים שהשימוש בהם לא תואם את המעמד שהוגדר להם.',
      color: 'warning',
      icon: 'playTimeRate',
    })
  }

  return buildItem({
    id: 'usageAligned',
    title: 'השימוש בפועל תואם את המעמד',
    text: 'חלוקת הדקות והפתיחות נראית עקבית ביחס למעמד השחקנים.',
    color: 'success',
    icon: 'playTimeRate',
  })
}

const buildProductionTakeaway = ({
  production = {},
}) => {
  const attack = production?.attack || {}
  const contributors = safeArr(attack.contributors)
  const goalsTotal = toNum(attack.goalsTotal)
  const assistsTotal = toNum(attack.assistsTotal)

  if (!goalsTotal && !assistsTotal) {
    return buildItem({
      id: 'noProduction',
      title: 'אין תפוקה התקפית מזוהה',
      text: 'לא זוהו שערים או בישולים משמעותיים מתוך נתוני השחקנים.',
      color: 'warning',
      icon: 'attack',
    })
  }

  if (contributors.length <= 2) {
    return buildItem({
      id: 'lowProductionSpread',
      title: 'התפוקה מרוכזת במספר שחקנים קטן',
      text: 'התרומה ההתקפית לא מתפזרת מספיק על פני הסגל.',
      color: 'warning',
      icon: 'attack',
    })
  }

  return buildItem({
    id: 'productionSpreadOk',
    title: 'יש פיזור בתפוקה',
    text: 'התפוקה ההתקפית מגיעה ממספר שחקנים ולא תלויה רק בשחקן אחד.',
    color: 'success',
    icon: 'attack',
  })
}

const buildFlagsTakeaway = ({
  structure = {},
  alignment = {},
  flags = {},
}) => {
  const squad = structure?.squad || {}
  const positionStructure = alignment?.positionStructure?.primary || alignment?.positionStructure || {}

  const details = [
    toNum(squad.withoutRole)
      ? buildDetail({
          id: 'withoutRole',
          label: 'ללא מעמד',
          value: `${toNum(squad.withoutRole)} שחקנים`,
          color: 'warning',
          icon: 'noneType',
        })
      : null,

    toNum(squad.withoutPrimaryPosition)
      ? buildDetail({
          id: 'withoutPrimaryPosition',
          label: 'ללא עמדה ראשית',
          value: `${toNum(squad.withoutPrimaryPosition)} שחקנים`,
          color: 'warning',
          icon: 'position',
        })
      : null,

    hasItems(positionStructure.thin)
      ? buildDetail({
          id: 'thinPositions',
          label: 'חוסר בעמדות',
          value: `${safeArr(positionStructure.thin).length} עמדות`,
          color: 'warning',
          icon: 'position',
        })
      : null,

    hasItems(positionStructure.overloaded)
      ? buildDetail({
          id: 'overloadedPositions',
          label: 'עומס בעמדות',
          value: `${safeArr(positionStructure.overloaded).length} עמדות`,
          color: 'warning',
          icon: 'position',
        })
      : null,

    hasItems(positionStructure.keyOverload)
      ? buildDetail({
          id: 'keyOverload',
          label: 'ריבוי שחקני מפתח',
          value: `${safeArr(positionStructure.keyOverload).length} עמדות`,
          color: 'warning',
          icon: 'keyPlayer',
        })
      : null,
  ].filter(Boolean)

  if (details.length) {
    return {
      item: buildItem({
        id: 'flagsFound',
        title: 'יש חריגים לבדיקה',
        text: 'נמצאו נקודות שדורשות בדיקה מקצועית במבנה הסגל.',
        color: 'warning',
        icon: 'insights',
      }),
      details,
    }
  }

  if (flags?.critical?.length) {
    return {
      item: buildItem({
        id: 'systemFlags',
        title: 'יש דגלים לבדיקה',
        text: 'המערכת זיהתה חריגות נוספות שכדאי לבדוק.',
        color: 'warning',
        icon: 'insights',
      }),
      details: safeArr(flags.critical),
    }
  }

  return {
    item: buildItem({
      id: 'noFlags',
      title: 'אין חריגים מרכזיים',
      text: 'לא זוהו פערים מרכזיים שמצריכים התערבות מיידית.',
      color: 'success',
      icon: 'insights',
    }),
    details: [],
  }
}

export const buildTakeawaysModel = ({
  structure = {},
  usage = {},
  production = {},
  alignment = {},
  flags = {},
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
      structure,
      alignment,
      flags,
    }),
  }
}
