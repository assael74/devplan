const toTargetNumber = (value) => {
  if (value === undefined || value === null || value === '') return null

  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

export function buildTeamTargetsState(raw = null) {
  if (!raw) {
    return {
      hasTargets: false,
      status: '',
      assignedAt: '',
      assignedBy: '',
      benchmarkLevelId: '',
      values: {},
      items: [],
    }
  }

  const values = {
    position: toTargetNumber(raw.targetPosition),
    points: toTargetNumber(raw.targetPoints),
    successRate: toTargetNumber(raw.targetSuccessRate),
    goalsFor: toTargetNumber(raw.targetGoalsFor),
    goalsAgainst: toTargetNumber(raw.targetGoalsAgainst),
  }

  const items = [
    {
      id: 'targetPosition',
      label: 'מיקום יעד',
      value: values.position,
      unit: 'rank',
    },
    {
      id: 'targetPoints',
      label: 'נקודות יעד',
      value: values.points,
      unit: 'points',
    },
    {
      id: 'targetSuccessRate',
      label: 'אחוז הצלחה יעד',
      value: values.successRate,
      unit: 'percent',
    },
    {
      id: 'targetGoalsFor',
      label: 'שערי זכות יעד',
      value: values.goalsFor,
      unit: 'goals',
    },
    {
      id: 'targetGoalsAgainst',
      label: 'שערי חובה יעד',
      value: values.goalsAgainst,
      unit: 'goals',
    },
  ].filter((item) => item.value !== null && item.value !== undefined && item.value !== '')

  return {
    hasTargets: items.length > 0,
    status: raw.status || '',
    assignedAt: raw.assignedAt || '',
    assignedBy: raw.assignedBy || '',
    benchmarkLevelId: raw.benchmarkLevelId || raw.targetsBenchmarkLevelId || '',
    source: raw.source || '',
    sourceVersion: raw.sourceVersion || '',
    values,
    items,
    raw,
  }
}
