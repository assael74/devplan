import Save from '@mui/icons-material/Save';
import RestartAlt from '@mui/icons-material/RestartAlt';
import { typeBackground } from '../../b_styleObjects/Colors.js'
import { iconUi } from '../../b_styleObjects/icons/IconIndex.js'

/// QuickExpandedFormContainer
export const wraperBoxProps = (theme, autoHeight, usableHeight) => ({
  sx: {
    border: '1px solid',
    borderColor: theme.vars.palette.divider,
    borderRadius: 'sm',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: autoHeight ? 'unset' : usableHeight,
  }
})

export const boxHeaderProps = {
  sx: {
    //bgcolor: '#c0c0c0',
    color: '#fff',
    p: 1,
    borderRadius: 'md',
    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  }
}

export const typoTitleProps = (isMobile) => ({
  level: "title-sm",
  sx: {
    fontSize: isMobile ? '12px' : '14px',
    color: 'text.primary',
    alignSelf: 'flex-end',
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    fontWeight: 'lg',
    direction: 'rtl',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }
})

export const boxVideoNameProps = (isMobile) => ({
  component: "span",
  sx: {
    fontSize: isMobile ? '12px' : '14px',
    fontWeight: 'lg',
    color: 'text.primary',
    letterSpacing: '0.08em',
    fontStyle: 'italic'
  }
})

export const boxActionsProps = {
  sx: {
    mt: 1,
    pt: 1.5,
    px: 1.5,
    pb: 1,
    bgcolor: 'background.level1',
    color: '#fff',
    borderRadius: 'md',
    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 1,
    width: '100%'
  }
}

export const buttResetProps = {
  size: "xs",
  variant: "solid",
  color: "neutral",
  startDecorator: <RestartAlt />
}

export const buttSaveProps = {
  size: "xs",
  variant: "solid",
  color: "success",
  startDecorator: <Save />
}

const idToTypeMap = {
  newMeeting: 'meetings',
  newPlayer: 'players',
  newTeam: 'teams',
  newClub: 'clubs',
  newPayment: 'payments',
  newTag: 'tags',
  newGame: 'games',
  newStats: 'statsParm'
};

export const addButtProps = (id) => {
  const type = idToTypeMap[id] || 'players';
  const { bgc, text } = typeBackground[type] || {};

  return {
    startDecorator: iconUi({ id, sx: { color: text } }),
    variant: 'solid',
    color: 'neutral',
    size: id === 'newGameStats' ? 'xs' : 'sm',
    sx: {
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

export const addIconButtProps = (id) => {
  const type = idToTypeMap[id] || 'players'; // ברירת מחדל
  const { bgc, text } = typeBackground[type] || {};
  return {
    variant: 'solid',
    color: 'neutral',
    size: id === 'newGameStats' ? 'xs' : 'sm',
    sx: {
      p: 0.5,
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
