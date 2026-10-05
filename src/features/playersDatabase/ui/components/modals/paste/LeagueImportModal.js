// src/features/playersDatabase/ui/components/modals/paste/LeagueImportModal.js

import * as React from 'react'
import {
  Alert,
  Box,
  CircularProgress,
  FormControl,
  FormLabel,
  Input,
  RadioGroup,
  Typography,
} from '@mui/joy'

import ImportActionArea from '../ImportActionArea.js'
import ConfirmModal from '../ConfirmModal.js'
import ModalStepper from '../ModalStepper.js'
import RegularModal from '../RegularModal.js'
import leagueActiveImage from '../../../../../../ui/core/images/modals/leagueActive.png'
import leagueCompletedImage from '../../../../../../ui/core/images/modals/leagueCompleted.png'
import leagueUpcomingImage from '../../../../../../ui/core/images/modals/leagueUpcoming.png'
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
    description: 'נתוני העונה הסופיים יישמרו בעונה הקנונית.',
    image: leagueCompletedImage,
  },
]

const TOOL_BUTTON_SX = {
  minHeight: 36,
  minWidth: 112,
}

export default function LeagueImportModal({
  league = {},
  columns = [],
  leagueImport,
  placeholder = '',
}) {
  const [activeStep, setActiveStep] = React.useState(0)
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
    ? leagueImport.rows.filter(row => row && row.valid !== false).length
    : 0
  const attentionRowsCount = hasPreviewRows ? leagueImport.rows.length - resolvedRowsCount : 0
  const seasonStatusReady = Boolean(leagueImport.seasonStatus)
  const executionReady = leagueImport.executionStatus === 'ready'
  const executionFailed = leagueImport.executionStatus === 'failed'
  const executionSucceeded = leagueImport.executionStatus === 'succeeded'

  const getLeagueImportRowStatus = React.useCallback(row => ({
    valid: row && row.valid !== false,
    message: Array.isArray(row && row.errors) ? row.errors.filter(Boolean).join(' ') : '',
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

  const confirmDisabled = activeStep === 0
    ? !seasonStatusReady || !leagueImport.gameDurationValid
    : activeStep === 1
      ? !leagueImport.pasteValue || !leagueImport.seasonStatus
      : activeStep === 2
        ? !leagueImport.canConfirm
        : leagueImport.busy || (!executionReady && !executionFailed && !executionSucceeded)

  const footerActions = activeStep === 1 ? (
    <ImportActionArea
      actions={[{
        id: 'back',
        label: 'חזרה למצב ליגה',
        iconId: 'back',
        presentationRole: 'back',
        disabled: leagueImport.busy,
        sx: chromeSx.backButton,
        onClick: () => setActiveStep(0),
      }]}
    />
  ) : activeStep === 2 ? (
    <ImportActionArea
      actions={[{
        id: 'back',
        label: 'חזרה לקליטת נתונים',
        iconId: 'back',
        presentationRole: 'back',
        disabled: leagueImport.busy,
        sx: chromeSx.backButton,
        onClick: () => setActiveStep(1),
      }]}
    />
  ) : activeStep === 3 && executionReady ? (
    <ImportActionArea
      actions={[{
        id: 'back',
        label: 'חזרה לזיהוי ואישור',
        iconId: 'back',
        presentationRole: 'back',
        disabled: leagueImport.busy,
        sx: chromeSx.backButton,
        onClick: () => setActiveStep(2),
      }]}
    />
  ) : null

  const oppositeFooterActions = activeStep === 1 && leagueImport.pasteValue ? (
    <ImportActionArea
      actions={[{
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
      }]}
    />
  ) : null

  const approveAndAdvance = () => {
    if (leagueImport.structuralChanges && leagueImport.structuralChanges.hasChanges && !leagueImport.structuralAcknowledged) {
      setStructuralConfirmOpen(true)
      return
    }
    if (leagueImport.handleApproveForSync()) setActiveStep(3)
  }

  const handleConfirm = async () => {
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
      approveAndAdvance()
      return
    }

    if (executionSucceeded) {
      leagueImport.finishLeagueImport()
      return
    }

    await leagueImport.executeApprovedImport()
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
      : activeStep === 2
        ? 'אישור ומעבר לסנכרון'
        : executionSucceeded
          ? 'סגור'
          : executionFailed
            ? leagueImport.retryMode === 'repair'
              ? 'תקן תוצרים'
              : 'נסה שוב'
            : 'בצע טעינה'

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
        confirmIconId={activeStep === 2 || activeStep === 3 ? 'upload' : 'forward'}
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

          {activeStep === 0 ? (
            <Box>
              <FormControl required sx={sx.seasonStatusField}>
                <Typography level='title-md' sx={sx.stepTitle}>מצב הליגה</Typography>
                <Typography level='body-sm' sx={sx.stepDescription}>בחר את מצב הליגה המתאים לטעינה.</Typography>
                <RadioGroup
                  value={leagueImport.seasonStatus || ''}
                  sx={sx.seasonStatusGroup}
                  onChange={event => leagueImport.setSeasonStatus(event.target.value)}
                >
                  {SEASON_STATUS_OPTIONS.map(option => {
                    const disabled = option.value === 'not_started' && leagueImport.hasStartedData
                    return (
                      <ImportChoiceCard
                        key={option.value}
                        value={option.value}
                        label={option.label}
                        description={option.description}
                        image={option.image}
                        selected={option.value === leagueImport.seasonStatus}
                        disabled={disabled}
                        disabledHint={disabled ? 'לא ניתן לבחור מצב זה לאחר שנקלטו נתוני עונה פעילים.' : ''}
                      />
                    )
                  })}
                </RadioGroup>
              </FormControl>
              <FormControl required sx={{ mt: 2, maxWidth: 240 }}>
                <FormLabel>משך משחק בדקות — לקריאה בלבד</FormLabel>
                <Input
                  type='number'
                  slotProps={{ input: { min: 1, step: 1, readOnly: true } }}
                  value={leagueImport.gameDurationMinutes}
                />
                <Typography level='body-xs' sx={{ mt: 0.5 }}>
                  הערך נקבע אוטומטית לפי קבוצת הגיל.
                </Typography>
              </FormControl>
            </Box>
          ) : null}

          {activeStep === 1 ? (
            <Box>
              <PasteArea
                value={leagueImport.pasteValue}
                placeholder={placeholder}
                onChange={leagueImport.setPasteValue}
                inputVariant='tall'
                templateText={placeholder}
              />
            </Box>
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
                { key: 'teams', label: `${leagueImport.rows.length} קבוצות`, color: 'neutral' },
                { key: 'resolved', label: `${resolvedRowsCount} זוהו`, color: 'success' },
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
                <Box sx={sx.syncHeader}>
                  <Typography level='title-md' sx={sx.syncTitle}>
                    סדר עדכון המסמכים
                  </Typography>
                  <Typography level='body-sm' sx={sx.syncDescription}>
                    לחיצה אחת מפעילה את כל השלבים לפי הסדר. כל שלב מעדכן את
                    היעד שבבעלותו, ובסיום מתבצעת בדיקה והקבלה נסגרת.
                  </Typography>
                </Box>

                <Box sx={sx.syncScope}>
                  {leagueImport.syncStages.map((stage, index) => (
                    <Box key={stage.id} sx={sx.syncStep}>
                      <Box sx={sx.syncStepNumber}>{index + 1}</Box>
                      <Box sx={sx.syncStepContent}>
                        <Typography level='title-sm'>{stage.title}</Typography>
                        <Typography level='body-xs' sx={sx.syncScopeHint}>
                          {stage.target}
                        </Typography>
                      </Box>
                      <Typography level='body-xs' color={
                        stage.state === 'completed'
                          ? 'success'
                          : stage.state === 'failed'
                            ? 'danger'
                            : stage.state === 'running'
                              ? 'primary'
                              : 'neutral'
                      }>
                        {stage.state === 'completed'
                          ? 'הושלם'
                          : stage.state === 'failed'
                            ? 'נכשל'
                            : stage.state === 'running'
                              ? 'בתהליך'
                              : 'ממתין'}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {leagueImport.busy ? (
                  <Box sx={sx.syncProgress}>
                    <CircularProgress size='sm' />
                    <Box>
                      <Typography level='title-sm'>טעינת הליגה מתבצעת</Typography>
                      <Typography level='body-xs' sx={sx.syncScopeHint}>
                        אין לסגור את החלון עד לסיום הכתיבה והבדיקה.
                      </Typography>
                    </Box>
                  </Box>
                ) : null}

                {executionReady ? (
                  <Alert color='primary' variant='soft'>
                    הנתונים אושרו. לחיצה על „בצע טעינה” תעדכן את היעדים המוצגים
                    לפי הסדר כפעולה מאושרת אחת.
                  </Alert>
                ) : null}

                {executionFailed ? (
                  <Alert color='danger' variant='soft'>
                    <Box>
                      <Typography level='body-sm'>
                        {leagueImport.executionError || 'הפעולה לא הושלמה.'}
                      </Typography>
                      <Typography level='body-xs' sx={{ mt: 0.5 }}>
                        {leagueImport.retryMode === 'repair'
                          ? 'מקור האמת כבר אושר. הפעולה הבאה תתקן רק את התוצרים באותה קבלה.'
                          : 'מקור האמת לא אושר. ניסיון חוזר ישתמש בקלט המאושר ובאותה קבלה.'}
                      </Typography>
                    </Box>
                  </Alert>
                ) : null}

                {executionSucceeded ? (
                  <Alert color='success' variant='soft'>
                    טעינת הליגה, התוצרים הנגזרים והבדיקה הושלמו בהצלחה.
                  </Alert>
                ) : null}

                {leagueImport.receiptId ? (
                  <Typography level='body-xs'>Receipt: {leagueImport.receiptId}</Typography>
                ) : null}
              </Box>
            </Box>
          ) : null}
        </Box>
      </RegularModal>

      <ConfirmModal
        open={structuralConfirmOpen}
        title='אישור שינוי מבני בליגה'
        description='נמצאו קבוצות שנוספו, הוסרו או שינו שיוך. האם להמשיך עם הנתונים שאושרו?'
        confirmLabel='אישור והמשך'
        onConfirm={confirmStructuralChanges}
        onClose={() => setStructuralConfirmOpen(false)}
      />
    </>
  )
}
