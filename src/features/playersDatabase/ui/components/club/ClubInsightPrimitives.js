import { Box, Chip, Tooltip, Typography } from '@mui/joy'

import LeagueName from '../entities/LeagueName.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { clubSharedSx as sx } from './sx/clubShared.sx.js'

const displayCount = value => (
  value === null || value === undefined ? '?' : value
)

const pathStatusTooltip = node => [
  node.hasLeagueLevelDecline
    ? `ירידה ברמת הליגה ביחס ל${node.comparisonAgeGroupLabel}`
    : '',
  node.hasLeagueLevelIncrease
    ? `עלייה ברמת הליגה ביחס ל${node.comparisonAgeGroupLabel}`
    : '',
  node.clubLevelDirection === 'above'
    ? 'הליגה מעל רמת המועדון'
    : node.clubLevelDirection === 'below'
      ? 'הליגה מתחת לרמת המועדון'
      : '',
].filter(Boolean).join('. ')

const renderPath = path => (
  <Box sx={sx.pathLine}>
    {path.map((node, index) => (
      <Box
        key={`${node.birthYear}-${index}`}
        sx={sx.pathLine}
      >
          <Box sx={sx.pathNode}>
            <Box component='span' sx={sx.pathYear}>
            {node.ageGroupLabel}
          </Box>
          <Box component='span' sx={sx.pathBirthYear}>
            {node.birthYear || '?'}
          </Box>
          <Box sx={sx.pathLevelRow}>
            {node.level ? (
              <LeagueName
                level={node.level}
                showLevel
                showName={false}
                fontSize={16}
                levelFontSize={14}
                levelSx={node.hasLeagueLevelIncrease
                  ? sx.pathLeagueLevelIncrease
                  : node.hasLeagueLevelDecline
                    ? sx.pathLeagueLevelDecline
                    : null}
              />
            ) : (
              <Box component='span' sx={sx.pathLevel}>?</Box>
            )}
            {node.clubLevelDirection ? (
              <Tooltip title={pathStatusTooltip(node)}>
                <Box
                  component='span'
                  sx={node.clubLevelDirection === 'above'
                    ? sx.pathDirectionAbove
                    : sx.pathDirectionBelow}
                >
                  {iconUi({
                    id: node.clubLevelDirection === 'above'
                      ? 'clubLevelAbove'
                      : 'clubLevelBelow',
                    size: 'inherit',
                    style: {
                      color: node.clubLevelDirection === 'above'
                        ? '#28734E'
                        : '#A95A00',
                    },
                  })}
                </Box>
              </Tooltip>
            ) : null}
          </Box>
        </Box>

        {index < path.length - 1 ? (
          <Box component='span' sx={sx.pathArrow}>
            ←
          </Box>
        ) : null}
      </Box>
    ))}
  </Box>
)

export function LeaguePath({ model, showSecondary = true, sx: rootSx }) {
  if (!model?.primary?.length && !(showSecondary && model?.secondary?.length)) {
    return (
      <Typography level='body-xs' sx={sx.metricItem}>
        אין מידע
      </Typography>
    )
  }

  return (
    <Box sx={[sx.path, rootSx]}>
      {model.primary?.length ? renderPath(model.primary) : null}

      {showSecondary ? model.secondary?.map(item => (
        <Box key={item.slot} sx={sx.pathLine}>
          <Typography level='body-xs' sx={sx.metricLabel}>
            {`קבוצה ${item.slot}`}
          </Typography>
          {renderPath(item.path)}
        </Box>
      )) : null}
    </Box>
  )
}

export function PerformanceDistribution({ model }) {
  return (
    <Box sx={sx.inlineItems}>
      {model.map(item => (
        <Box
          key={item.key}
          component='span'
          sx={sx.metricItem}
        >
          {`${item.label} · ${item.count}`}
        </Box>
      ))}
    </Box>
  )
}

const priorityTrendIconId = delta => (
  delta > 0 ? 'clubLevelAbove' : delta < 0 ? 'clubLevelBelow' : 'equal'
)

const priorityTrendColor = delta => (
  delta > 0 ? '#28734E' : delta < 0 ? '#A95A00' : '#64748B'
)

const priorityChipTooltip = item => {
  const previous = item.previousCount === null || item.previousCount === undefined
    ? 'אין נתון מהעונה הקודמת'
    : `עונה קודמת: ${item.previousCount}`
  const trend = item.delta === null
    ? ''
    : item.delta > 0 ? ' עלייה לעומת העונה הקודמת.'
      : item.delta < 0 ? ' ירידה לעומת העונה הקודמת.'
        : ' ללא שינוי לעומת העונה הקודמת.'

  return `${item.label} — עונה נוכחית: ${displayCount(item.count)}. ${previous}.${trend}`
}

export function PerformancePriorityChips({
  model = [],
  iconId = '',
  distribute = false,
}) {
  return (
    <Box sx={[
      sx.performancePriorityChips,
      distribute && sx.performancePriorityChipsDistributed,
    ]}>
      {model.map(item => (
        (() => {
          const chipSx = item.key === 'positive'
            ? sx.performancePriorityPositive
            : sx.performancePriorityBelow

          return (
            <Tooltip key={item.key} title={priorityChipTooltip(item)}>
              <Chip
                size='sm'
                variant='outlined'
                startDecorator={iconId ? iconUi({
                id: iconId,
                size: 'sm',
                style: {color: item.key === 'positive' ? '#28734E' : '#A95A00'},
                }) : null}
                endDecorator={item.delta === null ? null : iconUi({
                  id: priorityTrendIconId(item.delta),
                  size: 'md',
                  style: {color: priorityTrendColor(item.delta)},
                })}
                sx={chipSx}
              >
                {`${displayCount(item.count)} · ${displayCount(item.previousCount)}`}
              </Chip>
            </Tooltip>
          )
        })()
      ))}
    </Box>
  )
}

export function TransferSummary({ model }) {
  if (!model || model.status === 'NOT_LOADED') {
    return (
      <Typography level='body-xs' sx={sx.metricItem}>
        אין מידע
      </Typography>
    )
  }

  return (
    <Box sx={sx.inlineItems}>
      <Box component='span' sx={sx.metricItem}>
        {`↑ ${model.up} למעלה`}
      </Box>
      <Box component='span' sx={sx.metricItem}>
        {`↓ ${model.down} למטה`}
      </Box>
      {model.status === 'PARTIAL' ? (
        <Box component='span' sx={sx.metricItem}>
          כיסוי חלקי
        </Box>
      ) : null}
    </Box>
  )
}
