import { Box, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { CollapseBox } from '../../../../../ui/patterns/collapseBox/index.js'
import { profilePresentation } from './model/teamYearDevelopment.presentation.js'
import { SeasonSummaryChip, SummaryChip, SummaryFacts, TeamYearSection } from './TeamYearDevelopmentShared.js'
import { teamYearDevelopmentSharedSx } from './sx/teamYearDevelopmentShared.sx.js'
import { teamYearScoutProfilesSectionSx } from './sx/teamYearScoutProfilesSection.sx.js'

const sx = { ...teamYearDevelopmentSharedSx, ...teamYearScoutProfilesSectionSx }

export default function TeamYearScoutProfilesSection({ overview = {}, openSeasonKey = '', onToggle }) {
  const timeline = overview.scoutProfileDistributionTimeline || []
  const profileMaximum = Math.max(
    1,
    ...timeline.flatMap(season => season && Array.isArray(season.profiles) ? season.profiles : []).map(profile => profile.count || 0)
  )

  return (
    <TeamYearSection iconId='scouting' title='פרופילי הסקאוט לאורך עונות'>
      <Box sx={sx.evolutionGroup}>
        <Box sx={sx.evolutionRows}>
          {timeline.map((season, index) => {
            if (!season) {
              const seasonKey = overview.profileTimeline && overview.profileTimeline[index]
                ? overview.profileTimeline[index].seasonKey || ''
                : ''
              const headerLeft = (
                <Box sx={sx.evolutionCollapseSummary}>
                  <SeasonSummaryChip season={overview.profileTimeline?.[index] || { seasonKey }} />
                  <Typography sx={sx.evolutionCollapseEmptySummary}>אין נתוני פרופילים לעונה זו</Typography>
                </Box>
              )
              return (
                <CollapseBox
                  key={seasonKey || index}
                  disabled
                  headerLeft={headerLeft}
                  rootSx={sx.evolutionCollapse}
                  headerSx={sx.evolutionCollapseHeader}
                />
              )
            }

            const isOpen = openSeasonKey === season.seasonKey
            const leadingProfile = season.profiles[0]
            const leadingPresentation = leadingProfile ? profilePresentation(leadingProfile.profileId) : null
            const total = season.total === null || season.total === undefined ? 0 : season.total
            const headerLeft = (
              <Box sx={sx.evolutionCollapseSummary}>
                <SeasonSummaryChip season={season} />
                <SummaryFacts>
                  <SummaryChip iconId='scouting' label='פרופילים פעילים' value={total} />
                  <SummaryChip iconId='performanceProfile' label='סוגי פרופיל' value={season.profiles.length} />
                  {leadingProfile ? (
                    <SummaryChip iconId={leadingPresentation.iconId} label={`מוביל: ${leadingPresentation.label}`} value={leadingProfile.count} />
                  ) : null}
                </SummaryFacts>
              </Box>
            )

            return (
              <CollapseBox
                key={season.seasonKey}
                open={isOpen}
                disabled={!season.profiles.length}
                onToggle={() => onToggle(isOpen ? '' : season.seasonKey)}
                headerLeft={headerLeft}
                rootSx={sx.evolutionCollapse}
                headerSx={sx.evolutionCollapseHeader}
                contentSx={sx.evolutionCollapseContent}
              >
                <Box sx={sx.evolutionCollapseBody}>
                  <Box sx={sx.profileDistributionList}>
                    {season.profiles.map(profile => {
                      const presentation = profilePresentation(profile.profileId)
                      return (
                        <Box key={profile.profileId} sx={sx.profileDistributionRow}>
                          <Box sx={sx.profileDistributionLabel}>
                            {iconUi({ id: presentation.iconId, size: 'sm' })}
                            <Typography>{presentation.label}</Typography>
                          </Box>
                          <Box sx={sx.profileDistributionTrack}>
                            <Box sx={sx.profileDistributionFill((profile.count / profileMaximum) * 100)} />
                          </Box>
                          <Typography sx={sx.profileDistributionCount}>{profile.count}</Typography>
                        </Box>
                      )
                    })}
                  </Box>
                </Box>
              </CollapseBox>
            )
          })}
        </Box>
      </Box>
    </TeamYearSection>
  )
}
