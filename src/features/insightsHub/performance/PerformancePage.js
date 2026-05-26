// features/insightsHub/performance/PerformancePage.js

import React from 'react'
import { Box, Button, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../ui/core/icons/iconUi.js'

import {
  PerformanceExplainerCard,
} from './components/index.js'

import {
  PERFORMANCE_MODEL_META,
  PERFORMANCE_MODEL_STEPS,
} from './data/index.js'

import {
  resolveNumbersBlock,
} from './logic/performanceModel.logic.js'

import {
  pageSx,
} from './page.sx.js'

const clampIndex = (index, total) => {
  return Math.min(Math.max(index, 0), Math.max(total - 1, 0))
}

const blockManualScroll = event => {
  event.preventDefault()
}

export default function PerformancePage({ onBack }) {
  const stageRef = React.useRef(null)
  const refs = React.useRef([])

  const setStepRef = index => el => {
    refs.current[index] = el
  }

  const scrollToStep = index => {
    const stage = stageRef.current
    const safeIndex = clampIndex(index, PERFORMANCE_MODEL_STEPS.length)
    const target = refs.current[safeIndex]

    if (!stage || !target) return

    const stageTop = stage.getBoundingClientRect().top
    const targetTop = target.getBoundingClientRect().top

    stage.scrollTo({
      top: stage.scrollTop + targetTop - stageTop,
      behavior: 'smooth',
    })
  }

  return (
    <Box sx={pageSx.root}>
      <Box sx={pageSx.page}>
        <Box sx={pageSx.header}>
          <Box sx={pageSx.headerTop}>
            <Box sx={pageSx.headerText}>
              <Chip size="sm" variant="soft" color="primary" sx={pageSx.chip}>
                מודל ביצוע
              </Chip>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography level="h1" sx={pageSx.title}>
                  {PERFORMANCE_MODEL_META.title}
                </Typography>

                <Box sx={pageSx.inlineIcon}>
                  {iconUi({ id: 'performanceModel', size: 'lg' })}
                </Box>
              </Box>

              <Typography level="body-md" sx={pageSx.subtitle}>
                {PERFORMANCE_MODEL_META.subtitle}
              </Typography>
            </Box>

            <Button size="sm" variant="soft" color="neutral" onClick={onBack}>
              חזרה
            </Button>
          </Box>
        </Box>

        <Box
          ref={stageRef}
          sx={pageSx.stage}
          onWheel={blockManualScroll}
          onTouchMove={blockManualScroll}
        >
          {PERFORMANCE_MODEL_STEPS.map((item, index) => (
            <PerformanceExplainerCard
              key={item.id}
              item={item}
              numbersBlock={resolveNumbersBlock(item.numbersBlock)}
              stepRef={setStepRef(index)}
              isFirst={index === 0}
              isLast={index === PERFORMANCE_MODEL_STEPS.length - 1}
              stepIndex={index}
              totalSteps={PERFORMANCE_MODEL_STEPS.length}
              onPrev={() => scrollToStep(index - 1)}
              onNext={() => scrollToStep(index + 1)}
            />
          ))}
        </Box>
      </Box>
    </Box>
  )
}
