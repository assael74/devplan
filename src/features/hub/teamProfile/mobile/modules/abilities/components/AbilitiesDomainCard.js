// teamProfile/mobile/modules/abilities/components/AbilitiesDomainCard.js

import React from 'react'
import {
  AccordionGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Stack,
  Typography,
  Chip,
  LinearProgress,
  Tooltip,
  CircularProgress,
} from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'

import {
  isFilled,
  toFixed1,
  getScoreColor,
  DOMAIN_ACCENT,
} from './../../../../sharedLogic'

import { moduleSx as sx } from '../sx/module.sx'

export default function AbilitiesDomainCard({ domain, defaultExpanded = false }) {
  const domainAvg = Number(domain?.avg)
  const pct = Number(domain?.coveragePct || 0)
  const domainColor = domain?.color || getScoreColor(domainAvg)
  const filledCount = Number(domain?.filled || 0)
  const accent = DOMAIN_ACCENT[domain?.domain] || 'neutral'

  return (
    <AccordionGroup sx={{ '--AccordionGroup-gap': '0px' }}>
      <Accordion defaultExpanded={defaultExpanded} sx={sx.domainAccordion(accent)}>
        <AccordionSummary>
          <Box sx={sx.summaryRow}>
            <Box sx={{ display: 'grid', gap: 0.35, minWidth: 0 }}>
              <Typography
                level="title-sm"
                startDecorator={iconUi({ id: domain?.domain })}
                sx={{ color: `${accent}.700`, fontWeight: 700, minWidth: 0 }}
              >
                {domain?.domainLabel}
              </Typography>

              <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                {filledCount}/{domain?.items?.length || 0} abilities מלאים
              </Typography>
            </Box>

            <Box sx={sx.summaryStats}>
              <Chip size="sm" variant="soft" color={accent}>
                {domain?.hasRated ? domain?.avgLabel : '—'}
              </Chip>

              <Box sx={sx.avgCircle}>
                <CircularProgress
                  determinate
                  value={pct}
                  color={domainColor}
                  size="sm"
                  sx={{ width: 42, height: 42 }}
                />
                <Box sx={sx.avgCircleCenter}>
                  <Typography level="body-xs">{toFixed1(domainAvg)}</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </AccordionSummary>

        <AccordionDetails>
          <Stack spacing={0.75}>
            {(domain?.items || []).map((item) => {
              const filled = isFilled(item?.value)
              const itemPct = filled ? (item.value / 5) * 100 : 0
              const itemColor = filled ? getScoreColor(item?.value) : 'neutral'
              const tip = item?.description || item?.label

              return (
                <Box key={item?.id} sx={sx.domainItem}>
                  {tip ? (
                    <Tooltip title={tip} placement="top" enterDelay={250}>
                      <Typography level="body-sm" startDecorator={iconUi({ id: item?.id })}>
                        {item?.label}
                      </Typography>
                    </Tooltip>
                  ) : (
                    <Typography level="body-sm" startDecorator={iconUi({ id: item?.id })}>
                      {item?.label}
                    </Typography>
                  )}

                  <Chip
                    size="sm"
                    variant={filled ? 'soft' : 'outlined'}
                    color={itemColor}
                    sx={{ minWidth: 32, fontWeight: filled ? 600 : 400 }}
                  >
                    {filled ? item?.value : '—'}
                  </Chip>

                  <LinearProgress
                    determinate
                    value={itemPct}
                    color={itemColor}
                    size="sm"
                    variant="plain"
                    sx={{ gridColumn: '1 / -1' }}
                  />
                </Box>
              )
            })}
          </Stack>

          {filledCount === 0 ? (
            <Box sx={sx.empty}>
              <Typography level="body-xs" color="neutral">
                אין נתונים בדומיין זה
              </Typography>
            </Box>
          ) : null}
        </AccordionDetails>
      </Accordion>
    </AccordionGroup>
  )
}
