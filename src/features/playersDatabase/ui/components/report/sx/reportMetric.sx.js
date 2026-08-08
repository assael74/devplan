// features/playersDatabase/ui/components/report/sx/reportMetric.sx.js

export const reportMetricSx = {
  metric: ({ compact }) => ({
      minWidth: 0,
      textAlign: 'center',
      px: compact ? 0.25 : 0.45,
    }),

  metricLabel: {
      display: 'block',
      fontSize: 9,
      lineHeight: 1.15,
      color: 'text.secondary',
    },

  metricValue: {
      display: 'block',
      mt: 0.2,
      fontSize: 12,
      lineHeight: 1.15,
      fontWeight: 700,
      color: 'text.primary',
    },
}
