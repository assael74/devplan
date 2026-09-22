// src/features/playersDatabase/ui/components/modals/paste/LeagueImportModal.js

import * as React from 'react'

import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/joy'

import ImportActionArea from '../ImportActionArea.js'
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

const PROJECTION_JOB_STATUS = {
  queued: {
    color: 'warning',
    label: 'ממתין',
    title: 'הסנכרון ממתין להתחלה',
    description: 'טבלת הליגה נשמרה. סנכרון ביצועי הקבוצות יתחיל אוטומטית.',
  },
  processing: {
    color: 'primary',
    label: 'בתהליך',
    title: 'סנכרון ביצועי הקבוצות מתבצע',
    description: 'אפשר להמשיך לעבוד. הפעולה אינה חוסמת את המערכת.',
  },
  completed: {
    color: 'success',
    label: 'הושלם',
    title: 'סנכרון ביצועי הקבוצות הושלם',
    description: 'הביצועים עודכנו עבור קבוצות שכבר קיימות בעונה.',
  },
  failed: {
    color: 'danger',
    label: 'נכשל',
    title: 'סנכרון ביצועי הקבוצות נכשל',
    description: 'טבלת הליגה נשמרה. אפשר לנסות שוב ללא טעינה מחדש של הקובץ.',
  },
  superseded: {
    color: 'neutral',
    label: 'הוחלף',
    title: 'הטעינה הוחלפה בטעינה חדשה יותר',
    description: 'לא בוצעו עדכונים נוספים מהטעינה הישנה.',
  },
}

export default function LeagueImportModal({
  league = {},
  columns = [],
  leagueImport,
  placeholder = '',
}) {
  const [activeStep, setActiveStep] = React.useState(0)
  const [identityJsonOpen, setIdentityJsonOpen] = React.useState(false)
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
  const projectionJobStatus = PROJECTION_JOB_STATUS[leagueImport.projectionJob?.status] || {
    color: 'neutral',
    label: 'מכין',
    title: 'מכין את הסנכרון',
    description: 'טבלת הליגה נשמרה והמערכת יוצרת את פעולת הרקע.',
  }
  const projectionResult = leagueImport.projectionJob?.stageResults?.teamSeasonProjections || {}
  const updatedTeamsCount = Number(projectionResult.updatedCount || 0)
  const missingTeamsCount = Array.isArray(projectionResult.missingTeamSeasonIds)
    ? projectionResult.missingTeamSeasonIds.length
    : 0
  const getLeagueImportRowStatus = React.useCallback(row => ({
    valid: row?.valid !== false,
    message: Array.isArray(row?.errors) ? row.errors.filter(Boolean).join(' ') : '',
  }), [])
  React.useEffect(() => {
    if (leagueImport.open) {
      previewAdvanceRequestedRef.current = false
      setActiveStep(0)
    }
  }, [leagueImport.open])

  React.useEffect(() => {
    if (!previewAdvanceRequestedRef.current || !hasPreviewRows) return

    previewAdvanceRequestedRef.current = false
    setActiveStep(2)
  }, [hasPreviewRows])

  React.useEffect(() => {
    if (leagueImport.projectionJobId) setActiveStep(3)
  }, [leagueImport.projectionJobId])

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
        : false
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

    if (activeStep === 3) {
      handleClose()
      return
    }

    leagueImport.handleConfirm()
  }
  const handleClose = () => {
    if (leagueImport.busy) return

    leagueImport.handleClear()
    leagueImport.handleClose()
  }
  const confirmLabel = activeStep === 0
    ? 'המשך לטעינת נתונים'
    : activeStep === 1
      ? hasPreviewRows ? 'המשך לזיהוי ואישור' : 'המשך לבדיקת נתונים'
      : activeStep === 2 ? 'אישור טעינה' : 'סגור'

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
            <Box sx={sx.syncPanel}>
              <Stack direction='row' spacing={1.25} alignItems='center'>
                {!['completed', 'failed'].includes(leagueImport.projectionJob?.status) ? (
                  <CircularProgress size='sm' color={projectionJobStatus.color} />
                ) : null}
                <Box sx={sx.syncHeading}>
                  <Chip size='sm' variant='soft' color={projectionJobStatus.color}>
                    {projectionJobStatus.label}
                  </Chip>
                  <Typography level='title-lg' color={projectionJobStatus.color}>
                    {projectionJobStatus.title}
                  </Typography>
                </Box>
              </Stack>
              <Typography level='body-sm' sx={sx.syncDescription}>
                {projectionJobStatus.description}
              </Typography>
              <Divider />
              <Box sx={sx.syncScope}>
                <Typography level='title-sm'>מה מסתנכרן?</Typography>
                <Typography level='body-sm'>
                  מיקום, דירוג התקפי והגנתי, משחקים, שערים ונקודות — ב־Team Season ובאינדקס הקבוצה הקיים.
                </Typography>
                <Typography level='body-xs' sx={sx.syncScopeHint}>
                  הסנכרון אינו יוצר קבוצות, סגלים או מסמכי שחקנים חדשים.
                </Typography>
              </Box>
              {leagueImport.projectionJob?.status === 'completed' ? (
                <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap'>
                  <Chip size='sm' color='success' variant='soft'>
                    {updatedTeamsCount} קבוצות עודכנו
                  </Chip>
                  {missingTeamsCount ? (
                    <Chip size='sm' color='warning' variant='soft'>
                      {missingTeamsCount} קבוצות טרם קיימות בעונה
                    </Chip>
                  ) : null}
                </Stack>
              ) : null}
              {leagueImport.projectionJob?.error?.message ? (
                <Typography level='body-xs' color='danger' sx={sx.syncError}>
                  {leagueImport.projectionJob.error.message}
                </Typography>
              ) : null}
              {leagueImport.projectionJob?.status === 'failed' ? (
                <Button
                  color='danger'
                  variant='soft'
                  loading={leagueImport.retryingProjectionJob}
                  onClick={leagueImport.retryProjectionJob}
                  sx={sx.syncRetryButton}
                >
                  נסה שוב
                </Button>
              ) : null}
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
    </>
  )
}
