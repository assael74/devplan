// teamProfile/sharedUi/management/ManagementInfo.js

import React from 'react'
import { Box, Chip, Sheet, Typography } from '@mui/joy'

import { teamEditLayout } from '../../../../../ui/forms/teams/edit.layout.js'
import TeamIdentityFields from '../../../../../ui/forms/teams/edit/TeamIdentityFields.js'
import TeamLeagueFields from '../../../../../ui/forms/teams/edit/TeamLeagueFields.js'
import TeamSourceFields from '../../../../../ui/forms/teams/edit/TeamSourceFields.js'

import { infoSx as sx } from './sx/info.sx.js'

const emptyValue = 'לא הוזן'

function SectionTitle({ title, helper }) {
  return (
    <Box sx={sx.sectionTitleWrap}>
      <Typography level='title-sm' sx={sx.sectionTitle}>
        {title}
      </Typography>
      {helper ? (
        <Typography level='body-xs' sx={sx.sectionHelper}>
          {helper}
        </Typography>
      ) : null}
    </Box>
  )
}

function InfoValue({ label, value, wide = false }) {
  return (
    <Box sx={sx.readItem(wide)}>
      <Typography level='body-xs' sx={sx.readLabel}>
        {label}
      </Typography>
      <Typography level='title-sm' sx={sx.readValue}>
        {value || emptyValue}
      </Typography>
    </Box>
  )
}

export default function ManagementInfo({
  draft,
  clubName,
  onDraft,
  pending,
  readOnly = false,
  saveAttempted = false,
  isMobile = false,
}) {
  const handleDraft = (field, value) => {
    onDraft({
      ...draft,
      [field]: value,
    })
  }

  const teamNameMissing = saveAttempted && !String(draft.teamName || '').trim()

  if (readOnly) {
    return (
      <Sheet variant='plain' sx={sx.card(isMobile, false)}>
        <Box sx={sx.statusRow(isMobile)}>
          <Chip size='sm' variant='soft' color={draft.active ? 'success' : 'neutral'}>
            {draft.active ? 'פעילה' : 'לא פעילה'}
          </Chip>
          <Chip size='sm' variant='soft' color={draft.project ? 'primary' : 'neutral'}>
            {draft.project ? 'פרויקט פעיל' : 'לא פרויקט'}
          </Chip>
        </Box>

        <Box sx={sx.readGrid(isMobile)}>
          <InfoValue label='שם קבוצה' value={draft.teamName} />
          <InfoValue label='מועדון' value={clubName} />
          <InfoValue label='שנתון' value={draft.teamYear} />
          <InfoValue label='ליגה' value={draft.league} />
          <InfoValue label='רמת ליגה' value={draft.leagueLevel} />
          <InfoValue label='מחזור נוכחי' value={draft.leagueRound} />
          <InfoValue label='מחזורי ליגה' value={draft.leagueNumGames} />
          <InfoValue label='קישור התאחדות' value={draft.ifaLink} wide />
        </Box>
      </Sheet>
    )
  }

  return (
    <Sheet variant='plain' sx={sx.card(isMobile, true)}>
      <Box sx={sx.editHeader(isMobile)}>
        <Box sx={{ minWidth: 0 }}>
          <Typography level='title-sm' sx={sx.editTitle}>
            עריכת מידע כללי
          </Typography>
          <Typography level='body-xs' sx={sx.editSubtitle}>
            עדכון זהות הקבוצה, שיוך חיצוני ונתוני הליגה
          </Typography>
        </Box>

        <Chip size='sm' variant='soft' color='primary'>
          מצב עריכה
        </Chip>
      </Box>

      <Box sx={sx.sectionBlock}>
        <SectionTitle title='מידע בסיסי' />

        <TeamIdentityFields
          draft={draft}
          clubName={clubName}
          showClub
          onField={handleDraft}
          teamNameError={teamNameMissing}
          teamNameHelper={teamNameMissing ? 'שם קבוצה הוא שדה חובה' : ''}
          layout={teamEditLayout.profile[isMobile ? 'mobile' : 'desktop'].identity}
          statusLayout={teamEditLayout.profile[isMobile ? 'mobile' : 'desktop'].status}
        />
      </Box>

      <Box sx={sx.sectionBlock}>
        <SectionTitle title='מקור חיצוני' helper='קישור לפרופיל הקבוצה באתר ההתאחדות' />

        <TeamSourceFields
          draft={draft}
          onField={handleDraft}
          layout={{ minWidth: 0 }}
        />
      </Box>

      <Box sx={sx.sectionBlock}>
        <SectionTitle title='שיוך ליגה' helper='נתונים לעריכת הקשר הליגה והמחזורים' />

        <TeamLeagueFields
          draft={draft}
          onField={handleDraft}
          disabled={pending}
          showPosition={false}
          showStats={false}
          showRounds
          variant='outlined'
          mainLayout={teamEditLayout.profile[isMobile ? 'mobile' : 'desktop'].league}
        />
      </Box>
    </Sheet>
  )
}
