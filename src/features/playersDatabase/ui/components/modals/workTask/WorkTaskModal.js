// src/features/playersDatabase/ui/components/modals/workTask/WorkTaskModal.js

import {
  Box,
  Button,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import RegularModal from '../RegularModal.js'
import WorkTaskLeagueFlow from './WorkTaskLeagueFlow.js'
import WorkTaskStepper from './WorkTaskStepper.js'
import WorkTaskTeamFlow from './WorkTaskTeamFlow.js'
import useWorkTaskModal from './useWorkTaskModal.js'
import {
  LEAGUE_PAGE_ROUTE,
  TEAM_ROUTE,
} from './workTask.model.js'
import { workTaskModalSx as sx } from './sx/workTaskModal.sx.js'

export default function WorkTaskModal({
  open,
  model,
  leagueContext,
  mode,
  onClose,
}) {
  const teamMode = mode === 'team'
  const work = useWorkTaskModal({
    open,
    model,
    leagueContext: teamMode ? null : leagueContext,
    mode,
    onClose,
  })

  const renderStep = () => {
    if (teamMode) return null

    if (work.workRoute === LEAGUE_PAGE_ROUTE) {
      return (
        <WorkTaskLeagueFlow
          mode={work.activeStep === 0 ? 'taskType' : 'target'}
          model={work.leagueFlowModel}
          actions={work.leagueFlowActions}
        />
      )
    }

    if (work.activeStep === 0) {
      return (
        <WorkTaskLeagueFlow
          mode='route'
          model={work.leagueFlowModel}
          actions={work.leagueFlowActions}
        />
      )
    }

    if (work.workRoute === TEAM_ROUTE) {
      return (
        <WorkTaskTeamFlow
          mode={work.activeStep === 1 ? 'context' : 'lookup'}
          model={work.teamFlowModel}
          actions={work.teamFlowActions}
        />
      )
    }

    const stepMode = work.activeStep === 1
      ? 'year'
      : work.activeStep === 2
      ? 'level'
      : 'review'

    return (
      <WorkTaskLeagueFlow
        mode={stepMode}
        model={work.leagueFlowModel}
        actions={work.leagueFlowActions}
      />
    )
  }

  return (
    <RegularModal
      open={open}
      title={teamMode ? 'פתיחת משימת קבוצה' : 'פתיחת משימת עבודה'}
      description={teamMode
        ? 'יצירת משימה בהקשר של הקבוצה והעונה המוצגות'
        : work.workRoute === LEAGUE_PAGE_ROUTE
        ? 'יצירת משימה בהקשר של הליגה והעונה המוצגות'
        : 'בחירת מסלול עבודה והקשר לפני יצירת המשימה'}
      size='md'
      hideFooter
      contentSx={sx.modalContent}
      onClose={onClose}
    >
      <Box sx={sx.modalBody}>
        <WorkTaskStepper
          activeStep={teamMode ? 0 : work.activeStep}
          steps={teamMode ? ['סוג משימה'] : work.steps}
        />

        <Box className='dpScrollThin' sx={sx.stage}>
          {renderStep()}
        </Box>

        {!teamMode ? (
          <Box sx={sx.actions}>
            <Box>
              {work.activeStep > 0 ? (
                <Button
                  size='sm'
                  variant='outlined'
                  startDecorator={iconUi({id: 'forward', size: 'sm'})}
                  sx={sx.backButton}
                  onClick={work.handleBack}
                >
                  חזרה
                </Button>
              ) : null}
            </Box>

            <Box>
              {work.createError ? (
                <Typography level='body-xs' color='danger'>
                  {work.createError}
                </Typography>
              ) : null}

              {work.workRoute === TEAM_ROUTE &&
                work.activeStep === 2 &&
                !work.selectedTeam ? null : (
                  <Button
                    size='sm'
                    disabled={!work.canContinue || work.createLoading}
                    loading={work.createLoading}
                    endDecorator={iconUi({id: 'back', size: 'sm'})}
                    sx={sx.continueButton}
                    onClick={work.handleNext}
                  >
                    {work.createLoading ? 'יוצר משימה...' : work.actionLabel}
                  </Button>
                )}
            </Box>
          </Box>
        ) : null}
      </Box>
    </RegularModal>
  )
}
