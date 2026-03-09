export const teamRowSx = {
  topLine: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },
  subLine: {
    opacity: 0.75,
    mt: 0.25,
    lineHeight: 1.2,
    ml: 1,
  },
  iconWrap: {
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
  },
}

export const colorDotSx = (bg) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  bgcolor: bg,
  boxShadow: '0 0 0 2px #fff',
  flexShrink: 0,
})
