// preview/previewDomainCard/domains/team/videos/components/TeamVideosKpi.js

import React from 'react'
import { Box, Chip, Sheet, Typography, Avatar } from '@mui/joy'

import { iconUi } from '../../../../../../../../../../ui/core/icons/iconUi.js'
import { resolveEntityAvatar } from '../../../../../../../../../../ui/core/avatars/fallbackAvatar.js'
import { heroSx as sx } from '../sx/teamVideosKpi.sx.js'

function KpiCard({ label, value, subValue, icon }) {
  return (
    <Sheet variant="plain" sx={sx.kpiCardSx}>
      <Box sx={sx.kpiTopSx}>
        <Typography sx={sx.kpiLabelSx}>{label}</Typography>
        {icon}
      </Box>

      <Typography sx={sx.kpiValueSx}>{value}</Typography>

      <Box sx={sx.kpiSubBoxSx}>
        <Typography sx={sx.kpiSubValueSx(subValue)}>{subValue}</Typography>
      </Box>
    </Sheet>
  )
}

export default function TeamVideosKpi({ entity, summary, filteredCount }) {
  const topCategory = summary?.topCategories[0] || null
  const topTopic = summary?.topTopics[0] || null
  const src = resolveEntityAvatar({
    entityType: 'team',
    entity,
    parentEntity: entity?.club,
    subline: entity?.club?.name,
  })

  return (
    <Sheet variant="plain" sx={sx.rootSx}>
      <Box sx={sx.heroGlowSx} />
      <Box sx={sx.heroGlow2Sx} />

      <Box sx={sx.heroContentSx}>
        <Box sx={sx.heroTitleRowSx}>
          <Box sx={sx.heroTitleWrapSx}>
            <Box sx={sx.heroIconBoxSx}>
              <Avatar src={src} />
            </Box>

            <Box sx={sx.heroTextWrapSx}>
              <Typography level="title-md" sx={sx.heroTitleSx}>
                {entity?.name || entity?.teamName || 'קבוצה'}
              </Typography>

              <Typography level="body-sm" sx={sx.heroSubTitleSx}>
                וידאו הקבוצה
              </Typography>
            </Box>
          </Box>

          <Chip size="sm" variant="soft" color="primary" sx={sx.heroBadgeSx}>
            מוצגים {filteredCount ?? 0}
          </Chip>
        </Box>

        <Box sx={sx.kpiGridSx}>
          <KpiCard
            label="חודשים פעילים"
            value={summary?.activeMonths ?? 0}
            subValue={`מתוך ${summary?.seasonMonths ?? 0} חודשי עונה`}
            icon={iconUi({ id: 'video', size: 'sm' })}
          />

          <KpiCard
            label="קצב עבודה"
            value={summary?.avgVideosPerActiveMonth ?? 0}
            subValue="ממוצע לחודש פעיל"
            icon={iconUi({ id: 'speed', size: 'sm' })}
          />

          <KpiCard
            label="קטגוריה מובילה"
            value={topCategory?.label || 'ללא תיוג'}
            subValue={topCategory ? `${topCategory.total} וידאו · ${topCategory.pct}%` : ''}
            icon={iconUi({ id: 'parents', size: 'sm' })}
          />

          <KpiCard
            label="נושא מוביל"
            value={topTopic?.label || 'ללא תיוג'}
            subValue={topTopic? `${topTopic.total} וידאו · ${topTopic.pct}%`: ''}
            icon={iconUi({ id: 'children', size: 'sm' })}
          />
        </Box>
      </Box>
    </Sheet>
  )
}
