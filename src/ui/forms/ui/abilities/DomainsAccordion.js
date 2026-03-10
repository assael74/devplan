// C:\projects\devplan\src\ui\forms\ui\abilities\DomainsAccordion.js

import React from 'react'
import { AccordionGroup, Accordion, AccordionSummary, AccordionDetails, Box, Typography } from '@mui/joy'
import { iconUi } from '../../../core/icons/iconUi'
import { renderScoreChips } from './abilitiesCreateForm.renderers.js'

export default function DomainsAccordion({
  vaSx,
  draft,
  bits,
  domains,
  canInteract,
  onSetDomainScore,
  onSetItemScore,
}) {
  return (
    <AccordionGroup variant="plain" sx={vaSx.accGroup}>
      {domains.map((d) => {
        const disabled = !canInteract
        const domainScoreStored = (draft?.domainScores || {})[d.domain]
        const domainScore = domainScoreStored ?? d.avg

        return (
          <Accordion key={d.domain} disabled={disabled} sx={vaSx.accRoot(disabled)}>
            <AccordionSummary sx={vaSx.accSummary}>
              <Box sx={vaSx.domainTitleBox}>
                <Typography level="title-sm" noWrap startDecorator={iconUi({ id: d.domain })}>
                  {d.domainLabel}
                </Typography>
                <Typography level="body-xs" sx={{ opacity: 0.75 }}>
                  {d.filled}/{d.total} • {domainScore != null ? `ממוצע ${domainScore}` : 'ממוצע —'}
                </Typography>
              </Box>

              {renderScoreChips({
                vaSx,
                value: domainScore,
                onPick: (n) => onSetDomainScore(d.domain)(n),
                size: 'sm',
                withLabel: false,
                disabled,
              })}
            </AccordionSummary>

            <AccordionDetails sx={{ pt: 0, px: 1, pb: 1 }}>
              <Box sx={vaSx.itemsGrid}>
                {d.items
                  .filter((it) => it.id !== 'growthStage')
                  .map((it) => {
                    const v = bits.abilitiesValues[it.id] ?? null
                    return (
                      <Box key={it.id} sx={vaSx.itemRow}>
                        <Typography level="body-sm" sx={vaSx.itemTitle} noWrap>
                          {it.label}
                        </Typography>

                        {renderScoreChips({
                          vaSx,
                          id: it.id,
                          value: v,
                          onPick: (n) => onSetItemScore(d.domain, it.id)(n),
                          size: 'sm',
                          withLabel: true,
                          disabled,
                        })}
                      </Box>
                    )
                  })}
              </Box>
            </AccordionDetails>
          </Accordion>
        )
      })}
    </AccordionGroup>
  )
}
