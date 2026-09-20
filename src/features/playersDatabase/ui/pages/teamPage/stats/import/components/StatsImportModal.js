// src/features/playersDatabase/ui/pages/teamPage/stats/import/components/StatsImportModal.js

import * as React from 'react'
import {
  Box,
  Button,
  Chip,
  FormControl,
  FormHelperText,
  FormLabel,
  Option,
  Select,
  Tooltip,
  Typography,
} from '@mui/joy'

import {
  PLAYER_STATS_PLACEHOLDER,
  STATS_SEASON_STATUS_OPTIONS,
} from '../logic/statsImport.constants.js'
import ImportActionArea from '../../../../../components/modals/ImportActionArea.js'
import ModalStepper from '../../../../../components/modals/ModalStepper.js'
import RegularModal from '../../../../../components/modals/RegularModal.js'
import TeamSeasonSelect from '../../../../../components/modals/TeamSeasonSelect.js'
import PasteArea from '../../../../../components/modals/paste/PasteArea.js'
import PreviewTable from '../../../../../components/modals/paste/PreviewTable.js'
import { pasteModalSx as pasteSx } from '../../../../../components/modals/paste/sx/pasteModal.sx.js'
import { statsImportModalSx as sx } from '../sx/statsImportModal.sx.js'

const STEPS = ['הקשר טעינה', 'הדבקה וניתוח', 'בדיקה ואישור']

function clean(value) {
  return String(value || '').trim()
}

const formatValidationNumber = value => new Intl.NumberFormat('en-US').format(value)

function MetaLink({ href, children }) {
  const safeHref = clean(href)
  const missingLabel = children

  if (!safeHref) {
    return (
      <Typography component='span' level='body-sm' sx={sx.missingLink}>
        {missingLabel || 'לא הוגדר קישור למקור'}
      </Typography>
    )
  }

  return (
    <Tooltip title={safeHref} placement='top' arrow>
      <Typography
        component='a'
        href={safeHref}
        target='_blank'
        rel='noopener noreferrer'
        referrerPolicy='no-referrer'
        level='body-sm'
        dir='ltr'
        sx={sx.metaLink}
      >
        {children}
      </Typography>
    </Tooltip>
  )
}

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
  const seasonStatusOption = STATS_SEASON_STATUS_OPTIONS.find(option => (
    option.value === controller.seasonStatus
  ))

  React.useEffect(() => {
    if (controller.open) setActiveStep(0)
  }, [controller.open])

  const description = (
    <Box sx={sx.description}>
      <MetaLink href={teamUrl} missingLabel='לא הוגדר קישור לקבוצה'>
        {team.name || 'קבוצה'}
      </MetaLink>

      <Typography component='span' level='body-sm'>·</Typography>
      <MetaLink href={leagueUrl} missingLabel='לא הוגדר קישור לליגה'>
        {leagueName || 'ליגה'}
      </MetaLink>

      {seasonKey ? (
        <>
          <Typography component='span' level='body-sm'>·</Typography>
          <Typography component='span' level='body-sm'>
            עונה {seasonKey}
          </Typography>
        </>
      ) : null}

      {team.birthYear ? (
        <>
          <Typography component='span' level='body-sm'>·</Typography>
          <Typography component='span' level='body-sm'>
            שנתון {team.birthYear}
          </Typography>
        </>
      ) : null}
    </Box>
  )

  const selectionControls = (
    <Box sx={sx.selectionRow}>
      <TeamSeasonSelect
        seasonOptions={controller.seasonOptions}
        value={controller.selectedSeasonOptionKey}
        onChange={controller.selectSeasonOption}
        hideHelperText={hasPreviewRows}
        sx={sx.seasonSelect}
      />
      <FormControl
        size='sm'
        required
        sx={sx.seasonStatus}
      >
        <FormLabel>סוג טעינת הסטטיסטיקה</FormLabel>
        <Select value={controller.seasonStatus || null} placeholder='בחר סוג טעינה' onChange={(event, value) => controller.changeSeasonStatus(value)}>
          {STATS_SEASON_STATUS_OPTIONS.map(option => <Option key={option.value} value={option.value}>{option.label}</Option>)}
        </Select>
        {!hasPreviewRows ? <FormHelperText>{seasonStatusOption?.description || 'בחירה חובה לפני הצגת הנתונים'}</FormHelperText> : null}
      </FormControl>
    </Box>
  )

  const validationChecks = controller.validation.checks || []
  const contextReady = Boolean(controller.selectedSeasonOption && controller.seasonStatus)
  const finalConfirmDisabled = (
    !hasTeamPlayers ||
    controller.hasInvalidRows ||
    controller.movementPreview.requiresDecision ||
    !contextReady
  )
  const confirmDisabled = activeStep === 0
    ? !contextReady
    : activeStep === 1
      ? !hasPreviewRows
      : finalConfirmDisabled || !hasPreviewRows
  const footerActions = activeStep === 1 ? (
    <ImportActionArea
      actions={[
        {
          id: 'back',
          label: 'חזרה',
          iconId: 'forward',
          presentationRole: 'back',
          disabled: controller.busy,
          onClick: () => setActiveStep(0),
        },
        {
          id: 'clear',
          label: 'ניקוי מלא',
          iconId: 'delete',
          presentationRole: 'clear',
          disabled: !controller.pasteValue,
          onClick: controller.clearPaste,
        },
        {
          id: 'preview',
          label: 'הצג נתונים',
          iconId: 'addStats',
          presentationRole: 'primary',
          disabled: !controller.pasteValue || !contextReady,
          onClick: controller.parse,
        },
      ]}
    />
  ) : activeStep === 2 ? (
    <ImportActionArea
      actions={[
        {
          id: 'back',
          label: 'חזרה',
          iconId: 'forward',
          presentationRole: 'back',
          disabled: controller.busy,
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
      setActiveStep(2)
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
    ? 'המשך'
    : activeStep === 1
      ? 'המשך'
      : 'אישור טעינת סטטיסטיקות'

  return (
    <RegularModal
      open={controller.open}
      title={`טעינת סטטיסטיקות - ${team.name}`}
      description={description}
      iconId='addStats'
      busy={controller.busy}
      disabled={confirmDisabled}
      confirmLabel={confirmLabel}
      confirmIconId={activeStep === 2 ? 'upload' : 'next'}
      size='xl'
      contentSx={pasteSx.modalContent}
      footerActions={footerActions}
      onConfirm={handleConfirm}
      onClose={handleClose}
    >
      <Box sx={pasteSx.content}>
        <ModalStepper activeStep={activeStep} steps={STEPS} />

        {activeStep === 0 ? selectionControls : null}

        {activeStep === 1 ? (
          <PasteArea
            value={controller.pasteValue}
            placeholder={PLAYER_STATS_PLACEHOLDER}
            compact={hasPreviewRows}
            onChange={controller.setPasteValue}
          />
        ) : null}

        {activeStep === 2 ? (
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
        ) : null}
      </Box>
    </RegularModal>
  )
}
