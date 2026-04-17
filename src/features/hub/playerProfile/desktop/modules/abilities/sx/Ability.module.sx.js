// Ability.module.sx.js

export const abilitiesModuleSx = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: 0.3,
  flex: 1,
  minHeight: 0,
  position: 'relative',
  overflowY: 'auto',
  height: 'calc(100vh - 210px)',
}

export const stickyHeaderWrapSx = (theme) => ({
  position: 'sticky',
  top: -10,
  zIndex: 40,
  backgroundColor: theme.vars.palette.background.body,
  pt: 1.25,
  pb: 0.75,
  borderBottom: '1px solid',
  borderColor: 'divider',
})

export const abilityHeaderSx = {
  borderRadius: 12,
  bgcolor: 'background.surface',
  boxShadow: 'sm',
  backdropFilter: 'blur(10px)',
}

export const headerChipsRowSx = {
  mt: 0.5,
  flexWrap: 'wrap',
}

export const headerStarsWrapSx = {
  display: 'flex',
  flexDirection: 'row',
  gap: 3,
  alignItems: 'center',
  ml: 1,
}

export const headerSearchInputSx = {
  maxWidth: 280,
}

export const headerNoWrapSx = {
  whiteSpace: 'nowrap',
}

export const headerStarColSx = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}

export const headerStarRowSx = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
}

// Domain card
export const domainCardSx = (accent) => ({
  height: '100%',
  borderRadius: 'md',
  bgcolor: 'background.surface',
  transition: 'all 120ms ease',
  '&:hover': {
    boxShadow: 'sm',
    borderColor: `${accent}.400`,
  },
})

export const domainTitleSx = (accent) => ({
  color: `${accent}.700`,
  fontWeight: 600,
})

export const domainAvgWrapSx = {
  my: 1,
}

export const domainAvgCircleWrapSx = {
  position: 'relative',
  width: 48,
  height: 48,
}

export const domainAvgCircleCenterSx = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

export const domainAvgBarSx = {
  width: 160,
}

export const domainEmptyBoxSx = {
  mt: 1,
  p: 1,
  borderRadius: 'sm',
  bgcolor: 'neutral.softBg',
}

export const boxDomainSx = {
  height: '100%',
  p: 0.9,
  borderRadius: 'md',
  bgcolor: 'neutral.softBg',
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  alignItems: 'center',
  gap: 0.75,
  transition: 'background-color 120ms ease',
  '&:hover': {
    bgcolor: 'neutral.softHoverBg',
  },
}

export const domainItemChipSx = (filled) => ({
  minWidth: 32,
  fontWeight: filled ? 600 : 400,
})

export const domainItemBarSx = {
  gridColumn: '1 / -1',
}
