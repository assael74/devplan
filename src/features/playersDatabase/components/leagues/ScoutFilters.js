// src/features/playersDatabase/components/leagues/ScoutFilters.js

import React from 'react'
import { RestartAlt } from '@mui/icons-material'
import {
  Box,
  Button,
  Input,
  Option,
  Select,
  Typography,
} from '@mui/joy'

import { SCOUT_PROFILES } from '../../../../shared/players/scouting/index.js'
import {
  PERSPECTIVES,
  PLAYER_SEARCH_MODES,
} from './hook/useLeaguePage.js'
import { filtersSx as sx } from './sx/filters.sx.js'

const toThreshold = value => {
  if (value === '') return null

  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return null

  return numeric / 100
}

function ThresholdInput({ value, onChange }) {
  return (
    <Input
      type="number"
      size="sm"
      value={
        value === null
          ? ''
          : Math.round(value * 100)
      }
      placeholder="לא פעיל"
      endDecorator="%"
      slotProps={{
        input: {
          step: 1,
        },
      }}
      sx={sx.input}
      onChange={event =>
        onChange(
          toThreshold(event.target.value)
        )
      }
    />
  )
}

export default function ScoutFilters({
  perspectiveId,
  attackThreshold,
  defenseThreshold,
  includeUniversal,
  playerSearchProfileId,
  playerSearchMode,
  onPerspectiveChange,
  onAttackChange,
  onDefenseChange,
  onUniversalToggle,
  onPlayerSearchProfileChange,
  onPlayerSearchModeChange,
  onReset,
}) {
  return (
    <Box sx={sx.root}>
      <Box sx={sx.group}>
        <Typography level="body-xs" sx={sx.label}>
          סינון פרופילים עבור
        </Typography>

        {PERSPECTIVES.map(item => (
          <Button
            key={item.id}
            size="sm"
            variant={perspectiveId === item.id ? 'soft' : 'plain'}
            color={perspectiveId === item.id ? 'primary' : 'neutral'}
            sx={sx.button}
            onClick={() => onPerspectiveChange(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </Box>

      <Box sx={sx.group}>
        <Typography level="body-xs" sx={sx.label}>
          התקפה
        </Typography>

        <ThresholdInput value={attackThreshold} onChange={onAttackChange} />
      </Box>

      <Box sx={sx.group}>
        <Typography level="body-xs" sx={sx.label}>
          הגנה
        </Typography>

        <ThresholdInput value={defenseThreshold} onChange={onDefenseChange} />
      </Box>

      <Button
        size="sm"
        variant={includeUniversal ? 'solid' : 'soft'}
        color={includeUniversal ? 'success' : 'danger'}
        sx={sx.button}
        onClick={onUniversalToggle}
      >
        חיפוש כללי {includeUniversal ? 'פעיל' : 'כבוי'}
      </Button>

      <Box sx={sx.group}>
        <Typography level="body-xs" sx={sx.label}>
          חיפוש שחקנים
        </Typography>

        <Select
          size="sm"
          value={playerSearchProfileId || null}
          placeholder="בחר פרופיל"
          sx={sx.profileSelect}
          onChange={(event, value) => {
            event?.stopPropagation()
            onPlayerSearchProfileChange(value || '')
          }}
        >
          {SCOUT_PROFILES.map(profile => (
            <Option key={profile.id} value={profile.id}>
              {profile.label}
            </Option>
          ))}
        </Select>

        {PLAYER_SEARCH_MODES.map(item => (
          <Button
            key={item.id}
            size="sm"
            variant={playerSearchMode === item.id ? 'soft' : 'plain'}
            color={playerSearchMode === item.id ? 'primary' : 'neutral'}
            disabled={!playerSearchProfileId}
            sx={sx.button}
            onClick={() => onPlayerSearchModeChange(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </Box>

      <Box sx={{ flex: 1 }} />

      <Button
        size="sm"
        variant="soft"
        color="neutral"
        title="איפוס פילטרים"
        aria-label="איפוס פילטרים"
        sx={sx.reset}
        onClick={onReset}
      >
        <RestartAlt fontSize="small" />
      </Button>
    </Box>
  )
}
