import { typeBackground } from '../../../../b_styleObjects/Colors.js'
import { accordionDetailsClasses, accordionSummaryClasses } from '@mui/joy';
import EditRoundedIcon from '@mui/icons-material/EditRounded';

const idToTypeMap = {
  newMeeting: 'meetings',
  newPlayer: 'players',
  newTeam: 'teams',
  newClub: 'clubs',
  newPayment: 'payments',
  newTag: 'tags',
  newGame: 'games',
  newStats: 'statsParm',
  meetings: 'meetings',
  players: 'players',
  teams: 'teams',
  clubs: 'clubs',
  payments: 'payments',
  tags: 'tags',
  newRole: 'roles',
  roles: 'roles',
  games: 'games',
  statsParm: 'statsParm',
  evaluation: 'players'
};

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

export const drawerConsProps = (open, setOpen) => ({
  size:"md",
  variant:"plain",
  open: open,
  anchor:'bottom',
  onClose: () => setOpen(''),
  slotProps:{
    content: {
      sx: {
        height: '100dvh',
      },
    },
  }
})

export const sheetWraperProps = {
  sx: {
    borderRadius: 'md',
    display: 'flex',
    flexDirection: 'column',
    height: { xs: '100dvh', md: '95dvh' },
  }
}

export const boxContentWraperProps = (id, isMobile) => {
  const type = idToTypeMap[id] || 'players';
  const { bgc, text } = typeBackground[type] || {};
  return {
    sx: {
      flex: 1,
      p: 1,
      minHeight: 0,
      borderRadius: 'md',
      backgroundColor: bgc,
      color: text,
      display: 'flex',
      justifyContent: isMobile ? 'flex-start' : 'center',
      alignItems: 'flex-start',
      overflow: 'scroll',
      transition: 'all 0.3s ease',
      scrollbarGutter: 'stable both-edges',
      '& > .content-inner': {
        width: isMobile ? '100%' : '700px',
        transition: 'all 0.3s ease',
        //height: 400,
      },
      '&::-webkit-scrollbar': {
        width: '4px',
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: '#c1c1c1',
        borderRadius: '4px',
      },
      '&::-webkit-scrollbar-thumb:hover': {
        backgroundColor: '#a0a0a0',
      },
    }
  }
}

export const boxDomaimProps = {
  sx: {
    p: 0.9,
    borderRadius: 'md',
    bgcolor: 'neutral.softBg',
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    alignItems: 'center',
    gap: 0.75,
  }
}
