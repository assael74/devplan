// hub/sharedProfile/nav.sx.js
function hexToRgba(hex, a = 1) {
  const h = String(hex || '').replace('#', '').trim()
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const n = parseInt(full, 16)
  if (!Number.isFinite(n)) return `rgba(0,0,0,${a})`
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return `rgba(${r},${g},${b},${a})`
}

export const sheetSx = (active, c) => {
  const accent = c?.accent || '#2563EB'

  return {
    cursor: 'pointer',
    userSelect: 'none',
    px: 1,
    py: 0.9,
    borderRadius: 'md',
    minHeight: 52,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.75,
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: active ? hexToRgba(accent, 0.10) : 'background.surface',
    transition: 'background-color 120ms ease, box-shadow 120ms ease, transform 120ms ease',
    '&:hover': {
      bgcolor: hexToRgba(accent, 0.10),
      boxShadow: 'sm',
      transform: 'translateY(-1px)',
    },
    '&:active': { transform: 'translateY(0px)' },

    ...(active && { boxShadow: 'sm' }),
  }
}

export const boxSx = (active, c) => {
  const accent = c?.accent || '#2563EB'

  return {
    width: 28,
    height: 28,
    borderRadius: 'sm',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: active ? '#fff' : 'text.primary',
    '& svg': { color: 'currentColor', fill: 'currentColor' },
    '& svg *': { fill: 'currentColor', stroke: 'currentColor' },
    '& svg [fill="none"]': { fill: 'none' },
    bgcolor: active ? accent : 'background.level1',
    transition: 'background-color 120ms ease, color 120ms ease',
  }
}
