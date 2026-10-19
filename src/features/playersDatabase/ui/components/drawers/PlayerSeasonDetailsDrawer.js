// src/features/playersDatabase/ui/components/drawers/PlayerSeasonDetailsDrawer.js

import * as React from 'react'
import { Box, FormControl, FormHelperText, FormLabel, Input, Option, Select } from '@mui/joy'

import DrawerShell from '../../../../../ui/patterns/drawer/DrawerShell.js'
import { devPlanColors } from '../../../../../ui/core/theme/Colors.js'
import { POSITION_LAYER_OPTIONS, POSITION_OPTIONS } from '../playerMeta/playerRole.options.js'
import { entitySeasonUrlDrawerSx as baseSx } from './sx/entitySeasonUrlDrawer.sx.js'

const sx = {
  shell: {
    ...baseSx.shell,
    content: { ...baseSx.shell.content, p: 1.5 },
  },
  header: {
    ...baseSx.header,
    header: { ...baseSx.header.header, py: 1.25 },
    subline: { ...baseSx.header.subline, mt: 0.25, fontSize: 13 },
    icon: {
      ...baseSx.header.icon,
      color: '#FFFFFF',
      '& svg': { color: '#FFFFFF', fill: '#FFFFFF' },
    },
    close: {
      ...baseSx.header.close,
      color: '#FFFFFF',
      opacity: 1,
      '--Icon-color': '#FFFFFF',
      '--variant-plainColor': '#FFFFFF',
      '& svg': { color: '#FFFFFF', fill: '#FFFFFF' },
    },
  },
  fieldCard: { ...baseSx.fieldCard, p: 1.25 },
  formControl: {
    ...baseSx.formControl,
    gap: 0.4,
    '& label': { color: devPlanColors.primaryDark, fontSize: 13, fontWeight: 700 },
  },
  input: { ...baseSx.input, minHeight: 34, fontSize: 13 },
  urlField: { mt: 1.5, mb: 1.25 },
  roleCard: { mt: 1.5 },
  roleFields: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 1.25,
    minWidth: 0,
  },
  roleHint: { mt: 1, color: devPlanColors.secondary, fontSize: 11 },
}

const clean = value => String(value === null || value === undefined ? '' : value).trim()
const roleOption = (options, value) => (
  value && !options.some(option => option.value === value)
    ? <Option value={value}>{value}</Option>
    : null
)

export default function PlayerSeasonDetailsDrawer({
  open,
  playerName = '',
  seasonLabel = '',
  value,
  saving = false,
  onClose,
  onSave,
}) {
  const [draft, setDraft] = React.useState(value || {})
  React.useEffect(() => {
    if (open) setDraft(value || {})
  }, [open, value])

  const original = value || {}
  const changed = {
    numShirt: clean(draft.numShirt) !== clean(original.numShirt),
    playerUrl: clean(draft.playerUrl) !== clean(original.playerUrl),
    primaryPosition: clean(draft.primaryPosition) !== clean(original.primaryPosition),
    positionLayer: clean(draft.positionLayer) !== clean(original.positionLayer),
  }
  const isDirty = Object.values(changed).some(Boolean)
  const shirt = clean(draft.numShirt)
  const shirtValid = !shirt || (Number.isSafeInteger(Number(shirt)) && Number(shirt) > 0)
  const url = clean(draft.playerUrl)
  const urlValid = !url || /^https?:\/\/[^\s]+$/i.test(url)
  const canSave = isDirty && shirtValid && urlValid && !saving

  return (
    <DrawerShell
      open={open}
      onClose={onClose}
      entity='player'
      saving={saving}
      isDirty={isDirty}
      canSave={canSave}
      sxOverrides={sx.shell}
      headerProps={{
        title: 'פרטי שחקן',
        titleIconId: 'playersDatabase',
        subline: [playerName, seasonLabel].filter(Boolean).join(' · '),
        sxOverrides: sx.header,
      }}
      actions={{ onSave: () => canSave && onSave(draft, changed) }}
      texts={{ save: 'שמירת שינויים', saving: 'שומר...', statusDirty: 'יש שינויים שלא נשמרו', statusClean: 'לא בוצעו שינויים' }}
    >
      <Box sx={sx.fieldCard}>
        <FormControl sx={sx.formControl} error={!shirtValid}>
          <FormLabel>מספר חולצה לעונה</FormLabel>
          <Input
            size='sm'
            type='number'
            value={draft.numShirt || ''}
            disabled={saving}
            sx={sx.input}
            slotProps={{ input: { min: 1, step: 1 } }}
            onChange={event => setDraft(current => ({ ...current, numShirt: event.target.value }))}
          />
          {!shirtValid ? <FormHelperText>יש להזין מספר שלם וחיובי.</FormHelperText> : null}
        </FormControl>

        <FormControl sx={[sx.formControl, sx.urlField]} error={!urlValid}>
          <FormLabel>קישור שחקן לעונה</FormLabel>
          <Input
            size='sm'
            type='url'
            value={draft.playerUrl || ''}
            disabled={saving}
            placeholder='https://...'
            sx={sx.input}
            onChange={event => setDraft(current => ({ ...current, playerUrl: event.target.value }))}
          />
          {!urlValid ? <FormHelperText>יש להזין קישור http או https תקין.</FormHelperText> : null}
        </FormControl>
      </Box>

      <Box sx={[sx.fieldCard, sx.roleCard]}>
        <Box sx={sx.roleFields}>
          <FormControl sx={sx.formControl}>
            <FormLabel>חוליה קבועה</FormLabel>
            <Select
              size='sm'
              value={draft.positionLayer || ''}
              disabled={saving}
              onChange={(_, next) => setDraft(current => ({ ...current, positionLayer: next || '' }))}
            >
              <Option value=''>ללא</Option>
              {roleOption(POSITION_LAYER_OPTIONS, draft.positionLayer)}
              {POSITION_LAYER_OPTIONS.map(option => <Option key={option.value} value={option.value}>{option.label}</Option>)}
            </Select>
          </FormControl>

          <FormControl sx={sx.formControl}>
            <FormLabel>עמדה קבועה</FormLabel>
            <Select
              size='sm'
              value={draft.primaryPosition || ''}
              disabled={saving}
              onChange={(_, next) => setDraft(current => ({ ...current, primaryPosition: next || '' }))}
            >
              <Option value=''>ללא</Option>
              {roleOption(POSITION_OPTIONS, draft.primaryPosition)}
              {POSITION_OPTIONS.map(option => <Option key={option.value} value={option.value}>{option.label}</Option>)}
            </Select>
          </FormControl>
        </Box>
        <FormHelperText sx={sx.roleHint}>עמדה וחוליה אלו נשמרות כפרטי שחקן קבועים.</FormHelperText>
      </Box>
    </DrawerShell>
  )
}
