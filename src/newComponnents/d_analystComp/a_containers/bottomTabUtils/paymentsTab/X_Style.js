/// PaymentsIncomeTab
export const sheetTabsProps = {
  variant: 'outlined',
  sx: {
    borderRadius: 'md',
    p: 1,
    width: '100%',
    maxWidth: { xs: '100%', md: 1200 },
    display: 'flex',
    flexDirection: 'column',
    height: { xs: '60vh', md: '57vh' },
    minHeight: 0,
    overflow: 'hidden',
  },
};

export const boxWraperPanelProps = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 },
  transition: { duration: 0.3 },
  sx: {
    flexGrow: 1,
    overflowY: 'auto',
    height: '100%',
    pr: 1
  }
}

/// IncomeTableView
export const boxFiltersProps = {
  sx: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    mb: 1
  }
}

export const tableProps = (color) => ({
  size:"sm",
  variant:"outlined",
  borderAxis:"both",
  stickyHeader: true,
  sx: {
    minWidth: { xs: 300, md: 700 },
    width: '100%',
    '& th, & td': { textAlign: 'center', whiteSpace: 'nowrap', fontSize: { xs: '0.75rem', md: '0.875rem' } },
    '& th': { backgroundColor: color },
  }
})

/// getPaymentsRowStructure
export const typoCellProps = {
  sx: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    dir: 'rtl',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '100%',
  }
}

export const typoStatus = {
  noWrap: true,
  sx: {
    textAlign: 'center',
    direction: 'rtl',
    width: '100%'
  }
}
