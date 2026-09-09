import * as React from 'react'
import { Box, IconButton, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import AnimatedModal from '../../../../../ui/patterns/modals/AnimatedModal.js'
import { playerScoutingLevelsModalSx as sx } from './sx/playerScoutingLevelsModal.sx.js'

const IMMEDIACY_LEVELS = Object.freeze([
  Object.freeze({ label: 'מעקב', threshold: 'פחות מ־3', tone: 'watch', iconId: 'hour' }),
  Object.freeze({ label: 'עדיפות גבוהה', threshold: '3–5', tone: 'priority', iconId: 'highPriority' }),
  Object.freeze({ label: 'לבדוק עכשיו', threshold: '6 ומעלה', tone: 'immediate', iconId: 'immediateReview' }),
])

const INTEREST_LEVELS = Object.freeze([
  Object.freeze({ label: 'עניין סביר', threshold: '0–1', tone: 'reasonable', iconId: 'view' }),
  Object.freeze({ label: 'מסקרן', threshold: '2', tone: 'curious', iconId: 'targets' }),
  Object.freeze({ label: 'מעניין', threshold: '3–4', tone: 'interesting', iconId: 'insights' }),
  Object.freeze({ label: 'מעניין מאוד', threshold: '5–8', tone: 'superInteresting', iconId: 'strength' }),
])



function LevelsSection({ title, description, levels, note, iconId }) {
  return (
    <Box sx={sx.section}>
      <Box sx={sx.sectionHeading}>
        <Box sx={sx.sectionHeadingIcon}>
          {iconUi({ id: iconId, size: 'sm' })}
        </Box>
        <Typography sx={sx.sectionTitle}>{title}</Typography>
      </Box>
      <Typography sx={sx.sectionDescription}>{description}</Typography>
      <Box sx={sx.levels}>
        {levels.map(level => (
          <Box key={level.label} sx={[sx.level, sx[level.tone]]}>
            <Box sx={sx.levelMain}>
              <Box aria-hidden='true' sx={sx.levelIcon}>{iconUi({ id: level.iconId, size: 'sm' })}</Box>
              <Typography sx={sx.levelLabel}>{level.label}</Typography>
            </Box>
            <Typography sx={sx.levelThreshold}>{level.threshold}</Typography>
          </Box>
        ))}
      </Box>
      {note ? <Typography sx={sx.note}>{note}</Typography> : null}
    </Box>
  )
}

export default function PlayerScoutingLevelsModal({ area = 'immediacy', trigger = null }) {
  const [open, setOpen] = React.useState(false)
  const isInterest = area === 'interest'
  const title = isInterest ? 'רמות עניין מקצועי' : 'רמות מיידיות מקצועית'
  const description = isInterest
    ? 'כך נקבעת רמת העניין לפי ציון אוטומטי של עד 8 נקודות.'
    : 'כך נקבע ציון המיידיות בעמוד השחקן.'
  const handleOpen = event => {
    event?.stopPropagation()
    setOpen(true)
  }

  return (
    <>
      {trigger ? React.cloneElement(trigger, {
        onClick: handleOpen,
        onKeyDown: event => event.stopPropagation(),
      }) : (
        <IconButton
          size='sm'
          variant='soft'
          color='neutral'
          aria-label={`הצגת ${title}`}
          onClick={handleOpen}
          sx={sx.trigger}
        >
          {iconUi({ id: 'info', size: 'sm' })}
        </IconButton>
      )}

      <AnimatedModal
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        description={description}
        iconId='info'
        size='sm'
        hideFooter
      >
        <Box sx={sx.content}>
          {isInterest ? (
            <LevelsSection
              title='עניין מקצועי'
              description='הציון מחבר מיידיות, התמדה, קומבינציית פרופילים ועומק פרופיל.'
              levels={INTEREST_LEVELS}
              iconId='interest'
            />
          ) : (
            <LevelsSection
              title='מיידיות מקצועית'
              description='ציון המיידיות הוא סכום הנקודות החיוביות פחות ההפחתות.'
              levels={IMMEDIACY_LEVELS}
              note='״הוסר״ היא החלטה ידנית ואינה רמת ניקוד.'
              iconId='immediacy'
            />
          )}
        </Box>
      </AnimatedModal>
    </>
  )
}
