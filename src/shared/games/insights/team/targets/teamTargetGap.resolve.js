// shared/games/insights/team/targets/teamTargetGap.resolve.js

const getProfileLabel = (profile) => {
  return (
    profile?.rankRangeLabel ||
    profile?.rankLabel ||
    profile?.shortLabel ||
    profile?.label ||
    ''
  )
}

const getRangeMin = (profile) => {
  const value = profile?.rankRange?.[0]
  const n = Number(value)

  return Number.isFinite(n) ? n : null
}

const getRangeMax = (profile) => {
  const value = profile?.rankRange?.[1]
  const n = Number(value)

  return Number.isFinite(n) ? n : null
}

const getRangeMiddle = (profile) => {
  const min = getRangeMin(profile)
  const max = getRangeMax(profile)

  if (!Number.isFinite(min) || !Number.isFinite(max)) return null

  return (min + max) / 2
}

const getProfileOrderValue = (profile) => {
  return getRangeMiddle(profile)
}

const buildUnknownGap = ({ targetProfile, forecastProfile }) => {
  return {
    targetProfileId: targetProfile?.id || null,
    forecastProfileId: forecastProfile?.id || null,

    targetLabel: getProfileLabel(targetProfile),
    forecastLabel: getProfileLabel(forecastProfile),

    targetRankRange: targetProfile?.rankRange || null,
    forecastRankRange: forecastProfile?.rankRange || null,

    relation: 'unknown',
    rankGap: null,

    isAboveTarget: false,
    isOnTarget: false,
    isBelowTarget: false,

    label: 'לא ידוע',
    text: 'אין מספיק מידע כדי להשוות בין יעד הקבוצה לבין תחזית הביצוע הנוכחית.',
  }
}

const buildRelationText = ({
  relation,
  targetLabel,
  forecastLabel,
}) => {
  if (relation === 'onTarget') {
    return targetLabel
      ? `הקבוצה נמצאת כרגע בקצב שמתאים ליעד שהוגדר: ${targetLabel}.`
      : 'הקבוצה נמצאת כרגע בקצב שמתאים ליעד שהוגדר.'
  }

  if (relation === 'above') {
    return targetLabel && forecastLabel
      ? `הקבוצה מכוונת ל${targetLabel}, וקצב הביצוע הנוכחי מתאים ל${forecastLabel}.`
      : 'קצב הביצוע הנוכחי גבוה מיעד הקבוצה שהוגדר.'
  }

  if (relation === 'below') {
    return targetLabel && forecastLabel
      ? `הקבוצה מכוונת ל${targetLabel}, אך קצב הביצוע הנוכחי מתאים ל${forecastLabel}.`
      : 'קצב הביצוע הנוכחי נמוך מיעד הקבוצה שהוגדר.'
  }

  return 'אין מספיק מידע כדי להשוות בין יעד הקבוצה לבין תחזית הביצוע הנוכחית.'
}

export function resolveTeamTargetGap({
  targetProfile,
  forecastProfile,
} = {}) {
  if (!targetProfile?.id || !forecastProfile?.id) {
    return buildUnknownGap({
      targetProfile,
      forecastProfile,
    })
  }

  const targetOrder = getProfileOrderValue(targetProfile)
  const forecastOrder = getProfileOrderValue(forecastProfile)

  if (!Number.isFinite(targetOrder) || !Number.isFinite(forecastOrder)) {
    return buildUnknownGap({
      targetProfile,
      forecastProfile,
    })
  }

  const targetLabel = getProfileLabel(targetProfile)
  const forecastLabel = getProfileLabel(forecastProfile)

  const rankGap = forecastOrder - targetOrder

  let relation = 'onTarget'

  // בטבלה, מספר נמוך יותר = טוב יותר.
  if (forecastOrder < targetOrder) relation = 'above'
  if (forecastOrder > targetOrder) relation = 'below'

  const labels = {
    above: 'מעל היעד',
    onTarget: 'בתוך היעד',
    below: 'מתחת ליעד',
    unknown: 'לא ידוע',
  }

  return {
    targetProfileId: targetProfile.id,
    forecastProfileId: forecastProfile.id,

    targetLabel,
    forecastLabel,

    targetRankRange: targetProfile.rankRange || null,
    forecastRankRange: forecastProfile.rankRange || null,

    relation,
    rankGap,

    isAboveTarget: relation === 'above',
    isOnTarget: relation === 'onTarget',
    isBelowTarget: relation === 'below',

    label: labels[relation],
    text: buildRelationText({
      relation,
      targetLabel,
      forecastLabel,
    }),
  }
}
