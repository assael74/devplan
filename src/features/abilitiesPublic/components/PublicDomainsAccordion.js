// features/abilitiesPublic/components/PublicDomainsAccordion.js

import React, { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Chip,
  Accordion,
  Typography,
  AccordionGroup,
  LinearProgress,
  AccordionDetails,
  AccordionSummary,
} from '@mui/joy'

import { iconUi } from '../../../ui/core/icons/iconUi.js'
import { domainsAccordionSx as sx } from './sx/domainsAccordion.sx'
import { getDomainTone } from './shared/abilitiesPublic.helpers.js'
import {
  PublicDomainScoreBar,
  PublicAbilityItemRow,
} from './accordionParts/publicDomainsAccordion.parts.js'

function clean(value) {
  return String(value ?? '').trim()
}

export default function PublicDomainsAccordion({ form = {} }) {
  const {
    bits = {},
    domains = [],
    onSetItemScore = () => () => {},
    onSetDomainScore = () => () => {},
    validation = {},
  } = form

  const canOpenDomains = Boolean(bits?.hasGrowthStage)

  const firstId = useMemo(() => {
    const firstActive = (Array.isArray(domains) ? domains : []).find((domain) => domain?.active)
    const first = firstActive || (Array.isArray(domains) ? domains[0] : null)
    return clean(first?.id || first?.domain) || null
  }, [domains])

  const [expanded, setExpanded] = useState(firstId)

  useEffect(() => {
    setExpanded(firstId)
  }, [firstId])

  return (
    <Box sx={{ pb: 1 }}>
      <AccordionGroup sx={(theme) => sx.group(theme)}>
        {(domains || []).map((domain) => {
          const domainId = clean(domain?.id || domain?.domain)
          const domainActive = Boolean(domain?.active)
          const canInteractDomain = canOpenDomains && domainActive
          const filled = Number(domain?.filled || 0)
          const total = Number(domain?.total || 0)
          const avg = domain?.avg
          const percent = Number(domain?.percent || 0)
          const tone = getDomainTone(domain?.state)
          const isExpanded = expanded === domainId && canOpenDomains

          return (
            <Accordion
              key={domainId}
              expanded={isExpanded}
              disabled={!canInteractDomain}
              onChange={(event, nextExpanded) => {
                if (!canOpenDomains) return
                setExpanded(nextExpanded ? domainId : null)
              }}
              sx={sx.accordion(tone, canInteractDomain)}
            >
              <AccordionSummary>
                <Box sx={{ width: '100%', gap: 1, pb: isExpanded ? 1.2 : 0 }}>
                  <Box sx={sx.summaryTopRow}>
                    {iconUi({ id: domainId, size: 'lg', sx: { color: domainActive ? '#3cb406' : '' } })}

                    <Typography level="title-sm" noWrap sx={{ lineHeight: 1.3 }}>
                      {domain?.domainLabel || domainId}
                    </Typography>

                    <Typography level="body-xs" noWrap sx={{ mt: 0.2 }}>
                      {filled}/{total} מולאו
                    </Typography>

                    <Box sx={{ flex: 1 }} />

                    <Chip size="sm" variant="soft" color="neutral">
                      {tone.stateLabel}
                    </Chip>

                    <Chip size="sm" variant="soft" color="neutral">
                      ממוצע: {avg == null ? '-' : avg}
                    </Chip>
                  </Box>

                  {domainActive && (
                    <LinearProgress
                      determinate
                      value={percent}
                      color={tone.progressColor}
                      size="sm"
                      sx={{ '--LinearProgress-radius': '999px', my: 1 }}
                    />
                  )}

                  {domainActive ? (
                    <PublicDomainScoreBar
                      domain={domain}
                      onSetDomainScore={onSetDomainScore}
                    />
                  ) : (
                    <Box sx={sx.textEmptyBox}>
                      <Typography level="body-xs" color='warning' sx={{ fontWeight: 500 }}>
                        אין צורך למלא חלק זה בדוח
                      </Typography>
                    </Box>
                  )}
                </Box>
              </AccordionSummary>

              <AccordionDetails>
                <Box sx={sx.detailsFrame}>
                  <Box
                    sx={{ height: '100%', overflowY: 'auto', pr: 0.5 }}
                    className="dpScrollThin"
                  >
                    {(domain?.items || []).map((item) => (
                      <PublicAbilityItemRow
                        key={item?.id}
                        domainId={domainId}
                        item={item}
                        onSetItemScore={onSetItemScore}
                      />
                    ))}
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          )
        })}
      </AccordionGroup>
    </Box>
  )
}
