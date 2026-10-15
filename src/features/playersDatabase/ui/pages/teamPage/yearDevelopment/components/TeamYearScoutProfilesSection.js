// src/features/playersDatabase/ui/pages/teamPage/yearDevelopment/components/TeamYearScoutProfilesSection.js
import { Box, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { formatLtrNumber } from '../../../../../../../shared/format/direction.js'
import { CollapseBox } from '../../../../../../../ui/patterns/collapseBox/index.js'
import { profilePresentation } from '../model/teamYearDevelopment.presentation.js'
import { SeasonSummaryChip, SummaryChip, SummaryFacts, TeamYearSection } from './TeamYearDevelopmentShared.js'
import { teamYearDevelopmentSharedSx } from '../sx/teamYearDevelopmentShared.sx.js'
import { teamYearScoutProfilesSectionSx } from '../sx/teamYearScoutProfilesSection.sx.js'

const sx = { ...teamYearDevelopmentSharedSx, ...teamYearScoutProfilesSectionSx }

const renderInsightNoteText = note => {
  const phrase = note.key === 'professionalProfiles' ? 'פרופיל מקצועי'
    : note.key === 'underuseProfiles' ? 'פרופיל חוסר שימוש' : ''
  const phraseIndex = phrase ? note.text.indexOf(phrase) : -1
  if (phraseIndex < 0) return note.text

  return (
    <>
      {note.text.slice(0, phraseIndex)}
      <Box component='strong' sx={sx.profileInsightEmphasis}>{phrase}</Box>
      {note.text.slice(phraseIndex + phrase.length)}
    </>
  )
}

export default function TeamYearScoutProfilesSection({
  overview = {},
  openSeasonKey = '',
  onToggle,
  insightNotes = [],
}) {
  const timeline = overview.scoutProfileDistributionTimeline || []
  const profileMaximum = Math.max(
    1,
    ...timeline.flatMap(season => season && Array.isArray(season.profiles) ? season.profiles : []).map(profile => profile.count || 0)
  )

  return (
    <TeamYearSection
      iconId='scouting'
      title='פרופילי הסקאוט לאורך עונות'
      titleExtraSx={sx.profileInsightSlot}
      titleExtra={insightNotes.length ? (
        <Box sx={sx.profileInsightNotes(insightNotes.length)}>
          {insightNotes.map((note, index) => (
            <Box key={note.key} sx={sx.profileInsightNoteSlot(index > 0)}>
              <Typography
                title={note.text}
                sx={[sx.profileInsightNote, sx.profileInsightNoteTone(note.tone)]}
              >
                {renderInsightNoteText(note)}
              </Typography>
            </Box>
          ))}
        </Box>
      ) : null}
    >
      <Box sx={sx.evolutionGroup}>
        <Box sx={sx.evolutionRows}>
          {timeline.map((season, index) => {
            if (!season) {
              const seasonKey = overview.profileTimeline && overview.profileTimeline[index]
                ? overview.profileTimeline[index].seasonKey || ''
                : ''
              const profileSeason = overview.profileTimeline?.[index] || { seasonKey }
              const headerLeft = (
                <Box sx={sx.evolutionCollapseSummary}>
                  <SeasonSummaryChip season={profileSeason} />
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
            const professionalCount = season.groupCounts ? season.groupCounts.professional : '—'
            const underuseCount = season.groupCounts ? season.groupCounts.underuse : '—'
            const largestChange = overview.largestProfessionalProfileChange?.seasonKey === season.seasonKey
              ? overview.largestProfessionalProfileChange
              : null
            const changedProfile = largestChange ? profilePresentation(largestChange.profileId) : null
            const headerLeft = (
              <Box sx={sx.evolutionCollapseSummary}>
                <SeasonSummaryChip season={season} />
                <SummaryFacts>
                  <SummaryChip iconId='performanceProfile' label='מקצועיים' value={professionalCount} />
                  <SummaryChip iconId='underusedProspect' label='ללא שימוש' value={underuseCount} />
                  {largestChange ? (
                    <SummaryChip
                      iconId={changedProfile.iconId}
                      label={`שינוי בולט: ${changedProfile.label}`}
                      value={formatLtrNumber(largestChange.delta, { signed: true })}
                      title={`מ־${largestChange.previous} ל־${largestChange.current} שחקנים לעומת העונה הקודמת`}
                    />
                  ) : null}
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
                  <Box sx={sx.profileGroups}>
                    {season.profileGroups.map(group => (
                      <Box key={group.key} sx={sx.profileGroup}>
                        <Typography sx={sx.profileGroupHeading}>{group.label}</Typography>
                        <Box sx={sx.profileDistributionList}>
                          {group.profiles.length ? group.profiles.map(profile => {
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
                          }) : (
                            <Typography sx={sx.profileGroupEmpty}>אין פרופילים בקבוצה זו</Typography>
                          )}
                        </Box>
                      </Box>
                    ))}
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
