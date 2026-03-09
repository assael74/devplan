// ui/fields/dateUi/date.sx.js
export const monthYearPickerSx = {
  root: { spacing: 1 },
  label: { fontSize: 12 },
  row: {
    display: 'flex',
    gap: 1,
    alignItems: 'center',
    width: { md: 350, xs: 280 },
  },
  input: { flex: 1, width: '35%' },
  selectMonth: { width: '25%' },
  selectYear: { width: '40%' },
  listbox: { maxHeight: 200 },
}

export const dateInputFieldSx = {
  row: { alignItems: 'flex-end' },
  label: { fontSize: 12 },
  input: {
    '&:hover': { backgroundColor: '#eef4ff' },
  },
}

export const monthPickerSx = {
  rootRow: {
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' },
    gap: { xs: 1, md: 2 }
  },
  selectWrap: {
    position: 'relative',
    width: { xs: 120, md: 180 }
  },
  select: {
    minWidth: 150
  },
  label: {
    mb: 0.5
  },
}
