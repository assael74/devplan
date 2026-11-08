// src/features/hub/playerProfile/sharedModules/performance/components/PerformanceComparison.js

import React from 'react'
import { Box, Chip, Option, Select, Table, Typography } from '@mui/joy'
import { POSITION_STANDARD } from '../../../sharedLogic/performance/performance.comparison.logic.js'
import { formatPerformanceValue } from '../../../sharedLogic/performance/performance.metrics.logic.js'
import { performanceSx as sx } from '../performance.sx.js'

const percentileLabels = { p25: 'P25', p50: 'P50 · חציון', p75: 'P75', p90: 'P90' }

export default function PerformanceComparison({
  rows,
  position,
  onPosition,
  percentile,
  onPercentile,
  minutes,
}) {
  return (
    <Box sx={sx.section}>
      <Box sx={sx.sectionHeader}>
        <Box>
          <Typography sx={sx.sectionTitle}>השוואה לתקן לפי עמדה</Typography>
          <Typography sx={sx.caption}>{POSITION_STANDARD.source} · {POSITION_STANDARD.period}</Typography>
        </Box>
        <Box sx={sx.actions}>
          <Select size="sm" placeholder="בחירת עמדה" value={position || null} onChange={(_, value) => onPosition(value || '')} aria-label="עמדה להשוואה" sx={sx.filter}>
            {POSITION_STANDARD.positions.map(item => <Option key={item.id} value={item.id}>{item.label} · {item.id}</Option>)}
          </Select>
          <Select size="sm" value={percentile} onChange={(_, value) => onPercentile(value || 'p50')} aria-label="אחוזון להשוואה" sx={sx.filter}>
            {Object.entries(percentileLabels).map(([key, label]) => <Option key={key} value={key}>{label}</Option>)}
          </Select>
        </Box>
      </Box>
      <Typography sx={sx.caption}>
        תקן המקור ל־90 דקות; ההשוואה כאן ל־{minutes} דקות. אחוזי הצלחה נשארים ללא שינוי.
        {' '}זו השוואת קצב מול מדגם הקובץ, ללא התאמה לגיל. אחוזון אינו ציון איכות; באיבודים ערך נמוך עדיף.
      </Typography>
      {!position ? <Typography sx={sx.notice}>בחר עמדה להשוואה. לשוער ולקשר התקפי אין עמדה ייעודית בקובץ.</Typography> : !rows.length ? (
        <Typography sx={sx.notice}>אין בתקן מדדים ממשפחת המדדים שנבחרה. אפשר לבחור משפחה אחרת במסננים.</Typography>
      ) : (
        <Box sx={sx.tableWrap} className="dpScrollThin">
          <Table sx={{ ...sx.table, minWidth: 610 }} aria-label="השוואת השחקן לתקן העמדה">
            <thead><tr><th>מדד</th><th>השחקן</th><th>{percentileLabels[percentile]}</th><th>פער מהתקן</th><th>כיסוי</th></tr></thead>
            <tbody>
              {rows.map(row => {
                const width = row.actual === null || row.target <= 0 ? 0 : Math.max(0, Math.min(100, row.actual / row.target * 70))
                return (
                  <tr key={row.label}>
                    <td>
                      <Typography sx={sx.metricTitle}>{row.label}</Typography>
                      <Typography sx={sx.caption}>{row.isRate ? 'אחוז הצלחה' : `פעולות ל־${minutes} דקות`}{row.lowerIsBetter ? ' · פחות עדיף' : ''}</Typography>
                    </td>
                    <Box component="td" sx={sx.comparisonCell(row.gapTone)}>
                      <Typography sx={sx.metricTitle}>{formatPerformanceValue(row.actual, row.isRate, row)}</Typography>
                      {row.actual !== null ? <Box sx={sx.referenceBar}><Box sx={sx.referenceFill(width, row.favorable)} /></Box> : null}
                    </Box>
                    <td>{formatPerformanceValue(row.target, row.isRate, row)}</td>
                    <td>
                      {row.difference === null ? '—' : (
                        <Chip size="sm" variant="soft" color={row.favorable ? 'success' : 'warning'}>
                          {row.difference > 0 ? '+' : ''}{formatPerformanceValue(Math.abs(row.difference), false, row) === '0' ? '0' : row.difference < 0 ? `−${formatPerformanceValue(Math.abs(row.difference), false, row)}` : formatPerformanceValue(row.difference, false, row)}{row.isRate ? ' נק׳ אחוז' : ''}
                        </Chip>
                      )}
                    </td>
                    <td><Typography sx={sx.caption}>{row.unavailableReason || `${row.count} משחקים · ${row.observations.toLocaleString('he-IL')} תצפיות בתקן`}</Typography></td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        </Box>
      )}
    </Box>
  )
}
