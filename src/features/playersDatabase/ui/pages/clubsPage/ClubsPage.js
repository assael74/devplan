// src/features/playersDatabase/ui/pages/clubsPage/ClubsPage.js
import { useCallback, useState } from 'react'
import {
  Box,
  Button,
  Chip,
  Dropdown,
  Menu,
  MenuButton,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from '@mui/joy'
import { useNavigate } from 'react-router-dom'

import PlayersDatabaseLayout from '../../layout/PlayersDatabaseLayout.js'
import PageContentPanel from '../../components/page/PageContentPanel.js'
import PageHeader from '../../components/page/PageHeader.js'
import useClubsPage from './hooks/useClubsPage.js'
import {
  buildPlayersDatabaseBreadcrumbs,
  PLAYERS_DATABASE_UI_ROUTES,
} from '../../logic/routeBuilders.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import ClubsCollection from './components/ClubsCollection.js'
import ClubsFilters from './components/ClubsFilters.js'
import usePageSidePanelCollapsed from '../../components/page/usePageSidePanelCollapsed.js'
import {
  buildClubsPageJsonOptions,
  downloadAllClubsPageJsonOptions,
  downloadClubsPageJsonOption,
} from './logic/clubsPageJson.logic.js'
import { clubsPageSx as sx } from './sx/clubsPage.sx.js'

export default function ClubsPage() {
  const navigate = useNavigate()
  const model = useClubsPage()
  const [expandedClubId, setExpandedClubId] = useState(null)
  const [onlyClubsWithSignals, setOnlyClubsWithSignals] = useState(false)
  const [sidePanelCollapsed, setSidePanelCollapsed] = usePageSidePanelCollapsed(
    'playersDatabase:clubsSidePanelCollapsed'
  )
  const jsonOptions = buildClubsPageJsonOptions({
    directory: model.clubsPageData?.directory,
    centers: model.clubsPageData?.centers,
  })
  const availableJsonCount = jsonOptions.filter(option => option.available).length

  const breadcrumbs = buildPlayersDatabaseBreadcrumbs([
    { label: 'מועדונים' },
  ])

  const handleOpenClub = useCallback(club => {
    if (!club?.clubId) return

    navigate(PLAYERS_DATABASE_UI_ROUTES.club(club.clubId))
  }, [navigate])

  const handleToggleClub = useCallback(clubId => {
    setExpandedClubId(currentId => (
      currentId === clubId ? null : clubId
    ))
  }, [])

  const handleToggleOnlyClubsWithSignals = () => {
    setOnlyClubsWithSignals(currentValue => !currentValue)
  }

  const actions = (
    <Stack sx={sx.headerActionsPanel}>
      <Stack direction='row' spacing={1} sx={sx.headerActions}>
        <Button
          sx={sx.primaryButton}
          startDecorator={iconUi({ id: 'playerDatabase', size: 'sm' })}
          onClick={() => navigate(PLAYERS_DATABASE_UI_ROUTES.search)}
        >
          מעבר לעמוד חיפוש
        </Button>

        <Button
          variant='outlined'
          sx={sx.secondaryButton}
          startDecorator={iconUi({ id: 'back', size: 'sm' })}
          onClick={() => navigate(PLAYERS_DATABASE_UI_ROUTES.entry)}
        >
          חזרה לדף הפתיחה
        </Button>
      </Stack>
    </Stack>
  )

  const clubsHeaderActions = (
    <Stack direction='row' spacing={0.75} alignItems='center'>
      <Tooltip title='הצגת מועדונים עם איתותים בלבד'>
        <Chip
          size='sm'
          variant={onlyClubsWithSignals ? 'solid' : 'outlined'}
          color='primary'
          aria-label='סינון מועדונים עם איתותים בלבד'
          onClick={handleToggleOnlyClubsWithSignals}
        >
          עם איתותים בלבד
        </Chip>
      </Tooltip>

      <Dropdown>
        <Tooltip title='הורדת מסמכי JSON'>
          <span>
            <MenuButton
              size='sm'
              variant='outlined'
              color='neutral'
              aria-label='בחירת מסמכי מועדונים להורדה'
              disabled={model.loading || !model.clubsPageData}
            >
              {iconUi({ id: 'download', size: 'sm' })}
            </MenuButton>
          </span>
        </Tooltip>

        <Menu placement='bottom-end'>
          {jsonOptions.map(option => (
            <MenuItem
              key={option.id}
              disabled={!option.available}
              onClick={() => downloadClubsPageJsonOption(option)}
            >
              {option.available ? option.label : `${option.label} · לא קיים`}
            </MenuItem>
          ))}

          <MenuItem
            disabled={!availableJsonCount}
            onClick={() => downloadAllClubsPageJsonOptions(jsonOptions)}
          >
            הורדת כל מסמכי העמוד ({availableJsonCount})
          </MenuItem>
        </Menu>
      </Dropdown>
    </Stack>
  )

  const summaryText = [
    model.seasonLabel,
    `${model.summary.clubsCount} מועדונים`,
    `${model.summary.teamsCount} קבוצות`,
    `${model.summary.clubsWithScoutProfilesCount} עם פרופילי סקאוט`,
  ].join(' · ')

  return (
    <PlayersDatabaseLayout>
      <Box sx={sx.page}>
        <PageHeader breadcrumbs={breadcrumbs} actions={actions}>
          <Box>
            <Typography level='h1' sx={sx.pageTitle}>
              מועדונים
            </Typography>
          </Box>
        </PageHeader>

        <Box sx={[sx.contentGrid, sidePanelCollapsed && sx.contentGridCollapsed]}>
          <Box sx={[sx.mainColumn, sx.clubsMainColumn]}>
            <PageContentPanel
              title='רשימת כל המועדונים'
              subtitle={summaryText}
              headerActions={clubsHeaderActions}
              panelSx={sx.clubsPanel}
              contentSx={sx.panelContent}
              contentClassName='dpScrollThin'
            >
              <ClubsCollection
                groups={onlyClubsWithSignals
                  ? model.groups.filter(group => group.intelligence?.spotlights?.length)
                  : model.groups}
                loading={model.loading}
                error={model.error}
                expandedClubId={expandedClubId}
                onToggleClub={handleToggleClub}
                onOpenClub={handleOpenClub}
              />
            </PageContentPanel>
          </Box>

          <ClubsFilters
            model={model}
            collapsible
            collapsed={sidePanelCollapsed}
            onCollapsedChange={setSidePanelCollapsed}
          />
        </Box>

      </Box>
    </PlayersDatabaseLayout>
  )
}
