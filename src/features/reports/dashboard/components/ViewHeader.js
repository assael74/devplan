// src/features/reports/dashboard/components/ViewHeader.js

import Avatar from '@mui/joy/Avatar'
import Box from '@mui/joy/Box'
import Typography from '@mui/joy/Typography'

import { getFullDateIl } from '../../../../shared/format/dateUtiles.js'
import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import { viewSx as sx } from './sx/view.sx.js'

function toDateValue(value) {
  if (!value) return null
  if (typeof value?.toDate === 'function') return value.toDate()

  return value
}

function formatPublicationDate(publication) {
  const publishedAt = publication?.publishedAt || null
  const dateValue = toDateValue(publishedAt)

  if (!dateValue) return 'לא נבחר פרסום'

  const formattedDate = getFullDateIl(dateValue, false)

  return formattedDate && formattedDate !== 'ג€”'
    ? formattedDate
    : 'תאריך לא זמין'
}

function resolveEntityName(entity) {
  return entity?.teamName ||
    entity?.clubName ||
    entity?.playerFullName ||
    entity?.name ||
    'לא נבחרה ישות'
}

function resolveAvatarSrc(entity, publication) {
  return entity?.avatarUrl ||
    entity?.photo ||
    publication?.avatarUrl ||
    ''
}

export default function ViewHeader({ report, publication, entity }) {
  const reportTitle = report?.label || 'בחר סוג דוח'
  const hasPublication = Boolean(publication?.id)
  const entityName = resolveEntityName(entity)
  const publicationDate = formatPublicationDate(publication)
  const avatarSrc = resolveAvatarSrc(entity, publication)

  return (
    <Box sx={sx.reportHeader}>
      <Box sx={sx.reportHeaderPrimary}>
        <Box sx={sx.reportHeaderIcon}>
          {iconUi({ id: 'report' })}
        </Box>

        <Box sx={sx.reportHeaderBlock}>
          <Typography level='body-xs' sx={sx.reportHeaderLabel}>
            סוג הדוח
          </Typography>

          <Typography level='h3' sx={sx.reportHeaderTitle}>
            {reportTitle}
          </Typography>
        </Box>
      </Box>

      <Box sx={sx.reportHeaderBlock}>
        <Typography level='body-xs' sx={sx.reportHeaderLabel}>
          ישות
        </Typography>

        <Typography level='title-md' sx={sx.reportHeaderValue(hasPublication)}>
          {entityName}
        </Typography>
      </Box>

      <Box sx={sx.reportHeaderBlock}>
        <Typography level='body-xs' sx={sx.reportHeaderLabel}>
          תאריך פרסום
        </Typography>

        <Typography level='title-md' sx={sx.reportHeaderValue(hasPublication)}>
          {publicationDate}
        </Typography>
      </Box>

      <Avatar
        src={avatarSrc}
        alt={entityName}
        sx={sx.reportHeaderAvatar}
      />
    </Box>
  )
}
