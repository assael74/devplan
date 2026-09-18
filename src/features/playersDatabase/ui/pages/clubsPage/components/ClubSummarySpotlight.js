import { Box, Chip, Typography } from '@mui/joy'

import coveragePartial from '../../../../../../ui/core/images/clubSignals/club-coverage-partial.png'
import coverageMissing from '../../../../../../ui/core/images/clubSignals/club-coverage-missing.png'
import { formatLtrNumber } from '../../../../../../shared/format/direction.js'

import {
  ClubSignalIcon,
  ClubSignalTitle,
} from './ClubSignalDisplay.js'
import { clubsPageSx as sx } from '../sx/clubsPage.sx.js'

const COVERAGE_ICON_BY_STATE = Object.freeze({
  partialCoverage: coveragePartial,
  noCoverage: coverageMissing,
})

const TeamIdentity = ({ team }) => (
  <Typography level='title-sm' sx={sx.summarySpotlightTeamIdentity}>
    {[
      team?.ageGroupLabel,
      team?.birthYear || null,
    ].filter(Boolean).join(' · ')}
  </Typography>
)

export default function ClubSummarySpotlight({ model }) {
  const coverageIcon = COVERAGE_ICON_BY_STATE[model?.state]

  if (coverageIcon) {
    const isNoCoverage = model?.state === 'noCoverage'

    return (
      <Box sx={sx.summarySpotlightCoverageContent}>
        <Box
          component='img'
          src={coverageIcon}
          alt=''
          aria-hidden='true'
          sx={sx.summarySpotlightCoverageIcon}
        />
        {isNoCoverage ? (
          <Box sx={sx.summarySpotlightCoverageCopy}>
            <Typography level='title-sm' sx={sx.summarySpotlightCoverageTitle}>
              {model.title}
            </Typography>
            <Box sx={sx.summarySpotlightCoverageAction}>
              <Chip size='sm' variant='soft' color='primary' sx={sx.summarySpotlightCoverageActionChip}>
                {model.action}
              </Chip>
              <Typography level='body-sm' sx={sx.summarySpotlightCoverageActionText}>
                {(Array.isArray(model.ageGroups) ? model.ageGroups : [])
                  .map(ageGroup => [ageGroup?.ageGroupLabel, ageGroup?.birthYear]
                    .filter(Boolean)
                    .join(' · '))
                  .join(' · ')}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Typography level='body-sm' sx={sx.summarySpotlightEmpty}>
            {model.message}
          </Typography>
        )}
      </Box>
    )
  }

  if (model?.state !== 'signal') {
    return (
      <Typography
        level='body-sm'
        sx={model?.state === 'empty'
          ? sx.summarySpotlightNoSignal
          : sx.summarySpotlightEmpty}
      >
        {model?.message || 'אין איתותים'}
      </Typography>
    )
  }

  return (
    <Box sx={sx.summarySpotlightContent}>
      <ClubSignalIcon model={model} />
      <Box sx={sx.summarySpotlightCopy}>
        <Box sx={sx.summarySpotlightSignalLine}>
          <ClubSignalTitle model={model} />
        </Box>
        <Box sx={sx.summarySpotlightTeamIdentities}>
          {model.teams.map((team, index) => (
            <Box key={team.teamId} sx={sx.summarySpotlightTeamIdentityItem}>
              {index ? <Typography sx={sx.summarySpotlightTeamIdentitySeparator}>·</Typography> : null}
              <TeamIdentity team={team} />
            </Box>
          ))}
          {model.additionalTeamsCount ? (
            <Chip size='sm' variant='soft' color='neutral' sx={sx.summarySpotlightAdditionalTeams}>
              {formatLtrNumber(model.additionalTeamsCount, { signed: true })}
            </Chip>
          ) : null}
        </Box>
      </Box>
    </Box>
  )
}
