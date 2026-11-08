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
import StatsParameterHelp from '../inputs/StatsParameterHelp.js'

import {
  GAME_STATS_PRESETS,
  getStatsParams,
  getParamCardLabel,
  groupParamsByType,
  groupParamsByFamily,
  resolvePresetParamIds,
  toggleParamId,
} from '../logic/index.js'

const typeLabels = {
  general: 'בסיס',
  offensive: 'התקפה',
  defensive: 'הגנה',
}

function StepHeader({ onReset, children }) {
  return (
    <Box sx={sx.stepHeader}>
      <Box sx={sx.headerMain}>
        <Typography level="title-sm" sx={sx.headerTitle}>
          בחירת פרמטרים
        </Typography>
        {children}
      </Box>

      <Button size="sm" variant="soft" color="neutral" onClick={onReset} sx={sx.compactButton}>
        איפוס
      </Button>
    </Box>
  )
}

function ParamCard({ item, selected, onToggle }) {
  const label = item.statsParmName || item.statsParmShortName
  const icon = iconUi({ id: item.id })
  const displayLabel = getParamCardLabel(item)

  const handleClick = () => {
    onToggle(item.id)
  }

  return (
    <Sheet
      variant="outlined"
      sx={sx.paramCardState({ selected, family: item.tripletGroup || item.id })}
      onClick={handleClick}
    >
      <Box sx={sx.paramCardMain}>
        <Box sx={sx.paramIcon}>
          {icon}
        </Box>

        <Typography level="body-xs" sx={sx.paramLabel}>
          {displayLabel}
        </Typography>
      </Box>

      <Checkbox
        size="sm"
        checked={selected}
        slotProps={{ input: { 'aria-label': label } }}
        onClick={event => event.stopPropagation()}
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
      <StepHeader onReset={handleReset}>
        <Box sx={sx.presetsGrid}>
          {GAME_STATS_PRESETS.map(item => (
            <Button
              key={item.id}
              size="sm"
              variant={draft?.preset === item.id ? 'solid' : 'soft'}
              color={draft?.preset === item.id ? 'primary' : 'neutral'}
              onClick={() => setPreset(item.id)}
              sx={sx.compactButton}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      </StepHeader>

      <Box sx={sx.paramGroups}>
        {Object.entries(grouped).map(([type, items]) => (
          <Sheet key={type} variant="outlined" sx={sx.paramGroup}>
            <Typography level="title-sm" sx={sx.groupTitle}>
              {typeLabels[type] || type}
            </Typography>

            <Box sx={sx.paramGrid}>
              {groupParamsByFamily(items).map(family => (
                <Box key={family.id} sx={sx.paramFamily(family.id)}>
                  {family.items.length > 1 ? (
                    <Box sx={sx.familyHeader}>
                      <Typography level="body-xs" sx={sx.familyTitle}>{family.label}</Typography>
                      <StatsParameterHelp label={family.label} description={family.description} />
                    </Box>
                  ) : null}

                  <Box sx={sx.familyItems(family.items.length)}>
                    {family.items.map(item => (
                      <ParamCard
                        key={item.id}
                        item={item}
                        selected={selectedIds.includes(item.id)}
                        onToggle={handleToggle}
                      />
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>
          </Sheet>
        ))}
      </Box>
    </Box>
  )
}
