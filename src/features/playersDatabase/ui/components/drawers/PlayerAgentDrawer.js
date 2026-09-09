import * as React from 'react'
import {
  Box,
  Chip,
  FormControl,
  FormHelperText,
  FormLabel,
  Textarea,
} from '@mui/joy'

import DrawerShell from '../../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../../ui/patterns/drawer/DrawerHeaderShell.js'
import { entitySeasonUrlDrawerSx as sx } from './sx/entitySeasonUrlDrawer.sx.js'

const clean = value => String(value || '').trim()

const normalizeAgent = value => ({
  status: ['yes', 'no'].includes(clean(value?.status))
    ? clean(value.status)
    : 'unknown',
  phones: clean(value?.phones),
})

export default function PlayerAgentDrawer({
  open,
  playerName = '',
  value,
  saving = false,
  onClose,
  onSave,
}) {
  const original = React.useMemo(() => normalizeAgent(value), [value])
  const [draft, setDraft] = React.useState(original)

  React.useEffect(() => {
    if (open) setDraft(original)
  }, [open, original])

  const isDirty = JSON.stringify(draft) !== JSON.stringify(original)
  const canSave = isDirty && !saving && draft.status !== 'unknown'

  return (
    <DrawerShell
      open={open}
      onClose={onClose}
      entity='player'
      saving={saving}
      isDirty={isDirty}
      canSave={canSave}
      sxOverrides={sx.shell}
      header={(
        <DrawerHeaderShell
          title='סוכן ופרטי קשר'
          titleIconId='phone'
          entity='player'
          subline={playerName}
          chipLabel='מאגר שחקנים'
          chipIconId='playersDatabase'
          sxOverrides={sx.header}
        />
      )}
      actions={{
        onSave: () => canSave && onSave(draft),
        onReset: () => setDraft(original),
      }}
      texts={{
        save: 'שמירת סוכן',
        saving: 'שומר...',
        statusSaving: 'מעדכן פרטי סוכן...',
        statusDirty: 'יש שינוי שטרם נשמר',
        statusClean: 'לא בוצעו שינויים',
      }}
      saveButtonProps={{ sx: sx.saveButton }}
      cancelButtonProps={{ sx: sx.cancelButton }}
      resetButtonProps={{ sx: sx.resetButton }}
    >
      <Box sx={sx.fieldCard}>
        <FormControl sx={sx.formControl}>
          <FormLabel>סטטוס סוכן</FormLabel>
          <Box sx={sx.inlineRow}>
            <Chip
              component='button'
              size='md'
              variant={draft.status === 'yes' ? 'solid' : 'outlined'}
              onClick={() => setDraft(current => ({ ...current, status: 'yes' }))}
              sx={sx.clickable}
            >
              יש סוכן
            </Chip>
            <Chip
              component='button'
              size='md'
              variant={draft.status === 'no' ? 'solid' : 'outlined'}
              onClick={() => setDraft({ status: 'no', phones: '' })}
              sx={sx.clickable}
            >
              אין סוכן
            </Chip>
          </Box>
          <FormHelperText>
            יש לבחור אחת משתי האפשרויות לפני השמירה.
          </FormHelperText>
        </FormControl>

        <FormControl sx={[sx.formControl, { mt: 2 }]}>
          <FormLabel>טלפונים</FormLabel>
          <Textarea
            minRows={2}
            value={draft.phones}
            disabled={draft.status !== 'yes'}
            placeholder='מספר אחד או יותר, מופרדים בפסיק'
            onChange={event => setDraft(current => ({
              ...current,
              phones: event.target.value,
            }))}
            sx={sx.input}
          />
          <FormHelperText>
            פרטי הקשר נשמרים ברמת מסמך השחקן.
          </FormHelperText>
        </FormControl>
      </Box>
    </DrawerShell>
  )
}
