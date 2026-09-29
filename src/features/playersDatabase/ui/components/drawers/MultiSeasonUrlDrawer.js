import { Box, FormControl, FormHelperText, FormLabel, Input, Stack, Typography } from '@mui/joy'
import DrawerShell from '../../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../../ui/patterns/drawer/DrawerHeaderShell.js'
import { entitySeasonUrlDrawerSx as sx } from './sx/entitySeasonUrlDrawer.sx.js'
const clean = value => String(value ?? '').trim()
const validUrl = value => !clean(value) || /^https?:\/\/[^\s]+$/i.test(clean(value))
export default function MultiSeasonUrlDrawer({ open, onClose, onSave, onChange, rows = [], saving, entityType, entityName, title, fieldLabel, contextLabel }) {
  const dirtyRows = rows.filter(row => clean(row.draftUrl) !== clean(row.originalUrl))
  const valid = dirtyRows.every(row => validUrl(row.draftUrl))
  return <DrawerShell open={open} onClose={onClose} entity={entityType} saving={saving} isDirty={dirtyRows.length > 0} canSave={dirtyRows.length > 0 && valid && !saving}
    sxOverrides={sx.shell}
    header={<DrawerHeaderShell title={title} titleIconId='link' entity={entityType} subline={entityName} meta={`${rows.length} עונות`} metaIconId='season' chipLabel='מאגר שחקנים' chipIconId='playersDatabase' sxOverrides={sx.header} />}
    actions={{ onSave, onReset: () => rows.forEach(row => onChange(row.key, row.originalUrl)) }}
    texts={{ save: 'שמירת קישורים', saving: 'שומר...', statusSaving: 'מעדכן קישורים...', statusDirty: `${dirtyRows.length} שינויים ממתינים לשמירה`, statusClean: 'לא בוצעו שינויים' }}
    saveButtonProps={{ sx: sx.saveButton }} cancelButtonProps={{ sx: sx.cancelButton }} resetButtonProps={{ sx: sx.resetButton }}>
    <Stack spacing={1.25}>
      {rows.map(row => {
        const rowValid = validUrl(row.draftUrl)
        return <Box key={row.key} sx={sx.fieldCard}>
          <Stack spacing={0.5} sx={{ mb: 1 }}>
            <Typography level='title-sm'>{row.seasonKey}</Typography>
            <Typography level='body-xs'>{contextLabel(row)}</Typography>
          </Stack>
          <FormControl error={!rowValid}>
            <FormLabel>{fieldLabel}</FormLabel>
            <Input value={row.draftUrl} disabled={saving} onChange={event => onChange(row.key, event.target.value)} slotProps={{ input: { dir: 'ltr' } }} sx={sx.input} />
            <FormHelperText>{!rowValid ? 'יש להזין כתובת מלאה שמתחילה ב־http:// או https://' : row.error ? row.error : row.saving ? 'שומר...' : row.saved ? 'נשמר' : clean(row.draftUrl) !== clean(row.originalUrl) ? 'יש שינוי שטרם נשמר' : 'ללא שינוי'}</FormHelperText>
          </FormControl>
        </Box>
      })}
    </Stack>
  </DrawerShell>
}
