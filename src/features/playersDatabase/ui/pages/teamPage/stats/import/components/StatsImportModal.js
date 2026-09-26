// src/features/playersDatabase/ui/pages/teamPage/stats/import/components/StatsImportModal.js

import * as React from 'react'
import {
  Box,
  Button,
  Chip,
  Stack,
  Tooltip,
  Typography,
} from '@mui/joy'

import {
  PLAYER_STATS_PLACEHOLDER,
} from '../logic/statsImport.constants.js'
import ImportActionArea from '../../../../../components/modals/ImportActionArea.js'
import ImportModalContextDescription from '../../../../../components/modals/ImportModalContextDescription.js'
import ModalStepper from '../../../../../components/modals/ModalStepper.js'
import RegularModal from '../../../../../components/modals/RegularModal.js'
import PasteArea from '../../../../../components/modals/paste/PasteArea.js'
import PreviewTable from '../../../../../components/modals/paste/PreviewTable.js'
import TeamSeasonChoiceCards from '../../../../../components/modals/paste/TeamSeasonChoiceCards.js'
import { importModalChromeSx as chromeSx } from '../../../../../components/modals/paste/sx/importModalChrome.sx.js'
import { pasteModalSx as pasteSx } from '../../../../../components/modals/paste/sx/pasteModal.sx.js'
import { statsImportModalSx as sx } from '../sx/statsImportModal.sx.js'
import StatsV2FinalSyncPanel from './StatsV2FinalSyncPanel.js'

const STEPS = ['הקשר טעינה', 'קליטת נתונים', 'זיהוי ואישור', 'סנכרון']



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
  const [activeStep, setActiveStep] = React.useState(0)
  const previewAdvanceRequestedRef = React.useRef(false)
  React.useEffect(() => {
    if (controller.open) {
      previewAdvanceRequestedRef.current = false
      setActiveStep(0)
    }
  }, [controller.open])

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
        <Typography level='title-sm' sx={sx.choiceSectionTitle}>מצב העונה</Typography>
        <Chip size='sm' variant='soft' color='neutral'>
          {controller.seasonStatus === 'completed' ? 'עונה שהסתיימה' : 'עונה פעילה'}
        </Chip>
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
    (controller.reloadDecisionState?.unresolved?.length || 0) > 0 ||
    !contextReady
  )
  const syncComplete = activeStep === 3 && controller.finalSync?.stages?.every(stage => controller.finalSync.results?.[stage]?.status === 'completed')
  const confirmDisabled = activeStep === 3
    ? !syncComplete
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
  const handleConfirm = async () => {
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

    const approved = await controller.confirm()
    if (approved) setActiveStep(3)
  }
  const handleClose = () => {
    if (controller.busy) return
    if (activeStep === 3 && controller.finalSync?.stages?.some(stage => controller.finalSync.results?.[stage]?.status !== 'completed')) return

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
                  onClick={controller.rebuildApprovedStatsPlan}
                >
                  בנה מחדש
                </Button>
              </Stack>
            ) : null}
            {controller.reloadDecisionState?.missingPlayers?.length ? (
              <Stack spacing={1}>
                <Typography level='title-sm'>שחקנים שהיו בסטטיסטיקה הקודמת ואינם מופיעים בטעינה החדשה</Typography>
                {controller.reloadDecisionState.missingPlayers.map(entry => (
                  <Stack key={entry.playerKey} direction='row' spacing={1} alignItems='center'>
                    <Typography level='body-sm' sx={{ flex: 1 }}>{entry.player?.fullName || entry.playerKey}</Typography>
                    <Button size='sm' variant={controller.reloadDecisions?.[entry.playerKey] === 'preserveStats' ? 'solid' : 'soft'} onClick={() => controller.setReloadDecision(entry.playerKey, 'preserveStats')}>שמור סטטס קודם</Button>
                    <Button size='sm' variant={controller.reloadDecisions?.[entry.playerKey] === 'removeStats' ? 'solid' : 'soft'} color='warning' onClick={() => controller.setReloadDecision(entry.playerKey, 'removeStats')}>הסר סטטס</Button>
                  </Stack>
                ))}
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
          <StatsV2FinalSyncPanel controller={controller.finalSync} />
        ) : null}
      </Box>
    </RegularModal>
  )
}
