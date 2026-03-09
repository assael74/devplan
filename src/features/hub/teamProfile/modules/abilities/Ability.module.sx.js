// teamProfile/modules/abilities/Ability.module.sx.js

// Domain cards
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

export const domainCardSx = (accent = 'neutral') => ({
  height: '100%',
  borderRadius: 'md',
  bgcolor: 'background.surface',
  transition: 'all 120ms ease',
  border: '1px solid',
  borderColor: 'divider',
  '&:hover': {
    boxShadow: 'sm',
    borderColor: `${accent}.400`,
  },
})

// Filters bar 
export const filtersSheet = {
  p: 1,
  borderRadius: 'md',
}

export const filtersRow = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  flexWrap: 'wrap',
}

export const kpiSheet = {
  p: 1,
  borderRadius: 'md',
}

export const kpiGrid = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', md: '1fr auto' },
  gap: 1,
  alignItems: 'center',
}

export const kpiLeft = {
  display: 'flex',
  gap: 0.75,
  flexWrap: 'wrap',
  alignItems: 'center',
}

export const kpiRight = {
  display: 'flex',
  gap: 0.75,
  alignItems: 'center',
  justifyContent: { xs: 'flex-start', md: 'flex-end' },
}
