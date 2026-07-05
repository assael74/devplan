// features/playersDatabase/components/summary/SummaryBoard.js

import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Chip,
  Sheet,
  Typography,
} from '@mui/joy'

import LeagueModal from '../modals/LeagueModal.js'
import { Toolbar } from './toolbar/index.js'
import { LeagueList } from './leagueList/index.js'
import {
  DetailsPanel,
  IndicatorsPanel,
} from './preview/index.js'
import { SeasonPreview } from './seasonPreview/index.js'
import { useSummaryBoard } from './hooks/useSummaryBoard.js'
import { summaryBoardSx as sx } from './sx/summaryBoard.sx.js'

export default function SummaryBoard() {
  const navigate = useNavigate()
  const model = useSummaryBoard()
  const league = model.selectedLeague

  return (
    <Sheet sx={sx.root}>
      <Toolbar
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
            צור ליגה ראשונה כדי להתחיל לבנות את ההיסטוריה
          </Typography>

          <Typography level="body-sm" sx={sx.emptyText}>
            לאחר יצירת הליגה ניתן יהיה להוסיף לה עונות, נתונים, מועדים וצילומי טבלה.
          </Typography>
        </Box>
      ) : (
        <Box sx={sx.stage}>
          <LeagueList
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
              onOpenLeague={model.openLeague}
            >
              <IndicatorsPanel
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

            <SeasonPreview
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
      )}

      <LeagueModal
        open={model.createOpen}
        onClose={model.closeCreate}
        onSaved={model.handleLeagueSaved}
      />
    </Sheet>
  )
}
