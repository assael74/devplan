export const wraperBoxProps = {
  sx: {
    maxWidth: 500,
    mx: 'auto',
    p: 1,
    border: '1px solid #ddd',
    borderRadius: 'md',
    backgroundColor: 'background.level1',
  }
}

export const linkBoxProps = {
  sx: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    '&:hover': { color: 'primary.600' },
  }
}

export const positionsBoxProp = {
  sx: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '12px',
  }
}

export const tableProps = {
  size: "sm",
  stickyHeader: false,
  borderAxis: "bothBetween",
  sx: {
    '& thead th': {
      textAlign: 'center',
      backgroundColor: 'primary.softBg',
      color: 'primary.softColor',
      fontWeight: 600,
    },
    '& tbody td': {
      textAlign: 'center',
    },
  }
}
