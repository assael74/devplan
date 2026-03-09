
//// PlayersSelectorField
export const renderOptionStyle = {
  component: "li",
  sx: {
    display: 'flex',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 1.5,
    px: 1,
    py: 0.5,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: 'background.level2', // או צבע שתבחר
    }
  }
}

export const autoSlotProps = {
  listbox: {
    sx: {
      maxHeight: 200,
      overflowY: 'auto',
      borderRadius: 'md',
      px: 1,
      '&::-webkit-scrollbar': {
        width: 6,
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 6,
      }
    }
  }
}
