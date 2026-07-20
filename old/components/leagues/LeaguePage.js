// features/playersDatabase/components/leagues/LeaguePage.js

import React from 'react'
import {
  Box,
  Button,
  Chip,
  Sheet,
  Typography,
} from '@mui/joy'

import PasteModal from '../modals/PasteModal.js'
import {
  getLeagueLevelLabel,
  getLeagueRegionLabel,
} from './leagueUtils.js'
import LeagueTable from './LeagueTable.js'
import ScoutFilters from './ScoutFilters.js'
import TeamLinkModal from './TeamLinkModal.js'
import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import { useLeaguePage } from './hook/useLeaguePage.js'
import { pageSx as sx } from './sx/page.sx.js'

export default function LeaguePage() {
  const model = useLeaguePage()
  const { league, activeSeason } = model

  return (
    <Box>
      <Sheet sx={sx.root}>
        <Box sx={sx.top}>
          <Box>
            <Box sx={sx.titleRow}>
              <Typography level="title-lg" sx={sx.title}>
                {league?.leagueName || 'ליגה'}
              </Typography>

              <Chip size="sm" variant="soft" color="warning" sx={sx.birthChip}>
                שנתון {activeSeason?.primaryBirthYear || '-'}
              </Chip>
            </Box>

            <Typography level="body-sm" sx={sx.meta}>
              {league
                ? [
                    league.ageGroupLabel,
                    getLeagueLevelLabel(league.level),
                    getLeagueRegionLabel(league.region),
                  ].join(' | ')
                : model.decodedLeagueId}
            </Typography>
          </Box>

          <Box sx={sx.controls}>
            <Button
              size="sm"
              variant="soft"
              color="neutral"
              startDecorator={iconUi({ id: 'back', size: 'small' })}
              onClick={model.goBack}
            >
              חזרה לרשימה
            </Button>

            <Button
              size="sm"
              color="primary"
              startDecorator={iconUi({ id: 'upload', size: 'small' })}
              disabled={!league || !activeSeason}
              onClick={model.openPaste}
            >
              טען צילום ליגה
            </Button>
          </Box>
        </Box>

        {model.error ? (
          <Typography sx={sx.error}>
            {model.error}
          </Typography>
        ) : (
          <Box sx={sx.body}>
            <Box sx={sx.metaBar}>
              <ScoutFilters
                perspectiveId={model.perspectiveId}
                attackThreshold={model.attackThreshold}
                defenseThreshold={model.defenseThreshold}
                includeUniversal={model.includeUniversal}
                playerSearchProfileId={model.playerSearchProfileId}
                playerSearchMode={model.playerSearchMode}
                onPerspectiveChange={model.changePerspective}
                onAttackChange={model.changeAttackThreshold}
                onDefenseChange={model.changeDefenseThreshold}
                onUniversalToggle={model.toggleUniversal}
                onPlayerSearchProfileChange={model.changePlayerSearchProfile}
                onPlayerSearchModeChange={model.changePlayerSearchMode}
                onReset={model.resetFilters}
              />
            </Box>

            <LeagueTable
              rows={model.rows}
              onToggle={model.toggleTeam}
              onTeamSlotChange={model.changeTeamSlot}
              onLeagueIndexRefresh={model.load}
              onEditTeamLink={model.openTeamLink}
            />
          </Box>
        )}
      </Sheet>

      <PasteModal
        open={model.pasteOpen}
        onClose={model.closePaste}
        league={league}
        season={activeSeason}
        onSaved={model.handleSnapshotSaved}
      />

      <TeamLinkModal
        open={model.teamLinkOpen}
        row={model.teamLinkRow}
        saving={model.teamLinkSaving}
        error={model.teamLinkError}
        onClose={model.closeTeamLink}
        onSave={model.saveTeamLink}
      />
    </Box>
  )
}
