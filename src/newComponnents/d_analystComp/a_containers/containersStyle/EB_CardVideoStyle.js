export const cardProps = {
  sx: {
    width: 140,
    height: 205,
    borderRadius: 'md',
    boxShadow: 'sm',
    p: 1,
    cursor: 'pointer'
  }
}

export const typoVideoNameProps = {
  level: "title-sm",
  sx: {
    fontWeight: 500,
    fontSize: '12px',
    textAlign: 'right',
    direction: 'rtl',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    lineHeight: '1.2em',
    maxWidth: 'calc(100% - 32px)',
    minHeight: '2.4em',
  }
}

export const tagsBoxProps = {
  sx: {
    width: '100%',
    maxHeight: 32,
    minHeight: 25,
    overflowX: 'auto',
    display: 'flex',
    flexWrap: 'nowrap',
    gap: 0.5,
    mt: 0.5,
    pr: 0.5,
    pb: 0.3,
    '&::-webkit-scrollbar': {
      height: '1px',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#aaa',
      borderRadius: 8,
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: 'transparent',
    },
  }
}
