import { Box, Tooltip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { CollapseBox } from '../../../../../ui/patterns/collapseBox/index.js'
import {
  LINE_DISTRIBUTION_COLORS,
  linePresentation,
} from './model/teamYearDevelopment.presentation.js'
import { SeasonSummaryChip, SummaryChip, SummaryFacts, TeamYearSection } from './TeamYearDevelopmentShared.js'
import { teamYearDevelopmentSharedSx } from './sx/teamYearDevelopmentShared.sx.js'
import { teamYearRosterBalanceSectionSx } from './sx/teamYearRosterBalanceSection.sx.js'

const sx = { ...teamYearDevelopmentSharedSx, ...teamYearRosterBalanceSectionSx }

const LineLegend = () => (
  <Box sx={sx.evolutionLegend}>
    {[
      ['goalkeeper', 'שוער'],
      ['defense', 'הגנה'],
      ['midfield', 'קישור'],
      ['attack', 'התקפה'],
      ['unclassified', 'לא מסווגים / מדגם חסר'],
    ].map(([key, label]) => (
      <Box key={key} sx={sx.evolutionLegendItem}>
        <Box sx={sx.evolutionLegendColor(LINE_DISTRIBUTION_COLORS[key])} />
        <Typography>{label}</Typography>
      </Box>
    ))}
  </Box>
)

const LineDistributionTooltip = ({ category, seasonKey, total }) => {
  const share = total ? Math.round((category.count / total) * 100) : 0

  return (
    <Box sx={sx.evolutionTooltipContent}>
      <Box sx={sx.evolutionTooltipHead}>
        <Box sx={sx.evolutionTooltipColor(LINE_DISTRIBUTION_COLORS[category.key])} />
        <Typography>{category.label}</Typography>
      </Box>
      <Typography sx={sx.evolutionTooltipValue}>{category.count} שחקנים · {share}%</Typography>
      <Typography sx={sx.evolutionTooltipMeta}>עונת {seasonKey}</Typography>
    </Box>
  )
}

export default function TeamYearRosterBalanceSection({ overview = {}, openSeasonKey = '', onToggle }) {
  return (
    <TeamYearSection iconId='players' title='איזון הסגל לאורך עונות' titleExtra={<LineLegend />}>
      <Box sx={sx.evolutionGroup}>
        <Box sx={sx.evolutionRows}>
          {(overview.rosterBalanceTimeline || []).map((season, index) => {
            if (!season) {
              const seasonKey = overview.rosterTimeline && overview.rosterTimeline[index]
                ? overview.rosterTimeline[index].seasonKey || ''
                : ''
              const headerLeft = (
                <Box sx={sx.evolutionCollapseSummary}>
                  <SeasonSummaryChip season={overview.rosterTimeline?.[index] || { seasonKey }} />
                  <Typography sx={sx.evolutionCollapseEmptySummary}>אין נתוני סיווג לעונה זו</Typography>
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

            const totalInBar = season.categories.reduce((sum, item) => sum + item.count, 0)
            const isOpen = openSeasonKey === season.seasonKey
            const total = season.total === null || season.total === undefined ? totalInBar : season.total
            const headerLeft = (
              <Box sx={sx.evolutionCollapseSummary}>
                <SeasonSummaryChip season={season} />
                <SummaryFacts>
                  <SummaryChip iconId='players' label='סגל' value={total} />
                  {season.categories.map(item => (
                    <SummaryChip
                      key={item.key}
                      iconId={linePresentation(item.key === 'goalkeeper' ? 'GOALKEEPER' : item.key.toUpperCase()).iconId}
                      label={item.label}
                      value={item.count}
                    />
                  ))}
                </SummaryFacts>
              </Box>
            )

            return (
              <CollapseBox
                key={season.seasonKey}
                open={isOpen}
                onToggle={() => onToggle(isOpen ? '' : season.seasonKey)}
                headerLeft={headerLeft}
                rootSx={sx.evolutionCollapse}
                headerSx={sx.evolutionCollapseHeader}
                contentSx={sx.evolutionCollapseContent}
              >
                <Box sx={sx.evolutionCollapseBody}>
                  {totalInBar ? (
                    <Box sx={sx.stackedBar}>
                      {season.categories.filter(item => item.count > 0).map(item => (
                        <Tooltip
                          key={item.key}
                          title={<LineDistributionTooltip category={item} seasonKey={season.seasonKey} total={totalInBar} />}
                          arrow
                          placement='top'
                          slotProps={{ tooltip: { sx: sx.evolutionTooltip } }}
                        >
                          <Box sx={sx.stackedSegment({ width: (item.count / totalInBar) * 100, color: LINE_DISTRIBUTION_COLORS[item.key] })} />
                        </Tooltip>
                      ))}
                    </Box>
                  ) : <Typography sx={sx.evolutionEmptyValue}>אין שחקנים מסווגים להצגה</Typography>}
                  <Box sx={sx.evolutionCounts}>
                    {season.categories.map(item => <Typography key={item.key}>{item.label} {item.count}</Typography>)}
                    {season.total !== null ? <Typography sx={sx.evolutionTotal}>סה״כ {season.total}</Typography> : null}
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
