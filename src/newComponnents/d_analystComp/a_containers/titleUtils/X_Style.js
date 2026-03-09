import { typeBackground } from '../../../b_styleObjects/Colors.js'

export const typoHeaderBox = (type) => {
  const baseStyle = {
    borderRadius: '6px',
    px: 0.3,
  };

  const backgroundByType = {
    teams: typeBackground.teams.bgc,
    clubs: typeBackground.clubs.bgc,
    meetings: typeBackground.meetings.bgc,
    payments: typeBackground.payments.bgc,
  };

  return {
    sx: {
      ...baseStyle,
      backgroundColor: backgroundByType[type] || 'transparent'
    }
  };
};

export const titleExtraProps = (sx) => ({
  ...sx,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  direction: 'rtl',
  textAlign: 'center',
  display: 'block',
  maxWidth: '100%'
});

export const payContentProps = (isMobile) => ({
  sx: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'success.500',
    px: 0.5,
    mr: isMobile ? 2 : 0,
    pb: isMobile ? 0.5 : 0,
    border:1,
    borderRadius: 'sm',
    fontWeight: 'bold',
    color: '#fff',
    whiteSpace: 'nowrap',
    direction: 'rtl',
  }
})

export const meetingTitleProps = (isMobile) => ({
  sx:{
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-start',
    pl: isMobile ? 0 : 0.5,
    mt: isMobile ? 0.5 : -2
  }
})

export const meetingSubTitleProps = (isMobile) => ({
  sx: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-start',
    pl: isMobile ? 0 : 1
  }
})
