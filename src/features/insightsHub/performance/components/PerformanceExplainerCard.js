// features/insightsHub/performance/components/PerformanceExplainerCard.js

import React from 'react'
import { Box, Card } from '@mui/joy'

import PerformanceInfoModal from './PerformanceInfoModal.js'
import PerformanceModalActions from './PerformanceModalActions.js'
import PerformanceRichText from './PerformanceRichText.js'
import PerformanceStepActions from './PerformanceStepActions.js'
import PerformanceStepHeader from './PerformanceStepHeader.js'
import PerformanceFlowSummary from './PerformanceFlowSummary.js'

import {
  buildModalPanels,
} from './performanceCard.helpers.js'

import {
  cardSx,
} from './sx/card.sx.js'

export default function PerformanceExplainerCard({
  item,
  numbersBlock,
  stepRef,
  onPrev,
  onNext,
  isFirst,
  isLast,
  stepIndex,
  totalSteps,
}) {
  const [activePanel, setActivePanel] = React.useState(null)

  const panels = React.useMemo(() => {
    return buildModalPanels({ item, numbersBlock })
  }, [item, numbersBlock])

  const closeModal = () => {
    setActivePanel(null)
  }

  return (
    <Box ref={stepRef} sx={cardSx.stepWrap}>
      <Card variant="outlined" sx={cardSx.card}>
        <Box sx={cardSx.cardGlow} />

        <PerformanceStepHeader
          item={item}
          isFirst={isFirst}
          stepIndex={stepIndex}
          totalSteps={totalSteps}
          onPrev={onPrev}
        />

        {item.type === 'summaryFlow' ? (
          <PerformanceFlowSummary />
        ) : (
          <PerformanceRichText item={item} />
        )}

        <PerformanceModalActions
          panels={panels}
          onOpen={setActivePanel}
        />

        <PerformanceStepActions
          isLast={isLast}
          label={item.buttonLabel}
          onNext={onNext}
        />
      </Card>

      <PerformanceInfoModal
        open={Boolean(activePanel)}
        panel={activePanel}
        placement={activePanel?.placement || 'left'}
        variant={activePanel?.variant || 'content'}
        onClose={closeModal}
      />
    </Box>
  )
}
