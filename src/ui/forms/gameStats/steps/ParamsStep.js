// src/ui/forms/gameStats/steps/ParamsStep.js

import React from 'react'
import {
  Box,
  Button,
  Checkbox,
  Sheet,
  Typography,
} from '@mui/joy'

import { paramsStepSx as sx } from './sx/paramsStep.sx.js'
import { iconUi } from '../../../core/icons/iconUi.js'

import {
  GAME_STATS_PRESETS,
  getStatsParams,
  groupParamsByType,
  resolvePresetParamIds,
  toggleParamId,
} from '../logic/index.js'

const typeLabels = {
  general: 'בסיס',
  offensive: 'התקפה',
  defensive: 'הגנה',
}

function StepHeader({ onReset }) {
  return (
    <Box sx={sx.stepHeader}>
      <Box>
        <Typography level="title-sm">
          בחירת פרמטרים
        </Typography>

        <Typography level="body-sm" color="neutral">
          בחר preset או סמן ידנית את הפרמטרים שיופיעו במילוי.
        </Typography>
      </Box>

      <Button size="sm" variant="soft" color="neutral" onClick={onReset}>
        איפוס
      </Button>
    </Box>
  )
}

function ParamCard({ item, selected, onToggle }) {
  const label = item.statsParmName || item.statsParmShortName
  const icon = iconUi({ id: item.id })

  const handleClick = () => {
    onToggle(item.id)
  }

  const handleKeyDown = event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onToggle(item.id)
    }
  }

  return (
    <Sheet
      role="button"
      tabIndex={0}
      variant="outlined"
      sx={sx.paramCardState({ selected })}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <Box sx={sx.paramCardMain}>
        <Box sx={sx.paramIcon}>
          {icon}
        </Box>

        <Typography level="body-sm" sx={sx.paramLabel}>
          {label}
        </Typography>
      </Box>

      <Checkbox
        checked={selected}
        onChange={event => {
          event.stopPropagation()
          handleClick()
        }}
        sx={sx.paramCheckbox}
      />
    </Sheet>
  )
}

export function ParamsStep({ draft, onDraft }) {
  const selectedIds = draft?.selectedParmIds || []
  const params = getStatsParams()
  const grouped = groupParamsByType(params)

  const setPreset = preset => {
    onDraft({
      preset,
      selectedParmIds: resolvePresetParamIds(preset),
    })
  }

  const handleToggle = paramId => {
    onDraft({
      preset: 'custom',
      selectedParmIds: toggleParamId({
        selectedParmIds: selectedIds,
        paramId,
      }),
    })
  }

  const handleReset = () => {
    onDraft({
      preset: 'basic',
      selectedParmIds: resolvePresetParamIds('basic'),
    })
  }

  return (
    <Box sx={sx.stepContent}>
      <StepHeader onReset={handleReset} />

      <Box sx={sx.presetsGrid}>
        {GAME_STATS_PRESETS.map(item => (
          <Button
            key={item.id}
            size="sm"
            variant={draft?.preset === item.id ? 'solid' : 'soft'}
            color={draft?.preset === item.id ? 'primary' : 'neutral'}
            onClick={() => setPreset(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </Box>

      <Box sx={sx.paramGroups}>
        {Object.entries(grouped).map(([type, items]) => (
          <Sheet key={type} variant="outlined" sx={sx.paramGroup}>
            <Typography level="title-sm">
              {typeLabels[type] || type}
            </Typography>

            <Box sx={sx.paramGrid}>
              {items.map(item => (
                <ParamCard
                  key={item.id}
                  item={item}
                  selected={selectedIds.includes(item.id)}
                  onToggle={handleToggle}
                />
              ))}
            </Box>
          </Sheet>
        ))}
      </Box>
    </Box>
  )
}
