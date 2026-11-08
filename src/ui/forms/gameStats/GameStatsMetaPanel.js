// src/ui/forms/gameStats/GameStatsMetaPanel.js

import React from 'react'
import {
  Box,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Option,
  Select,
  Sheet,
} from '@mui/joy'

import { formSx as sx } from './sx/form.sx.js'
import StatsParameterHelp from './inputs/StatsParameterHelp.js'

import {
  GAME_STATS_STATUS_OPTIONS,
  toNumber,
} from './logic/index.js'

export default function GameStatsMetaPanel({ draft, game, onDraft }) {
  const scope = draft?.scope || draft?.meta?.scope
  const isPlayerScope = scope === 'player' || scope === 'privatePlayer'
  const source = game?.game || game || {}
  const gameDuration = toNumber(draft?.gameDuration || source.gameDuration)
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
        <FormLabel>
          משך משחק מלא
          <StatsParameterHelp
            label="משך משחק מלא"
            description="משך המשחק התקני לקבוצת הגיל, כפי שהוגדר בפרטי המשחק. זהו משך היעד לנרמול, גם אם השחקן השתתף רק בחלק מהמשחק."
          />
        </FormLabel>

        <Input
          value={gameDuration || ''}
          readOnly
          endDecorator="דק׳"
          slotProps={{ input: { 'aria-label': 'משך משחק מלא' } }}
        />
        <FormHelperText>לפי ההגדרה בפרטי המשחק</FormHelperText>
      </FormControl>

      <Box sx={sx.timeFields}>
        <FormControl size="sm">
          <FormLabel>
            דקות משחק
            <StatsParameterHelp
              label="דקות משחק"
              description={isPlayerScope
                ? 'הדקות שהשחקן שיחק בפועל. בפתיחת טופס חדש הזמן נשלף מרישום השחקן במשחק. למשל: 90 דקות משחק, גם אם נמדדה סטטיסטיקה רק ב־60 דקות. עריכה כאן נשמרת בנפרד ואינה משנה את רישום ההשתתפות.'
                : 'משך המשחק שאליו מתייחסת רשומת הסטטיסטיקה של הקבוצה. דקות הווידאו שנותחו מוזנות בנפרד.'}
            />
          </FormLabel>

          <Input
            type="number"
            value={draft?.timePlayed === null || draft?.timePlayed === undefined ? '' : draft.timePlayed}
            onChange={setNumber('timePlayed')}
            slotProps={{ input: { min: 0, 'aria-label': 'דקות משחק לסטטיסטיקה' } }}
          />
        </FormControl>

        <FormControl size="sm">
          <FormLabel>
            דקות וידאו
            <StatsParameterHelp
              label="דקות וידאו שנותחו"
              description="רק הדקות שמהן נאספו הפעולות לסטטיסטיקה, ולא אורך קובץ הווידאו כולו. אם השחקן שיחק 90 דקות ונמדדו רק 60, יש להזין כאן 60. זהו המכנה בחישוב הנרמול."
            />
          </FormLabel>

          <Input
            type="number"
            value={draft?.timeVideoStats === null || draft?.timeVideoStats === undefined ? '' : draft.timeVideoStats}
            onChange={setNumber('timeVideoStats')}
            slotProps={{ input: { min: 0, 'aria-label': 'דקות וידאו שנותחו' } }}
          />
        </FormControl>
      </Box>

    </Sheet>
  )
}
