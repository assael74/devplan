import { Box } from '@mui/joy';
import { accordionClasses, accordionDetailsClasses, accordionSummaryClasses } from '@mui/joy';
import { typeBackground } from '../b_styleObjects/Colors.js'
import { iconUi } from '../b_styleObjects/icons/IconIndex.js'

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
  abilities: 'abilities'
};

export const addButtProps = (id, size) => {
  const type = idToTypeMap[id] || 'players';
  const { bgc, text } = typeBackground[type] || {};
  return {
    startDecorator: iconUi({ id, sx: { color: text, fontSize: size || 'md' } }),
    variant: 'solid',
    color: 'neutral',
    size: size || 'md',
    sx: {
      borderRadius: 'md',
      px: 1.5,
      fontWeight: 'bold',
      boxShadow: 'sm',
      backgroundColor: bgc,
      color: text,
      '&:hover': {
        backgroundColor: bgc,
        opacity: 0.9,
      },
    },
  };
}

export const addTwoButtProps = (id1, id2) => {
  const type = 'games';
  const { bgc, text } = typeBackground[type] || {};
  return {
    startDecorator: (
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        {iconUi({ id: id1, sx: { color: text } })}
        {iconUi({ id: id2, sx: { color: text } })}
      </Box>
    ),
    variant: 'solid',
    color: 'neutral',
    sx: {
      borderRadius: 'xl',
      px: 3,
      fontWeight: 'bold',
      boxShadow: 'sm',
      backgroundColor: bgc,
      color: text, // צבע טקסט
      '&:hover': {
        backgroundColor: bgc,
        opacity: 0.9,
      },
    },
  };
}

export const addIconButtProps = (id, size) => {
  const type = idToTypeMap[id] || 'players'; // ברירת מחדל
  const { bgc, text } = typeBackground[type] || {};
  return {
    variant: 'solid',
    color: 'neutral',
    size: size || 'md',
    sx: {
      borderRadius: 'md',
      fontWeight: 'bold',
      boxShadow: 'sm',
      backgroundColor: bgc,
      color: text,
      '&:hover': {
        backgroundColor: bgc,
        opacity: 0.9,
      },
    },
  };
}

export const clearButtProps = {
  size:"md",
  variant:"solid",
  color:"neutral",
  sx:{ borderRadius: 'md' }
}

export const datesBoxProps = {
  sx: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: '100%',
    gap: 1,
  }
}

export const ageTeamBoxProps = {
  sx: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    ml: 0.5,
  }
}

export const yearGroupBoxProps = (isMobile) => ({
  sx: {
    py: 0.5,
    ml: 2,
    borderRadius: 'sm',
    border: '1px solid',
    borderColor: 'primary.solidBg',
    width: isMobile ? 50 : 100,
    textAlign: 'center',
    fontWeight: 'lg',
    backgroundColor: 'warning.softBg',
    color: 'primary.900',
    boxShadow: 'md',
  }
})

export const boxExraFieldsProps = {
  sx: {
    maxHeight: 200,
    overflowY: 'auto',
    px: 0.5,
    pr: 1,
    pt: 2,
    '&::-webkit-scrollbar': {
      width: '3px',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#ccc',
      borderRadius: '6px',
    },
    '&::-webkit-scrollbar-thumb:hover': {
      backgroundColor: '#aaa',
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: 'transparent',
    },
  }
}

//// StatsFormContent
export const typoTimeText = {
  variant: "soft",
  color: "primary",
  sx: {
    direction: 'rtl',
    mb: 2,
    display: 'inline-flex',
    alignItems: 'center',
    px: 1,
    borderRadius: 'md',
    fontSize: '11px'
  }
}

export const accordGroupProps = (theme, isMobile) => ({
  variant: "plain",
  size: isMobile ? 'sm' : 'md',
  transition: "0.2s",
  sx: (theme) => ({
    width: '100%',
    borderRadius: 'lg',
    [`& .${accordionSummaryClasses.button}:hover`]: {
      //bgcolor: 'transparent',
      backgroundColor: theme.vars.palette.neutral.plainHoverBg,
    },
    [`& .${accordionSummaryClasses.button}`]: {
      backgroundColor: theme.vars.palette.neutral.plainHoverBg,
      borderRadius: 'md',
    },
    [`& .${accordionDetailsClasses.content}`]: {
      backgroundColor: theme.vars.palette.background.surface, // שונה קלות
    },
    [`& .${accordionDetailsClasses.content}`]: {
      [`&.${accordionDetailsClasses.expanded}`]: {
        paddingBlock: '0.90rem',
        backgroundColor: '#dbdedc',
        borderRadius: 'sm',
        px: 1,
        mt: 0.5,
        paddingInline: theme.spacing(1),
      },
    },
    [`& .${accordionClasses.root}`]: {
      marginBottom: theme.spacing(0.5),
    },
    [`& .${accordionClasses.expanded}`]: {
      boxShadow: 'lg'
    },
  })
})

export const accordInnerProps = (theme) => ({
  variant: "plain",
  size: 'sm',
  transition: "0.2s",
  sx: (theme) => ({
    mt: 2,
    ml: -1,
    bgcolor: 'transparent',
    width: '100%',
    borderRadius: 'lg',
    borderBottom: 'none',
    boxShadow: 'none',
  })
})

export const drawerConsProps = (open, setOpen) => ({
  size:"md",
  variant:"plain",
  open: open,
  anchor:'bottom',
  onClose: () => setOpen(false),
  slotProps:{
    content: {
      sx: {
        p: { md: 3 },
        height: '100dvh',
      },
    },
  }
})

export const sheetWraperProps = {
  sx: {
    borderRadius: 'md',
    px: 2,
    display: 'flex',
    flexDirection: 'column',
    height: '92dvh',
  }
}

export const sheetWraperProps1 = {
  sx: {
    borderRadius: 'md',
    px:2,
    display: 'flex',
    flexDirection: 'column',
    height: { xs: '100dvh', md: '92dvh' },
  }
}

export const boxContentWraperProps = (id, isMobile) => {
  const type = idToTypeMap[id] || 'players';
  const { bgc, text } = typeBackground[type] || {};
  return {
    sx: {
      flex: 1,
      minHeight: 0,
      mt: 2,
      mb: 2,
      p: 2,
      borderRadius: 'md',
      backgroundColor: bgc,
      color: text,
      display: 'flex',
      justifyContent: isMobile ? 'flex-start' : 'center',
      alignItems: 'flex-start',
      overflow: 'scroll',
      transition: 'all 0.3s ease',
      '& > .content-inner': {
        width: isMobile ? '100%' : '700px',
        transition: 'all 0.3s ease',
        height: 400,
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

export const boxWraperAccordion = (isMobile) => ({
  sx: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    width: '100%',
    minWidth: isMobile ? 100 : 0,
    maxWidth: isMobile ? 0 : 150
  }
})

export const typoWraperAccordion = (fontSize) => ({
  fontSize: fontSize,
  level: 'title-md',
  fontWeight: "lg",
  sx: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    direction: 'rtl',
    textAlign: 'right',
    flexGrow: 1
  }
})

export const gridExtraProps = (type) => ({
  xs: type === 'triplet' ? 4 : type === 'select' ? 8 : 4,
  md: type === 'triplet' ? 4 : type === 'select' ? 6 : 3
})

export const footerBoxProps = {
  slot: "footer",
  sx: {
    p: 1,
    mb: -2,
    borderTop: '1px solid',
    borderColor: 'divider',
    position: 'sticky',
    bottom: 0,
    bgcolor: 'background.body',
    backdropFilter: 'blur(6px)',
    zIndex: 1,
  }
}

export const sheetListDisplay = {
  variant: "soft",
  color: "neutral",
  sx: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 2,
    p: 2,
    borderRadius: 'lg',
    direction: 'rtl',
  },
  role: "status",
  "aria-live": "polite"
}
