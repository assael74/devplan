// previewDomainCard/domains/player/games/components/newExForm/NewExFormFieldsDrawer.js

import React from 'react'
import { Box, Typography, Divider, Accordion, AccordionDetails, AccordionSummary, AccordionGroup } from '@mui/joy'
import AddIcon from '@mui/icons-material/Add';

import GameCreateFields from '../../../../../../../../../../ui/forms/ui/games/GameCreateFields.js'
import OnSquadSelector from '../../../../../../../../../../ui/fields/checkUi/games/OnSquadSelector.js'
import OnSquadStart from '../../../../../../../../../../ui/fields/checkUi/games/OnSquadStart.js'
import GoalField from '../../../../../../../../../../ui/fields/inputUi/games/GoalField.js'
import AssistField from '../../../../../../../../../../ui/fields/inputUi/games/AssistField.js'
import TimePlayedField from '../../../../../../../../../../ui/fields/inputUi/games/TimePlayedField.js'

import { drawerNewFormSx as sx } from '../../sx/newFormDrawer.sx.js'

const layout = {
  topCols: { xs: '1fr', sm: '1fr 1fr' },
  mainCols: { xs: '1fr', sm: '1fr 1fr' },

  metaCols: {
    xs: '1fr',
    sm: 'repeat(3, minmax(0, 1fr))',
  },

  resultCols: {
    xs: '1fr',
    sm: 'repeat(3, minmax(0, 1fr))',
  },
}

export default function NewExFormFieldsDrawer({
  draft,
  setField,
  player,
  context,
  validity,
  pending = false,
}) {
  const isPrivatePlayer = player?.isPrivatePlayer === true

  const goalsFor = Number(draft?.goalsFor || 0)
  const goalsLocked = goalsFor <= 0
  const assistsLocked = goalsFor <= 0

  const clampStatToGoalsFor = (value) => {
    const n = Number(value || 0)
    if (!Number.isFinite(n) || n <= 0) return 0
    return Math.min(n, goalsFor)
  }

  return (
    <Box sx={{ display: 'grid', gap: 1 }}>
      <GameCreateFields
        draft={draft}
        isPrivatePlayer={isPrivatePlayer}
        onDraft={(nextDraft) => {
          const safeDraft = typeof nextDraft === 'function' ? nextDraft(draft) : nextDraft
          Object.entries(safeDraft || {}).forEach(([key, value]) => {
            setField(key, value)
          })
        }}
        context={{
          ...context,
          clubs: context?.clubs || [],
          teams: context?.teams || [],
        }}
        validity={validity || { ok: true, okDate: true }}
        layout={layout}
      />

      <AccordionGroup
        variant="plain"
        transition="0.2s"
        sx={(theme) => (sx.accordion(theme))}
      >
        <Accordion defaultExpanded>
          <AccordionSummary indicator={<AddIcon />}>
            <Typography level="title-sm" sx={{ textAlign: 'center' }}>
              פרטי ההשתתפות של
              <Typography color='success' variant='soft' sx={sx.entryText}>{player?.playerFullName}</Typography>
            </Typography>
          </AccordionSummary>
          <AccordionDetails variant="soft">
            <Box sx={sx.fieldsBlock(true)}>
              <Box sx={sx.booleanGrid1}>
                <OnSquadSelector
                  value={draft?.isSelected}
                  onChange={(v) => {
                    setField('isSelected', v)

                    if (!v) {
                      setField('isStarting', false)
                      setField('timePlayed', 0)
                      setField('goals', 0)
                      setField('assists', 0)
                    }
                  }}
                  disabled={pending}
                  size="sm"
                  label="נכלל בסגל"
                />

                <OnSquadStart
                  value={draft?.isStarting}
                  onChange={(v) => setField('isStarting', v)}
                  disabled={pending || !draft?.isSelected}
                  size="sm"
                  label="פותח בהרכב"
                />
              </Box>

              <Box sx={sx.statsGrid}>
                <GoalField
                  value={draft?.goals}
                  size="sm"
                  onChange={(v) => setField('goals', clampStatToGoalsFor(v))}
                  disabled={pending || !draft?.isSelected || goalsLocked}
                  helperText={!draft?.isSelected ? 'יש לכלול בסגל' : goalsLocked ? 'הקבוצה לא כבשה' : `עד ${goalsFor} שערים`}
                />

                <AssistField
                  value={draft?.assists}
                  size="sm"
                  onChange={(v) => setField('assists', clampStatToGoalsFor(v))}
                  disabled={pending || !draft?.isSelected || goalsLocked}
                  helperText={!draft?.isSelected ? 'יש לכלול בסגל' : assistsLocked ? 'הקבוצה לא כבשה' : `עד ${goalsFor} בישולים`}
                />

                <TimePlayedField
                  value={draft?.timePlayed}
                  size="sm"
                  onChange={(v) => setField('timePlayed', v)}
                  disabled={pending || !draft?.isSelected}
                />
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      </AccordionGroup>
    </Box>
  )
}
