// src/features/playersDatabase/ui/pages/teamPage/notes/TeamNotebookDrawer.js

import * as React from 'react'
import { Box, Button, Chip, FormControl, FormLabel, Switch, Typography } from '@mui/joy'
import { useTheme } from '@mui/joy/styles'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import DrawerShell from '../../../../../../ui/patterns/drawer/DrawerShell.js'
import MentionEditor from '../../../../../../ui/patterns/mentions/MentionEditor.js'
import { TEAM_INSIGHTS } from '../information/model/teamWorkspace.navigation.js'
import TeamNotebookDiscardDialog from './TeamNotebookDiscardDialog.js'
import TeamNotebookSummaryCard from './TeamNotebookSummaryCard.js'
import useTeamNotebookDraft, { NOTEBOOK_STEPS } from './useTeamNotebookDraft.js'
import { teamNotebookSx as sx } from './sx/teamNotebook.sx.js'

export default function TeamNotebookDrawer({
  open = false,
  onClose,
  onSave,
  teamId = '',
  teamName = '',
  birthYear = '',
  notes = null,
  mentionOptions = [],
  initialInsightId = '',
}) {
  return (
    <NotebookSession
      key={teamId || 'team-notebook'}
      open={open}
      onClose={onClose}
      onSave={onSave}
      teamId={teamId}
      teamName={teamName}
      birthYear={birthYear}
      notes={notes}
      mentionOptions={mentionOptions}
      initialInsightId={initialInsightId}
    />
  )
}

function NotebookSession({
  open,
  onClose,
  onSave,
  teamId,
  teamName,
  birthYear,
  notes,
  mentionOptions,
  initialInsightId,
}) {
  const theme = useTheme()
  const notebook = useTeamNotebookDraft({ open, notes, mentionOptions, teamId, initialInsightId })
  const [saving, setSaving] = React.useState(false)
  const [saveError, setSaveError] = React.useState('')
  const stepButtons = React.useRef([])
  const subline = [teamName, birthYear ? `שנתון ${birthYear}` : ''].filter(Boolean).join(' · ')
  const activeStep = NOTEBOOK_STEPS[notebook.stepIndex]

  React.useEffect(() => {
    if (!open) setSaveError('')
  }, [open])

  React.useEffect(() => {
    stepButtons.current[notebook.stepIndex]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    })
  }, [notebook.stepIndex])

  const requestClose = () => {
    if (saving) return
    if (notebook.hasChanges) notebook.setConfirmClose(true)
    else onClose?.()
  }

  const save = async () => {
    if (!notebook.hasChanges || saving || !onSave) return
    setSaving(true)
    setSaveError('')
    try {
      await onSave({
        teamId,
        contentsById: notebook.contentsById,
        dirtyIds: notebook.dirtyIds,
        showInvestigationIndicator: notebook.showInvestigationIndicator,
      })
      onClose?.()
    } catch (error) {
      setSaveError(error?.message || 'שמירת המחברת נכשלה')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <DrawerShell
        open={open}
        onClose={requestClose}
        entity='team'
        isDirty={notebook.hasChanges}
        saving={saving}
        canSave={notebook.hasChanges && Boolean(onSave)}
        actions={{ onSave: save }}
        sxOverrides={sx.shell}
        headerProps={{
          title: 'מחברת חקירה',
          titleIconId: 'notes',
          subline,
          sxOverrides: sx.header,
        }}
        texts={{ cancel: 'סגירה' }}
        status={saveError
          ? { text: saveError, color: 'danger' }
          : !onSave ? { text: 'תצוגה מקדימה בלבד', color: 'neutral' } : {}}
        saveButtonProps={{ sx: sx.saveButton }}
        cancelButtonProps={{ sx: sx.cancelButton }}
      >
        <Box sx={sx.workspace}>
          <Box className='dpScrollThin' sx={sx.stepper} role='tablist' aria-label='מסלולי מחברת החקירה'>
            {NOTEBOOK_STEPS.map((step, index) => (
              <Button
                key={step.id}
                ref={element => { stepButtons.current[index] = element }}
                id={`notebook-tab-${step.id}`}
                role='tab'
                aria-selected={notebook.stepIndex === index}
                aria-controls={`notebook-panel-${step.id}`}
                size='sm'
                variant={notebook.stepIndex === index ? 'solid' : 'soft'}
                sx={sx.stepButton(notebook.stepIndex === index)}
                onClick={() => notebook.selectStep(index)}
              >
                <Box component='span' sx={sx.stepNumber(notebook.stepIndex === index)}>{index + 1}</Box>
                {step.label}
              </Button>
            ))}
          </Box>

          <Box sx={sx.pageWindow}>
            {NOTEBOOK_STEPS.map((step, index) => (
              <Box
                  key={step.id}
                  id={`notebook-panel-${step.id}`}
                  role='tabpanel'
                  aria-labelledby={`notebook-tab-${step.id}`}
                  aria-hidden={notebook.stepIndex !== index}
                  className='dpScrollThin'
                  sx={sx.page(index, notebook.stepIndex, theme.direction, step.id === 'summary')}
                >
                  {step.id === 'summary' ? (
                    <Box sx={sx.summary}>
                      <Box sx={sx.pageHeading}>
                        <Typography level='title-lg' sx={sx.summaryHeadingTitle}>
                          {teamName ? `סיכום הערות ל${teamName}` : 'סיכום הערות לקבוצה'}
                        </Typography>
                      </Box>
                      {NOTEBOOK_STEPS.slice(0, -1).map(item => (
                        <TeamNotebookSummaryCard
                          key={item.id}
                          step={item}
                          content={notebook.contentsById[item.id]}
                          text={notebook.textsById[item.id]}
                          open={open}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Box sx={sx.editor}>
                      <Box sx={sx.pageHeading}>
                        <Box>
                          <Typography level='title-lg'>{step.title}</Typography>
                          <Typography level='body-sm'>
                            {TEAM_INSIGHTS.find(route => route.id === step.id)?.subtitle || 'מקום למחשבות שאינן שייכות למסלול מסוים.'}
                          </Typography>
                        </Box>
                        <Chip size='sm' variant='soft'>{`${index + 1} / ${NOTEBOOK_STEPS.length}`}</Chip>
                      </Box>
                      <FormControl sx={sx.formControl}>
                        <FormLabel sx={sx.formLabel}>{step.id === 'general' ? 'הערות כלליות' : 'הערות למסלול'}</FormLabel>
                        <MentionEditor
                          value={notebook.contentsById[step.id]}
                          onChange={value => notebook.changeContent(step.id, value)}
                          options={mentionOptions}
                          ariaLabel={step.id === 'general' ? 'הערות כלליות' : `הערות למסלול ${step.title}`}
                          tabIndex={notebook.stepIndex === index ? 0 : -1}
                          placeholder={step.id === 'general' ? 'מה עוד חשוב לזכור על הקבוצה?' : `מה חשוב לזכור לגבי ${step.title}?`}
                        />
                      </FormControl>
                      <Box sx={sx.linkActions}>
                        <Button size='sm' variant='soft' startDecorator={iconUi({ id: 'calendar', size: 'sm' })}>שיוך לעונה</Button>
                        <Button size='sm' variant='soft' startDecorator={iconUi({ id: 'players', size: 'sm' })}>שיוך לשחקנים</Button>
                        <Button size='sm' variant='outlined' startDecorator={iconUi({ id: 'report', size: 'sm' })}>הוספת דוח</Button>
                      </Box>
                      <Box component='label' sx={sx.indicatorRow}>
                        <Switch
                          size='sm'
                          checked={notebook.showInvestigationIndicator}
                          onChange={event => notebook.setShowInvestigationIndicator(event.target.checked)}
                          slotProps={{ input: { 'aria-label': 'הצגת סימון חקירה בעמודים אחרים' } }}
                        />
                        <Box sx={sx.indicatorText}>
                          <Typography level='body-sm' sx={sx.indicatorLabel}>הצגת סימון חקירה בעמודים אחרים</Typography>
                          <Typography level='body-xs' sx={sx.indicatorHint}>חל על הקבוצה כולה</Typography>
                        </Box>
                      </Box>
                      {notebook.dirtyIds.includes(step.id) && (
                        <Typography level='body-xs' color='warning'>יש שינוי בטיוטה של שלב זה.</Typography>
                      )}
                    </Box>
                  )}
              </Box>
            ))}
          </Box>

          <Box sx={sx.pager}>
            <Button
              size='sm'
              variant='outlined'
              disabled={notebook.stepIndex === 0}
              onClick={() => notebook.selectStep(notebook.stepIndex - 1)}
            >
              הקודם
            </Button>
            <Typography level='body-xs' sx={sx.pagerLabel}>
              {`${notebook.stepIndex + 1} מתוך ${NOTEBOOK_STEPS.length} · ${activeStep.label}`}
            </Typography>
            <Button
              size='sm'
              variant='solid'
              disabled={notebook.stepIndex === NOTEBOOK_STEPS.length - 1}
              onClick={() => notebook.selectStep(notebook.stepIndex + 1)}
            >
              הבא
            </Button>
          </Box>
        </Box>
      </DrawerShell>
      <TeamNotebookDiscardDialog
        open={notebook.confirmClose}
        onContinue={() => notebook.setConfirmClose(false)}
        onDiscard={() => {
          notebook.setConfirmClose(false)
          onClose?.()
        }}
      />
    </>
  )
}
