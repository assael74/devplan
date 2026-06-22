// src/features/playersDatabase/components/leagues/board/Board.js

import React from 'react'
import {
  Box,
  Button,
  Chip,
  Sheet,
  Typography,
} from '@mui/joy'

import LeagueModal from '../../modals/LeagueModal.js'
import BoardHeader from './BoardHeader.js'
import BoardList from './BoardList.js'
import DetailsPanel from './DetailsPanel.js'
import SeasonsPanel from './SeasonsPanel.js'
import {
  getLeagueLevelLabel,
  getLeagueRegionLabel,
} from '../leagueUtils.js'
import { useBoard } from './hook/useBoard.js'
import { boardSx as sx } from './sx/board.sx.js'

export default function Board() {
  const model = useBoard()
  const league = model.selectedLeague

  return (
    <Sheet sx={sx.root}>
      <BoardHeader
        loading={model.loading}
        onReload={model.load}
        onCreate={model.openCreate}
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
            sortBy={model.sortBy}
            sortDirection={model.sortDirection}
            sortOptions={model.sortOptions}
            onSortByChange={model.setSortBy}
            onSortDirectionChange={model.setSortDirection}
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

              <Button
                size="sm"
                color="primary"
                disabled={!league}
                onClick={model.openLeague}
              >
                פתח טבלת ליגה
              </Button>
            </Box>

            <Box
              className="dpScrollThin"
              sx={sx.content}
            >
              <Box sx={sx.grid}>
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
                />

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
