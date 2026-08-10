// features/playersDatabase/ui/pages/searchPage/SearchWorkspace.js

import { Box } from '@mui/joy'

import TeamUrlEditDrawer from '../../components/drawers/TeamUrlEditDrawer.js'
import { PlayerRoleEditModal } from '../../components/modals/index.js'
import SearchQueryPanel from './query/SearchQueryPanel.js'
import SearchResultsSection from './results/SearchResultsSection.js'
import SearchResultsSidebar from './resultsSidebar/SearchResultsSidebar.js'
import { searchWorkspaceSx as sx } from './sx/searchWorkspace.sx.js'

export default function SearchWorkspace({ search, onEntityOpen }) {
  const queryEntityType = search.queryFilters.searchContext || 'player'
  const resultsEntityType = search.loadedEntityType || queryEntityType

  return (
    <>
      <Box sx={sx.workspace}>
        <SearchQueryPanel
          search={search}
          activeItems={search.queryActiveItems}
          count={search.previewCount}
          loading={search.previewLoading}
          error={search.previewError}
          onLoad={search.loadDocuments}
          onReset={search.resetQuery}
        />

        <Box sx={sx.resultsWorkspace}>
          <SearchResultsSection
            rows={search.rows}
            loading={search.loadLoading}
            error={search.loadError}
            entityType={resultsEntityType}
            onEntityOpen={onEntityOpen}
            onFavoriteToggle={search.toggleFavorite}
            onNotesSave={search.saveNotes}
            onScoutProfileRemove={search.removeScoutProfile}
            onRoleEdit={search.roleEditor.open}
            onTeamUrlEdit={search.teamUrlEditor.open}
          />

          <SearchResultsSidebar
            summary={search.summary}
            entityType={resultsEntityType}
            hasLoaded={search.hasLoaded}
            loading={search.loadLoading}
            filters={search.resultFilters}
            options={search.resultFilterOptions}
            hasFilters={search.hasResultFilters}
            onFilterChange={search.updateResultFilter}
            onResetFilters={search.resetResultFilters}
          />
        </Box>
      </Box>

      <TeamUrlEditDrawer
        open={Boolean(search.teamUrlEditor.row)}
        row={search.teamUrlEditor.row}
        seasonLabel={search.teamUrlEditor.row?.seasonKey || ''}
        saving={search.teamUrlEditor.saving}
        onSave={search.teamUrlEditor.save}
        onClose={search.teamUrlEditor.close}
      />

      <PlayerRoleEditModal
        open={Boolean(search.roleEditor.row)}
        playerName={search.roleEditor.row?.playerName || ''}
        draft={search.roleEditor.draft}
        busy={search.roleEditor.busy}
        changed={search.roleEditor.changed}
        onDraftChange={search.roleEditor.setDraft}
        onConfirm={search.roleEditor.confirm}
        onClose={search.roleEditor.close}
      />
    </>
  )
}
