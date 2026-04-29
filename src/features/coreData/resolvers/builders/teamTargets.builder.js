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
    position: raw.targetPosition ?? null,
    points: raw.targetPoints ?? null,
    successRate: raw.targetSuccessRate ?? null,
    goalsFor: raw.targetGoalsFor ?? null,
    goalsAgainst: raw.targetGoalsAgainst ?? null,
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
    benchmarkLevelId: raw.benchmarkLevelId || '',
    source: raw.source || '',
    sourceVersion: raw.sourceVersion || '',
    values,
    items,
    raw,
  }
}
