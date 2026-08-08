// features/playersDatabase/ui/components/actions/InlineSelectConfirm.sx.js

export const inlineSelectConfirmSx = {
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.5,
    minWidth: 0,
  },

  select: fontSize => ({
    minHeight: 28,
    minWidth: 82,
    maxWidth: 118,
    fontSize,
    borderRadius: 7,
    '--Select-decoratorChildHeight': '26px',
  }),

  confirmButton: {
    width: 28,
    minWidth: 28,
    height: 28,
    minHeight: 28,
    borderRadius: 7,
  },
}
