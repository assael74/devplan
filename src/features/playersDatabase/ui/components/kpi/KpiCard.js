// src/features/playersDatabase/ui/components/kpi/KpiCard.js

import * as React from 'react'
import {
  Box,
  Card,
  Chip,
  Stack,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import {
  getKpiIconSx,
  kpiCardSx as sx,
} from './sx/kpiCard.sx.js'

function KpiDetails({ details = [] }) {
  if (!details.length) return null

  return (
    <Box sx={sx.details}>
      {details.map(detail => (
        <Box key={detail.label} sx={sx.detail}>
          <Typography level='body-xs' sx={sx.detailLabel}>
            {detail.label}
          </Typography>

          {detail.chip ? (
            <Chip
              size='sm'
              variant='soft'
              color={detail.color || 'neutral'}
              sx={sx.detailChip}
            >
              {detail.value}
            </Chip>
          ) : (
            <Typography level='body-sm' sx={sx.detailValue}>
              {detail.value}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  )
}

export default function KpiCard({
  title,
  value,
  caption,
  footer,
  iconId,
  tone = 'soft',
  details = [],
  placeholder = false,
  sx: externalSx,
}) {
  const hasDetails = details.length > 0

  if (hasDetails) {
    return (
      <Card sx={[sx.card, sx.detailsCard, externalSx]}>
        <Box sx={sx.main}>
          <Box sx={sx.text}>
            <Typography level='body-sm' sx={[sx.title, sx.detailsTitle]}>
              {title}
            </Typography>

            <Typography
              level='h2'
              sx={[
                sx.value,
                sx.detailsValue,
                placeholder && sx.placeholderValue,
              ]}
            >
              {value}
            </Typography>
          </Box>

          {iconId ? (
            <Box sx={[getKpiIconSx(tone), sx.detailsIcon]}>
              {iconUi({id: iconId, size: 'md'})}
            </Box>
          ) : null}
        </Box>

        <KpiDetails details={details} />
      </Card>
    )
  }

  return (
    <Card sx={[sx.card, externalSx]}>
      <Stack sx={sx.content}>
        <Typography
          level='body-sm'
          sx={sx.title}
        >
          {title}
        </Typography>

        <Box sx={sx.valueRow}>
          <Typography
            level='h2'
            sx={[
              sx.value,
              placeholder && sx.placeholderValue,
            ]}
          >
            {value}
          </Typography>

          {iconId ? (
            <Stack sx={getKpiIconSx(tone)}>
              {iconUi({id: iconId, size: 'md'})}
            </Stack>
          ) : null}
        </Box>

        {caption ? (
          <Typography
            level='body-xs'
            sx={sx.caption}
          >
            {caption}
          </Typography>
        ) : null}

        {footer ? (
          <Box sx={sx.footer}>
            {footer}
          </Box>
        ) : null}
      </Stack>
    </Card>
  )
}
