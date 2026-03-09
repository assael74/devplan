//// MonthYearPicker
export const selectPropsM = {
  size: 'sm',
  placeholder: 'חודש',
  slotProps: {
    listbox: {
      sx: { maxHeight: 200 },
    },
  },
  sx: {
    flex: 1, // מתפרס על המקום הפנוי
    width: 110,
    mr: -1
  },
}

export const selectPropsY = {
  size: 'sm',
  placeholder: 'שנה',
  slotProps: {
    listbox: {
      sx: { maxHeight: 200 },
    },
  },
  sx: {
    flex: 1,
    width: 80,
  },
}
