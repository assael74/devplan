// features/playersDatabase/components/profilesPage/preview/PreviewArea.js

import React from 'react'
import { Box } from '@mui/joy'

import PreviewPlayerSelect from '../list/preview/PreviewPlayerSelect.js'
import PreviewToolbar from './toolbar/PreviewToolbar.js'
import PreviewDataStage from './PreviewDataStage.js'
import { InitialState, PrimaryState } from './PreviewStateViews.js'
import { getProfileMetrics } from './logic/previewMetrics.logic.js'
import { areaSx as sx } from './sx/area.sx.js'

export default function PreviewArea({
  profile,
  selectedProfileResult,
  previewState = {},
  previewContentCleared = false,
  previewPlayerRow = null,
  rowLinks = null,
  onRemoveProfile = null,
  onRefreshDocuments = null,
}) {
  const stage = previewState.stage || 'initial'
  const selectionMetrics = previewState.selectionMetrics || {}
  const activePreviewPlayer = previewPlayerRow || rowLinks?.row?.playerRow || null
  const linksRow = rowLinks?.row?.playerRow || null

  const previewData = React.useMemo(
    () => ({
      ...selectedProfileResult,
      selectionMetrics,
    }),
    [selectionMetrics, selectedProfileResult]
  )

  const metrics = stage === 'selection' ? selectionMetrics : getProfileMetrics(profile)

  return (
    <Box sx={sx.root}>
      <Box sx={sx.toolbarWrap}>
        <PreviewToolbar
          key={`${stage}-${previewState.searchMode || 'all'}-${previewState.primaryFilter || 'all'}`}
          player={activePreviewPlayer}
          stage={stage}
          searchMode={previewState.searchMode || 'all'}
          title={previewState.title || ''}
          subtitle={previewState.subtitle || ''}
          primaryFilter={previewState.primaryFilter || 'all'}
          leagueLevelsCount={previewState.leagueLevelsCount || 0}
          yearsCount={previewState.yearsCount || 0}
          disabled={stage === 'initial'}
        />
      </Box>

      <Box className="dpScrollThin" sx={sx.content}>
        {previewContentCleared ? (
          <Box sx={sx.clearedState} />
        ) : stage === 'initial' ? (
          <InitialState />
        ) : activePreviewPlayer ? (
          <PreviewPlayerSelect
            profile={profile}
            player={activePreviewPlayer}
            linksRow={linksRow}
            rowLinks={rowLinks}
            onRemoveProfile={onRemoveProfile}
            onSaved={onRefreshDocuments}
          />
        ) : stage === 'primary' ? (
          <PrimaryState title={previewState.title} subtitle={previewState.subtitle} />
        ) : (
          <PreviewDataStage profileResult={previewData} metrics={metrics} />
        )}
      </Box>
    </Box>
  )
}
