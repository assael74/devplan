// features/playersDatabase/ui/components/modals/DataImportModal.js

import * as React from 'react'
import {
  Box,
  Button,
  Card,
  Chip,
  Input,
  Option,
  Select,
  Stack,
  Table,
  Tooltip,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import PlayersDatabaseModal from './PlayersDatabaseModal.js'
import { dataImportSx as sx } from './sx/dataImport.sx.js'

const DEFAULT_COLUMNS = [
  {
    key: 'name',
    label: 'שם',
  },
  {
    key: 'value',
    label: 'ערך',
  },
  {
    key: 'status',
    label: 'סטטוס',
  },
]

const resolveOptions = (column, row) => {
  if (typeof column.getOptions === 'function') {
    return column.getOptions(row) || []
  }

  return column.options || []
}

const isRequiredMissing = (column, row) => {
  if (!column.required) return false

  const value = row[column.key]
  return value === null || value === undefined || String(value).trim() === ''
}

const isPreviewRowValid = (columns, row) => (
  !columns.some(column => isRequiredMissing(column, row))
)

const resolvePreviewRowStatus = ({ columns, row, rowIndex, getRowStatus }) => {
  if (typeof getRowStatus === 'function') {
    const status = getRowStatus(row, rowIndex)

    if (status && typeof status === 'object') {
      return {
        valid: Boolean(status.valid),
        message: status.message || '',
      }
    }

    return {
      valid: Boolean(status),
      message: '',
    }
  }

  return {
    valid: isPreviewRowValid(columns, row),
    message: '',
  }
}

function PreviewStatusCell({ valid, message }) {
  const content = (
    <Box sx={sx.statusCell}>
      {iconUi({
        id: valid ? 'completed' : 'warning',
        size: 'sm',
        sx: valid ? sx.statusIconValid : sx.statusIconInvalid,
      })}
    </Box>
  )

  if (!message) return content

  return (
    <Tooltip
      title={message}
      arrow
    >
      {content}
    </Tooltip>
  )
}

function PasteArea({
  pasteValue,
  pastePlaceholder,
  onPasteChange,
  onPaste,
  onFileSelect,
}) {
  const fileInputRef = React.useRef(null)

  const handleFileButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = event => {
    const file = event.target.files?.[0] || null

    if (typeof onFileSelect === 'function') {
      onFileSelect(file)
    }

    event.target.value = ''
  }

  return (
    <Card sx={sx.pastePanel}>
      <Box sx={sx.sectionHeader}>
        <Box>
          <Typography
            level='title-md'
            sx={sx.sectionTitle}
          >
            הדבקת נתונים
          </Typography>

          <Typography
            level='body-xs'
            sx={sx.sectionDescription}
          >
            הדביקו נתונים שהועתקו מאקסל או ממקור טבלאי אחר.
          </Typography>
        </Box>

        <Button
          size='sm'
          variant='outlined'
          startDecorator={iconUi({ id: 'upload', size: 'sm' })}
          onClick={handleFileButtonClick}
          sx={sx.fileButton}
        >
          קובץ אקסל
        </Button>

        <Input
          slotProps={{
            input: {
              ref: fileInputRef,
              type: 'file',
              accept: '.xlsx,.xls,.csv',
              onChange: handleFileChange,
            },
          }}
          sx={sx.hiddenFileInput}
        />
      </Box>

      <Box
        component='textarea'
        value={pasteValue}
        placeholder={pastePlaceholder || 'הדביקו כאן את הנתונים באמצעות Ctrl+V'}
        onChange={event => {
          if (typeof onPasteChange === 'function') {
            onPasteChange(event.target.value)
          }
        }}
        sx={sx.pasteInput}
      />

      <Box sx={sx.pasteFooter}>
        <Typography
          level='body-xs'
          sx={sx.pasteHint}
        >
          השורה הראשונה יכולה לשמש כשורת כותרות.
        </Typography>

        <Button
          size='sm'
          variant='solid'
          disabled={!pasteValue}
          startDecorator={iconUi({
            id: 'addStats',
            size: 'sm',
          })}
          onClick={onPaste}
          sx={sx.pasteButton}
        >
          הצג נתונים
        </Button>
      </Box>
    </Card>
  )
}

function PreviewCell({ column, row, rowIndex, onCellChange }) {
  const value = row[column.key] || ''
  const isChangedTeamSlot = column.key === 'teamSlot' && Number(value) > 1

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
        sx={{
          ...sx.cellText,
          ...(column.inputSx || {}),
        }}
      >
        {value || '-'}
      </Typography>
    )
  }

  if (column.type === 'select') {
    const options = resolveOptions(column, row)

    return (
      <Select
        size='sm'
        value={value}
        sx={{
          ...sx.cellSelect,
          ...(isChangedTeamSlot ? sx.cellSelectChanged : {}),
          ...(column.inputSx || {}),
        }}
        onChange={(event, nextValue) => {
          if (typeof onCellChange === 'function') {
            onCellChange({
              row,
              rowIndex,
              column,
              value: nextValue || '',
            })
          }
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
        if (typeof onCellChange === 'function') {
          onCellChange({
            row,
            rowIndex,
            column,
            value: event.target.value,
          })
        }
      }}
      sx={{
        ...sx.cellInput,
        ...(column.inputSx || {}),
      }}
    />
  )
}

function PreviewTable({ columns, rows, onCellChange, getRowStatus }) {
  return (
    <Card sx={sx.previewPanel}>
      <Box sx={sx.previewHeader}>
        <Box>
          <Typography
            level='title-md'
            sx={sx.sectionTitle}
          >
            תצוגה ועריכת נתונים
          </Typography>

          <Typography
            level='body-xs'
            sx={sx.sectionDescription}
          >
            ניתן לבדוק ולתקן את הנתונים לפני הטעינה.
          </Typography>
        </Box>

        <Stack
          direction='row'
          spacing={0.75}
          sx={sx.summaryChips}
        >
          <Chip
            size='sm'
            variant='soft'
            color='success'
          >
            {rows.length} שורות
          </Chip>

          <Chip
            size='sm'
            variant='soft'
            color='neutral'
          >
            {columns.length} עמודות
          </Chip>
        </Stack>
      </Box>

      <Box
        className='dpScrollThin'
        sx={sx.tableWrap}
      >
        <Table
          stickyHeader
          hoverRow
          size='sm'
          sx={sx.table}
        >
          <thead>
            <tr>
              <Box
                component='th'
                sx={sx.statusColumn}
              >
                תקין
              </Box>

              {columns.map(column => (
                <Box
                  component='th'
                  key={column.key}
                  sx={column.sx}
                >
                  {column.label}
                </Box>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, rowIndex) => {
              const rowStatus = resolvePreviewRowStatus({
                columns,
                row,
                rowIndex,
                getRowStatus,
              })

              return (
                <tr key={row.id || rowIndex}>
                  <Box
                    component='td'
                    sx={sx.statusColumn}
                  >
                    <PreviewStatusCell
                      valid={rowStatus.valid}
                      message={rowStatus.message}
                    />
                  </Box>

                  {columns.map(column => (
                    <Box
                      component='td'
                      key={column.key}
                      sx={column.sx}
                    >
                      <PreviewCell
                        column={column}
                        row={row}
                        rowIndex={rowIndex}
                        onCellChange={onCellChange}
                      />
                    </Box>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </Table>
      </Box>
    </Card>
  )
}

export default function DataImportModal({
  open,
  title = 'טעינת נתונים',
  description = 'הדבקת נתונים, בדיקה ועריכה לפני טעינה למערכת.',
  iconId = 'upload',
  confirmLabel = 'טעינת נתונים',
  columns = DEFAULT_COLUMNS,
  rows = [],
  pasteValue = '',
  pastePlaceholder = '',
  busy = false,
  disabled = false,
  onPasteChange,
  onPaste,
  onFileSelect,
  onCellChange,
  getRowStatus,
  onConfirm,
  onClose,
}) {
  return (
    <PlayersDatabaseModal
      open={open}
      title={title}
      description={description}
      iconId={iconId}
      confirmLabel={confirmLabel}
      confirmIconId='upload'
      size='xl'
      busy={busy}
      disabled={disabled || !rows.length}
      onConfirm={onConfirm}
      onClose={onClose}
    >
      <Box sx={sx.content}>
        <PasteArea
          pasteValue={pasteValue}
          pastePlaceholder={pastePlaceholder}
          onPasteChange={onPasteChange}
          onPaste={onPaste}
          onFileSelect={onFileSelect}
        />

        <PreviewTable
          columns={columns}
          rows={rows}
          onCellChange={onCellChange}
          getRowStatus={getRowStatus}
        />
      </Box>
    </PlayersDatabaseModal>
  )
}





