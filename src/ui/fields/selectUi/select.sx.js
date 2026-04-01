// ui/fields/selectUi/select.sx.js

/// Games
export const gameSx = {
  boxWraper: {
    p: 0.5,
    mb: 0.5,
    borderRadius: 'md',
    bgcolor: 'neutral.softBg',
    border: '1px solid',
    borderColor: 'neutral.outlinedBorder',
    display: 'flex',
    gap:1
  },

  selectFil: {
    sx: { minWidth: 130 },
  },

}

export const gameSlot = {
  listbox: {
    sx: {
      maxHeight: 240,
      width: '100%'
    }
  },

  button: {
    sx: { fontSize: '12px' }
  }
}

// meetings
export const meetingsSx = {
  boxRender: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1.5,
    direction: 'rtl',
    px: 1,
  }
}

export const meetingsStyle = {
  liSty: (ownerState) => ({
    listStyle: 'none',
    paddingTop: 6,
    paddingBottom: 6,
    backgroundColor: '#d0e1ff',
    transition: 'background-color 0.2s ease',
    borderRadius: 8,
    margin: 2,
  })
}

// players
export const playersSlot = {
  listbox: {
    className: 'dpScrollThin',
    sx: {
      maxHeight: 320,
      //minWidth: 'var(--Select-trigger-width)',
      overflow: 'auto',
      //p: 0.5,
      borderRadius: 'md',
      //boxShadow: 'lg',

    },
  },
}

export const playersStyle = {
  liSty: (ownerState) => ({
    listStyle: 'none',
    paddingTop: 6,
    paddingBottom: 6,
    backgroundColor: '#d0e1ff',
    transition: 'background-color 0.2s ease',
    borderRadius: 8,
    margin: 2,
  })
}

// teams
export const teamsSlot = {
  listbox: {
    className: 'dpScrollThin',
    sx: {
      maxHeight: 320,
      minWidth: 'var(--Select-trigger-width)',
      overflow: 'auto',
      p: 0.5,
      borderRadius: 'md',
      boxShadow: 'lg',
      '& .MuiOption-root': {
        py: 0.5,
        px: 0.75,
        borderRadius: 'sm',
      },
    },
  },
}

export const teamsStyle = {
  liSty: (ownerState) => ({
    listStyle: 'none',
    paddingTop: 6,
    paddingBottom: 6,
    backgroundColor: '#d0e1ff',
    transition: 'background-color 0.2s ease',
    borderRadius: 8,
    margin: 2,
  })
}
