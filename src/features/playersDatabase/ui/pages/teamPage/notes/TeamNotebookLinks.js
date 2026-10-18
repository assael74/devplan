// src/features/playersDatabase/ui/pages/teamPage/notes/TeamNotebookLinks.js

import React from 'react'
import {
  Autocomplete, AutocompleteOption, Box, FormControl, FormHelperText,
  FormLabel, Option, Select, Typography,
} from '@mui/joy'
import { includeLinkedOptions, INSIGHT_OPTIONS } from './model/teamNotebook.ui.js'
import { teamNotebookSx as sx } from './sx/teamNotebook.sx.js'

function LinkField({ label, placeholder, options, selectedIds, onChange, fallback, helper }) {
  const items = includeLinkedOptions(options, selectedIds, fallback)
  const value = selectedIds.map(id => items.find(item => item.id === id)).filter(Boolean)
  return (
    <FormControl size='sm' sx={sx.formControl}>
      <FormLabel>{label}</FormLabel>
      <Autocomplete
        multiple
        size='sm'
        disableCloseOnSelect
        filterSelectedOptions
        options={items}
        value={value}
        getOptionLabel={option => option.label}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        onChange={(_event, next) => onChange(next.map(item => item.id))}
        placeholder={value.length ? '' : placeholder}
        noOptionsText='אין אפשרויות נוספות ברשימה שסופקה'
        clearText='ניקוי הבחירה'
        closeText='סגירת הרשימה'
        openText='פתיחת הרשימה'
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
        sx={sx.autocomplete}
      />
      {helper && <FormHelperText>{helper}</FormHelperText>}
    </FormControl>
  )
}

export default function TeamNotebookLinks({ finding, seasonOptions, playerOptions, onChange }) {
  const seasons = includeLinkedOptions(seasonOptions, finding.relatedSeasonIds, 'עונה')
  const focusOptions = seasons.filter(option => finding.relatedSeasonIds.includes(option.id))
  const changeSeasons = relatedSeasonIds => onChange({
    relatedSeasonIds,
    focusSeasonId: relatedSeasonIds.includes(finding.focusSeasonId) ? finding.focusSeasonId : '',
  })

  return (
    <Box sx={sx.fields}>
      <LinkField
        label='מסלולים מקושרים'
        placeholder='בחירת מסלול אחד או יותר'
        fallback='מסלול'
        options={INSIGHT_OPTIONS}
        selectedIds={finding.insightIds}
        onChange={insightIds => onChange({ insightIds })}
      />
      <LinkField
        label='עונות מקושרות'
        placeholder='בחירת עונה אחת או יותר'
        fallback='עונה'
        options={seasons}
        selectedIds={finding.relatedSeasonIds}
        onChange={changeSeasons}
      />
      {focusOptions.length > 0 && (
        <FormControl size='sm' sx={sx.formControl}>
          <FormLabel>עונת מיקוד — לא חובה</FormLabel>
          <Select
            size='sm'
            value={finding.focusSeasonId}
            onChange={(_event, value) => onChange({ focusSeasonId: value || '' })}
            slotProps={{ listbox: { dir: 'rtl' } }}
          >
            <Option value=''>ללא עונת מיקוד — ממצא רב־עונתי</Option>
            {focusOptions.map(option => <Option key={option.id} value={option.id}>{option.label}</Option>)}
          </Select>
        </FormControl>
      )}
      <LinkField
        label='שחקנים מקושרים'
        placeholder='חיפוש ובחירת שחקנים'
        fallback='שחקן'
        options={playerOptions}
        selectedIds={finding.relatedPlayerIds}
        onChange={relatedPlayerIds => onChange({ relatedPlayerIds })}
        helper='הבחירה כוללת את כל העונות שסופקו, ולא רק את עונת המיקוד.'
      />
    </Box>
  )
}
