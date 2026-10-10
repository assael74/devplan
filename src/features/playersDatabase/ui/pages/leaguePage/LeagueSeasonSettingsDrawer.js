// src/features/playersDatabase/ui/pages/leaguePage/LeagueSeasonSettingsDrawer.js

import * as React from 'react'
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
import { rulesFields } from './logic/leagueSettingsEditor.model.js'
import { leagueSeasonSettingsDrawerSx as sx } from './sx/leagueSeasonSettingsDrawer.sx.js'

export default function LeagueSeasonSettingsDrawer({ editor }) {
  const context = editor.context || {}
  const hasRulesChange = editor.rulesDirty && editor.rulesValid && !editor.saving

  return (
    <DrawerShell
      open={editor.open}
      onClose={editor.close}
      entity='league'
      saving={editor.saving}
      isDirty={editor.urlDirty || editor.rulesDirty}
      canSave={editor.urlDirty && editor.urlValid && !editor.saving}
      actions={{ onSave: () => editor.saveUrl() }}
      texts={{
        save: 'שמירת קישור',
        saving: 'שומר...',
        statusSaving: 'מעדכן את עונת הליגה...',
        statusDirty: 'יש שינויים שטרם נשמרו',
        statusClean: 'לא בוצעו שינויים',
      }}
      sxOverrides={sx.shell}
      header={(
        <DrawerHeaderShell
          title='הגדרות עונת ליגה'
          titleIconId='edit'
          entity='league'
          subline={context.leagueName || ''}
          meta={context.seasonKey ? `עונה ${context.seasonKey}` : ''}
          metaIconId='season'
          chipLabel='מאגר שחקנים'
          chipIconId='playersDatabase'
          sxOverrides={sx.header}
        />
      )}
    >
      <Box sx={sx.section}>
        <Typography level='title-md'>קישור העונה</Typography>
        <FormControl error={!editor.urlValid || Boolean(editor.urlError)} sx={sx.formControl}>
          <FormLabel>קישור עונת הליגה</FormLabel>
          <Input
            autoComplete='off'
            value={editor.draftUrl}
            placeholder='https://'
            onChange={event => editor.changeUrl(event.target.value)}
            slotProps={{ input: { dir: 'ltr' } }}
            sx={sx.input}
          />
          <FormHelperText>
            {!editor.urlValid
              ? 'יש להזין כתובת מלאה שמתחילה ב־http:// או https://'
              : editor.urlError || 'הקישור נשמר בנפרד מחוקי התחרות.'}
          </FormHelperText>
        </FormControl>
      </Box>

      <Box sx={sx.section}>
        <Typography level='title-md'>חוקי התחרות</Typography>
        <Typography level='body-sm' sx={sx.hint}>
          {`מספר קבוצות בטבלה: ${context.teamCount || 0}. חוקי התחרות נשמרים בנפרד מהקישור.`}
        </Typography>
        <Box sx={sx.rulesGrid}>
          {rulesFields.map(([key, label]) => {
            const topLeaguePromotion = context.isTopLeague && key.startsWith('promotion')
            return (
              <FormControl key={key} sx={sx.formControl}>
                <FormLabel>{label}</FormLabel>
                <Input
                  type='number'
                  value={topLeaguePromotion ? '0' : editor.draftRules[key] || '0'}
                  disabled={editor.saving || topLeaguePromotion}
                  slotProps={{ input: { min: 0, step: 1 } }}
                  onChange={event => editor.changeRule(key, event.target.value)}
                  sx={sx.input}
                />
              </FormControl>
            )
          })}
        </Box>
        {context.isTopLeague && (
          <Typography level='body-xs' sx={sx.hint}>בליגה העליונה אין מקומות עלייה.</Typography>
        )}
        {!editor.rulesValid && (
          <Typography level='body-xs' color='danger'>יש להזין מספרים שלמים שאינם שליליים.</Typography>
        )}
        {editor.rulesError && (
          <Typography level='body-xs' color='danger'>{editor.rulesError}</Typography>
        )}
        <Button
          variant='soft'
          loading={editor.rulesSaving}
          disabled={!hasRulesChange}
          onClick={editor.saveRules}
        >
          שמירת חוקי התחרות
        </Button>
      </Box>
    </DrawerShell>
  )
}
