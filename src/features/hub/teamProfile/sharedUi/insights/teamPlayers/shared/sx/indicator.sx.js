// teamPlayers/shared/sx/indicator.sx.js

export const indicatorSx = {
  grid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: 'repeat(2, minmax(0, 1fr))',
      md: 'repeat(4, minmax(0, 1fr))',
    },
    gap: 1,
  },

  positionGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: 'repeat(2, minmax(0, 1fr))',
      md: 'repeat(6, minmax(0, 1fr))',
    },
    gap: 0.75,
  },

  rangeCard: {
    minHeight: 116,
    borderRadius: 'xl',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
    p: 1,
    display: 'grid',
    alignContent: 'start',
    gap: 0.75,
    boxShadow: 'xs',
  },

  rangeHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  rangeLabel: {
    fontWeight: 700,
    lineHeight: 1.15,
  },

  rangeValue: {
    fontWeight: 700,
    lineHeight: 1.1,
    mb: 0.4,
  },

  rangeSub: {
    color: 'text.tertiary',
    lineHeight: 1.2,
  },

  positionCard: {
    minHeight: 74,
    borderRadius: 'md',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
    p: 0.6,
    display: 'grid',
    alignContent: 'start',
    gap: 0.3,
    boxShadow: 'xs',
  },

  positionHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.75,
  },

  positionLabel: {
    fontWeight: 700,
    lineHeight: 1.1,
    fontSize: 12,
  },

  positionValue: {
    fontWeight: 700,
    lineHeight: 1,
    fontSize: 19,
    mb: 0,
  },

  positionSub: {
    color: 'text.tertiary',
    lineHeight: 1.05,
    fontSize: 10,
  },

  indicatorRoot: {
    display: 'grid',
    gap: 0.5,
    mt: 0.6,
  },

  indicatorLabels: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    alignItems: 'center',
    gap: 0.5,
  },

  indicatorLabel: {
    fontSize: 10.5,
    color: 'text.tertiary',
    lineHeight: 1.1,
    fontWeight: 600,
  },

  indicatorLabelCenter: {
    textAlign: 'center',
  },

  indicatorLabelEnd: {
    textAlign: 'left',
  },

  indicatorTrack: {
    position: 'relative',
    height: 9,
    borderRadius: 999,
    bgcolor: 'background.level2',
    overflow: 'visible',
    border: '1px solid',
    borderColor: 'divider',
  },

  indicatorZone: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '33.333%',
  },

  indicatorZoneLeft: {
    insetInlineStart: 0,
    bgcolor: 'warning.softBg',
    borderTopRightRadius: 999,
    borderBottomRightRadius: 999,
  },

  indicatorZoneMid: {
    insetInlineStart: '33.333%',
    bgcolor: 'success.softBg',
  },

  indicatorZoneRight: {
    insetInlineStart: '66.666%',
    bgcolor: 'danger.softBg',
    borderTopLeftRadius: 999,
    borderBottomLeftRadius: 999,
  },

  indicatorMarker: ({
    position,
    color,
  }) => ({
    position: 'absolute',
    top: '50%',
    insetInlineStart: position,
    width: 16,
    height: 16,
    borderRadius: 999,
    bgcolor: color,
    border: '3px solid',
    borderColor: 'background.surface',
    transform: 'translate(50%, -50%)',
    boxShadow: 'md',
    zIndex: 2,
  }),
}
