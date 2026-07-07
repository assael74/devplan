// features/playersDatabase/components/profilesPage/list/preview/PlayerPositionEditor.js

import { Box, Button, IconButton, Input, Option, Select, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { usePlayerPosition } from '../../list/hooks/usePlayerPosition.js'
import { positionsSx as sx } from './sx/positions.sx.js'

export default function PlayerPositionEditor({ player, onSaved }) {
  const positionModel = usePlayerPosition(player, {
    onSaved,
  })

  return (
    <Box sx={sx.previewSection}>
      <Box sx={sx.previewSectionHead}>
        <Typography sx={sx.previewSectionTitle}>הגדרת עמדה</Typography>

        <Box sx={sx.previewSectionHeadActions}>
          <IconButton
            size="sm"
            variant="soft"
            color="neutral"
            aria-label="איפוס עמדה"
            sx={sx.resetButton}
            disabled={!positionModel.hasDraft || positionModel.saving}
            onClick={positionModel.resetPosition}
          >
            {iconUi({ id: 'reset', size: 'sm' })}
          </IconButton>

          <Button
            size="sm"
            loading={positionModel.saving}
            disabled={!positionModel.hasDraft || positionModel.saving}
            onClick={positionModel.savePosition}
            startDecorator={iconUi({ id: 'save' })}
            sx={sx.saveButton}
          >
            שמור עמדה
          </Button>
        </Box>
      </Box>

      <Box sx={sx.previewPositionGrid}>
        <Box sx={sx.previewFieldWrap}>
          <Select
            size="sm"
            variant="plain"
            value={positionModel.selectedLayer || ''}
            placeholder="חוליה"
            sx={sx.previewSelect}
            onChange={(event, value) => {
              event && event.stopPropagation()
              positionModel.changeLayer(value)
            }}
          >
            <Option value="">ללא חוליה</Option>
            {positionModel.layerOptions.map(option => <Option key={option.code} value={option.code}>{option.label}</Option>)}
          </Select>
        </Box>

        <Box sx={sx.previewFieldWrap}>
          <Select
            size="sm"
            variant="plain"
            value={positionModel.selectedPosition || ''}
            placeholder="עמדה"
            disabled={!positionModel.selectedLayer}
            sx={sx.previewSelect}
            onChange={(event, value) => {
              event && event.stopPropagation()
              positionModel.changePosition(value)
            }}
          >
            <Option value="">ללא עמדה</Option>
            {positionModel.positionOptions.map(option => <Option key={option.code} value={option.code}>{option.label}</Option>)}
          </Select>
        </Box>

        <Input
          size="sm"
          type="number"
          value={positionModel.selectedShirtNumber}
          placeholder="מס' חולצה"
          sx={sx.previewShirtNumberInput}
          onChange={event => {
            event && event.stopPropagation()
            positionModel.changeShirtNumber(event.target.value)
          }}
        />
      </Box>

      {positionModel.error ? <Typography sx={sx.previewSectionError}>{positionModel.error}</Typography> : null}
    </Box>
  )
}
