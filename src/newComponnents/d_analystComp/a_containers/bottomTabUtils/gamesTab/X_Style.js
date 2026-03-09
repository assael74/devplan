/// getMeetingsRowStructure
export const typoCellProps = {
  sx: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    dir: 'rtl',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '100%',
  }
}

export const typoStatus = {
  noWrap: true,
  sx: {
    direction: 'rtl',
  }
}

export const dateCellProps = {
  sx: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    dir: 'rtl',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '100%',
  }
}

export const typoDate = (isMobile) => ({
  noWrap: true,
  sx:{
    fontSize: isMobile ? '8px' : '14px',
    textAlign: 'center',
    direction: 'rtl',
    width: '100%',
    letterSpacing: '0.1em'
  }
})

export const typoHeadDate = (isMobile) => ({
  noWrap: true,
  sx:{
    fontWeight: 'bold',
    fontSize: isMobile ? '8px' : '14px',
    textAlign: 'center',
    direction: 'rtl',
    width: '100%',
    letterSpacing: '0.1em'
  }
})

export const resultBox = (color) => ({
  sx: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
    ...(color ? { color } : {})
  }
})

export const typoRivel = (isMobile, text = '') => {
  const words = String(text).trim().split(/\s+/).filter(Boolean);
  const isSingleWord = words.length <= 1;

  const baseSx = {
    fontWeight: 'bold',
    fontSize: isMobile ? '8px' : '14px',
    textAlign: 'center',
    direction: 'rtl',
    width: '100%',
    letterSpacing: '0.1em',
    minWidth: 0, // חשוב בתוך flex
  };

  if (!isMobile || isSingleWord) {
    // דסקטופ תמיד שורה אחת; מובייל + מילה אחת: שורה אחת
    return {
      noWrap: true,
      sx: {
        ...baseSx,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
    };
  }

  // מובייל + שתי מילים ומעלה: עד 2 שורות + אליפסות
  return {
    noWrap: false,
    sx: {
      ...baseSx,
      whiteSpace: 'normal',     // לשבור שורה
      display: '-webkit-box',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      wordBreak: 'break-word',
    },
  };
};
