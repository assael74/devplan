// C:\projects\devplan\src\features\hub\components\preview\previewDomainCard\domains\player\meetings\components\MeetingsTableRow.js
import React from 'react'
import { Chip, IconButton } from '@mui/joy'
import MoreVertRounded from '@mui/icons-material/MoreVertRounded'

import { iconUi } from '../../../../../../../../../ui/core/icons/iconUi.js'
import { getFullDateIl } from '../../../../../../../../../shared/format/dateUtiles.js'
import { clean } from '../../../../../../../../../shared/format/string.js'

const formatTime = (t) => clean(t) || '—'

const renderChip = (value, label, idIcon, colorMap = {}) => {
  const v = clean(value).toLowerCase()
  const l = clean(label) || '—'
  const color = colorMap[v]

  return (
    <Chip size="sm" variant="soft" color={color} startDecorator={idIcon ? iconUi({ id: idIcon }) : null}>
      {l}
    </Chip>
  )
}

export default function MeetingsTableRow({
  meeting,
  onEditBasic,
  onEditNotes,
  onEditVideo,
  busy,
}) {
  const hasVideo = Array.isArray(meeting?.videos) && meeting.videos.length > 0
  return (
    <tr>
      <td style={{ textAlign: 'center' }}>{meeting?.meetingDate ? getFullDateIl(meeting.meetingDate, false) : '—'}</td>
      <td style={{ textAlign: 'center' }}>{formatTime(meeting?.meetingHour)}</td>

      <td style={{ textAlign: 'center' }}>
        {renderChip(meeting?.statusId, meeting?.statusLabel, meeting?.statusIcon, {
          done: 'success',
          new: 'primary',
          planned: 'primary',
          canceled: 'danger',
          cancelled: 'danger',
        })}
      </td>

      <td style={{ textAlign: 'center' }}>
        {renderChip(meeting?.typeId, meeting?.typeLabel, meeting?.typeIcon, {
          personal: 'warning',
          team: 'neutral',
          group: 'neutral',
        })}
      </td>

      {/* וידאו */}
      <td style={{ textAlign: 'center', width: 56 }}>
        <IconButton
          size="sm"
          variant={hasVideo ? 'solid' : 'soft'}
          color={hasVideo ? 'success' : 'danger'}
          onClick={() => onEditVideo(meeting)}
          disabled={busy}
        >
          {iconUi({ id: hasVideo ? 'videoGeneral' : 'noVideo' })}
        </IconButton>
      </td>

      {/* הערות */}
      <td style={{ textAlign: 'center', width: 56 }}>
        <IconButton
          size="sm"
          variant="soft"
          onClick={() => onEditNotes(meeting)}
          disabled={busy}
        >
          {iconUi({ id: 'note' })}
        </IconButton>
      </td>

      {/* עריכה בסיסית */}
      <td style={{ textAlign: 'left', width: 56 }}>
        <IconButton
          size="sm"
          variant="soft"
          onClick={() => onEditBasic(meeting)}
          disabled={busy}
        >
          <MoreVertRounded fontSize="small" />
        </IconButton>
      </td>
    </tr>
  )
}
