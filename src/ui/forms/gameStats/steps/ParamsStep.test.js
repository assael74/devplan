// src/ui/forms/gameStats/steps/ParamsStep.test.js

import React, { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { ParamsStep } from './ParamsStep.js'
import { TripletFieldsSection } from './parts/EntryFieldsSection.js'
import { buildEntryFields } from '../logic/entry.logic.js'
import { getVisibleParams } from '../logic/params.logic.js'
import GameStatsMetaPanel from '../GameStatsMetaPanel.js'
import { getGameStatsTeamName } from '../logic/core/form.helpers.js'

jest.mock('../../../core/icons/iconUi.js', () => ({ iconUi: () => null }))

const progressiveIds = ['progressivePassesTotal', 'progressivePassesSuccess', 'progressivePassesSuccessRate']

test('selecting progressive passes selects all three fields once', () => {
  const onDraft = jest.fn()
  render(<ParamsStep draft={{ preset: 'custom', selectedParmIds: [] }} onDraft={onDraft} />)
  fireEvent.click(screen.getByRole('checkbox', { name: 'סה"כ מסירות מקדמות' }))
  expect(onDraft).toHaveBeenCalledTimes(1)
  expect(onDraft).toHaveBeenCalledWith({ preset: 'custom', selectedParmIds: progressiveIds })
})

function SelectionHarness() {
  const [draft, setDraft] = useState({ preset: 'custom', selectedParmIds: [] })
  return <ParamsStep draft={draft} onDraft={patch => setDraft(current => ({ ...current, ...patch }))} />
}

test('each field selects and clears its triplet without changing other families', () => {
  render(<SelectionHarness />)
  const total = screen.getByRole('checkbox', { name: 'סה"כ מסירות מקדמות' })
  const success = screen.getByRole('checkbox', { name: 'מסירות מקדמות מוצלחות' })
  const keyPasses = screen.getByRole('checkbox', { name: 'סה"כ מסירות מפתח' })
  fireEvent.click(total)
  expect(total).toBeChecked()
  expect(success).toBeChecked()
  expect(keyPasses).not.toBeChecked()
  fireEvent.click(total)
  expect(total).not.toBeChecked()
  expect(success).not.toBeChecked()
  fireEvent.click(success)
  expect(success).toBeChecked()
  expect(total).toBeChecked()
  fireEvent.click(success)
  expect(total).not.toBeChecked()
  expect(success).not.toBeChecked()
})

test.each([
  ['מסירות מקדמות', 'מסירה בין הקווים כולל מסירה אלכסונית'],
  ['מסירות מפתח', 'מסירה לשחקן שיכול לאיים על השער'],
])('explaining %s does not change the selected parameters', async (label, explanation) => {
  const onDraft = jest.fn()
  render(<ParamsStep draft={{ preset: 'custom', selectedParmIds: [] }} onDraft={onDraft} />)
  const help = screen.getByRole('button', { name: `הסבר על ${label}` })
  fireEvent.click(help)
  expect(await screen.findByRole('tooltip')).toHaveTextContent(explanation)
  fireEvent.keyDown(help, { key: 'Enter' })
  expect(onDraft).not.toHaveBeenCalled()
})

function EntryHarness() {
  const [row, setRow] = useState({ progressivePassesTotal: 10, progressivePassesSuccess: 6, progressivePassesSuccessRate: 60 })
  return (
    <TripletFieldsSection
      fields={buildEntryFields(getVisibleParams(progressiveIds))}
      row={row}
      onUpdateRow={patch => setRow(current => ({ ...current, ...patch }))}
    />
  )
}

test('progressive passes calculate the success rate and cap successes at the total', () => {
  render(<EntryHarness />)
  fireEvent.change(screen.getByRole('spinbutton', { name: 'הצלחות מסירות מקדמות' }), { target: { value: '8' } })
  expect(screen.getByRole('textbox', { name: 'אחוז הצלחה מסירות מקדמות' })).toHaveValue('80%')
  fireEvent.change(screen.getByRole('spinbutton', { name: 'סה״כ מסירות מקדמות' }), { target: { value: '5' } })
  expect(screen.getByRole('spinbutton', { name: 'הצלחות מסירות מקדמות' })).toHaveValue(5)
  expect(screen.getByRole('textbox', { name: 'אחוז הצלחה מסירות מקדמות' })).toHaveValue('100%')
  fireEvent.change(screen.getByRole('spinbutton', { name: 'סה״כ מסירות מקדמות' }), { target: { value: '14' } })
  fireEvent.change(screen.getByRole('spinbutton', { name: 'הצלחות מסירות מקדמות' }), { target: { value: '12' } })
  expect(screen.getByRole('textbox', { name: 'אחוז הצלחה מסירות מקדמות' })).toHaveValue('86%')
})

test('time fields distinguish full duration from played and analyzed minutes', async () => {
  const onDraft = jest.fn()
  render(<GameStatsMetaPanel
    draft={{ scope: 'player', gameDuration: 80, timePlayed: 75, timeVideoStats: 60 }}
    onDraft={onDraft}
  />)
  expect(screen.getByRole('textbox', { name: 'משך משחק מלא' })).toHaveValue('80')
  expect(screen.getByRole('textbox', { name: 'משך משחק מלא' })).toHaveAttribute('readonly')
  expect(screen.getByRole('spinbutton', { name: 'דקות משחק לסטטיסטיקה' })).toHaveValue(75)
  fireEvent.change(screen.getByRole('spinbutton', { name: 'דקות וידאו שנותחו' }), { target: { value: '40' } })
  expect(onDraft).toHaveBeenCalledWith({ timeVideoStats: 40 })
  fireEvent.click(screen.getByRole('button', { name: 'הסבר על דקות וידאו שנותחו' }))
  expect(await screen.findByRole('tooltip')).toHaveTextContent('ולא אורך קובץ הווידאו כולו')
})

test.each([
  [{ team: { teamName: 'נערים א׳', club: { clubName: 'מכבי נתניה' } } }, 'מכבי נתניה · נערים א׳'],
  [{
    game: { gameSource: 'external', clubName: 'מועדון במשחק', teamName: 'נוער' },
    context: { club: { clubName: 'מועדון אחר' }, player: { isPrivatePlayer: true } },
  }, 'מועדון במשחק · נוער'],
  [{
    context: { player: { isPrivatePlayer: true, clubName: 'מועדון פרטי', teamName: 'נערים ב׳' } },
  }, 'מועדון פרטי · נערים ב׳'],
  [{ team: { teamName: 'מכבי נתניה' } }, 'מכבי נתניה'],
  [{ team: { name: 'קבוצת פרויקט' } }, 'קבוצת פרויקט'],
  [{
    game: { teamName: 'קבוצה במשחק', gameSource: 'external' },
    team: { teamName: 'קבוצה אחרת' },
    context: { player: { isPrivatePlayer: true, teamName: 'קבוצה נוכחית' } },
  }, 'קבוצה במשחק'],
  [{ context: { player: { isPrivatePlayer: true, teamName: 'קבוצת שחקן פרטי' } } }, 'קבוצת שחקן פרטי'],
])('stats header resolves the stored team name for regular and private players', (model, expected) => {
  expect(getGameStatsTeamName(model)).toBe(expected)
})
