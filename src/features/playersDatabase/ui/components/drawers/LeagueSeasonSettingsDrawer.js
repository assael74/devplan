// src/features/playersDatabase/ui/components/drawers/LeagueSeasonSettingsDrawer.js

import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Typography,
} from '@mui/joy'
import DrawerShell from '../../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../../ui/patterns/drawer/DrawerHeaderShell.js'
import { entitySeasonUrlDrawerSx as sx } from './sx/entitySeasonUrlDrawer.sx.js'
import { leagueSeasonSettingsDrawerSx as settingsSx } from './sx/leagueSeasonSettingsDrawer.sx.js'
import {
  isValidQuantity,
  rulesFields,
} from '../../pages/leaguePage/logic/leagueSettingsEditor.model.js'

export default function LeagueSeasonSettingsDrawer({ editor }) {
  const { context } = editor
  return (
    <DrawerShell
      open={editor.open}
      onClose={editor.close}
      entity='league'
      saving={editor.saving}
      isDirty={editor.urlDirty || editor.rulesDirty}
      sxOverrides={sx.shell}
      header={
        <DrawerHeaderShell
          title='הגדרות עונת ליגה'
          titleIconId='edit'
          entity='league'
          subline={context?.leagueName || ''}
          meta={context?.seasonKey ? `עונה ${context.seasonKey}` : ''}
          metaIconId='season'
          chipLabel='מאגר שחקנים'
          chipIconId='playersDatabase'
          sxOverrides={sx.header}
        />
      }
      texts={{ cancel: 'סגירה', statusSaving: 'שומר את השינוי שנבחר...' }}
      saveButtonProps={{ sx: settingsSx.hiddenSave }}
      cancelButtonProps={{ sx: sx.cancelButton }}
    >
      <Box sx={settingsSx.sections}>
        <Box sx={sx.fieldCard}>
          <Typography level='title-md' sx={settingsSx.title}>
            קישור העונה
          </Typography>
          <FormControl error={!editor.urlValid} sx={sx.formControl}>
            <FormLabel>קישור הליגה לעונה</FormLabel>
            <Input
              autoFocus
              autoComplete='off'
              value={editor.draftUrl}
              placeholder='https://'
              disabled={editor.saving}
              onChange={event => editor.changeUrl(event.target.value)}
              slotProps={{ input: { dir: 'ltr' } }}
              sx={sx.input}
            />
            <FormHelperText>אפשר להשאיר ריק או להזין כתובת מלאה.</FormHelperText>
          </FormControl>
          {editor.urlError && (
            <Typography role='alert' color='danger' sx={settingsSx.message}>
              {editor.urlError}
            </Typography>
          )}
          <Button
            loading={editor.urlSaving}
            disabled={!editor.urlDirty || !editor.urlValid || editor.saving}
            onClick={editor.saveUrl}
            sx={[sx.saveButton, settingsSx.save]}
          >
            שמירת קישור
          </Button>
        </Box>

        <Box sx={sx.fieldCard}>
          <Typography level='title-md' sx={settingsSx.title}>
            חוקי עלייה וירידה
          </Typography>
          <Box sx={sx.goalGrid}>
            {rulesFields.map(([field, label]) => (
              <FormControl
                key={field}
                error={!isValidQuantity(editor.draftRules[field])}
                sx={sx.formControl}
              >
                <FormLabel>{label}</FormLabel>
                <Input
                  type='number'
                  value={editor.draftRules[field] || ''}
                  placeholder='0'
                  disabled={
                    editor.saving ||
                    (context?.isTopLeague && field.startsWith('promotion'))
                  }
                  onChange={event => editor.changeRule(field, event.target.value)}
                  slotProps={{ input: { min: 0, inputMode: 'numeric', dir: 'ltr' } }}
                  sx={sx.input}
                />
                <FormHelperText>
                  {context?.isTopLeague && field.startsWith('promotion')
                    ? 'בליגה הראשונה אין עלייה.'
                    : 'הזן את מספר הקבוצות.'}
                </FormHelperText>
              </FormControl>
            ))}
          </Box>
          {editor.rulesError && (
            <Typography role='alert' color='danger' sx={settingsSx.message}>
              {editor.rulesError}
            </Typography>
          )}
          <Button
            loading={editor.rulesSaving}
            disabled={!editor.rulesDirty || !editor.rulesValid || editor.saving}
            onClick={editor.saveRules}
            sx={[sx.saveButton, settingsSx.save]}
          >
            שמירת חוקים
          </Button>
        </Box>
      </Box>
    </DrawerShell>
  )
}
