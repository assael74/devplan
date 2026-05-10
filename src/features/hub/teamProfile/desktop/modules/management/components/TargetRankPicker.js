// teamProfile/desktop/modules/management/components/TargetRankPicker.js

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

import TeamLeaguePosField from '../../../../../../../ui/fields/inputUi/teams/TeamLeaguePosField'

import {
  TEAM_TARGET_POSITION_MODE,
  getTeamTargetProfileById,
  resolveTeamTargetProfileId,
} from '../../../../../../../shared/teams/targets/index.js'

const TARGET_RANK_MODES = [
  {
    id: 'exact',
    label: 'מקום מדויק',
    helper: 'יעד מספרי אחד',
  },
  {
    id: 'range',
    label: 'טווח מקומות',
    helper: 'בין מקום למקום',
  },
  {
    id: 'zone',
    label: 'אזור טבלה',
    helper: 'הגדרה מילולית',
  },
]

const TARGET_RANK_ZONES = [
  {
    id: 'top',
    label: 'צמרת',
  },
  {
    id: 'midHigh',
    label: 'אמצע עליון',
  },
  {
    id: 'midLow',
    label: 'אמצע תחתון',
  },
  {
    id: 'bottom',
    label: 'תחתון',
  },
]

const TARGET_RANK_POSITION = [
  {
    id: 'top',
    label: 'מיקום 1 - 4',
  },
  {
    id: 'midHigh',
    label: 'מיקום 5 - 8',
  },
  {
    id: 'midLow',
    label: 'מיקום 9 - 13',
  },
  {
    id: 'bottom',
    label: 'מיקום 14 - ומטה',
  },
]

const isProfileId = (value) => {
  return !!getTeamTargetProfileById(value)
}

const resolveUiMode = (draft = {}) => {
  if (draft.targetPositionMode === TEAM_TARGET_POSITION_MODE.EXACT) {
    return 'exact'
  }

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
}) {
  const mode = resolveUiMode(draft)

  const handleMode = (nextMode) => {
    if (pending) return

    if (nextMode === 'exact') {
      onDraft({
        ...draft,
        targetPositionMode: TEAM_TARGET_POSITION_MODE.EXACT,
        targetPosition: '',
        targetProfileId: '',
      })
      return
    }

    onDraft({
      ...draft,
      targetPositionMode: TEAM_TARGET_POSITION_MODE.RANGE,
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
    <Box sx={{ display: 'grid', gap: 1 }}>
      <ButtonGroup
        size="sm"
        variant="soft"
        buttonFlex={1}
        disabled={pending}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 12,

          '& .MuiButton-root:first-of-type': {
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            borderTopLeftRadius: 12,
            borderBottomLeftRadius: 12,
          },

          '& .MuiButton-root:last-of-type': {
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            borderTopRightRadius: 12,
            borderBottomRightRadius: 12,
          },
        }}
      >
        {TARGET_RANK_MODES.map((item) => {
          const selected =
            item.id === 'exact'
              ? mode === 'exact'
              : mode === 'range' && item.id === 'range'

          return (
            <Button
              key={item.id}
              variant={selected ? 'solid' : 'soft'}
              color={selected ? 'primary' : 'neutral'}
              onClick={() => handleMode(item.id)}
            >
              <Box
                sx={{
                  display: 'grid',
                  gap: 0.15,
                  minWidth: 0,
                  color: selected ? 'common.white' : 'text.primary',
                }}
              >
                <Typography level="title-sm" sx={{ fontWeight: 700, color: 'inherit' }}>
                  {item.label}
                </Typography>

                <Typography
                  level="body-xs"
                  sx={{
                    color: 'inherit',
                    opacity: selected ? 0.85 : 0.65,
                  }}
                >
                  {item.helper}
                </Typography>
              </Box>
            </Button>
          )
        })}
      </ButtonGroup>

      {mode === 'exact' && (
        <Box sx={{ maxWidth: 220, minWidth: 0 }}>
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
        <Box sx={{ maxWidth: 320, minWidth: 0 }}>
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

      {mode === 'zone' && (
        <Box sx={{ maxWidth: 320, minWidth: 0 }}>
          <FormControl size="sm">
            <FormLabel>אזור טבלה</FormLabel>

            <Select
              size="sm"
              value={draft.targetPosition || null}
              placeholder="בחר אזור טבלה"
              variant="soft"
              color="primary"
              disabled={pending}
              onChange={(event, value) => handleRange(value)}
            >
              {TARGET_RANK_ZONES.map((zone) => (
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
