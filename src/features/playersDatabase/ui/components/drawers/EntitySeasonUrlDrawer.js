// features/playersDatabase/ui/components/drawers/EntitySeasonUrlDrawer.js

import * as React from 'react'
import {
  Box,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
} from '@mui/joy'

import DrawerShell from '../../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../../ui/patterns/drawer/DrawerHeaderShell.js'
import { entitySeasonUrlDrawerSx as sx } from './sx/entitySeasonUrlDrawer.sx.js'

const clean = value => String(value || '').trim()

const isValidUrl = value => {
  const nextValue = clean(value)
  if (!nextValue) return true

  return /^https?:\/\/[^\s]+$/i.test(nextValue)
}

export default function EntitySeasonUrlDrawer({
  open,
  onClose,
  onSave,
  entityType = 'entity',
  entityName = '',
  seasonLabel = '',
  value = '',
  title = 'עריכת קישור',
  fieldLabel = 'קישור',
  fieldPlaceholder = 'https://',
  saving = false,
}) {
  const originalValue = clean(value)
  const [draftValue, setDraftValue] = React.useState(originalValue)

  React.useEffect(() => {
    if (!open) return
    setDraftValue(originalValue)
  }, [open, originalValue])

  const nextValue = clean(draftValue)
  const isDirty = nextValue !== originalValue
  const valid = isValidUrl(nextValue)
  const canSave = isDirty && valid && !saving

  const handleSave = () => {
    if (!canSave) return
    onSave(nextValue)
  }

  const handleReset = () => {
    setDraftValue(originalValue)
  }

  return (
    <DrawerShell
      open={open}
      onClose={onClose}
      entity={entityType}
      saving={saving}
      isDirty={isDirty}
      canSave={canSave}
      sxOverrides={sx.shell}
      header={(
        <DrawerHeaderShell
          title={title}
          titleIconId="link"
          entity={entityType}
          subline={entityName}
          meta={seasonLabel ? `עונה ${seasonLabel}` : ''}
          metaIconId="season"
          chipLabel="מאגר שחקנים"
          chipIconId="playersDatabase"
          sxOverrides={sx.header}
        />
      )}
      actions={{
        onSave: handleSave,
        onReset: handleReset,
      }}
      texts={{
        save: 'שמירת קישור',
        saving: 'שומר...',
        statusSaving: 'מעדכן את הקישור...',
        statusDirty: 'יש שינוי שטרם נשמר',
        statusClean: 'לא בוצעו שינויים',
      }}
      saveButtonProps={{ sx: sx.saveButton }}
      cancelButtonProps={{ sx: sx.cancelButton }}
      resetButtonProps={{ sx: sx.resetButton }}
    >
      <Box sx={sx.fieldCard}>
        <FormControl error={!valid} sx={sx.formControl}>
          <FormLabel>{fieldLabel}</FormLabel>
          <Input
            autoFocus
            value={draftValue}
            placeholder={fieldPlaceholder}
            onChange={event => setDraftValue(event.target.value)}
            slotProps={{
              input: {
                dir: 'ltr',
              },
            }}
            sx={sx.input}
          />
          <FormHelperText>
            {!valid
              ? 'יש להזין כתובת מלאה שמתחילה ב־http:// או https://'
              : 'הקישור נשמר עבור הישות והעונה המוצגות במגירה.'}
          </FormHelperText>
        </FormControl>
      </Box>
    </DrawerShell>
  )
}
