
export const indicSx = {
  root: {
    display: 'grid',
    gap: 0.5,
    mt: 0.6,
  },

  labels: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    alignItems: 'center',
    gap: 0.5,
  },

  label: {
    fontSize: 10.5,
    color: 'text.tertiary',
    lineHeight: 1.1,
    fontWeight: 600,
  },

  labelCenter: {
    textAlign: 'center',
  },

  labelEnd: {
    textAlign: 'left',
  },

  track: {
    position: 'relative',
    height: 9,
    borderRadius: 999,
    bgcolor: 'background.level2',
    overflow: 'visible',
    border: '1px solid',
    borderColor: 'divider',
  },

  zone: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '33.333%',
  },

  zoneLeft: {
    insetInlineStart: 0,
    bgcolor: 'warning.softBg',
    borderTopRightRadius: 999,
    borderBottomRightRadius: 999,
  },

  zoneMid: {
    insetInlineStart: '33.333%',
    bgcolor: 'success.softBg',
  },

  zoneRight: {
    insetInlineStart: '66.666%',
    bgcolor: 'danger.softBg',
    borderTopLeftRadius: 999,
    borderBottomLeftRadius: 999,
  },

  marker: (status) => ({
    position: 'absolute',
    top: '50%',
    insetInlineStart: statusPosition[status] || statusPosition.neutral,
    width: 16,
    height: 16,
    borderRadius: 999,
    bgcolor: statusColor[status] || statusColor.neutral,
    border: '3px solid',
    borderColor: 'background.surface',
    transform: 'translate(50%, -50%)',
    boxShadow: 'md',
    zIndex: 2,
  }),

  status: (status) => ({
    fontSize: 10.5,
    lineHeight: 1.1,
    color: statusColor[status] || statusColor.neutral,
    fontWeight: 700,
  }),
}
