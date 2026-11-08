// src/features/hub/playerProfile/sharedModules/performance/PlayerPerformanceModule.js

import React, { Suspense, useEffect, useMemo, useState } from 'react'
import { Box, Button, CircularProgress, Modal, ModalDialog, Option, Select, Typography } from '@mui/joy'
import { getFullDateIl } from '../../../../../shared/format/dateUtils.js'
import { normalizationLabel } from '../../sharedLogic/performance/performance.metrics.logic.js'
import { buildPerformanceShareReport } from '../../sharedLogic/performance/performance.share.logic.js'
import usePlayerPerformanceWorkspace from './usePlayerPerformanceWorkspace.js'
import PerformanceToolbar from './components/PerformanceToolbar.js'
import PerformanceGames from './components/PerformanceGames.js'
import PerformanceMetrics from './components/PerformanceMetrics.js'
import PerformanceComparison from './components/PerformanceComparison.js'
import PerformanceTrend from './components/PerformanceTrend.js'
import PerformanceShareModal from './components/PerformanceShareModal.js'
import { performanceSx as sx } from './performance.sx.js'

const GameStatsCreateForm = React.lazy(() => import('../../../../../ui/forms/gameStats/GameStatsCreateForm.js'))

function StatsEditor({ model, context }) {
  const { stats, player, liveTeam } = model
  const [retainedGame, setRetainedGame] = useState(null)
  useEffect(() => {
    if (stats.editingStatsGame) setRetainedGame(stats.editingStatsGame)
  }, [stats.editingStatsGame])
  const game = stats.editingStatsGame || retainedGame
  // Keep the drawer mounted after its first use so Joy can finish its exit transition.
  if (!game) return null
  return (
    <Suspense fallback={<Typography role="status" level="body-sm">טוען את טופס העריכה…</Typography>}>
      <GameStatsCreateForm
        open={!!stats.editingStatsGame}
        game={game}
        team={liveTeam}
        context={{ ...context, player, playerId: player?.id, team: liveTeam, game, source: 'playerProfile' }}
        savedDraft={stats.activeStatsFormDraft}
        onClose={stats.closeStatsForm}
        onSave={stats.handleSaveStats}
        statsDeleteAction={stats.statsDeleteAction}
        onDeleteDraft={stats.deleteStatsDraft}
        onDeleteStats={stats.handleDeleteStats}
        savePending={stats.statsSavePending}
        saveError={stats.statsSaveError}
      />
    </Suspense>
  )
}

function PerformanceWorkspace({ entity, context, performanceInsightsRequest }) {
  const model = usePlayerPerformanceWorkspace({ entity, context, performanceInsightsRequest })
  const [shareOptions, setShareOptions] = useState(null)
  const [shareOpen, setShareOpen] = useState(false)
  const { report, view, target, normalizedGame } = model
  const shareReport = useMemo(() => shareOptions ? buildPerformanceShareReport(shareOptions) : null, [shareOptions])
  const openShare = () => {
    setShareOptions({
      player: model.player, context, report, view, target,
      activeGame: model.activeGame, normalizedGame, comparison: model.comparison,
      positionId: model.position, percentile: model.percentile,
    })
    setShareOpen(true)
  }
  const changeSharePosition = positionId => {
    model.setPosition(positionId)
    setShareOptions(current => ({ ...current, positionId }))
  }

  return (
    <Box sx={sx.root}>
      <PerformanceToolbar
        view={view} onView={model.changeView} filters={model.filters}
        onFilters={model.changeFilters} target={target} onTarget={model.setTarget} onReset={model.resetFilters}
        onShare={openShare} canShare={model.canCopy}
      />

      {model.loading ? <Typography role="status" sx={sx.caption}>טוען סטטיסטיקה שמורה…</Typography> : null}
      {model.error ? (
        <Box role="alert" sx={sx.notice}>
          חלק מנתוני הסטטיסטיקה לא נטענו. הנתונים הזמינים נשארו מוצגים.
          <Button size="sm" variant="plain" color="warning" onClick={model.refresh}>נסה שוב</Button>
        </Box>
      ) : null}

      {!report.games.length && !model.loading ? (
        <Box sx={sx.empty}>
          <Typography sx={sx.sectionTitle}>לא נמצאו משחקים לתצוגה</Typography>
          <Typography sx={sx.caption}>אפשר לאפס את המסננים, או להוסיף משחק דרך טאב המשחקים.</Typography>
        </Box>
      ) : null}

      {report.games.length && view === 'games' ? (
        <PerformanceGames
          games={report.games} activeGame={model.activeGame} metrics={report.metrics}
          onSelect={model.setSelectedGameId} onEdit={model.stats.handleOpenStatsGame}
          editing={model.statsFormLoading || model.loading || model.stats.statsSavePending}
        />
      ) : null}

      {view === 'summary' || view === 'normalized' ? (
        <>
          {view === 'normalized' && (report.missingVideoGames || report.missingDurationGames) ? (
            <Typography sx={sx.notice}>
              {report.missingVideoGames ? `${report.missingVideoGames} משחקים ללא דקות ניתוח חיוביות. ` : ''}
              {report.missingDurationGames ? `${report.missingDurationGames} משחקים ללא משך משחק מלא. ` : ''}
              משחקים אלה אינם נכללים בנרמול. אפשר להשלים את הנתונים בעריכת המשחק.
            </Typography>
          ) : null}
          <Box sx={sx.section}>
            <Box sx={sx.sectionHeader}>
              <Typography sx={sx.sectionTitle}>{view === 'summary'
                ? 'סיכום הנתונים בפועל'
                : normalizedGame ? `נרמול נגד ${normalizedGame.rival} ${normalizationLabel(target)}` : `ממוצע מנורמל ${normalizationLabel(target)}`}</Typography>
              <Box sx={sx.actions}>
                {view === 'normalized' ? (
                  <Select size="sm" value={normalizedGame?.id || ''} onChange={(_, value) => model.setNormalizedGameId(value || '')} sx={sx.filter} aria-label="משחק לנרמול">
                    <Option value="">כל המשחקים · ממוצע מנורמל</Option>
                    {report.measuredGames.map(game => <Option key={game.id} value={game.id}>{game.rival}{game.date ? ` · ${getFullDateIl(game.date)}` : ''}</Option>)}
                  </Select>
                ) : null}
              </Box>
            </Box>
            <PerformanceMetrics
              metrics={view === 'summary' ? report.rawMetrics : normalizedGame ? report.metrics : report.normalizedMetrics}
              game={view === 'normalized' ? normalizedGame : null} mode={view} target={target}
            />
          </Box>
          {view === 'normalized' && !normalizedGame ? <PerformanceTrend games={report.measuredGames} metrics={report.metrics} target={target} metricId={model.trendMetric} onMetric={model.setTrendMetric} /> : null}
        </>
      ) : null}

      {view === 'compare' ? (
        <PerformanceComparison rows={model.comparison} position={model.position} onPosition={model.setPosition} percentile={model.percentile} onPercentile={model.setPercentile} minutes={Number(target)} />
      ) : null}

      {model.statsFormLoading ? (
        <Modal open>
          <ModalDialog><Box sx={sx.actions}><CircularProgress size="sm" /><Typography level="body-sm">{model.statsFormLoadingText || 'טוען סטטיסטיקה לעריכה…'}</Typography></Box></ModalDialog>
        </Modal>
      ) : null}
      <StatsEditor model={model} context={context} />
      {shareReport ? <PerformanceShareModal open={shareOpen} report={shareReport} onPosition={changeSharePosition} onClose={() => setShareOpen(false)} /> : null}
    </Box>
  )
}

export default function PlayerPerformanceModule(props) {
  const key = `${props.entity?.playerSource || ''}:${props.entity?.id || ''}`
  return <PerformanceWorkspace key={key} {...props} />
}
