import React from 'react'
import Box from '@mui/joy/Box'
import Chip from '@mui/joy/Chip'
import Sheet from '@mui/joy/Sheet'
import Stack from '@mui/joy/Stack'
import Typography from '@mui/joy/Typography'

import { PUBLIC_GROWTH_STAGE_OPTIONS } from '../shared/abilitiesPublic.helpers.js'

export default function PublicGrowthStageSection({ form }) {
  const { bits, onChangeGrowthStage, validation } = form

  const disabled = form?.draft?.publicMeta?.allowGrowthStageEdit === false
  const hasError = Boolean(validation?.errors?.growthStage)

  return (
    <Sheet
      variant="outlined"
      sx={{
        p: 1.5,
        mb: 1.5,
        borderRadius: 'md',
      }}
    >
      <Stack spacing={1}>
        <Box>
          <Typography level="title-sm">שלב התפתחות</Typography>
          <Typography level="body-sm">
            בחר את שלב ההתפתחות הנוכחי של השחקן
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          {PUBLIC_GROWTH_STAGE_OPTIONS.map((opt) => {
            const selected = Number(bits.growthStageValue) === Number(opt.value)

            return (
              <Chip
                key={opt.value}
                size="lg"
                variant={selected ? 'solid' : 'soft'}
                color={selected ? 'primary' : 'neutral'}
                disabled={disabled}
                onClick={() => onChangeGrowthStage(null, opt.value)}
              >
                {opt.label}
              </Chip>
            )
          })}
        </Stack>

        {hasError ? (
          <Typography level="body-xs" color="danger">
            {validation.errors.growthStage}
          </Typography>
        ) : null}
      </Stack>
    </Sheet>
  )
}
