// src/features/playersDatabase/ui/components/modals/paste/LeagueImportModal.js

import * as React from 'react'

import {
  Box,
  Button,
  Chip,
  CircularProgress,

  FormControl,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/joy'

import ImportActionArea from '../ImportActionArea.js'
import ConfirmModal from '../ConfirmModal.js'
import JsonViewerModal from '../JsonViewerModal.js'
import ModalStepper from '../ModalStepper.js'
import RegularModal from '../RegularModal.js'
import leagueActiveImage from '../../../../../../ui/core/images/modals/leagueActive.png'
import leagueCompletedImage from '../../../../../../ui/core/images/modals/leagueCompleted.png'
import leagueUpcomingImage from '../../../../../../ui/core/images/modals/leagueUpcoming.png'
import { downloadLeagueIdentityIndexJson } from '../../../pages/leaguePage/logic/leagueIdentityIndexJson.logic.js'
import PasteArea from './PasteArea.js'
import ImportChoiceCard from './ImportChoiceCard.js'
import PreviewTable from './PreviewTable.js'
import { importModalChromeSx as chromeSx } from './sx/importModalChrome.sx.js'
import { leagueImportModalSx as sx } from './sx/leagueImportModal.sx.js'
import { pasteModalSx as pasteSx } from './sx/pasteModal.sx.js'

const STEPS = ['מצב ליגה', 'קליטת נתונים', 'זיהוי ואישור', 'סנכרון']

const SEASON_STATUS_OPTIONS = [
  {
    value: 'not_started',
    label: 'ליגה לא החלה',
    description: 'מסגרת הליגה בלבד, ללא נתוני ביצוע.',
    image: leagueUpcomingImage,
  },
  {
    value: 'active',
    label: 'ליגה פעילה',
    description: 'עדכון טבלת הליגה ונתוני הביצועים.',
    image: leagueActiveImage,
  },
  {
    value: 'completed',
    label: 'ליגה הסתיימה',
    description: 'נתוני העונה הסופיים יישמרו כהיסטוריה.',
    image: leagueCompletedImage,
  },
]

const FOOTER_BUTTON_SX = {
  minHeight: 36,
}

const TOOL_BUTTON_SX = {
  ...FOOTER_BUTTON_SX,
  minWidth: 112,
}



export default function LeagueImportModal({
  league = {},
  columns = [],
  leagueImport,
  placeholder = '',
}) {
  const [activeStep, setActiveStep] = React.useState(0)
  const [identityJsonOpen, setIdentityJsonOpen] = React.useState(false)
  const [structuralConfirmOpen, setStructuralConfirmOpen] = React.useState(false)
  const previewAdvanceRequestedRef = React.useRef(false)
  const leagueContext = [
    league.name,
    league.seasonKey ? `עונה ${league.seasonKey}` : '',
    league.birthYear && league.birthYear !== '-' ? `שנתון ${league.birthYear}` : '',
    league.ageGroup && league.ageGroup !== '-' ? league.ageGroup : '',
  ].filter(Boolean).join(' · ')
  const hasPreviewRows = Array.isArray(leagueImport.rows) && leagueImport.rows.length > 0
  const resolvedRowsCount = hasPreviewRows
    ? leagueImport.rows.filter(row => row?.valid !== false).length
    : 0
  const attentionRowsCount = hasPreviewRows ? leagueImport.rows.length - resolvedRowsCount : 0
  const seasonStatusReady = Boolean(leagueImport.seasonStatus)
  const hasSyncAttempt = Object.values(leagueImport.syncState || {}).some(state => (
    ['running', 'completed', 'failed'].includes(state?.status)
  ))
  const getLeagueImportRowStatus = React.useCallback(row => ({
    valid: row?.valid !== false,
    message: Array.isArray(row?.errors) ? row.errors.filter(Boolean).join(' ') : '',
  }), [])
  React.useEffect(() => {
    if (leagueImport.open) {
      previewAdvanceRequestedRef.current = false
      setStructuralConfirmOpen(false)
      setActiveStep(0)
    }
  }, [leagueImport.open])

  React.useEffect(() => {
    if (!previewAdvanceRequestedRef.current || !hasPreviewRows) return

    previewAdvanceRequestedRef.current = false
    setActiveStep(2)
  }, [hasPreviewRows])

  const seasonStatusControl = (
    <FormControl required sx={sx.seasonStatusField}>
      <Typography level='title-md' sx={sx.stepTitle}>
        מצב הליגה
      </Typography>

      <Typography level='body-sm' sx={sx.stepDescription}>
        בחר את מצב הליגה המתאים לטעינה.
      </Typography>

      <RadioGroup
        value={leagueImport.seasonStatus || ''}
        sx={sx.seasonStatusGroup}
        onChange={event => leagueImport.setSeasonStatus(event.target.value)}
      >
        {SEASON_STATUS_OPTIONS.map(option => {
          const disabled = option.value === 'not_started' && leagueImport.hasStartedData
          const selected = option.value === leagueImport.seasonStatus

          return (
            <ImportChoiceCard
              key={option.value}
              value={option.value}
              label={option.label}
              description={option.description}
              image={option.image}
              selected={selected}
              disabled={disabled}
              disabledHint={disabled
                ? 'לא ניתן לבחור מצב זה לאחר שנקלטו נתוני עונה פעילים.'
                : ''}
              cardSx={[
                selected ? sx.seasonStatusOptionSelected : null,
              ]}
            />
          )
        })}
      </RadioGroup>
    </FormControl>
  )
  const confirmDisabled = activeStep === 0
    ? !seasonStatusReady
    : activeStep === 1
      ? !leagueImport.pasteValue || !leagueImport.seasonStatus
      : activeStep === 2
        ? !leagueImport.canConfirm
        : !leagueImport.syncComplete
  const footerActions = activeStep === 1 ? (
    <ImportActionArea
      actions={[
        {
          id: 'back',
          label: 'חזרה למצב ליגה',
          iconId: 'back',
          presentationRole: 'back',
          disabled: leagueImport.busy,
          sx: chromeSx.backButton,
          onClick: () => setActiveStep(0),
        },
      ]}
    />
  ) : activeStep === 2 ? (
    <ImportActionArea
      actions={[
        {
          id: 'back',
          label: 'חזרה לקליטת נתונים',
          iconId: 'back',
          presentationRole: 'back',
          disabled: leagueImport.busy,
          sx: chromeSx.backButton,
          onClick: () => setActiveStep(1),
        },
      ]}
    />
  ) : activeStep === 3 ? (
    <ImportActionArea
      actions={[
        {
          id: 'back',
          label: 'חזרה לזיהוי ואישור',
          iconId: 'back',
          presentationRole: 'back',
          disabled: leagueImport.busy || hasSyncAttempt,
          sx: chromeSx.backButton,
          onClick: () => setActiveStep(2),
        },
      ]}
    />
  ) : null
  const oppositeFooterActions = activeStep === 1 && leagueImport.pasteValue ? (
    <ImportActionArea
      actions={[
        {
          id: 'clear',
          label: 'התחל מחדש',
          iconId: 'reset',
          presentationRole: 'secondary',
          disabled: leagueImport.busy,
          sx: TOOL_BUTTON_SX,
          onClick: () => {
            if (leagueImport.busy) return

            leagueImport.handleClear()
            setActiveStep(0)
          },
        },
      ]}
    />
  ) : activeStep === 2 && leagueImport.identityIndexDocument ? (
    <ImportActionArea
      actions={[
        {
          id: 'identity-json',
          label: 'מסמך זיהוי',
          iconId: 'dataShow',
          presentationRole: 'secondary',
          sx: TOOL_BUTTON_SX,
          onClick: () => setIdentityJsonOpen(true),
        },
      ]}
    />
  ) : null
  const handleConfirm = () => {
    if (activeStep === 0) {
      setActiveStep(1)
      return
    }

    if (activeStep === 1) {
      if (!hasPreviewRows) {
        previewAdvanceRequestedRef.current = true
        leagueImport.handlePreview()
        return
      }

      setActiveStep(2)
      return
    }

    if (activeStep === 2) {
      if (leagueImport.structuralChanges?.hasChanges && !leagueImport.structuralAcknowledged) {
        setStructuralConfirmOpen(true)
        return
      }
      if (leagueImport.handleApproveForSync()) setActiveStep(3)
      return
    }

    if (activeStep === 3 && leagueImport.syncComplete) handleClose()
  }
  const handleClose = () => {
    if (leagueImport.busy) return

    leagueImport.handleClear()
    leagueImport.handleClose()
  }
  const confirmStructuralChanges = () => {
    leagueImport.setStructuralAcknowledged(true)
    setStructuralConfirmOpen(false)
    if (leagueImport.handleApproveForSync()) setActiveStep(3)
  }
  const confirmLabel = activeStep === 0
    ? 'המשך לטעינת נתונים'
    : activeStep === 1
      ? hasPreviewRows ? 'המשך לזיהוי ואישור' : 'המשך לבדיקת נתונים'
      : activeStep === 2 ? 'אישור ומעבר לסנכרון' : 'סגור'

  return (
    <>
      <RegularModal
        open={leagueImport.open}
        title='טעינת נתוני ליגה'
        description={leagueContext}
        iconId='upload'
        busy={leagueImport.busy}
        disabled={confirmDisabled}
        confirmLabel={confirmLabel}
        confirmIconId={activeStep === 2 ? 'upload' : 'forward'}
        confirmLoadingPosition='start'
        size='xl'
        contentSx={pasteSx.modalContent}
        headerIconSx={chromeSx.modalHeaderIcon}
        footerActions={footerActions}
        oppositeFooterActions={oppositeFooterActions}
        footerSx={chromeSx.footer}
        onConfirm={handleConfirm}
        onClose={handleClose}
      >
        <Box sx={pasteSx.content}>
          <ModalStepper activeStep={activeStep} steps={STEPS} compact />

          {activeStep === 0 ? seasonStatusControl : null}

          {activeStep === 1 ? (
            <PasteArea
              value={leagueImport.pasteValue}
              placeholder={placeholder}
              onChange={leagueImport.setPasteValue}
              inputVariant='tall'
              templateText={placeholder}
            />
          ) : null}

          {activeStep === 2 ? (
            <PreviewTable
              columns={columns}
              rows={leagueImport.rows}
              title='זיהוי קבוצות'
              statusLabel='סטטוס'
              showSummaryCounts={false}
              hoverRow={false}
              summary={[
                {
                  key: 'teams',
                  label: `${leagueImport.rows.length} קבוצות`,
                  color: 'neutral',
                },
                {
                  key: 'resolved',
                  label: `${resolvedRowsCount} זוהו`,
                  color: 'success',
                },
                ...(attentionRowsCount > 0 ? [{
                  key: 'attention',
                  label: `${attentionRowsCount} לטיפול`,
                  color: 'warning',
                }] : []),
              ]}
              onCellChange={leagueImport.handleCellChange}
              getRowStatus={getLeagueImportRowStatus}
            />


          ) : null}

          {activeStep === 3 ? (
            <Box sx={sx.syncStepArea}>
              <Box sx={sx.syncPanel}>

              <Stack spacing={1}>
                {[
                  {
                    key: 'league',
                    title: 'שמירת טבלת הליגה',
                    description: 'שמירת מסמך הליגה הקנוני והעונה שאושרה.',
                    action: leagueImport.syncLeagueCanonical,
                    enabled: true,
                  },
                  {
                    key: 'leaguesMaster',
                    title: 'סנכרון אינדקס הליגות',
                    description: 'בנייה מחדש של Leagues Master ממסמכי הליגה הקנוניים.',
                    action: leagueImport.syncLeaguesMaster,
                    enabled: leagueImport.syncState.league?.status === 'completed',
                  },
                  {
                    key: 'identity',
                    title: 'סנכרון אינדקס הזיהוי',
                    description: 'עדכון זהויות הקבוצות של הליגה ושמירת ליגות אחרות ללא שינוי.',
                    action: leagueImport.syncLeagueIdentity,
                    enabled: leagueImport.syncState.leaguesMaster?.status === 'completed',
                  },
                  {
                    key: 'teams',
                    title: 'סנכרון קבוצות',
                    description: 'עדכון ביצועים ב־Team Season קיים וב־Team SearchIndex.',
                    action: leagueImport.syncLeagueTeams,
                    enabled: leagueImport.syncState.identity?.status === 'completed',
                  },
                  {
                    key: 'clubs',
                    title: 'סנכרון מועדונים',
                    description: 'עדכון Club projections וניקוי stale data בתחום הליגה הנוכחית.',
                    action: leagueImport.syncLeagueClubs,
                    enabled: leagueImport.syncState.teams?.status === 'completed',
                  },
                  {
                    key: 'clubsMaster',
                    title: 'סנכרון אינדקס המועדונים',
                    description: 'בנייה מחדש של Clubs Master ממסמכי המועדונים הקנוניים.',
                    action: leagueImport.syncClubsMaster,
                    enabled: leagueImport.syncState.clubs?.status === 'completed',
                  },
                ].map((step, index) => {
                  const state = leagueImport.syncState[step.key] || {}
                  const completed = state.status === 'completed'
                  const running = state.status === 'running'
                  const failed = state.status === 'failed'

                  return (
                    <Box key={step.key} sx={sx.syncStep}>
                      <Box sx={sx.syncStepNumber}>{completed ? '✓' : index + 1}</Box>
                      <Box sx={sx.syncStepContent}>
                        <Stack direction='row' spacing={1} alignItems='center'>
                          <Typography level='title-sm'>{step.title}</Typography>
                          {completed ? <Chip size='sm' color='success' variant='soft'>הושלם</Chip> : null}
                          {failed ? <Chip size='sm' color='danger' variant='soft'>נכשל</Chip> : null}
                        </Stack>
                        <Typography level='body-xs' sx={sx.syncScopeHint}>
                          {step.description}
                        </Typography>
                        {failed && state.error ? (
                          <Typography level='body-xs' color='danger' sx={sx.syncError}>
                            {state.error}
                          </Typography>
                        ) : null}
                      </Box>
                      <Button
                        size='sm'
                        variant={completed ? 'soft' : 'solid'}
                        color={failed ? 'danger' : completed ? 'success' : 'primary'}
                        disabled={!step.enabled || leagueImport.busy || completed}
                        startDecorator={running ? <CircularProgress size='sm' /> : null}
                        onClick={step.action}
                      >
                        {running ? 'מבצע...' : failed ? 'נסה שוב' : completed ? 'הושלם' : 'בצע'}
                      </Button>
                    </Box>
                  )
                })}
              </Stack>

              {leagueImport.syncComplete ? (
                <Box sx={sx.syncComplete}>
                  <Typography level='title-md' color='success'>
                    כל שלבי טעינת הליגה הושלמו
                  </Typography>
                  <Typography level='body-sm' sx={sx.syncScopeHint}>
                    התהליך הסתיים. כעת נשאר רק לסגור את המודאל.
                  </Typography>
                </Box>
              ) : null}
            </Box>
            </Box>
          ) : null}
        </Box>
      </RegularModal>
      <JsonViewerModal
        open={identityJsonOpen}
        title='אינדקס זיהוי קבוצות · JSON'
        description='זהו מסמך ה־JSON שנקרא בפועל לצורך זיהוי הופעת מועדון בליגה אחרת באותה עונה ושנתון.'
        data={leagueImport.identityIndexDocument || {}}
        onClose={() => setIdentityJsonOpen(false)}
        onDownload={() => downloadLeagueIdentityIndexJson(leagueImport.identityIndexDocument || {})}
      />
      <ConfirmModal
        open={structuralConfirmOpen}
        title='אישור שינויי מבנה בליגה'
        message={`זוהו שינויים במבנה הליגה: נוספו ${leagueImport.structuralChanges?.added.length || 0}, הוסרו ${leagueImport.structuralChanges?.removed.length || 0}, שונו ${leagueImport.structuralChanges?.changed.length || 0}.`}
        confirmLabel='מאשר וממשיך לסנכרון'
        cancelLabel='חזרה לעריכה'
        onConfirm={confirmStructuralChanges}
        onClose={() => setStructuralConfirmOpen(false)}
      />
    </>
  )
}