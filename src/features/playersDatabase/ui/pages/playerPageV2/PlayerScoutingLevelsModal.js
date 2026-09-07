import * as React from 'react'
import { Box, IconButton, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import AnimatedModal from '../../../../../ui/patterns/modals/AnimatedModal.js'
import { COLORS, devPlanColors } from '../../../../../ui/core/theme/Colors.js'

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

const sx = {
  trigger: {
    width: 24,
    minWidth: 24,
    height: 24,
    minHeight: 24,
    p: 0.35,
    color: devPlanColors.secondary,
    bgcolor: devPlanColors.secondaryLight,
    '&:hover': { color: devPlanColors.primary, bgcolor: devPlanColors.primaryLight },
  },
  content: { display: 'grid', gap: 1.25 },
  section: {
    display: 'grid',
    gap: 0.7,
    p: 1,
    border: `1px solid ${devPlanColors.border}`,
    borderRadius: 9,
    bgcolor: devPlanColors.surface,
  },
  sectionTitle: { color: devPlanColors.primaryDark, fontSize: 13, fontWeight: 800 },
  sectionDescription: { color: devPlanColors.secondary, fontSize: 11, lineHeight: 1.4 },
  levels: { display: 'grid', gap: 0.45 },
  level: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    px: 0.8,
    py: 0.55,
    borderRadius: 7,
    bgcolor: devPlanColors.secondaryLight,
  },
  levelMain: { display: 'inline-flex', alignItems: 'center', gap: 0.45, minWidth: 0 },
  levelIcon: { display: 'inline-flex', flexShrink: 0, color: 'inherit', '& svg': { fontSize: 15, color: 'inherit' } },
  levelLabel: { color: 'inherit', fontSize: 12, fontWeight: 800 },
  levelThreshold: { color: 'inherit', opacity: 0.78, fontSize: 11.5, fontWeight: 700, whiteSpace: 'nowrap' },
  immediate: { color: COLORS.status.danger.text, bgcolor: COLORS.status.danger.softBg },
  priority: { color: COLORS.status.warning.text, bgcolor: COLORS.status.warning.softBg },
  watch: { color: COLORS.entity.domain.base.subText, bgcolor: COLORS.entity.domain.disabled.bg },
  reasonable: { color: COLORS.entity.domain.base.subText, bgcolor: COLORS.entity.domain.disabled.bg },
  curious: { color: COLORS.status.warning.text, bgcolor: COLORS.status.warning.softBg },
  interesting: { color: devPlanColors.tertiaryDark, bgcolor: devPlanColors.tertiaryLight },
  superInteresting: { color: devPlanColors.petrolDark, bgcolor: devPlanColors.petrolLight },
  note: { color: devPlanColors.secondary, fontSize: 10.5, lineHeight: 1.4 },
}

function LevelsSection({ title, description, levels, note, iconId }) {
  return (
    <Box sx={sx.section}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55 }}>
        <Box sx={{ color: devPlanColors.primary, display: 'inline-flex', '& svg': { fontSize: 16 } }}>
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
