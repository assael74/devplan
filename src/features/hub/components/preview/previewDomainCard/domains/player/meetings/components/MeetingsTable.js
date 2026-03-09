import React from 'react'
import { Sheet, Table, Typography } from '@mui/joy'
import MeetingsTableRow from './MeetingsTableRow'
import { sx } from '../meetingsDomainModal.sx.js'

export default function MeetingsTable({
  onEditBasic,
  onEditNotes,
  onEditVideo,
  meetings,
  onEdit,
  busy,
}) {
  return (
    <Sheet variant="outlined" sx={sx.tableWrap}>
      <Table size="sm" stickyHeader hoverRow sx={sx.table}>
        <thead>
          <tr>
            <th style={{ textAlign: 'center' }}>תאריך</th>
            <th style={{ textAlign: 'center' }}>שעה</th>
            <th style={{ textAlign: 'center' }}>סטטוס</th>
            <th style={{ textAlign: 'center' }}>סוג</th>
            <th style={{ textAlign: 'center' }}>וידאו</th>
            <th style={{ textAlign: 'center' }}>הערות</th>
            <th />
          </tr>
        </thead>

        <tbody>
          {meetings.map((m) => (
            <MeetingsTableRow
              key={m.id}
              meeting={m}
              onEdit={onEdit}
              busy={busy}
              onEditBasic={onEditBasic}
              onEditNotes={onEditNotes}
              onEditVideo={onEditVideo}
            />
          ))}

          {!meetings.length && (
            <tr>
              <td colSpan={7}>
                <Typography level="body-sm">
                  אין נתונים
                </Typography>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Sheet>
  )
}
