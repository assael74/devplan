// features/playersDatabase/ui/components/modals/dataImport/DataImportPreviewCell.js

import * as React from 'react'
import {
  Input,
  Option,
  Select,
  Typography,
} from '@mui/joy'

import { dataImportSx as sx } from '../sx/dataImport.sx.js'
import { resolveDataImportOptions } from './dataImport.model.js'

const buildCellSx = ({ baseSx, columnSx, changedSx }) => ({
  ...baseSx,
  ...(changedSx || {}),
  ...(columnSx || {}),
})

export default function DataImportPreviewCell({
  column,
  row,
  rowIndex,
  onCellChange,
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

  if (column.type === 'select') {
    const options = resolveDataImportOptions(column, row)

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
