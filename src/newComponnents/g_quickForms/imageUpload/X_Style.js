import { IconButton } from '@mui/joy';
import { typeBackground } from '../../b_styleObjects/Colors.js'
import { iconUi } from '../../b_styleObjects/icons/IconIndex.js'
/// ImageCropModal
export const boxCropModalProps = {
  sx: {
    width: '90vw',
    height: '80vh',
    bgcolor: '#000',
    zIndex: 1701,
    position: 'relative',
    m: 'auto',
    mt: '5vh',
    borderRadius: 'md',
    overflow: 'hidden'
  }
}

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
  games: 'games',
  statsParm: 'statsParm',
  evaluation: 'players'
};

export const updateButtProps = (id, isMobile) => {
  const type = idToTypeMap[id] || 'players';
  const { bgc, text } = typeBackground[type] || {};
  return {
    startDecorator: iconUi({ id, sx: { color: text, fontSize: isMobile ?  'sm' : 'md' } }),
    variant: 'solid',
    color: 'neutral',
    size: isMobile ?  'sm' : 'md',
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
