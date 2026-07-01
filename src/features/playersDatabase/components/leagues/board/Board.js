// src/features/playersDatabase/components/leagues/board/Board.js

import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Chip,
  Sheet,
  Typography,
} from '@mui/joy'

import LeagueModal from '../../modals/LeagueModal.js'
import BoardHeader from './BoardHeader.js'
import BoardList from './BoardList.js'
import DetailsPanel from './DetailsPanel.js'
import LeagueIndicatorsPanel from './LeagueIndicatorsPanel.js'
import SeasonsPanel from './SeasonsPanel.js'
import {
  getLeagueLevelLabel,
  getLeagueRegionLabel,
} from '../leagueUtils.js'
import { useBoard } from './hook/useBoard.js'
import { boardSx as sx } from './sx/board.sx.js'

export default function Board() {
  const navigate = useNavigate()
  const model = useBoard()
  const league = model.selectedLeague

  return (
    <Sheet sx={sx.root}>
      <BoardHeader
        loading={model.loading}
        statusItems={model.boardStatus}
        onReload={model.load}
        onCreate={model.openCreate}
        onScan={() => navigate('/players-database/scan')}
      />

      {model.loadError && (
        <Typography sx={sx.error}>
          {model.loadError}
        </Typography>
      )}

      {!model.leagues.length && !model.loading ? (
        <Box sx={sx.empty}>
          <Chip size="sm" variant="soft" color="neutral">
            אין ליגות פעילות להצגה
          </Chip>

          <Typography level="h4" sx={sx.emptyTitle}>
            צור ליגה ראשונה כדי להתחיל לבנות היסטוריה
          </Typography>

          <Typography level="body-sm" sx={sx.emptyText}>
            לאחר יצירת הליגה ניתן יהיה להוסיף לה עונות,
            שנתונים, מועדונים וצילומי טבלה.
          </Typography>
        </Box>
      ) : (
        <Box sx={sx.stage}>
          <BoardList
            leagues={model.leagues}
            selectedId={league?.id}
            birthYearFilter={model.birthYearFilter}
            levelFilter={model.levelFilter}
            birthYearOptions={model.birthYearOptions}
            levelOptions={model.levelOptions}
            leagueInsightsById={model.leagueInsightsById}
            onBirthYearChange={model.setBirthYearFilter}
            onLevelChange={model.setLevelFilter}
            onSelect={model.selectLeague}
          />

          <Box sx={sx.panel}>
            <Box sx={sx.panelTop}>
              <Typography
                level="title-md"
                sx={sx.panelTitle}
              >
                {league?.leagueName}
                {' | '}
                {league?.ageGroupLabel}
              </Typography>

              <Box sx={sx.chips}>
                <Chip size="sm" variant="soft" color="neutral">
                  מזהה {league?.id}
                </Chip>

                <Chip size="sm" variant="soft" color="neutral">
                  רמה {getLeagueLevelLabel(league?.level)}
                </Chip>

                <Chip size="sm" variant="soft" color="neutral">
                  {getLeagueRegionLabel(league?.region)}
                </Chip>
              </Box>
            </Box>

            <Box sx={sx.content}>
              <Box sx={sx.grid}>
                <Box sx={sx.mainColumn}>
                  <DetailsPanel
                    league={league}
                    form={model.detailsForm}
                    editing={model.editingDetails}
                    saving={model.savingDetails}
                    error={model.detailsError}
                    onEdit={model.startDetailsEdit}
                    onCancel={model.cancelDetailsEdit}
                    onChange={model.updateDetails}
                    onSave={model.saveDetails}
                    onOpenLeague={model.openLeague}
                  >
                    <LeagueIndicatorsPanel
                      embedded
                      league={league}
                      opportunities={model.selectedLeagueOpportunities}
                      profileRows={model.selectedLeagueProfileRows}
                      scoutProfilesCount={
                        model.selectedLeagueInsight?.scoutProfilesCount
                      }
                      onOpenLeague={model.openLeagueById}
                    />
                  </DetailsPanel>
                </Box>

                <SeasonsPanel
                  rows={model.seasonRows}
                  form={model.seasonForm}
                  adding={model.addingSeason}
                  saving={model.savingSeason}
                  error={model.seasonError}
                  onToggle={model.toggleSeasonForm}
                  onChange={model.updateSeason}
                  onSave={model.saveSeason}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      <LeagueModal
        open={model.createOpen}
        onClose={model.closeCreate}
        onSaved={model.handleLeagueSaved}
      />
    </Sheet>
  )
}
