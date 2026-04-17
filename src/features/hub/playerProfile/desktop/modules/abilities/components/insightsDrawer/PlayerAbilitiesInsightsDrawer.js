// playerProfile/desktop/modules/abilities/components/insightsDrawer/PlayerAbilitiesInsightsDrawer.js

import React, { useMemo } from 'react'
import { Drawer, Box, Sheet, DialogContent } from '@mui/joy'

import { InsightRowsList } from './InsightsRows.js'
import { StatCard, SectionBlock, InsightsDrawerHeader } from './InsightsBlocks.js'
import { insightsDrawersSx as sx } from './sx/playerAbilities.insightsDrawer.sx.js'
import { buildPlayerAbilitiesInsightsDrawerModel } from './../../../../../sharedLogic'

export default function PlayerAbilitiesInsightsDrawer({
  open,
  onClose,
  entity,
}) {
  const model = useMemo(() => buildPlayerAbilitiesInsightsDrawerModel(entity || {}), [entity])

  return (
    <Drawer
      size="md"
      variant="plain"
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ content: { sx: sx.drawerSx } }}
    >
      <Sheet sx={sx.drawerSheet}>
        <InsightsDrawerHeader entity={entity} isEligible={model?.isEligible} />

        <DialogContent sx={{ gap: 2 }}>
          <Box sx={sx.content} className="dpScrollThin">
            <SectionBlock title="תקציר על" icon="insights">
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                  gap: 1,
                }}
              >
                {(model?.topStats || []).map((item) => (
                  <StatCard
                    key={item.id}
                    title={item.title}
                    value={item.value}
                    sub={item.sub}
                    icon={item.icon}
                  />
                ))}
              </Box>
            </SectionBlock>

            <SectionBlock title="מוכנות נתונים" icon="check">
              <InsightRowsList
                items={model?.readinessRows || []}
                emptyText="אין כרגע תובנות מוכנות באזור זה"
              />
            </SectionBlock>

            <SectionBlock title="תמונת פרופיל" icon="profile">
              <InsightRowsList
                items={model?.profileRows || []}
                emptyText="אין כרגע תובנות פרופיל להצגה"
              />
            </SectionBlock>

            <SectionBlock title="פוטנציאל" icon="potential">
              <InsightRowsList
                items={model?.potentialRows || []}
                emptyText="אין כרגע תובנות פוטנציאל להצגה"
              />
            </SectionBlock>

            <SectionBlock title="פירוט דומיינים" icon="abilities">
              <InsightRowsList
                items={model?.domainRows || []}
                emptyText="אין כרגע דומיינים תקפים להצגה"
              />
            </SectionBlock>
          </Box>
        </DialogContent>
      </Sheet>
    </Drawer>
  )
}
