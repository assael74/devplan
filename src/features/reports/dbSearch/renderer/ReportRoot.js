import React from 'react'
import { Alert, Box, Chip, Typography } from '@mui/joy'

import { ReportShell } from '../../../../ui/patterns/reports/index.js'
import PlayersListContent from './playersList/PlayersListContent.js'
import TeamsListContent from './teamsList/TeamsListContent.js'

function ReportPurpose({ purpose = '', description = '' }) {
  if (!purpose && !description) return null

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 0.75,
        p: 1.5,
        mb: 1.5,
        bgcolor: 'var(--db-search-tertiary-light)',
        border: '1px solid var(--db-search-tertiary)',
        borderRadius: 'md',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <Chip
          size='sm'
          variant='solid'
          sx={{
            bgcolor: 'var(--db-search-primary)',
            color: '#fff',
          }}
        >
          מטרת הדוח
        </Chip>

        <Typography level='title-sm' sx={{ color: 'var(--db-search-primary-dark)' }}>
          {purpose}
        </Typography>
      </Box>

      {description ? (
        <Typography level='body-sm' sx={{ color: 'var(--db-search-secondary)' }}>
          {description}
        </Typography>
      ) : null}
    </Box>
  )
}

export default function ReportRoot({
  model = null,
  presentation = 'url',
  device = 'desktop',
}) {
  if (!model) {
    return <Alert color='warning'>לא התקבל מודל דוח להצגה.</Alert>
  }

  const isTeamsList = model.entityType === 'teamsList'
  const isPlayersList = model.entityType === 'playersList'

  if (!isTeamsList && !isPlayersList) {
    return (
      <Box>
        <Alert color='warning'>סוג הרשימה אינו נתמך בתצוגת dbSearch.</Alert>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        '--db-search-primary': model.colors?.primary || '#173B57',
        '--db-search-primary-dark': model.colors?.primaryDark || '#102B40',
        '--db-search-primary-light': model.colors?.primaryLight || '#E8F0F5',
        '--db-search-secondary': model.colors?.secondary || '#657684',
        '--db-search-tertiary': model.colors?.tertiary || '#2F86C7',
        '--db-search-tertiary-light': model.colors?.tertiaryLight || '#EAF5FC',
      }}
    >
      <ReportShell
        title={model.title}
        reportDate={model.reportDate}
        reportType='dbSearch'
        presentation={presentation}
        isMobile={device === 'mobile'}
        status={model.status || 'active'}
        entity={model.entity}
        showEntity={false}
        metaItems={model.metaItems}
        metaColumns={device === 'mobile' ? 2 : 4}
        reportNumber={model.entityId}
      >
        <ReportPurpose
          purpose={model.reportPurpose}
          description={model.reportDescription}
        />

        {isTeamsList ? (
          <TeamsListContent model={model} presentation={presentation} device={device} />
        ) : (
          <PlayersListContent model={model} presentation={presentation} device={device} />
        )}
      </ReportShell>
    </Box>
  )
}
