export const TEAM_TASK_INDICATOR_KIND = Object.freeze({
  NONE: 'none',
  OFFENSE: 'offense',
  DEFENSE: 'defense',
  COMBINED: 'combined',
})

const TEAM_TASK_INDICATORS = Object.freeze({
  [TEAM_TASK_INDICATOR_KIND.NONE]: Object.freeze({
    id: TEAM_TASK_INDICATOR_KIND.NONE,
    label: '',
    iconId: '',
  }),
  [TEAM_TASK_INDICATOR_KIND.OFFENSE]: Object.freeze({
    id: TEAM_TASK_INDICATOR_KIND.OFFENSE,
    label: 'יש משימה התקפית לבחינה',
    iconId: 'attack',
  }),
  [TEAM_TASK_INDICATOR_KIND.DEFENSE]: Object.freeze({
    id: TEAM_TASK_INDICATOR_KIND.DEFENSE,
    label: 'יש משימה הגנתית לבחינה',
    iconId: 'defense',
  }),
  [TEAM_TASK_INDICATOR_KIND.COMBINED]: Object.freeze({
    id: TEAM_TASK_INDICATOR_KIND.COMBINED,
    label: 'יש משימות התקפיות והגנתיות לבחינה',
    iconId: 'transitions',
  }),
})

export const resolveTeamTaskIndicator = signals => {
  const offense = Boolean(signals?.offense)
  const defense = Boolean(signals?.defense)

  if (offense && defense) return TEAM_TASK_INDICATORS[TEAM_TASK_INDICATOR_KIND.COMBINED]
  if (offense) return TEAM_TASK_INDICATORS[TEAM_TASK_INDICATOR_KIND.OFFENSE]
  if (defense) return TEAM_TASK_INDICATORS[TEAM_TASK_INDICATOR_KIND.DEFENSE]

  return TEAM_TASK_INDICATORS[TEAM_TASK_INDICATOR_KIND.NONE]
}
