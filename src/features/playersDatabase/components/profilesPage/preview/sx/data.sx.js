// features/playersDatabase/components/profilesPage/preview/sx/data.sx.js

import { alpha } from '@mui/material/styles'

import { devPlanColors, getEntityColors } from '../../../../../../ui/core/theme/Colors.js'

const c = entity => getEntityColors(entity)

const palette = {
  muted: alpha(devPlanColors.primaryDark, 0.68),
  strong: '#17202a',
  scout: c('scouting'),
}

const softBg = entity => alpha(c(entity).accent, 0.06)
const softBorder = entity => alpha(c(entity).accent, 0.16)
const softIcon = entity => alpha(c(entity).accent, 0.1)
const softShadow = entity => `0 6px 14px ${alpha(c(entity).accent, 0.055)}`

export const dataSx = {
  stage: {
    minHeight: 0,
    flex: '1 1 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 0.7,
  },

  metricsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.5,
  },

  metricsRowThree: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 0.5,
  },

  metricsRowTwo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 0.5,
  },

  metricCube: entity => ({
    minHeight: 54,
    border: `1px solid ${softBorder(entity)}`,
    borderRadius: '10px',
    bgcolor: softBg(entity),
    boxShadow: softShadow(entity),
    px: 0.75,
    py: 0.42,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 0.15,
    boxSizing: 'border-box',
  }),

  metricHeader: {
    minWidth: 0,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.35,
  },

  metricIcon: entity => ({
    width: 18,
    height: 18,
    borderRadius: '999px',
    bgcolor: softIcon(entity),
    color: c(entity).accent,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
  }),

  metricLabel: {
    minWidth: 0,
    color: palette.muted,
    fontSize: 10.5,
    fontWeight: 650,
    lineHeight: 1.15,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  metricValue: entity => ({
    color: c(entity).accent,
    fontSize: 24,
    fontWeight: 700,
    lineHeight: 1,
  }),

  scoutProfilesSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.5,
    mt: 0.05,
  },

  scoutProfileRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 85%) minmax(68px, 15%)',
    gap: 0.5,
    alignItems: 'stretch',
  },

  scoutProfileInfoCube: {
    minWidth: 0,
    minHeight: 66,
    border: `1px solid ${alpha(palette.scout.accent, 0.15)}`,
    borderRadius: '10px',
    bgcolor: alpha(palette.scout.accent, 0.04),
    boxShadow: `0 6px 14px ${alpha(palette.scout.accent, 0.05)}`,
    px: 0.85,
    py: 0.55,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 0.3,
    boxSizing: 'border-box',
  },

  scoutProfileHeader: {
    minWidth: 0,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.45,
  },

  scoutProfileIcon: {
    width: 19,
    height: 19,
    borderRadius: '999px',
    bgcolor: alpha(palette.scout.accent, 0.09),
    color: palette.scout.accent,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
  },

  scoutProfileLabel: {
    minWidth: 0,
    color: palette.strong,
    fontSize: 13,
    fontWeight: 750,
    lineHeight: 1.15,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  scoutProfileDescription: {
    color: palette.muted,
    fontSize: 10.8,
    fontWeight: 600,
    lineHeight: 1.3,
    whiteSpace: 'normal',
  },

  scoutProfileCountCube: {
    minHeight: 66,
    border: `1px solid ${alpha(palette.scout.accent, 0.17)}`,
    borderRadius: '10px',
    bgcolor: alpha(palette.scout.accent, 0.07),
    boxShadow: `0 6px 14px ${alpha(palette.scout.accent, 0.055)}`,
    px: 0.4,
    py: 0.55,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 0.12,
    boxSizing: 'border-box',
  },

  scoutProfileCountValue: {
    color: palette.scout.accent,
    fontSize: 24,
    fontWeight: 850,
    lineHeight: 1,
  },

  scoutProfileCountLabel: {
    color: palette.muted,
    fontSize: 10.5,
    fontWeight: 700,
    lineHeight: 1.15,
  },
}
