import { typeBackground } from '../../../../b_styleObjects/Colors.js'
/// PlayerPaymentsTab
export const boxPanelProps = {
  sx: {
    px: { xs: 0, md: 2 },
    minHeight: {md: '60vh' , xs: '77vh'} ,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  }
}

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
    maxWidth: 1450,
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

export const tabSx = (isSelected, type) => (theme) => {
  const color = typeBackground[type]?.text || theme.vars.palette.text.primary;
  const borderColor = typeBackground[type]?.bgc;

  return {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0.5,
    color: isSelected ? color : undefined,
    borderBottom: isSelected ? `2px solid ${borderColor}` : '2px solid transparent',
    transition: 'all 0.2s ease-in-out',
  };
};

export const boxSortProps = {
  sx: {
    display: 'flex',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 2,
  }
}
