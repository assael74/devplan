// src/ui/patterns/scoring/ScoringInfoContent.js

import Box from '@mui/joy/Box'
import Typography from '@mui/joy/Typography'

import {
  SCORING_METRICS_DIFF,
} from './ui/index.js'

import { tooltipSx as sx } from './sx/tooltip.sx.js'

export function MetricShortContent({ info }) {
  return (
    <Box sx={sx.shortContent}>
      <Typography level="body-xs" sx={sx.shortTitle}>
        {info.title}
      </Typography>

      <Typography level="body-sm" sx={sx.text}>
        {info.shortText || info.description}
      </Typography>
    </Box>
  )
}

export function MetricFullContent({ info, showDiff }) {
  return (
    <Box sx={sx.content}>
      <Box sx={sx.head}>
        <Typography level="title-sm" sx={sx.title}>
          {info.title}
        </Typography>

        <Typography level="body-xs" sx={sx.subtitle}>
          {info.subtitle}
        </Typography>
      </Box>

      <Typography level="body-sm" sx={sx.text}>
        {info.description}
      </Typography>

      {info.question ? (
        <Box sx={sx.section}>
          <Typography level="body-xs" sx={sx.title}>
            השאלה שהמדד עונה עליה
          </Typography>

          <Typography level="body-sm" sx={sx.text}>
            {info.question}
          </Typography>
        </Box>
      ) : null}

      {info.read?.length ? (
        <Box sx={sx.section}>
          <Typography level="body-xs" sx={sx.title}>
            איך קוראים את זה?
          </Typography>

          <Box component="ul" sx={sx.list}>
            {info.read.map(item => (
              <Box component="li" key={item} sx={sx.item}>
                <Typography level="body-sm" sx={sx.text}>
                  {item}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      ) : null}

      {info.note ? (
        <Typography level="body-xs" sx={sx.note}>
          {info.note}
        </Typography>
      ) : null}

      {showDiff ? (
        <Box sx={sx.section}>
          <Typography level="body-xs" sx={sx.title}>
            {SCORING_METRICS_DIFF.title}
          </Typography>

          <Box component="ul" sx={sx.list}>
            {SCORING_METRICS_DIFF.items.map(item => (
              <Box component="li" key={item} sx={sx.item}>
                <Typography level="body-sm" sx={sx.text}>
                  {item}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      ) : null}
    </Box>
  )
}

export function ProfileShortContent({ info, showConcept }) {
  return (
    <Box sx={sx.shortContent}>
      <Typography level="body-xs" sx={sx.shortTitle}>
        {showConcept ? info.profileTitle : info.label}
      </Typography>

      <Typography level="body-sm" sx={sx.text}>
        {showConcept ? info.profileShortText : info.description}
      </Typography>
    </Box>
  )
}

export function ProfileFullContent({ info, showConcept }) {
  return (
    <Box sx={sx.content}>
      <Box sx={sx.head}>
        <Typography level="title-sm" sx={sx.title}>
          {showConcept ? info.profileTitle : info.label}
        </Typography>

        <Typography level="body-xs" sx={sx.subtitle}>
          {showConcept ? info.profileSubtitle : 'אבחנת תפקוד בפועל'}
        </Typography>
      </Box>

      <Typography level="body-sm" sx={sx.text}>
        {showConcept ? info.profileDescription : info.description}
      </Typography>

      {showConcept ? (
        <Box sx={sx.section}>
          <Typography level="body-xs" sx={sx.title}>
            השאלה שהפרופיל עונה עליה
          </Typography>

          <Typography level="body-sm" sx={sx.text}>
            {info.profileQuestion}
          </Typography>
        </Box>
      ) : null}

      {!showConcept && info.coachText ? (
        <Box sx={sx.section}>
          <Typography level="body-xs" sx={sx.title}>
            משמעות למאמן
          </Typography>

          <Typography level="body-sm" sx={sx.text}>
            {info.coachText}
          </Typography>
        </Box>
      ) : null}

      {showConcept ? (
        <Typography level="body-xs" sx={sx.note}>
          {info.profileNote}
        </Typography>
      ) : null}
    </Box>
  )
}
