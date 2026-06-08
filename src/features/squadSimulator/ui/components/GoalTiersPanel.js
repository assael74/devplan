// features/squadSimulator/ui/components/GoalTiersPanel.js

import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  Input,
  Sheet,
  Typography,
} from '@mui/joy'

import playerImage from '../../../../ui/core/images/playerImage.jpg'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import { GOAL_TIER_ICON_IDS } from '../simulatorUi.constants.js'
import { getStatusColor } from '../simulatorUi.utils.js'
import { squadSimulatorSx as sx } from './sx/squadSimulator.sx.js'

export default function GoalTiersPanel({
  playerBank = [],
  totals,
  goalTiers,
  minutesDistribution = [],
  onPlayerBankChange,
  onAddBankPlayer,
  onRemoveBankPlayer,
}) {
  const visibleGoalTiers = goalTiers.filter(tier => tier.id !== 'none')

  return (
    <Sheet sx={{ ...sx.panel, ...sx.sidePanel }} className="dpScrollThin">
      <AccordionGroup size="sm" sx={sx.sideAccordionGroup} className="dpScrollThin">
        <Accordion defaultExpanded>
          <AccordionSummary>
            <Typography level="title-md">בנק שחקנים</Typography>
            <Chip size="sm" variant="soft" color="primary">
              {playerBank.length}
            </Chip>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={sx.bankList} className="dpScrollThin">
              {playerBank.map(player => (
                <Sheet key={player.id} sx={sx.bankRow}>
                  <Input
                    size="sm"
                    value={player.fullName}
                    placeholder="הוסף שחקן"
                    startDecorator={(
                      <Avatar
                        src={player.photo || playerImage}
                        alt=""
                        sx={{ width: 22, height: 22 }}
                      />
                    )}
                    sx={sx.rtlField}
                    onChange={event => onPlayerBankChange(player.id, {
                      fullName: event.target.value,
                    })}
                  />
                  <IconButton
                    size="sm"
                    variant="plain"
                    color="danger"
                    onClick={() => onRemoveBankPlayer(player.id)}
                  >
                    {iconUi({ id: 'remove', size: 'sm' })}
                  </IconButton>
                </Sheet>
              ))}
              <Button
                size="sm"
                variant="outlined"
                startDecorator={iconUi({ id: 'add', size: 'sm' })}
                onClick={onAddBankPlayer}
              >
                הוסף שחקן לבנק
              </Button>
            </Box>
          </AccordionDetails>
        </Accordion>

        <Accordion defaultExpanded>
          <AccordionSummary>
            <Typography level="title-md">פיזור כובשים</Typography>
            <Chip size="sm" variant="soft" color={getStatusColor(totals.status)}>
              {totals.coveragePct}%
            </Chip>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={sx.sideSection} className="dpScrollThin">
              {visibleGoalTiers.map(tier => (
                <Sheet key={tier.id} sx={sx.tierRow}>
                  <Box>
                    <Typography
                      level="title-sm"
                      startDecorator={iconUi({
                        id: GOAL_TIER_ICON_IDS[tier.id] || 'noGoalTarget',
                        size: 'sm',
                      })}
                    >
                      {tier.label}
                    </Typography>
                    <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                      {tier.excelLabel} שערים
                    </Typography>
                  </Box>

                  <Box sx={sx.tierCount}>
                    <Chip
                      size="sm"
                      variant="soft"
                      color={getStatusColor(tier.status)}
                      sx={sx.pill}
                    >
                      {tier.targetCount} / {tier.actualCount}
                    </Chip>
                    <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                      יעד / בפועל
                    </Typography>
                  </Box>

                  <Chip size="sm" variant="soft" color="success" sx={sx.pill}>
                    {tier.goalsTargetTotal} / {tier.guaranteedGoalsTargetTotal ?? tier.goalsTargetTotal} ש'
                  </Chip>
                </Sheet>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary>
            <Typography level="title-md">פיזור דקות</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={sx.sideSection} className="dpScrollThin">
              {minutesDistribution.map(item => (
                <Sheet key={item.id} sx={sx.tierRow}>
                  <Box>
                    <Typography
                      level="title-sm"
                      startDecorator={iconUi({ id: 'hour', size: 'sm' })}
                    >
                      {item.label} דקות
                    </Typography>
                    <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                      שחקנים מעל {item.label}
                    </Typography>
                  </Box>

                  <Box sx={sx.tierCount}>
                    <Chip
                      size="sm"
                      variant="soft"
                      color={getStatusColor(item.status)}
                      sx={sx.pill}
                    >
                      {item.targetCount} / {item.actualCount}
                    </Chip>
                    <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                      יעד / בפועל
                    </Typography>
                  </Box>

                  <Chip size="sm" variant="soft" color="neutral" sx={sx.pill}>
                    {item.label}
                  </Chip>
                </Sheet>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      </AccordionGroup>
    </Sheet>
  )
}
