// src/features/playersDatabase/ui/pages/leaguePage/LeagueSeasonSettingsDrawer.js

import * as React from 'react'
import {
  Box,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Typography,
} from '@mui/joy'

import DrawerShell from '../../../../../ui/patterns/drawer/DrawerShell.js'
import { rulesFields } from './logic/leagueSettingsEditor.model.js'
import { leagueSeasonSettingsDrawerSx as sx } from './sx/leagueSeasonSettingsDrawer.sx.js'

export default function LeagueSeasonSettingsDrawer({ editor }) {
  const context = editor.context || {}
  const isDirty = editor.urlDirty || editor.rulesDirty

  return (
    <DrawerShell
      open={editor.open}
      onClose={editor.close}
      entity='league'
      saving={editor.saving}
      isDirty={isDirty}
      canSave={isDirty && editor.urlValid && editor.rulesValid && !editor.saving}
      actions={{ onSave: editor.save }}
      texts={{
        save: 'שמירת שינויים',
        saving: 'שומר...',
        statusSaving: 'מעדכן את עונת הליגה...',
        statusDirty: 'יש שינויים שטרם נשמרו',
        statusClean: 'לא בוצעו שינויים',
      }}
      sxOverrides={sx.shell}
      headerProps={{
        title: 'הגדרות עונת ליגה',
        titleIconId: 'edit',
        subline: [context.leagueName, context.seasonKey ? `עונה ${context.seasonKey}` : ''].filter(Boolean).join(' · '),
        sxOverrides: sx.header,
      }}
    >
      <Box sx={sx.section}>
        <Typography level='title-md'>קישור העונה</Typography>
        <FormControl size='sm' error={!editor.urlValid || Boolean(editor.urlError)} sx={sx.formControl}>
          <FormLabel>קישור עונת הליגה</FormLabel>
          <Input
            autoComplete='off'
            value={editor.draftUrl}
            disabled={editor.saving}
            placeholder='https://'
            onChange={event => editor.changeUrl(event.target.value)}
            slotProps={{ input: { dir: 'ltr' } }}
            sx={sx.input}
          />
          <FormHelperText>
            {!editor.urlValid
              ? 'יש להזין כתובת מלאה שמתחילה ב־http:// או https://'
              : editor.urlError || 'השינויים יישמרו באמצעות הכפתור בתחתית המגירה.'}
          </FormHelperText>
        </FormControl>
      </Box>

      <Box sx={sx.section}>
        <Typography level='title-md'>חוקי התחרות</Typography>
        <Typography level='body-sm' sx={sx.hint}>
          {`מספר קבוצות בטבלה: ${context.teamCount || 0}.`}
        </Typography>
        <Box sx={sx.rulesGrid}>
          {rulesFields.map(([key, label]) => {
            const topLeaguePromotion = context.isTopLeague && key.startsWith('promotion')
            return (
              <FormControl key={key} size='sm' sx={sx.formControl}>
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
      </Box>
    </DrawerShell>
  )
}
