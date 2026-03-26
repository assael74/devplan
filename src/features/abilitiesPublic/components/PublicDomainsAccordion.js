import React, { useMemo, useState } from 'react'
import Accordion from '@mui/joy/Accordion'
import AccordionDetails from '@mui/joy/AccordionDetails'
import AccordionGroup from '@mui/joy/AccordionGroup'
import AccordionSummary from '@mui/joy/AccordionSummary'
import Box from '@mui/joy/Box'
import Chip from '@mui/joy/Chip'
import Divider from '@mui/joy/Divider'
import Sheet from '@mui/joy/Sheet'
import Stack from '@mui/joy/Stack'
import Typography from '@mui/joy/Typography'

import { ABILITY_SCORE_OPTS, PUBLIC_ABILITY_LABELS_SHORT } from '../shared/abilitiesPublic.helpers.js'

function ScoreChipsRow({ value, onChange }) {
  return (
    <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
      {ABILITY_SCORE_OPTS.map((score) => {
        const selected = Number(value) === Number(score)

        return (
          <Chip
            key={score}
            size="lg"
            variant={selected ? 'solid' : 'soft'}
            color={selected ? 'primary' : 'neutral'}
            onClick={() => onChange(score)}
          >
            {score}
          </Chip>
        )
      })}
    </Stack>
  )
}

function DomainScoreBar({ domain, onSetDomainScore }) {
  return (
    <Box sx={{ mb: 1.25 }}>
      <Typography level="body-xs" sx={{ mb: 0.75 }}>
        ציון לכל הדומיין
      </Typography>

      <ScoreChipsRow
        value={domain?.avg}
        onChange={onSetDomainScore(domain?.id || domain?.domain)}
      />
    </Box>
  )
}

function AbilityItemRow({ domainId, item, onSetItemScore }) {
  return (
    <Box sx={{ py: 1 }}>
      <Stack spacing={0.75}>
        <Box>
          <Typography level="title-sm">{item?.label || item?.name || item?.id}</Typography>

          {item?.description ? (
            <Typography level="body-xs">{item.description}</Typography>
          ) : null}
        </Box>

        <ScoreChipsRow
          value={item?.value}
          onChange={onSetItemScore(domainId, item?.id)}
        />

        <Typography level="body-xs">
          {item?.value ? `נבחר: ${PUBLIC_ABILITY_LABELS_SHORT[item.value] || item.value}` : 'לא נבחר ציון'}
        </Typography>
      </Stack>
    </Box>
  )
}

export default function PublicDomainsAccordion({ form }) {
  const { domains, onSetItemScore, onSetDomainScore, validation } = form

  const firstId = useMemo(() => {
    const first = Array.isArray(domains) ? domains[0] : null
    return first?.id || first?.domain || null
  }, [domains])

  const [expanded, setExpanded] = useState(firstId)

  return (
    <Box sx={{ pb: 2 }}>
      <AccordionGroup size="lg">
        {(domains || []).map((domain) => {
          const domainId = domain?.id || domain?.domain
          const filled = domain?.filled || 0
          const total = domain?.total || 0
          const avg = domain?.avg

          return (
            <Accordion
              key={domainId}
              expanded={expanded === domainId}
              onChange={(event, isExpanded) => {
                setExpanded(isExpanded ? domainId : null)
              }}
            >
              <AccordionSummary>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ width: '100%' }}
                >
                  <Box>
                    <Typography level="title-sm">
                      {domain?.label || domain?.name || domainId}
                    </Typography>

                    <Typography level="body-xs">
                      {filled}/{total} מולאו
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={0.75}>
                    <Chip size="sm" variant="soft">
                      ממוצע: {avg == null ? '-' : avg}
                    </Chip>
                  </Stack>
                </Stack>
              </AccordionSummary>

              <AccordionDetails>
                <Sheet variant="soft" sx={{ p: 1.25, borderRadius: 'md' }}>
                  <DomainScoreBar
                    domain={domain}
                    onSetDomainScore={onSetDomainScore}
                  />

                  <Divider sx={{ my: 1 }} />

                  <Stack divider={<Divider />}>
                    {(domain?.items || []).map((item) => (
                      <AbilityItemRow
                        key={item?.id}
                        domainId={domainId}
                        item={item}
                        onSetItemScore={onSetItemScore}
                      />
                    ))}
                  </Stack>
                </Sheet>
              </AccordionDetails>
            </Accordion>
          )
        })}
      </AccordionGroup>

      {validation?.errors?.abilities ? (
        <Typography level="body-xs" color="danger" sx={{ mt: 1 }}>
          {validation.errors.abilities}
        </Typography>
      ) : null}
    </Box>
  )
}
