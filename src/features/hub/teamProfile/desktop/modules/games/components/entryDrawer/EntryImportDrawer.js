// teamProfile/modules/games/components/entryDrawer/EntryImportDrawer.js

import React from 'react'
import {
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  ModalClose,
  Sheet,
  Table,
  Textarea,
  Typography,
} from '@mui/joy'

import PlayerSelectField from '../../../../../../../../ui/fields/selectUi/players/PlayerSelectField.js'

import { importSx as sx } from './sx/import.sx.js'
import { useEntryImportDrawerModel } from './hooks/useEntryImportDrawerModel.js'

function StatusChip({ status }) {
  if (status === 'matched') {
    return (
      <Chip size="sm" color="success" variant="soft">
        זוהה
      </Chip>
    )
  }

  if (status === 'manual') {
    return (
      <Chip size="sm" color="primary" variant="soft">
        ידני
      </Chip>
    )
  }

  return (
    <Chip size="sm" color="danger" variant="soft">
      שגיאה
    </Chip>
  )
}

export default function EntryImportDrawer({ open, onClose, draft, onApply }) {
  const model = useEntryImportDrawerModel({
    draft,
    onApply,
    onClose,
  })

  const {
    text,
    sampleText,
    resolvedPreview,

    handleTextChange,
    handleSetManualMatch,
    handleUseSample,
    handleClear,
    handleApply,

    getRowPlayerOptions,
    getRowSelectValue,
  } = model

  return (
    <Drawer
      open={open}
      onClose={onClose}
      anchor="right"
      size="lg"
      slotProps={{ content: { sx: sx.content } }}
    >
      <Sheet sx={sx.sheet}>
        <Box sx={sx.header}>
          <Box sx={sx.titleWrap}>
            <Typography level="title-md">
              ייבוא רישום שחקנים מאקסל
            </Typography>

            <Typography level="body-sm" sx={sx.muted}>
              הדבק טבלה, בדוק זיהוי שחקנים, ובחר ידנית שורות שלא זוהו.
            </Typography>
          </Box>

          <ModalClose onClick={onClose} />
        </Box>

        <Divider />

        <Box sx={sx.body}>
          <Textarea
            minRows={7}
            value={text}
            placeholder={sampleText}
            onChange={event => handleTextChange(event.target.value)}
            sx={sx.textarea}
          />

          <Box sx={sx.summary}>
            <Chip size="sm" variant="soft">
              {resolvedPreview?.summary?.total || 0} שורות
            </Chip>

            <Chip size="sm" color="success" variant="soft">
              {resolvedPreview?.summary?.matched || 0} זוהו
            </Chip>

            <Chip size="sm" color="danger" variant="soft">
              {resolvedPreview?.summary?.error || 0} שגיאות
            </Chip>

            {resolvedPreview?.message ? (
              <Typography
                level="body-sm"
                color={resolvedPreview?.ok ? 'success' : 'danger'}
              >
                {resolvedPreview.message}
              </Typography>
            ) : null}
          </Box>

          <Sheet variant="outlined" sx={sx.tableWrap}>
            <Table size="sm" stickyHeader sx={sx.table}>
              <thead>
                <tr>
                  <th style={sx.statusCell}>סטטוס</th>
                  <th style={sx.indexCell}>#</th>
                  <th style={sx.playerCell}>שם מהקובץ / שיוך שחקן</th>
                  <th style={sx.smallCell}>בסגל</th>
                  <th style={sx.smallCell}>הרכב</th>
                  <th style={sx.minutesCell}>דקות</th>
                </tr>
              </thead>

              <tbody>
                {(resolvedPreview?.rows || []).map(row => {
                  const selectValue = getRowSelectValue(row)
                  const rowPlayerOptions = getRowPlayerOptions(row)

                  return (
                    <tr key={row.importIndex}>
                      <td>
                        <StatusChip status={row.status} />
                      </td>

                      <td>{row.displayIndex}</td>

                      <td>
                        <Box sx={sx.playerCellWrap}>
                          <Typography level="body-xs" sx={sx.sourceName}>
                            {row.playerName || '—'}
                          </Typography>

                          <Box sx={sx.selectWrap}>
                            <PlayerSelectField
                              size="sm"
                              label=""
                              placeholder="בחר שחקן"
                              value={selectValue}
                              options={rowPlayerOptions}
                              onChange={value => handleSetManualMatch(row.importIndex, value)}
                            />
                          </Box>
                        </Box>
                      </td>

                      <td>{row.onSquad === true ? 'כן' : row.onSquad === false ? 'לא' : '—'}</td>
                      <td>{row.onStart === true ? 'כן' : row.onStart === false ? 'לא' : '—'}</td>
                      <td>{row.timePlayed || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          </Sheet>
        </Box>

        <Box sx={sx.footer}>
          <Box sx={sx.footerGroup}>
            <Button
              size="sm"
              variant="soft"
              color="neutral"
              onClick={handleUseSample}
            >
              טען דוגמה
            </Button>

            <Button
              size="sm"
              variant="plain"
              color="neutral"
              onClick={handleClear}
              disabled={!text}
            >
              נקה
            </Button>
          </Box>

          <Box sx={sx.footerGroup}>
            <Button
              size="sm"
              color="primary"
              disabled={!resolvedPreview?.ok}
              onClick={handleApply}
            >
              החל על הטיוטה
            </Button>

            <Button
              size="sm"
              variant="outlined"
              color="neutral"
              onClick={onClose}
            >
              סגור
            </Button>
          </Box>
        </Box>
      </Sheet>
    </Drawer>
  )
}
