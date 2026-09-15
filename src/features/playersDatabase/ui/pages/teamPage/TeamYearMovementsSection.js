import { Avatar, Box, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { CollapseBox } from '../../../../../ui/patterns/collapseBox/index.js'
import playerImage from '../../../../../ui/core/images/playerImage.jpg'
import { directionPresentation, linePresentation } from './model/teamYearDevelopment.presentation.js'
import { SeasonSummaryChip, SummaryChip, SummaryFacts, TeamYearSection } from './TeamYearDevelopmentShared.js'
import { teamYearDevelopmentSharedSx } from './sx/teamYearDevelopmentShared.sx.js'
import { teamYearMovementsSectionSx } from './sx/teamYearMovementsSection.sx.js'

const sx = { ...teamYearDevelopmentSharedSx, ...teamYearMovementsSectionSx }

export default function TeamYearMovementsSection({ seasons = [], openSeasonKey = '', onToggle }) {
  return (
    <TeamYearSection iconId='players' title='תנועת שחקנים בין עונות'>
      <Box sx={sx.movementSeasons}>
        {seasons.map(season => {
          const isOpen = openSeasonKey === season.seasonKey
          const directionItems = ['up', 'down', 'lateral'].map(direction => ({
            direction,
            count: season.directionCounts && season.directionCounts[direction] ? season.directionCounts[direction] : 0,
            ...directionPresentation(direction),
          }))
          const lineItems = ['GOALKEEPER', 'DEFENSE', 'MIDFIELD', 'ATTACK', 'UNKNOWN']
            .map(line => ({
              line,
              count: season.lineCounts && season.lineCounts[line] ? season.lineCounts[line] : 0,
              ...linePresentation(line),
            }))
            .filter(item => item.count > 0)
          const headerLeft = (
            <Box sx={sx.evolutionCollapseSummary}>
              <SeasonSummaryChip season={season} />
              {season.isUpcoming ? <Typography sx={sx.evolutionCollapseEmptySummary}>טרם החלה</Typography> : (
                <SummaryFacts>
                  <SummaryChip iconId='rosterLeft' label='עזבו' value={season.leftCount} />
                  <SummaryChip iconId='rosterJoined' label='הצטרפו' value={season.joinedCount} />
                  {directionItems.map(item => <SummaryChip key={item.direction} iconId={item.iconId} label={item.label} value={item.count} />)}
                  {lineItems.map(item => <SummaryChip key={item.line} iconId={item.iconId} label={item.label} value={item.count} />)}
                </SummaryFacts>
              )}
            </Box>
          )

          return (
            <CollapseBox
              key={season.seasonKey}
              open={isOpen}
              onToggle={() => onToggle(isOpen ? '' : season.seasonKey)}
              headerLeft={headerLeft}
              iconId='arrowDown'
              rootSx={sx.movementCollapse}
              headerSx={sx.movementCollapseHeader}
            >
              <Box sx={sx.movementCollapseBody}>
                {season.isUpcoming ? (
                  <Typography sx={sx.emptyInline}>טרם החלה העונה ולכן אין עדיין נתוני סגל או מעברים.</Typography>
                ) : season.movements.length ? (
                  <Box sx={sx.movementList}>
                    {season.movements.map((movement, index) => {
                      const presentation = directionPresentation(movement.direction)
                      return (
                        <Box key={`${movement.name}-${index}`} sx={sx.movementItem}>
                          <Box sx={sx.movementPlayer}>
                            <Avatar src={playerImage} alt='' sx={sx.movementAvatar} />
                            <Typography sx={sx.movementName}>{movement.name}</Typography>
                          </Box>
                          <Typography sx={sx.movementProfile}>{movement.hasScoutProfile ? 'עם פרופיל סקאוט' : 'ללא פרופיל סקאוט'}</Typography>
                          <Box sx={sx.movementTag(presentation.color)}>
                            {iconUi({ id: presentation.iconId, size: 'sm' })}
                            <Typography component='span' sx={sx.movementTagText}>{presentation.label}</Typography>
                          </Box>
                        </Box>
                      )
                    })}
                  </Box>
                ) : <Typography sx={sx.emptyInline}>לא נמצאו עוזבים בעונה זו.</Typography>}
              </Box>
            </CollapseBox>
          )
        })}
      </Box>
    </TeamYearSection>
  )
}
