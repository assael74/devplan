// teamProfile/sharedUi/management/targets/TargetRankPicker.js

import React from 'react'
import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  FormLabel,
  Option,
  Select,
  Typography,
} from '@mui/joy'

import TeamLeaguePosField from '../../../../../../ui/fields/inputUi/teams/TeamLeaguePosField'

import {
  TEAM_TARGET_POSITION_MODE,
  getTeamTargetProfileById,
  resolveTeamTargetProfileId,
} from '../../../../../../shared/teams/targets/index.js'

import { targetRankPickerSx as sx } from '../sx/targetRankPicker.sx.js'

const TARGET_RANK_MODES = [
  {
    id: 'exact',
    label: 'מקום מדויק',
    helper: 'יעד מספרי אחד',
  },
  {
    id: 'range',
    label: 'טווח מקומות',
    helper: 'אזור טבלה מוגדר',
  },
]

const TARGET_RANK_POSITION = [
  {
    id: 'top',
    label: 'צמרת · מקומות 1 - 4',
  },
  {
    id: 'midHigh',
    label: 'אמצע עליון · מקומות 5 - 8',
  },
  {
    id: 'midLow',
    label: 'אמצע תחתון · מקומות 9 - 13',
  },
  {
    id: 'bottom',
    label: 'תחתון · מקום 14 ומטה',
  },
]

const isProfileId = (value) => {
  return !!getTeamTargetProfileById(value)
}

const resolveUiMode = (draft = {}) => {
  if (draft.targetPositionMode === TEAM_TARGET_POSITION_MODE.RANGE) {
    return 'range'
  }

  return 'exact'
}

const buildExactPatch = (draft, value) => {
  const nextTargetPosition = value == null ? '' : String(value).trim()

  const nextTargetProfileId = resolveTeamTargetProfileId({
    targetPositionMode: TEAM_TARGET_POSITION_MODE.EXACT,
    targetPosition: nextTargetPosition,
    targetProfileId: '',
  })

  return {
    ...draft,
    targetPositionMode: TEAM_TARGET_POSITION_MODE.EXACT,
    targetPosition: nextTargetPosition,
    targetProfileId: nextTargetProfileId,
  }
}

const buildRangePatch = (draft, value) => {
  const nextTargetPosition = value == null ? '' : String(value).trim()

  return {
    ...draft,
    targetPositionMode: TEAM_TARGET_POSITION_MODE.RANGE,
    targetPosition: nextTargetPosition,
    targetProfileId: isProfileId(nextTargetPosition) ? nextTargetPosition : '',
  }
}

export default function TargetRankPicker({
  draft,
  pending,
  onDraft,
  isMobile = false,
}) {
  const mode = resolveUiMode(draft)

  const handleMode = (nextMode) => {
    if (pending) return

    const targetPositionMode =
      nextMode === 'range'
        ? TEAM_TARGET_POSITION_MODE.RANGE
        : TEAM_TARGET_POSITION_MODE.EXACT

    onDraft({
      ...draft,
      targetPositionMode,
      targetPosition: '',
      targetProfileId: '',
    })
  }

  const handleExact = (value) => {
    if (pending) return
    onDraft(buildExactPatch(draft, value))
  }

  const handleRange = (value) => {
    if (pending) return
    onDraft(buildRangePatch(draft, value))
  }

  return (
    <Box sx={sx.root}>
      <ButtonGroup
        size="sm"
        variant="soft"
        buttonFlex={1}
        disabled={pending}
        orientation='horizontal'
        sx={sx.group}
      >
        {TARGET_RANK_MODES.map((item) => {
          const selected = item.id === mode

          return (
            <Button
              key={item.id}
              variant={selected ? 'solid' : 'soft'}
              color={selected ? 'primary' : 'neutral'}
              onClick={() => handleMode(item.id)}
              sx={{ minHeight: 48 }}
            >
              <Box sx={sx.modeText(selected)}>
                <Typography level="title-sm" sx={{ fontWeight: 700, color: 'inherit' }}>
                  {item.label}
                </Typography>

                <Typography level="body-xs" sx={sx.modeHelper(selected)}>
                  {item.helper}
                </Typography>
              </Box>
            </Button>
          )
        })}
      </ButtonGroup>

      {mode === 'exact' && (
        <Box sx={sx.exactField(isMobile)}>
          <TeamLeaguePosField
            value={draft.targetPosition || ''}
            size="sm"
            label="מקום יעד"
            variant="soft"
            color="primary"
            disabled={pending}
            onChange={handleExact}
          />
        </Box>
      )}

      {mode === 'range' && (
        <Box sx={sx.rangeField(isMobile)}>
          <FormControl size="sm">
            <FormLabel>טווח מיקומים</FormLabel>

            <Select
              size="sm"
              value={draft.targetPosition || null}
              placeholder="בחר טווח מיקומים"
              variant="soft"
              color="primary"
              disabled={pending}
              onChange={(event, value) => handleRange(value)}
            >
              {TARGET_RANK_POSITION.map((zone) => (
                <Option key={zone.id} value={zone.id}>
                  {zone.label}
                </Option>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}
    </Box>
  )
}
