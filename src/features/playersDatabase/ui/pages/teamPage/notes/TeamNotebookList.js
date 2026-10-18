// src/features/playersDatabase/ui/pages/teamPage/notes/TeamNotebookList.js

import React from 'react'
import {
  Autocomplete, AutocompleteOption, Box, Button, Chip, FormControl, FormLabel,
  Input, Option, Select, Sheet, Typography,
} from '@mui/joy'
import {
  formatNoteDate, getFindingPreview, getNoteStatus, getOptionLabel,
  includeLinkedOptions, INSIGHT_OPTIONS,
} from './model/teamNotebook.ui.js'
import { teamNotebookSx as sx } from './sx/teamNotebook.sx.js'

export default function TeamNotebookList({ notebook, seasonOptions, playerOptions }) {
  const { filters, findings, visibleFindings } = notebook
  const hasFilters = Object.values(filters).some(Boolean)
  const extraCount = Number(Boolean(filters.seasonId)) + Number(Boolean(filters.playerId))
  const seasons = includeLinkedOptions(seasonOptions, findings.flatMap(item => item.relatedSeasonIds), 'עונה')
  const players = includeLinkedOptions(playerOptions, findings.flatMap(item => item.relatedPlayerIds), 'שחקן')

  return (
    <Box sx={sx.listPane}>
      <Box sx={sx.listTools}>
        <Box sx={sx.rowBetween}>
          <Box>
            <Typography level='title-md'>ממצאי החקירה</Typography>
            <Typography level='body-xs'>מחברת אחת לכל המסלולים והעונות</Typography>
          </Box>
          <Button size='sm' onClick={notebook.addDraft} sx={sx.primaryButton}>
            <span aria-hidden='true'>＋</span> ממצא חדש
          </Button>
        </Box>
        <Input
          size='sm'
          value={filters.query}
          onChange={event => notebook.changeFilter('query', event.target.value)}
          placeholder='חיפוש בטקסט או בשם שחקן'
          slotProps={{ input: { 'aria-label': 'חיפוש ממצאים', dir: 'rtl' } }}
        />
        <Box sx={sx.filterRow}>
          <FormControl size='sm' sx={{ flex: 1, minWidth: 0 }}>
            <FormLabel>מסלול חקירה</FormLabel>
            <Select
              size='sm'
              value={filters.insightId}
              onChange={(_event, value) => notebook.changeFilter('insightId', value || '')}
              slotProps={{ listbox: { dir: 'rtl' } }}
            >
              <Option value=''>כל המסלולים</Option>
              {INSIGHT_OPTIONS.map(option => <Option key={option.id} value={option.id}>{option.label}</Option>)}
            </Select>
          </FormControl>
          <Button
            size='sm'
            variant='outlined'
            color='neutral'
            aria-expanded={notebook.showExtraFilters}
            aria-controls='team-notebook-extra-filters'
            onClick={() => notebook.setShowExtraFilters(!notebook.showExtraFilters)}
          >
            עונה ושחקן{extraCount ? ` (${extraCount})` : ''}
          </Button>
        </Box>
        {notebook.showExtraFilters && (
          <Box id='team-notebook-extra-filters' sx={sx.filterGrid}>
            {[
              { key: 'seasonId', label: 'סינון לפי עונה', options: seasons },
              { key: 'playerId', label: 'סינון לפי שחקן', options: players },
            ].map(field => (
              <FormControl size='sm' key={field.key}>
                <FormLabel>{field.label}</FormLabel>
                <Autocomplete
                  size='sm'
                  options={field.options}
                  value={field.options.find(option => option.id === filters[field.key]) || null}
                  getOptionLabel={option => option.label}
                  isOptionEqualToValue={(a, b) => a.id === b.id}
                  onChange={(_event, value) => notebook.changeFilter(field.key, value ? value.id : '')}
                  placeholder='הכול'
                  noOptionsText='אין תוצאות'
                  clearText='ניקוי הסינון'
                  openText='פתיחת הרשימה'
                  closeText='סגירת הרשימה'
                  slotProps={{ listbox: { dir: 'rtl' }, input: { dir: 'rtl' } }}
                  renderOption={(props, option) => {
                    const { key, ...rest } = props
                    return (
                      <AutocompleteOption {...rest} key={option.id || key}>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography level='body-sm' sx={sx.breakText}>{option.label}</Typography>
                          {option.description && <Typography level='body-xs'>{option.description}</Typography>}
                        </Box>
                      </AutocompleteOption>
                    )
                  }}
                />
              </FormControl>
            ))}
          </Box>
        )}
        <Box sx={sx.rowBetween}>
          <Typography level='body-xs' aria-live='polite'>
            {`מוצגים ${visibleFindings.length} מתוך ${findings.length} ממצאים`}
          </Typography>
          {hasFilters && <Button size='sm' variant='plain' color='neutral' onClick={notebook.clearFilters}>ניקוי סינון</Button>}
        </Box>
      </Box>
      <Box sx={sx.listScroll}>
        {visibleFindings.length === 0 ? (
          <Box sx={sx.emptyState}>
            <Typography level='title-md'>{findings.length ? 'לא נמצאו ממצאים מתאימים' : 'המחברת עדיין ריקה'}</Typography>
            <Typography level='body-sm'>
              {findings.length ? 'אפשר לשנות את החיפוש או לנקות את הסינון.' : 'אפשר לפתוח טיוטה, לכתוב התרשמות ולקשר אותה להקשר החקירה.'}
            </Typography>
            <Button variant='outlined' size='sm' onClick={findings.length ? notebook.clearFilters : notebook.addDraft}>
              {findings.length ? 'הצגת כל הממצאים' : 'פתיחת ממצא ראשון'}
            </Button>
          </Box>
        ) : visibleFindings.map(finding => {
          const status = getNoteStatus(finding.status)
          const date = formatNoteDate(finding.updatedAt || finding.createdAt)
          const seasonLabels = finding.relatedSeasonIds.map(id => getOptionLabel(seasons, id, 'עונה'))
          const playerLabels = finding.relatedPlayerIds.map(id => getOptionLabel(players, id, 'שחקן'))
          return (
            <Sheet
              key={finding.id}
              component='button'
              type='button'
              onClick={() => notebook.selectFinding(finding.id)}
              aria-label={`פתח ממצא: ${getFindingPreview(finding).slice(0, 90)}`}
              sx={sx.findingCard}
            >
              <Box sx={sx.rowBetween}>
                <Box sx={sx.chipRow}>
                  <Chip size='sm' color={status.color} variant='soft'>{status.label}</Chip>
                  {notebook.dirtyIds.has(finding.id) && <Chip size='sm' variant='outlined'>טיוטה מקומית</Chip>}
                </Box>
                {date && <Typography level='body-xs' component='span'>{date}</Typography>}
              </Box>
              <Typography level='body-sm' sx={sx.findingExcerpt}>{getFindingPreview(finding)}</Typography>
              <Box sx={sx.chipRow}>
                {finding.insightIds.length ? finding.insightIds.map(id => (
                  <Chip key={id} size='sm' variant='soft' sx={sx.routeChip}>
                    {getOptionLabel(INSIGHT_OPTIONS, id, 'מסלול')}
                  </Chip>
                )) : <Typography level='body-xs'>ללא שיוך למסלול</Typography>}
              </Box>
              <Typography level='body-xs' sx={sx.breakText}>
                {seasonLabels.length ? `עונות: ${seasonLabels.join(' · ')}` : 'ללא שיוך לעונה'}
              </Typography>
              {playerLabels.length > 0 && (
                <Typography level='body-xs' sx={sx.breakText}>
                  {`שחקנים: ${playerLabels.slice(0, 2).join(' · ')}${playerLabels.length > 2 ? ` ועוד ${playerLabels.length - 2}` : ''}`}
                </Typography>
              )}
            </Sheet>
          )
        })}
      </Box>
    </Box>
  )
}
