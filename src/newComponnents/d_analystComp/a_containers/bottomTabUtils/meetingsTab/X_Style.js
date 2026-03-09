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
    textAlign: 'center',
    direction: 'rtl',
    width: '100%'
  }
}

///MeetingsPlanTab
export const cardSheetProps = {
  variant: "soft",
  sx: {
    p: 1,
    borderRadius: 'xl',
    border: '1px solid',
    borderColor: 'neutral.outlinedBorder',
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    minHeight: 140,
  }
}

export const dayCardSheetProps = (blockedDays, dateStr) => {
  return {
    variant: "soft",
    sx: {
      p:1,
      borderRadius:'xl',
      border:'1px solid',
      borderColor:'neutral.outlinedBorder',
      opacity: blockedDays.has(dateStr) ? 0.35 : 1,
      display:'flex',
      flexDirection:'column',
      gap:1,
      minHeight: 'auto',
    }
  }
}

export const photoBoxProps = {
  component: "img",
  sx:{
    width: 34,
    height: 34,
    borderRadius: '50%',
    objectFit: 'cover',
    border: '1px solid',
    borderColor: 'neutral.outlinedBorder',
    flexShrink: 0,
  }
}

export const typoCardProps = {
  level: "title-sm",
  sx: {
    fontSize:'12px',
    lineHeight:1.2,
    display:'-webkit-box',
    overflow:'hidden',
    WebkitLineClamp:2,
    WebkitBoxOrient:'vertical',
    direction:'rtl',
    textAlign:'right',
  }
}

export const sheetPanelProps = {
  variant:"plain",
  sx:{
    p:1,
    borderRadius:'md',
    border:'1px solid',
    borderColor:'neutral.outlinedBorder',
    display:'flex',
    flexDirection:'column',
    gap:0.5
  }
}

export const busyRowProps = (rowHeight) => ({
  variant:"soft",
  color:"neutral",
  sx:{
    height: rowHeight,
    minHeight: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6,
    pointerEvents: 'none',
  }
})

export const buttonRowProps = (rowHeight) => ({
  size:"sm",
  variant:"soft",
  color:"primary",
  sx:{
    width: '100%',
    height: rowHeight,
    minHeight: 24,
    justifyContent: 'center',
    p: 0.5,
  }
})
