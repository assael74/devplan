// features/playersDatabase/ui/components/scout/sx/scoutProfileTooltip.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const scoutProfileTooltipSx = {
  root: {
    width: 260,
    maxWidth: 260,
    display: 'grid',
    gap: 0.75,
    color: 'inherit',
    textAlign: 'left',
  },

  title: {
    color: 'inherit',
    fontWeight: 700,
    lineHeight: 1.2,
    textAlign: 'left',
  },

  primarySection: {
    display: 'grid',
    gap: 0.3,
    pb: 0.65,
    borderBottom: '1px solid rgba(255, 255, 255, 0.22)',
  },

  primaryLabel: {
    color: 'rgba(255, 255, 255, 0.74)',
    fontWeight: 700,
    lineHeight: 1.2,
    textAlign: 'left',
  },

  itemsList: {
    display: 'grid',
    gap: 0.35,
  },

  secondaryList: {
    display: 'grid',
    gap: 0.45,
  },

  itemRow: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: '6px minmax(0, 1fr)',
    alignItems: 'start',
    gap: 0.65,
  },

  primaryBullet: {
    width: 5,
    height: 5,
    mt: 0.75,
    borderRadius: '50%',
    bgcolor: '#7CC4F8',
  },

  secondaryBullet: {
    width: 5,
    height: 5,
    mt: 0.75,
    borderRadius: '50%',
    bgcolor: devPlanColors.tertiary,
  },

  itemValue: {
    minWidth: 0,
    color: 'inherit',
    lineHeight: 1.35,
    overflowWrap: 'break-word',
    textAlign: 'left',
    whiteSpace: 'normal',
  },

  secondaryValue: {
    minWidth: 0,
    color: 'inherit',
    lineHeight: 1.35,
    overflowWrap: 'break-word',
    textAlign: 'left',
    whiteSpace: 'normal',
  },

  inlineLabel: {
    fontWeight: 700,
  },
}
