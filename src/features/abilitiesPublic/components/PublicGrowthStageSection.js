// features/abilitiesPublic/components/PublicGrowthStageSection.js

import React from 'react'
import { Box, Chip, Sheet, Stack, Typography } from '@mui/joy'

import { PUBLIC_GROWTH_STAGE_OPTIONS } from '../shared/abilitiesPublic.helpers.js'
import { domainsGrowthStageSx as sx } from './sx/domainsGrowthStage.sx'
import { iconUi } from '../../../ui/core/icons/iconUi.js'

export default function PublicGrowthStageSection({ form = {} }) {
  const {
    bits = {},
    onChangeGrowthStage = () => {},
    validation = {},
  } = form

  const disabled = form?.draft?.publicMeta?.allowGrowthStageEdit === false
  const hasError = Boolean(validation?.errors?.growthStage)

  return (
    <Sheet variant="soft" sx={sx.root(hasError)}>
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Sheet
            variant="solid"
            color={hasError ? 'danger' : 'primary'}
            sx={sx.iconWrap(hasError)}
          >
            {iconUi({ id: 'growthStage' })}
          </Sheet>

          <Box>
            <Typography level="title-sm">שלב התפתחות</Typography>
            {hasError ? (
              <Typography level="body-xs" color="danger">
                {validation.errors.growthStage}
              </Typography>
            ) : null}
          </Box>
        </Stack>

        <Box className="dpScrollThin" sx={sx.scrollWrap}>
          <Stack direction="row" spacing={0.75} sx={sx.chipsRow}>
            {PUBLIC_GROWTH_STAGE_OPTIONS.map((opt) => {
              const selected = Number(bits.growthStageValue) === Number(opt.value)

              return (
                <Chip
                  key={opt.value}
                  size="sm"
                  variant={selected ? 'solid' : 'soft'}
                  color={selected ? 'primary' : 'neutral'}
                  disabled={disabled}
                  startDecorator={iconUi({ id: opt.idIcon })}
                  onClick={() => onChangeGrowthStage(null, opt.value)}
                  sx={sx.chip}
                >
                  {opt.label}
                </Chip>
              )
            })}
          </Stack>
        </Box>
      </Stack>
    </Sheet>
  )
}
