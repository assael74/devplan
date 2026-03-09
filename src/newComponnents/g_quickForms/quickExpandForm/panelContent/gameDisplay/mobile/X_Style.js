import Save from '@mui/icons-material/Save';
import RestartAlt from '@mui/icons-material/RestartAlt';
import { iconUi } from '../../../../../b_styleObjects/icons/IconIndex.js'
/// EditExpanGame
const getBoxStyle = (side, result, goalsFor, goalsAgainst) => {
  if (result === 'draw') {
    return {
      bgcolor: 'warning.softBg',
      color: '#000000',
    };
  }

  const isWinner = (side === 'team' && goalsFor > goalsAgainst) ||
                   (side === 'rivel' && goalsAgainst > goalsFor);

  return isWinner
    ? { bgcolor: 'success.softBg', color: '#000000' }
    : { bgcolor: 'transparent', color: '#000000' };
};

export const boxTeamProps = (side, result, goalsFor, goalsAgainst) => ({
  sx: {
    width: '40%',
    bgcolor: 'background.level1',
    borderRadius: 'md',
    py: 1,
    boxShadow: 'sm',
    textAlign: 'center',
    border: '1px solid',
    borderColor: 'divider',
    color: getBoxStyle(side, result, goalsFor, goalsAgainst).color,
    ...getBoxStyle(side, result, goalsFor, goalsAgainst)
  }
})

export const boxRivelProps = (side, result, goalsFor, goalsAgainst) => ({
  sx: {
    width: '40%',
    borderRadius: 'md',
    boxShadow: 'sm',
    textAlign: 'center',
    border: '1px solid',
    borderColor: 'divider',
    '& input': {
      textAlign: 'center',
      fontWeight: 600,
      fontSize:'12px',
      bgcolor: getBoxStyle(side, result, goalsFor, goalsAgainst).bgcolor,
      color: getBoxStyle(side, result, goalsFor, goalsAgainst).color,
    },
    ...getBoxStyle(side, result, goalsFor, goalsAgainst)
  }
})

export const boxScoreProps = {
  sx: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    width: '100%',
    mb: 2,
  }
}

export const boxOneSideProps = (side) => ({
  sx: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '40%',
  }
})

export const numberFieldProps = {
  sx: {
    width: 50,
    '& input': {
      textAlign: 'center',
      fontWeight: 600,
      fontSize: '12px'
    }
  }
}

export const buttSaveProps = {
  size: 'xs',
  variant: "solid",
  color: "success",
  sx: { py: 0.5 }
}

export const buttEditProps = {
  size: 'xs',
  variant: "solid",
  color: "neutral",
  sx: { py: 0.5 }
}

/// MobileGameTeamStatsExpand
export const boxStatsExpandProps = {
  sx: {
    width: '100%',
    maxWidth: '100%',
    minHeight: '18vh',
    maxHeight: '18vh',
    overflowY: 'auto',
    overflowX: 'hidden',
    borderColor: 'divider',
    borderRadius: 2,
    pb: 2,
    pr: 1,
    // עיצוב פס גלילה
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

export const boxStickyProps = {
  sx: {
    px: 1,
    py: 0.5,
    boxShadow: 'sm',
    borderBottom: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.body',
  }
}
