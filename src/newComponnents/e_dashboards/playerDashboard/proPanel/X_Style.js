export const tabListProps = {
  sx: {
    width: '100%',
    mx: 'auto',
    display: 'flex',
    justifyContent: 'flex-start',
    gap: 4,
    px: 2,
    py: 1,
    mb: 1
  }
}

export const tabsBoxProps = {
  sx: {
    position: 'fixed',
    bottom: 0,
    left: 'auto',
    right: 'auto',
    maxWidth: {md: 1090, xs: 350},
    width: '100%',
    mx: 'auto',
    backgroundColor: 'background.surface',
    boxShadow: '0 -4px 16px rgba(0,0,0,0.08)',
    borderTop: '1px solid',
    borderColor: 'divider',
    zIndex: 1200,
    borderRadius: 'xl',
  }
}

export const tabSx = (isSelected) => (theme) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 0.5,
  color: isSelected ? theme.vars.palette.primary[600] : undefined,
  borderBottom: isSelected ? `2px solid ${theme.vars.palette.primary[500]}` : '2px solid transparent',
  transition: 'all 0.2s ease-in-out',
});
