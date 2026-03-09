// C:\projects\devplan\src\ui\forms\ui\abilities\GrowthStageSection.js
import React from 'react'
import { Box, Typography, Sheet, Select, Option } from '@mui/joy'
import { iconUi } from '../../../core/icons/iconUi'
import { growthStageOptions } from '../../helpers/abilities/abilitiesCreateForm.helpers.js'

export default function GrowthStageSection({
  vaSx,
  canInteract,
  growthStageValue,
  missingGrowthStage,
  onChange,
}) {
  return (
    <Sheet
      variant="soft"
      color={missingGrowthStage ? 'danger' : 'neutral'}
      sx={[vaSx.growthStageCard, missingGrowthStage && vaSx.growthStageMissing]}
    >
      <Box sx={vaSx.growthStageRow}>
        <Typography level="title-sm" startDecorator={iconUi({ id: 'growthStage' })}>
          שלב התפתחות
        </Typography>

        <Select
          size="sm"
          value={growthStageValue == null || growthStageValue === '' ? null : Number(growthStageValue)}
          placeholder="בחר שלב התפתחות השחקן"
          disabled={!canInteract}
          onChange={onChange}
          sx={vaSx.compactSelect}
          slotProps={{ listbox: { className: 'dpScrollThin' } }}
        >
          <Option value={null} disabled>
            בחר שלב התפתחות השחקן
          </Option>

          {growthStageOptions.map((o) => (
            <Option key={o.value} value={o.value}>
              {o.label}
            </Option>
          ))}
        </Select>
      </Box>

      <Typography level="body-xs" sx={{ opacity: 0.75 }}>
        מלא קודם את שלב ההתפתחות, ואז עבור לדומיינים.
      </Typography>
    </Sheet>
  )
}
