// src/features/playersDatabase/ui/components/page/sx/activityStatusChip.sx.js

export const activityStatusChipSx = {
  root: ({ backgroundColor, color, textColor }) => ({
    minHeight: 28,
    px: 1.2,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.75,
    borderRadius: 999,
    bgcolor: backgroundColor,
    border: `1px solid ${color}`,
    color: textColor,
  }),

  dot: color => ({
    width: 7,
    height: 7,
    flexShrink: 0,
    borderRadius: '50%',
    bgcolor: color,
  }),

  label: textColor => ({
    color: textColor,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  }),
}
