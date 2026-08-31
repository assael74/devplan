// src/features/playersDatabase/ui/components/modals/paste/PreviewCell.js

import * as React from 'react'
import {
  Autocomplete,
  Input,
  Option,
  Select,
  Typography,
} from '@mui/joy'

import { previewCellSx as sx } from './sx/previewCell.sx.js'
import { resolvePasteOptions } from './paste.model.js'


const normalizeSearchValue = value => String(value || '')
  .toLowerCase()
  .replace(/["׳״'`.-]/g, '')
  .replace(/\s+/g, ' ')
  .trim()

const filterAutocompleteOptions = (options, state) => {
  const query = normalizeSearchValue(state.inputValue)
  if (!query) return options

  return options.filter(option => normalizeSearchValue(
    `${option.displayLabel || option.label || ''} ${option.searchText || ''}`
  ).includes(query))
}

const buildCellSx = ({ baseSx, columnSx, changedSx }) => ({
  ...baseSx,
  ...(changedSx || {}),
  ...(columnSx || {}),
})

export default function PreviewCell({
  column,
  row,
  rowIndex,
  onCellChange,
  cellStatus,
}) {
  const value = row[column.key] || ''
  const isChangedTeamSlot = column.key === 'teamSlot' && Number(value) > 1

  const emitChange = nextValue => {
    if (typeof onCellChange !== 'function') return

    onCellChange({
      row,
      rowIndex,
      column,
      value: nextValue,
    })
  }

  if (typeof column.render === 'function') {
      return column.render({
      row,
      rowIndex,
      column,
      value,
      onCellChange,
      cellStatus,
    })
  }

  if (column.readOnly) {
    return (
      <Typography
        level='body-sm'
        sx={buildCellSx({
          baseSx: sx.cellText,
          columnSx: column.inputSx,
        })}
      >
        {value || '-'}
      </Typography>
    )
  }

  if (cellStatus?.valid === false) {
    return (
      <InvalidCellEditor
        value={value}
        onChange={emitChange}
      />
    )
  }

  if (column.type === 'autocomplete') {
    const options = resolvePasteOptions(column, row)
    const selectedOption = options.find(option => option.value === value) || null

    return (
      <Autocomplete
        size='sm'
        options={options}
        value={selectedOption}
        placeholder='חיפוש מועדון'
        getOptionLabel={option => option.displayLabel || option.label || ''}
        isOptionEqualToValue={(option, selected) => option.value === selected.value}
        filterOptions={filterAutocompleteOptions}
        sx={buildCellSx({
          baseSx: sx.cellAutocomplete,
          columnSx: column.inputSx,
        })}
        onChange={(event, nextOption) => {
          emitChange(nextOption ? nextOption.value : '')
        }}
      />
    )
  }

  if (column.type === 'select') {
    const options = resolvePasteOptions(column, row)

    return (
      <Select
        size='sm'
        value={value}
        sx={buildCellSx({
          baseSx: sx.cellSelect,
          changedSx: isChangedTeamSlot ? sx.cellSelectChanged : null,
          columnSx: column.inputSx,
        })}
        onChange={(event, nextValue) => {
          emitChange(nextValue || '')
        }}
      >
        {options.map(option => (
          <Option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </Option>
        ))}
      </Select>
    )
  }

  return (
    <Input
      variant='plain'
      value={value}
      onChange={event => {
        emitChange(event.target.value)
      }}
      sx={buildCellSx({
        baseSx: sx.cellInput,
        columnSx: column.inputSx,
      })}
    />
  )
}

function InvalidCellEditor({ value, onChange }) {
  return (
    <Input
      variant='plain'
      value={value}
      inputMode='numeric'
      onChange={event => onChange(event.target.value)}
      sx={sx.cellInput}
    />
  )
}
