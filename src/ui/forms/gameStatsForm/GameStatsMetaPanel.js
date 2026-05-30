// src/ui/forms/gameStatsForm/GameStatsMetaPanel.js

import React from 'react'
import {
  FormControl,
  FormLabel,
  Input,
  Option,
  Select,
  Sheet,
} from '@mui/joy'

import { formSx as sx } from './sx/form.sx.js'

import {
  GAME_STATS_STATUS_OPTIONS,
  toNumber,
} from './logic/index.js'

export default function GameStatsMetaPanel({ draft, onDraft }) {
  const setNumber = key => event => {
    onDraft({ [key]: toNumber(event.target.value) })
  }

  const setStatus = (_, value) => {
    onDraft({ status: value || 'draft' })
  }

  return (
    <Sheet variant="soft" sx={sx.metaPanel}>
      <FormControl size="sm">
        <FormLabel>סטטוס</FormLabel>

        <Select value={draft?.status || 'draft'} onChange={setStatus}>
          {GAME_STATS_STATUS_OPTIONS.map(option => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      </FormControl>

      <FormControl size="sm">
        <FormLabel>זמן משחק</FormLabel>

        <Input
          type="number"
          value={draft?.timePlayed ?? ''}
          onChange={setNumber('timePlayed')}
        />
      </FormControl>

      <FormControl size="sm">
        <FormLabel>דקות וידאו</FormLabel>

        <Input
          type="number"
          value={draft?.timeVideoStats ?? ''}
          onChange={setNumber('timeVideoStats')}
        />
      </FormControl>
    </Sheet>
  )
}
