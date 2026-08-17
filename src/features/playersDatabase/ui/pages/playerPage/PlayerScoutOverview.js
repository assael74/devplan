// src/features/playersDatabase/ui/pages/playerPage/PlayerScoutOverview.js

import * as React from 'react'
import {
  Box,
  Button,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import PageContentPanel from '../../components/page/PageContentPanel.js'
import RegularModal from '../../components/modals/RegularModal.js'
import PlayerNarrativeCard from './PlayerNarrativeCard.js'
import { buildPlayerScoutView } from './logic/playerScoutView.js'
import PlayerScoutSummary from './scout/PlayerScoutSummary.js'
import PlayerScoutProfiles from './scout/PlayerScoutProfiles.js'
import PlayerScoutReasons from './scout/PlayerScoutReasons.js'
import PlayerScoutContext from './scout/PlayerScoutContext.js'
import PlayerScoutPath from './scout/PlayerScoutPath.js'
import PlayerScoutQuestions from './scout/PlayerScoutQuestions.js'
import { playerScoutOverviewSx as sx } from './sx/playerScoutOverview.sx.js'

function resolveNarrativeParagraphs(summary = '') {
  return String(summary || '')
    .split(/\n\s*\n/)
    .map(item => item.trim())
    .filter(Boolean)
}

function ApprovedNarrativeModal({ open, narrativeView, onClose }) {
  const approved = narrativeView?.approved
  const content = approved?.content || {}
  const paragraphs = resolveNarrativeParagraphs(content.summary)

  return (
    <RegularModal
      open={open}
      title={content.title || 'סיפור סקאוט'}
      description='הסיפור המקצועי המאושר של השחקן.'
      iconId='profile'
      size='md'
      hideFooter
      contentSx={sx.storyModalContent}
      onClose={onClose}
    >
      <Box sx={sx.storyModalBody}>
        {paragraphs.length ? paragraphs.map((paragraph, index) => (
          <Box
            key={`${index}-${paragraph.slice(0, 24)}`}
            sx={index === 0 ? sx.storyLead : sx.storyParagraph}
          >
            <Typography level={index === 0 ? 'body-lg' : 'body-md'} sx={sx.storyModalText}>
              {paragraph}
            </Typography>
          </Box>
        )) : (
          <Typography level='body-md' sx={sx.emptyText}>
            אין כרגע תוכן סיפור מאושר להצגה.
          </Typography>
        )}
      </Box>
    </RegularModal>
  )
}

export default function PlayerScoutOverview({
  player = {},
  historyRows = [],
  selectedSeasonKey = '',
  narrativeView = {},
  narrativeLoading = false,
  playerJsonLoading = false,
  onNarrativeGenerate,
  onPlayerJson,
  onReviewOpen,
}) {
  const [storyOpen, setStoryOpen] = React.useState(false)
  const view = React.useMemo(() => buildPlayerScoutView({
    player,
    historyRows,
    selectedSeasonKey,
  }), [player, historyRows, selectedSeasonKey])

  return (
    <>
      <PageContentPanel
        title='מצב סקאוטינג נוכחי'
        subtitle={`מבוסס על המדידה האחרונה · ${view.seasonKey}`}
        headerActions={(
          <Box sx={sx.headerActions}>
            <Button
              size='sm'
              variant='outlined'
              loading={playerJsonLoading}
              startDecorator={iconUi({id: 'statsFull', size: 'sm'})}
              onClick={onPlayerJson}
            >
              JSON
            </Button>
          </Box>
        )}
        headerTone='soft'
        panelSx={sx.panel}
        contentSx={sx.content}
      >
        <PlayerScoutSummary view={view} />

        <PlayerScoutProfiles profiles={view.profiles} />

        <PlayerNarrativeCard
          view={view}
          narrativeView={narrativeView}
          loading={narrativeLoading}
          onOpen={() => setStoryOpen(true)}
          onGenerate={onNarrativeGenerate}
        />

        <PlayerScoutReasons why={view.why} />

        <Box sx={sx.detailGrid}>
          <PlayerScoutContext
            context={view.context}
            seasonStats={view.seasonStats}
            identity={view.identity}
          />

          <PlayerScoutPath trajectory={view.trajectory} dataDepth={view.dataDepth} />
        </Box>

        <PlayerScoutQuestions
          questions={view.questions}
          nextAction={view.nextAction}
          onReview={onReviewOpen}
        />
      </PageContentPanel>

      <ApprovedNarrativeModal
        open={storyOpen}
        narrativeView={narrativeView}
        onClose={() => setStoryOpen(false)}
      />
    </>
  )
}
