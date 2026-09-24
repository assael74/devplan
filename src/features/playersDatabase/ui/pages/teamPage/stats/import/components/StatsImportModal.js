// src/features/playersDatabase/ui/pages/teamPage/stats/import/components/StatsImportModal.js

import * as React from 'react'
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  RadioGroup,
  Stack,
  Tooltip,
  Typography,
} from '@mui/joy'

import {
  PLAYER_STATS_PLACEHOLDER,
  STATS_SEASON_STATUS_OPTIONS,
} from '../logic/statsImport.constants.js'
import ImportActionArea from '../../../../../components/modals/ImportActionArea.js'
import ImportModalContextDescription from '../../../../../components/modals/ImportModalContextDescription.js'
import ModalStepper from '../../../../../components/modals/ModalStepper.js'
import RegularModal from '../../../../../components/modals/RegularModal.js'
import ImportChoiceCard from '../../../../../components/modals/paste/ImportChoiceCard.js'
import PasteArea from '../../../../../components/modals/paste/PasteArea.js'
import PreviewTable from '../../../../../components/modals/paste/PreviewTable.js'
import TeamSeasonChoiceCards from '../../../../../components/modals/paste/TeamSeasonChoiceCards.js'
import { importModalChromeSx as chromeSx } from '../../../../../components/modals/paste/sx/importModalChrome.sx.js'
import { pasteModalSx as pasteSx } from '../../../../../components/modals/paste/sx/pasteModal.sx.js'
import { statsImportModalSx as sx } from '../sx/statsImportModal.sx.js'
import leagueActiveImage from '../../../../../../../../ui/core/images/modals/leagueActive.png'
import leagueCompletedImage from '../../../../../../../../ui/core/images/modals/leagueCompleted.png'

const STEPS = ['הקשר טעינה', 'קליטת נתונים', 'זיהוי ואישור', 'סנכרון']

const PROJECTION_JOB_STATUS = {
  queued: { color: 'neutral', label: 'ממתין', title: 'הסנכרון ממתין להתחלה', description: 'נתוני הסטטיסטיקה נשמרו. בדיקת הסנכרון תתחיל אוטומטית.' },
  processing: { color: 'primary', label: 'בתהליך', title: 'סנכרון נתוני הסטטיסטיקה מתבצע', description: 'המערכת בודקת מסמכי שחקנים, אינדקסים והשלכות של הקבוצה והעונה.' },
  completed: { color: 'success', label: 'הושלם', title: 'סנכרון נתוני הסטטיסטיקה הושלם', description: 'המסמכים הנגזרים נבדקו מול נתוני הקבוצה והעונה שנשמרו.' },
  failed: { color: 'danger', label: 'נכשל', title: 'סנכרון נתוני הסטטיסטיקה נכשל', description: 'נתוני הסטטיסטיקה נשמרו; אפשר לנסות שוב את הסנכרון בלבד.' },
  superseded: { color: 'neutral', label: 'הוחלף', title: 'הטעינה הוחלפה בטעינה חדשה יותר', description: 'לא בוצעו עדכונים נוספים מהטעינה הישנה.' },
}

function clean(value) {
  return String(value || '').trim()
}

const formatValidationNumber = value => new Intl.NumberFormat('en-US').format(value)

function ValidationCheckChip({ check, onApplyMinutesAdjustment }) {
  const isValid = check?.valid === true
  const hasNumbers = Number.isFinite(check?.actual) && Number.isFinite(check?.limit)
  const difference = Number(check?.difference || 0)
  const valueLabel = hasNumbers
    ? isValid
      ? 'תקין'
      : `חריגה ${formatValidationNumber(difference)}`
    : 'לא תקין'
  const adjustment = check?.adjustment

  return (
    <Box sx={sx.validationCheckWrap}>
      <Chip
        size='sm'
        variant='soft'
        color={isValid ? 'success' : 'danger'}
        sx={[sx.validationIssuesChip, isValid ? sx.validationValidChip : sx.validationInvalidChip]}
      >
        <Box component='span' sx={sx.validationCheckLabel}>{check.label}</Box>
        <Box component='span' sx={sx.validationCheckValue}>{valueLabel}</Box>
      </Chip>
      {adjustment ? (
        <Button
          size='sm'
          variant='soft'
          color='danger'
          sx={sx.validationAdjustmentAction}
          onClick={() => onApplyMinutesAdjustment?.(adjustment)}
        >
          הפחת דקה מכל השחקנים
        </Button>
      ) : null}
    </Box>
  )
}

function RosterExceptionsChip({ summary = {} }) {
  const count = Number(summary.exceptionRowsCount || 0)
  if (!count) return null

  return (
    <Chip size='sm' variant='soft' color='warning' sx={sx.rosterExceptionsChip}>
      {`חריגי סגל: ${count}`}
    </Chip>
  )
}

function MovementPreviewChips({ preview = {} }) {
  const existingIncomingCount = Number(preview.existingIncomingCount || 0)
  const newPlayerCount = Number(preview.newPlayerCount || 0)
  const decisionRequiredCount = Number(preview.decisionRequiredCount || 0)
  const leftCount = Number(preview.leftCount || 0)
  const joinedCount = Number(preview.joinedCount || 0)
  const youngerAgeGroupCount = Number(preview.youngerAgeGroupCount || 0)

  return (
    <>
      {existingIncomingCount ? (
        <Tooltip title='שחקנים מזוהים שאינם בסגל הנוכחי. באישור הם ייכנסו לסגל, והמערכת תתעד מעבר אוטומטי רק אם מקור קודם ודאי נמצא.'>
          <Chip size='sm' variant='soft' color='primary' sx={sx.rosterExceptionsChip}>
            {`כניסות מזוהות: ${existingIncomingCount}`}
          </Chip>
        </Tooltip>
      ) : null}
      {newPlayerCount ? (
        <Tooltip title='שחקנים חדשים ללא עבר מזוהה. הם ייכנסו לסגל, ללא עובדת מעבר מומצאת.'>
          <Chip size='sm' variant='soft' color='neutral' sx={sx.rosterExceptionsChip}>
            {`שחקנים חדשים: ${newPlayerCount}`}
          </Chip>
        </Tooltip>
      ) : null}
      {decisionRequiredCount ? (
        <Tooltip title='יש לפתור את זהות השחקן לפני טעינת הסטטיסטיקה.'>
          <Chip size='sm' variant='soft' color='danger' sx={sx.rosterExceptionsChip}>
            {`דורש הכרעה: ${decisionRequiredCount}`}
          </Chip>
        </Tooltip>
      ) : null}
      {leftCount ? (
        <Tooltip title='שחקנים שסווגו כמי שעזבו במהלך העונה.'>
          <Chip size='sm' variant='soft' color='neutral' sx={sx.rosterExceptionsChip}>
            {`עזבו: ${leftCount}`}
          </Chip>
        </Tooltip>
      ) : null}
      {joinedCount ? (
        <Tooltip title='שחקנים שסווגו כמי שהצטרפו במהלך העונה.'>
          <Chip size='sm' variant='soft' color='primary' sx={sx.rosterExceptionsChip}>
            {`הצטרפו: ${joinedCount}`}
          </Chip>
        </Tooltip>
      ) : null}
      {youngerAgeGroupCount ? (
        <Tooltip title='שחקנים משנתון צעיר שהשתתפו בעונה.'>
          <Chip size='sm' variant='soft' color='success' sx={sx.rosterExceptionsChip}>
            {`צעירים: ${youngerAgeGroupCount}`}
          </Chip>
        </Tooltip>
      ) : null}
    </>
  )
}

export default function StatsImportModal({
  team,
  seasonKey,
  activeSeasonOptionKey,
  hasTeamPlayers,
  columns,
  source,
  controller,
}) {
  const teamUrl = clean(source.teamUrl || team.teamUrl)
  const leagueName = clean(source.leagueName || team.leagueName)
  const leagueUrl = clean(source.leagueUrl || team?.domain?.metadata?.seasonUrl)
  const hasPreviewRows = controller.rows.length > 0
  const projectionJobStatus = PROJECTION_JOB_STATUS[controller.projectionJob?.status] || PROJECTION_JOB_STATUS.queued
  const [activeStep, setActiveStep] = React.useState(0)
  const previewAdvanceRequestedRef = React.useRef(false)
  React.useEffect(() => {
    if (controller.open) {
      previewAdvanceRequestedRef.current = false
      setActiveStep(0)
    }
  }, [controller.open])

  React.useEffect(() => {
    if (controller.projectionJobId) setActiveStep(3)
  }, [controller.projectionJobId])

  React.useEffect(() => {
    if (!previewAdvanceRequestedRef.current || !hasPreviewRows) return

    previewAdvanceRequestedRef.current = false
    setActiveStep(2)
  }, [hasPreviewRows])

  const description = (
    <ImportModalContextDescription
      items={[
        { label: team.name || 'קבוצה', href: teamUrl },
        { label: leagueName || 'ליגה', href: leagueUrl },
        { label: seasonKey ? `עונה ${seasonKey}` : '' },
        { label: team.birthYear ? `שנתון ${team.birthYear}` : '' },
      ]}
    />
  )

  const selectionControls = (
    <Box sx={sx.selectionPanel}>
      <Box sx={sx.choiceSection}>
        <Typography level='title-sm' sx={sx.choiceSectionTitle}>
          עונת פעולה
        </Typography>
        <TeamSeasonChoiceCards
          seasonOptions={controller.seasonOptions}
          activeSeasonOptionKey={activeSeasonOptionKey}
          value={controller.selectedSeasonOptionKey}
          onChange={controller.selectSeasonOption}
          sx={sx.seasonCards}
        />
      </Box>

      <Box sx={sx.choiceSection}>
        <Typography level='title-sm' sx={sx.choiceSectionTitle}>
          סוג טעינת הסטטיסטיקה
        </Typography>
        <RadioGroup
          value={controller.seasonStatus || ''}
          sx={sx.statsTypeCards}
          onChange={event => controller.changeSeasonStatus(event.target.value)}
        >
          {STATS_SEASON_STATUS_OPTIONS.map(option => {
            const selected = option.value === controller.seasonStatus
            const image = option.value === 'completed'
              ? leagueCompletedImage
              : leagueActiveImage

            return (
              <ImportChoiceCard
                key={option.value}
                value={option.value}
                label={option.label}
                description={option.description}
                descriptionLevel='body-sm'
                image={image}
                selected={selected}
                size='large'
              />
            )
          })}
        </RadioGroup>
      </Box>
    </Box>
  )

  const validationChecks = controller.validation.checks || []
  const contextReady = Boolean(controller.selectedSeasonOption && controller.seasonStatus)
  const finalConfirmDisabled = (
    !hasTeamPlayers ||
    controller.hasInvalidRows ||
    controller.movementPreview.requiresDecision ||
    controller.approvedStatsPlanPreparing ||
    !controller.approvedStatsPlan ||
    !contextReady
  )
  const confirmDisabled = activeStep === 3
    ? false
    : activeStep === 0
    ? !contextReady
    : activeStep === 1
      ? !controller.pasteValue || !contextReady
      : finalConfirmDisabled || !hasPreviewRows
  const footerActions = activeStep === 1 ? (
    <ImportActionArea
      actions={[
        {
          id: 'back',
          label: 'חזרה להקשר טעינה',
          iconId: 'forward',
          presentationRole: 'back',
          disabled: controller.busy,
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
          iconId: 'forward',
          presentationRole: 'back',
          disabled: controller.busy,
          sx: chromeSx.backButton,
          onClick: () => setActiveStep(1),
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
      if (hasPreviewRows) {
        setActiveStep(2)
        return
      }

      previewAdvanceRequestedRef.current = true
      controller.parse()
      return
    }

    if (activeStep === 3) {
      handleClose()
      return
    }

    controller.confirm()
  }
  const handleClose = () => {
    if (controller.busy) return

    controller.clearPaste()
    controller.close()
  }
  const confirmLabel = activeStep === 0
    ? 'המשך לקליטת נתונים'
    : activeStep === 1
      ? 'המשך לזיהוי ואישור'
      : activeStep === 2 ? 'אישור טעינת סטטיסטיקות' : 'סגור'

  return (
    <RegularModal
      open={controller.open}
      title={`טעינת סטטיסטיקות - ${team.name}`}
      description={description}
      iconId='addStats'
      busy={controller.busy}
      disabled={confirmDisabled}
      confirmLabel={confirmLabel}
      confirmIconId={activeStep === 2 ? 'upload' : activeStep === 3 ? 'next' : 'next'}
      size='xl'
      contentSx={pasteSx.modalContent}
      headerIconSx={sx.modalHeaderIcon}
      footerSx={chromeSx.footer}
      footerActions={footerActions}
      onConfirm={handleConfirm}
      onClose={handleClose}
    >
      <Box sx={pasteSx.content}>
        <ModalStepper activeStep={activeStep} steps={STEPS} compact />

        {activeStep === 0 ? selectionControls : null}

        {activeStep === 1 ? (
          <PasteArea
            value={controller.pasteValue}
            placeholder={PLAYER_STATS_PLACEHOLDER}
            compact={hasPreviewRows}
            onChange={controller.setPasteValue}
            inputVariant='tall'
            templateText={PLAYER_STATS_PLACEHOLDER}
          />
        ) : null}

        {activeStep === 2 ? (
          <>
            {controller.approvedStatsPlanError ? (
              <Stack spacing={1} alignItems='flex-start'>
                <Typography level='body-sm' color='danger'>
                  הכנת תוכנית הטעינה נכשלה. אפשר לנסות שוב ללא שינוי הנתונים.
                </Typography>
                <Button
                  size='sm'
                  color='danger'
                  variant='soft'
                  loading={controller.approvedStatsPlanPreparing}
                  onClick={controller.retryApprovedStatsPlan}
                >
                  נסה שוב
                </Button>
              </Stack>
            ) : null}
            <PreviewTable
              columns={columns}
              rows={controller.rows}
              onCellChange={controller.changeCell}
              getRowStatus={controller.getRowStatus}
              getCellStatus={controller.getCellStatus}
              showSummaryCounts={false}
              summary={[
                {
                  key: 'roster-exceptions',
                  render: () => (
                    <RosterExceptionsChip summary={controller.rosterExceptionsSummary} />
                  ),
                },
                {
                  key: 'movement-preview',
                  render: () => (
                    <MovementPreviewChips preview={controller.movementPreview} />
                  ),
                },
                ...validationChecks.map(check => ({
                  key: check.code,
                  render: () => (
                    <ValidationCheckChip
                      check={check}
                      onApplyMinutesAdjustment={controller.applyEqualMinutesReduction}
                    />
                  ),
                })),
              ]}
            />
          </>
        ) : null}

        {activeStep === 3 ? (
          <Box sx={sx.syncPanel}>
            <Stack direction='row' spacing={1.25} alignItems='center'>
              {!['completed', 'failed'].includes(controller.projectionJob?.status) ? (
                <CircularProgress size='sm' color={projectionJobStatus.color} />
              ) : null}
              <Box sx={sx.syncHeading}>
                <Chip size='sm' variant='soft' color={projectionJobStatus.color}>{projectionJobStatus.label}</Chip>
                <Typography level='title-lg' color={projectionJobStatus.color}>
                  {projectionJobStatus.title}
                </Typography>
              </Box>
            </Stack>
            <Typography level='body-sm' sx={sx.syncDescription}>{projectionJobStatus.description}</Typography>
            <Divider />
            <Box sx={sx.syncScope}>
              <Typography level='title-sm'>מה מסתנכרן?</Typography>
              <Typography level='body-sm'>
                פרופילי סקאוט, עמדות, איזון, דקות משחק, העברות ואינדקסי שחקנים — לפי נתוני הסטטיסטיקה שנשמרו.
              </Typography>
              <Typography level='body-xs' sx={sx.syncScopeHint}>
                הסנכרון אינו טוען נתונים חדשים ואינו משנה את טבלת הליגה.
              </Typography>
            </Box>
            {controller.projectionJob?.stageResults?.canonicalSource ? (
              <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap'>
                <Chip size='sm' variant='soft' color='neutral'>
                  {controller.projectionJob.stageResults.canonicalSource.playersCount || 0} שחקנים
                </Chip>
                <Chip size='sm' variant='soft' color='neutral'>
                  {controller.projectionJob.stageResults.playerIndexes?.playerIndexCount || 0} אינדקסים
                </Chip>
              </Stack>
            ) : null}
            {controller.projectionJob?.error?.message ? (
              <Typography level='body-xs' color='danger' sx={sx.syncError}>{controller.projectionJob.error.message}</Typography>
            ) : null}
            {controller.projectionJob?.status === 'failed' ? (
              <Button
                color='danger'
                variant='soft'
                loading={controller.retryingProjectionJob}
                onClick={controller.retryProjectionJob}
                sx={sx.syncRetryButton}
              >
                נסה שוב
              </Button>
            ) : null}
          </Box>
        ) : null}
      </Box>
    </RegularModal>
  )
}
