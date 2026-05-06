// teamProfile/modules/games/components/insightsDrawer/shared.sx.js

export const coloredCard = ({
  minHeight = 96,
  borderRadius = 16,
  padding = 1.25,
  gap = 1,
  color = 'neutral',
} = {}) => ({
  minHeight,
  height: minHeight,
  borderRadius,
  p: padding,
  display: 'grid',
  gridTemplateRows: 'auto 1fr',
  gap,
  overflow: 'hidden',
  border: '1px solid',
  borderColor: `${color}.outlinedBorder`,
  bgcolor: `${color}.softBg`,
})

export const neutralCard = ({
  minHeight = 118,
  borderRadius = 16,
  padding = 1.25,
  gap = 1,
} = {}) => ({
  minHeight,
  height: '100%',
  borderRadius,
  p: padding,
  display: 'grid',
  gridTemplateRows: 'auto 1fr',
  gap,
  border: '1px solid',
  borderColor: 'neutral.outlinedBorder',
  bgcolor: 'background.level1',
})
