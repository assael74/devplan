//  src/features/bulkActions/videos/import/BulkVideosImportPreview.js

import React from 'react'
import {
  Box,
  Chip,
  Input,
  Option,
  Select,
  Sheet,
  Table,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'

import { bulkVideosImportSx as sx } from './sx/bulkVideosImport.sx.js'
import { alpha } from '@mui/system'

const toneColor = tone => {
  if (tone === 'green') return '#16A34A'
  if (tone === 'orange') return '#F97316'
  if (tone === 'blue') return '#2563EB'
  if (tone === 'purple') return '#7C3AED'
  if (tone === 'yellow') return '#D97706'
  if (tone === 'cyan') return '#0891B2'
  if (tone === 'teal') return '#0F766E'
  return '#64748B'
}

function ValidityChip({ row }) {
  if (row.isValid) {
    return (
      <Chip size="sm" color="success" variant="soft">
        תקין
      </Chip>
    )
  }

  return (
    <Chip size="sm" color="danger" variant="soft">
      לא תקין
    </Chip>
  )
}

export default function BulkVideosImportPreview({
  rows = [],
  categories = [],
  pending = false,
  onNameChange,
  onCategoryChange,
}) {
  return (
    <Box>
      <Typography level="title-sm" sx={sx.sectionTitle}>
        תצוגה מקדימה ועריכה
      </Typography>

      <Sheet variant="outlined" sx={sx.previewSheet}>
        <Table
          size="sm"
          borderAxis="bothBetween"
          sx={sx.previewHeaderTable}
        >
          <thead>
            <tr>
              <th style={{ width: 56 }}>#</th>
              <th style={{ width: 260 }}>שם וידאו</th>
              <th>קישור</th>
              <th style={{ width: 110 }}>תקינות</th>
              <th style={{ width: 230 }}>קטגוריה</th>
            </tr>
          </thead>
        </Table>

        <Box sx={sx.previewBodyScroll} className="dpScrollThin">
          <Table
            size="sm"
            borderAxis="bothBetween"
            sx={sx.previewBodyTable}
          >
            <tbody>
              {rows.map(row => (
                <tr key={row.rowId}>
                  <td style={{ width: 56 }}>{row.rowNumber}</td>

                  <td style={{ width: 260 }}>
                    <Input
                      size="sm"
                      value={row.name || ''}
                      disabled={pending}
                      placeholder="שם וידאו"
                      onChange={event => onNameChange(row.rowId, event.target.value)}
                      error={!row.name}
                      sx={sx.nameInput}
                    />
                  </td>

                  <td>
                    <Box>
                      <Typography level="body-xs" sx={sx.linkText}>
                        {row.link || '—'}
                      </Typography>

                      {!!row.errors?.length && (
                        <Typography level="body-xs" color="danger" sx={sx.rowError}>
                          {row.errors.join(', ')}
                        </Typography>
                      )}
                    </Box>
                  </td>

                  <td style={{ width: 110 }}>
                    <ValidityChip row={row} />
                  </td>

                  <td style={{ width: 230 }}>
                    <Select
                      size="sm"
                      value={row.primaryCategory || null}
                      placeholder="בחירת קטגוריה"
                      disabled={pending || !row.isValidLink}
                      color={row.isValid && !row.primaryCategory ? 'warning' : 'neutral'}
                      onChange={(event, value) => onCategoryChange(row.rowId, value || '')}
                      renderValue={() => {
                        const selectedCategory = categories.find(
                          category => category.id === row.primaryCategory
                        )

                        if (!selectedCategory) return null

                        return (
                          <Box sx={sx.categoryValue}>
                            {iconUi({
                              id: selectedCategory.iconId,
                              sx: { color: toneColor(selectedCategory.tone) },
                            })}
                            <Typography level="body-sm">
                              {selectedCategory.label}
                            </Typography>
                          </Box>
                        )
                      }}
                      sx={sx.categorySelect}
                    >
                      {categories.map(category => (
                        <Option key={category.id} value={category.id}>
                          <Box sx={sx.categoryOption}>
                            {iconUi({
                              id: category.iconId,
                              sx: { color: toneColor(category.tone) },
                            })}
                            <Typography level="body-sm">
                              {category.label}
                            </Typography>
                          </Box>
                        </Option>
                      ))}
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Box>
      </Sheet>
    </Box>
  )
}
