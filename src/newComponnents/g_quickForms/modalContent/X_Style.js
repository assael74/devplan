import { IconButton } from '@mui/joy';
import { typeBackground } from '../../b_styleObjects/Colors.js'
import { iconUi } from '../../b_styleObjects/icons/IconIndex.js'

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

export const clearButtProps = (isMobile) => ({
  size:"md",
  variant:"solid",
  color:"neutral",
  sx:{ borderRadius: 'md' }
})

const trim = (v) => (v ?? '').toString().trim();

export function pickTeamColorValue(update = {}, formProps = {}) {
  const raw = update?.color;

  // מצא clubId (ישירות מהקבוצה או דרך teams אם חסר)
  const clubId =
    update?.clubId ??
    (formProps.teams || []).find(t => t.id === update?.id)?.clubId;

  const club =
    (formProps.clubs || []).find(c => c.id === clubId || c.clubId === clubId);

  const clubColor = club?.color || {};

  // צבע כשמחרוזת
  if (typeof raw === 'string') {
    return trim(raw) || trim(clubColor.bg) || '';
  }

  // צבע כאובייקט { bg, text } / { bg, fg }
  if (raw && typeof raw === 'object') {
    const bg   = trim(raw.bg)   || trim(clubColor.bg)   || '';
    const text = trim(raw.text ?? raw.fg) || trim(clubColor.text ?? clubColor.fg) || '';
    return { ...raw, bg, text };
  }

  // אין color בכלל → החזר צבע מועדון (או ריק)
  return clubColor.bg || clubColor.text ? clubColor : '';
}

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

export const gridExtraProps = (type) => ({
  xs: type === 'triplet' ? 4 : type === 'select' ? 8 : 4,
  md: type === 'triplet' ? 4 : type === 'select' ? 6 : 3
})
