// src/features/firestoreUsage/components/UsageDocumentsTable.js

import React, { useState } from 'react'
import { Box, Card, Option, Select, Table, Typography } from '@mui/joy'
import { documentsSx as sx } from './sx/documents.sx.js'

const format = value => Number(value || 0).toLocaleString('he-IL', { maximumFractionDigits: 2 })

export default function UsageDocumentsTable({ rows = [] }) {
  const [limit, setLimit] = useState(5)
  const visibleRows = limit === 'all' ? rows : rows.slice(0, limit)

  return (
    <Card variant="outlined" sx={sx.card}>
      <Box sx={sx.header}>
        <Typography level="title-md">נפח לפי מסמך בודד</Typography>
        <Select
          size="sm"
          aria-label="מספר מסמכים להצגה"
          value={limit}
          onChange={(_, value) => setLimit(value || 5)}
          sx={sx.select}
        >
          <Option value={5}>5 מסמכים</Option>
          <Option value={10}>10 מסמכים</Option>
          <Option value={25}>25 מסמכים</Option>
          <Option value="all">הכל</Option>
        </Select>
      </Box>
      <Typography level="body-xs" textColor="text.tertiary">
        גודל JSON אחרון מול נפח קריאות שרת מצטבר.
      </Typography>
      {rows.length === 0 ? (
        <Typography level="body-sm">אין עדיין מדידות למסמכים בודדים. הנתונים יתווספו בטעינת העמודים.</Typography>
      ) : (
        <Box className="dpScrollThin" sx={sx.scroll}>
          <Table size="sm" stripe="odd" stickyHeader sx={sx.table}>
            <colgroup>
              <col style={{ width: '42%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '26%' }} />
            </colgroup>
            <thead>
              <tr>
                <th>מסמך</th>
                <th>גודל</th>
                <th title="קריאות שרת">קריאות</th>
                <th aria-label="נפח שרת מצטבר">מצטבר</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map(row => (
                <tr key={row.path}>
                  <td title={`${row.path} — מקור אחרון: ${row.lastFromCache ? 'מטמון' : 'שרת'}`}>
                    <Typography level="body-xs" noWrap>{row.path}</Typography>
                  </td>
                  <td title={`גודל מרבי שנמדד: ${format(row.maxReadKb)} KB`}>
                    {format(row.lastReadKb)} KB
                  </td>
                  <td title={`אירועי מטמון: ${format(row.cacheReads)}`}>{format(row.reads)}</td>
                  <td>{format(row.estimatedReadKb)} KB</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Box>
      )}
    </Card>
  )
}
