import { typeBackground } from '../../../../b_styleObjects/Colors.js'
import { accordionDetailsClasses, accordionSummaryClasses } from '@mui/joy';
import EditRoundedIcon from '@mui/icons-material/EditRounded';

export const boxPanelProps = {
  sx: {
    display: 'flex',
    flexDirection: 'column',
    height: '75vh',
    minHeight: 0,
    overflowY: 'auto',
    scrollbarGutter: 'stable both-edges',
    '&::-webkit-scrollbar': { width: 4 },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'var(--joy-palette-neutral-400)',
      borderRadius: 8,
    },
    '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
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
    width: 150,
    borderRadius: 'sm',
    color: isSelected ? color : undefined,
    borderBottom: isSelected ? `2px solid ${borderColor}` : '2px solid transparent',
    transition: 'all 0.2s ease-in-out',
  };
};

export const accordGroupProps = (theme) => {
  return {
    transition: "0.2s",
    size: 'lg',
    sx: (theme) => ({
      width: '100%',
      maxWidth: 900,
      borderRadius: 'lg',
      [`& .${accordionSummaryClasses.button}:hover`]: {
        bgcolor: 'transparent',
      },
      [`& .${accordionDetailsClasses.content}`]: {
        boxShadow: `inset 0 1px ${theme.vars.palette.divider}`,
        [`&.${accordionDetailsClasses.expanded}`]: {
          paddingBlock: '0.75rem',
          borderRadius: 'lg',
          width: 850,
          p: 3,
        },
      },
    })
  }
}

export const boxHeaderProps = {
  sx: {
    my: 2,
    px: 2,
    py: 1,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 'md',
    backgroundColor: 'neutral.softBg',
    boxShadow: 'sm',
  }
}
