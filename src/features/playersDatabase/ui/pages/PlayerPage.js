// features/playersDatabase/ui/pages/PlayerPage.js

import * as React from 'react'
import {
  Box,
  Button,
  Card,
  Stack,
  Typography,
} from '@mui/joy'
import { useNavigate } from 'react-router-dom'

import PlayersDatabaseLayout from '../layout/PlayersDatabaseLayout.js'
import Breadcrumbs from '../layout/Breadcrumbs.js'
import StatCard from '../components/cards/StatCard.js'
import DataTable from '../components/tables/DataTable.js'

import { usePlayerPage } from '../hooks/usePlayerPage.js'
import {
  buildPlayersDatabaseBreadcrumbs,
  PLAYERS_DATABASE_UI_ROUTES,
} from '../logic/routeBuilders.js'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import playerImage from '../../../../ui/core/images/playerImage.jpg'
import { playerSx as sx } from './sx/player.sx.js'

const PLAYER_REASONS = [
  'תפוקת מסירות קדימה גבוהה ביחס לשחקנים בני גילו.',
  'מעורבות גבוהה בבניית המשחק דרך מרכז המגרש.',
  'תרומה יציבה גם במשחקים מול יריבות ברמה גבוהה.',
  'פוטנציאל התפתחות בהתאם לפרופיל הסקאוט המוביל.',
]

function ReasonsPanel() {
  return (
    <Card sx={sx.reasonsPanel}>
      <Box sx={sx.panelHeader}>
        <Typography
          level='title-lg'
          sx={sx.panelTitle}
        >
          למה סומן?
        </Typography>

        <Box sx={sx.panelIcon}>
          {iconUi({id: 'targets', size: 'md'})}
        </Box>
      </Box>

      <Stack
        spacing={1}
        className='dpScrollThin'
        sx={sx.reasonsList}
      >
        {PLAYER_REASONS.map(reason => (
          <Box
            key={reason}
            sx={sx.reasonItem}
          >
            <Box sx={sx.reasonDot} />

            <Typography
              level='body-sm'
              sx={sx.reasonText}
            >
              {reason}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Card>
  )
}

function TeamContextPanel({ player }) {
  const items = [
    {
      label: 'קבוצה',
      value: player.teamName,
    },
    {
      label: 'ליגה',
      value: player.leagueName,
    },
    {
      label: 'תפקיד',
      value: player.position,
    },
    {
      label: 'גיל',
      value: player.ageLabel,
    },
  ]

  return (
    <Card sx={sx.contextPanel}>
      <Typography
        level='title-lg'
        sx={sx.panelTitle}
      >
        הקשר קבוצתי
      </Typography>

      <Box sx={sx.contextGrid}>
        {items.map(item => (
          <Box
            key={item.label}
            sx={sx.contextItem}
          >
            <Typography
              level='body-xs'
              sx={sx.contextLabel}
            >
              {item.label}
            </Typography>

            <Typography
              level='title-sm'
              sx={sx.contextValue}
            >
              {item.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Card>
  )
}

export default function PlayerPage() {
  const navigate = useNavigate()
  const { player } = usePlayerPage()

  const breadcrumbs = buildPlayersDatabaseBreadcrumbs([
    {
      label: 'חיפוש מועמדים',
      to: PLAYERS_DATABASE_UI_ROUTES.search,
    },
    {
      label: player.teamName,
    },
    {
      label: player.fullName,
    },
  ])

  const columns = [
    {
      key: 'label',
      label: 'פרופיל',
      sx: sx.profileNameColumn,
    },
    {
      key: 'score',
      label: 'ציון',
      sx: sx.profileScoreColumn,
      render: row => `${row.score}/100`,
    },
    {
      key: 'reliability',
      label: 'אמינות',
      sx: sx.profileReliabilityColumn,
    },
  ]

  const handleNavigateToSearch = () => {
    navigate(PLAYERS_DATABASE_UI_ROUTES.search)
  }

  const handleNavigateToLeague = () => {
    navigate(
      PLAYERS_DATABASE_UI_ROUTES.league('u16-regional-south')
    )
  }

  return (
    <PlayersDatabaseLayout>
      <Box sx={sx.page}>
        <Box sx={sx.header}>
          <Stack sx={sx.headerCopy}>
            <Breadcrumbs items={breadcrumbs} />

            <Typography
              level='h1'
              sx={sx.pageTitle}
            >
              שחקן: {player.fullName}
            </Typography>

            <Stack
              direction='row'
              spacing={1}
              sx={sx.reliabilityRow}
            >
              <Typography
                level='body-sm'
                sx={sx.reliabilityLabel}
              >
                אמינות האיתור:
              </Typography>

              <Box sx={sx.reliabilityDot} />

              <Typography
                level='title-sm'
                sx={sx.reliabilityValue}
              >
                {player.reliability}
              </Typography>
            </Stack>
          </Stack>

          <Box sx={sx.headerPlayer}>
            <Box
              component='img'
              src={player.avatarUrl || playerImage}
              alt={player.fullName}
              sx={sx.playerAvatar}
            />

            <Stack
              spacing={0.25}
              sx={sx.headerPlayerInfo}
            >
              <Typography
                level='title-lg'
                sx={sx.headerPlayerName}
              >
                {player.fullName}
              </Typography>

              <Typography
                level='title-sm'
                sx={sx.headerTeamName}
              >
                {player.teamName}
              </Typography>

              <Typography
                level='body-xs'
                sx={sx.headerPlayerMeta}
              >
                {player.position} · {player.ageLabel}
              </Typography>
            </Stack>
          </Box>

          <Stack
            direction='row'
            spacing={1}
            sx={sx.headerActions}
          >
            <Button
              startDecorator={iconUi({id: 'back', size: 'sm'})}
              sx={sx.primaryButton}
              onClick={handleNavigateToSearch}
            >
              חזרה לחיפוש
            </Button>

            <Button
              variant='outlined'
              startDecorator={iconUi({id: 'back', size: 'sm'})}
              sx={sx.secondaryButton}
              onClick={handleNavigateToLeague}
            >
              חזרה לקבוצה
            </Button>
          </Stack>
        </Box>

        <Box sx={sx.statsGrid}>
          <StatCard
            title='אמינות איתור'
            value={player.reliability}
            caption='לפי נתוני עמדה וסטטיסטיקה'
            iconId='targets'
          />

          <StatCard
            title='דקות משחק'
            value={player.minutes}
            caption='בעונה הנוכחית'
            iconId='hour'
          />

          <StatCard
            title='שערים'
            value={player.goals}
            caption='0.48 למשחק'
            iconId='stats'
          />

          <StatCard
            title='הופעות בהרכב'
            value={`${player.startsPct}%`}
            caption='מהמשחקים'
            iconId='players'
          />
        </Box>

        <Box sx={sx.contentGrid}>
          <Box sx={sx.mainContent}>
            <Card sx={sx.profilesPanel}>
              <Box sx={sx.panelHeader}>
                <Typography
                  level='title-lg'
                  sx={sx.panelTitle}
                >
                  פרופילי סקאוט
                </Typography>

                <Typography
                  level='body-xs'
                  sx={sx.panelCount}
                >
                  {player.scoutProfiles.length} פרופילים
                </Typography>
              </Box>

              <DataTable
                className='dpScrollThin'
                columns={columns}
                rows={player.scoutProfiles}
                getRowKey={row => row.id}
                wrapSx={sx.profilesTableWrap}
                tableSx={sx.profilesTable}
              />
            </Card>

            <TeamContextPanel player={player} />
          </Box>

          <ReasonsPanel />
        </Box>

        <Stack
          direction='row'
          spacing={1}
          sx={sx.footerActions}
        >
          <Button
            variant='outlined'
            startDecorator={iconUi({id: 'reports', size: 'sm'})}
            sx={sx.footerButton}
          >
            פרופיל סקאוט
          </Button>

          <Button
            variant='outlined'
            startDecorator={iconUi({id: 'back', size: 'sm'})}
            sx={sx.footerButton}
            onClick={handleNavigateToSearch}
          >
            חזרה לחיפוש
          </Button>

          <Button
            startDecorator={iconUi({id: 'teams', size: 'sm'})}
            sx={sx.footerPrimaryButton}
            onClick={handleNavigateToLeague}
          >
            מעבר לקבוצה
          </Button>
        </Stack>
      </Box>
    </PlayersDatabaseLayout>
  )
}
