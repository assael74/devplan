export const scoutPriorityColors = {
  leadingTarget: {
    main: '#5B963F',
    light: '#E8F3E2',
    text: '#2F5F24',
  },
  highPriority: {
    main: '#27CCB1',
    light: '#E8FAF7',
    text: '#176F62',
  },
  positive: {
    main: '#B7D9A8',
    light: '#F5FAF2',
    text: '#557A48',
  },
  regular: {
    main: '#657684',
    light: '#F1F4F6',
    text: '#4D5B66',
  },
  lowPriority: {
    main: '#C58A32',
    light: '#FBF3E6',
    text: '#8A5E1F',
  },
}

const priorityByValue = {
  elite: {
    label: 'יעד מוביל',
    shortLabel: 'יעד מוביל',
    colors: scoutPriorityColors.leadingTarget,
    iconId: 'leadingTarget',
  },
  high: {
    label: 'עדיפות גבוהה',
    shortLabel: 'גבוהה',
    colors: scoutPriorityColors.highPriority,
    iconId: 'highPriority',
  },
  positive: {
    label: 'חיובי',
    shortLabel: 'חיובי',
    colors: scoutPriorityColors.positive,
    iconId: 'positivePriority',
  },
  neutral: {
    label: 'רגיל',
    shortLabel: 'רגיל',
    colors: scoutPriorityColors.regular,
    iconId: 'regularPriority',
  },
  low: {
    label: 'עדיפות נמוכה',
    shortLabel: 'נמוכה',
    colors: scoutPriorityColors.lowPriority,
    iconId: 'lowPriority',
  },
}

export function resolveScoutPriority(value) {
  return priorityByValue[value] || priorityByValue.neutral
}

export const scoutPrioritySx = {
  tooltipContent: {
    width: 190,
    maxWidth: 190,
    color: 'inherit',
    lineHeight: 1.35,
    textAlign: 'left',
    whiteSpace: 'normal',
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
  },
  root: ({ colors, fontSize }) => ({
    minHeight: fontSize + 8,
    maxWidth: '100%',
    px: 0.65,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.35,
    overflow: 'hidden',
    color: colors.text,
    bgcolor: colors.light,
    border: `1px solid ${colors.main}33`,
    borderRadius: 999,
    whiteSpace: 'nowrap',
  }),
  icon: ({ colors, fontSize }) => ({
    flexShrink: 0,
    color: colors.main,
    fontSize: fontSize + 1,
  }),
  label: ({ colors, fontSize }) => ({
    minWidth: 0,
    overflow: 'hidden',
    color: colors.text,
    fontSize,
    fontWeight: 700,
    lineHeight: 1,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
}
