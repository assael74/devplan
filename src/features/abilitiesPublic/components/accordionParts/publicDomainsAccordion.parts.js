// features/abilitiesPublic/components/accordionParts/publicDomainsAccordion.parts.js

import React from 'react'
import { Box, Chip, Sheet, Stack, Typography } from '@mui/joy'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import {
  ABILITY_SCORE_OPTS,
  PUBLIC_ABILITY_LABELS_SHORT,
} from '../../shared/abilitiesPublic.helpers.js'
import { getItemScoreTone } from '../shared/abilitiesPublic.helpers.js'
import { domainsAccordionSx as sx } from '../sx/domainsAccordion.sx'

export function PublicScoreChipsRow({ value, onChange }) {
  return (
    <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
      {ABILITY_SCORE_OPTS.map((score) => {
        const selected = Number(value) === Number(score)

        return (
          <Chip
            key={score}
            size="sm"
            variant={selected ? 'solid' : 'outlined'}
            color={selected ? 'success' : 'neutral'}
            onClick={(event) => {
              event.stopPropagation()
              onChange(score)
            }}
            sx={sx.scoreChip}
          >
            {score}
          </Chip>
        )
      })}
    </Stack>
  )
}

export function PublicDomainScoreBar({ domain, onSetDomainScore }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography level="body-sm" sx={{ fontWeight: 700, fontSize: 12 }}>
        ציון מהיר לכל
      </Typography>

      <PublicScoreChipsRow
        value={domain?.avg}
        onChange={onSetDomainScore(domain?.id || domain?.domain)}
      />
    </Box>
  )
}

export function PublicAbilityItemRow({
  domainId,
  item,
  onSetItemScore,
}) {
  const selectedLabel = item?.value
    ? PUBLIC_ABILITY_LABELS_SHORT[item.value] || item.value
    : 'לא נבחר ציון'

  const tone = getItemScoreTone(item?.value)

  return (
    <Sheet variant="solid" sx={sx.itemCard(tone)}>
      <Stack spacing={0.9}>
          <Box sx={sx.itemTopRow}>
            <Box sx={{ minWidth: 0 }}>
              <Typography level="title-sm" startDecorator={iconUi({ id: item?.id })}>
                {item?.label || item?.id}
              </Typography>

              {item?.description ? (
                <Typography level="body-xs" sx={{ mt: 0.25 }}>
                  {item.description}
                </Typography>
              ) : null}
            </Box>

          <Box sx={sx.itemMetaRow}>
            <Typography
              level="body-xs"
              sx={{ fontWeight: 600, color: 'text.secondary', whiteSpace: 'nowrap' }}
            >
              {selectedLabel}
            </Typography>

            <Chip size="sm" variant="soft" color="neutral">
              {item?.value == null ? '-' : item?.value}
            </Chip>
          </Box>
        </Box>

        <PublicScoreChipsRow
          value={item?.value}
          onChange={onSetItemScore(domainId, item?.id)}
        />
      </Stack>
    </Sheet>
  )
}
