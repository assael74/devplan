// teamProfile/mobile/modules/abilities/components/insightsDrawer/TeamAbilitiesInsightsDrawer.js

import React, { useMemo } from 'react'
import { Drawer, Box, Sheet, DialogContent } from '@mui/joy'

import { InsightRowsList } from './InsightsRows.js'
import { StatCard, SectionBlock, InsightsDrawerHeader, InsightCardsGrid } from './InsightsBlocks.js'
import { insightsDrawersSx as sx } from './sx/insightsDrawer.sx.js'
import { buildTeamAbilitiesInsightsDrawerModel } from './../../../../../sharedLogic/abilities'

export default function TeamAbilitiesInsightsDrawer({
  open,
  onClose,
  entity,
  context,
}) {
  const model = useMemo(() => {
    return buildTeamAbilitiesInsightsDrawerModel(entity || {}, context || {})
  }, [entity, context])

  return (
    <Drawer
      size="lg"
      variant="plain"
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ content: { sx: { p: { md: 3, sm: 0 }, boxShadow: 'none' } } }}
    >
      <Sheet sx={sx.drawerSheet}>
        <InsightsDrawerHeader entity={entity} isEligible={model?.isEligible} />

        <DialogContent sx={{ gap: 2 }}>
          <Box sx={sx.content} className="dpScrollThin">
            <SectionBlock title="תקציר על" icon="insights">
              <Box sx={sx.section}>
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

            <SectionBlock title="תמונת קבוצה" icon="profile">
              <InsightRowsList
                items={model?.profileRows || []}
                emptyText="אין כרגע תובנות קבוצה להצגה"
              />
            </SectionBlock>

            <SectionBlock title="פוטנציאל" icon="potential">
              <InsightRowsList
                items={model?.potentialRows || []}
                emptyText="אין כרגע תובנות פוטנציאל להצגה"
              />
            </SectionBlock>

            <SectionBlock title="פירוט דומיינים" icon="abilities">
              <InsightCardsGrid
                items={model?.domainRows || []}
                emptyText="אין כרגע דומיינים תקפים להצגה"
              />
            </SectionBlock>

            <SectionBlock title="לפי עמדות" icon="position">
              <InsightCardsGrid
                items={model?.positionRows || []}
                emptyText="אין כרגע נתוני עמדות להצגה"
              />
            </SectionBlock>

            <SectionBlock title="לפי שכבות" icon="layers">
              <InsightCardsGrid
                items={model?.layerRows || []}
                emptyText="אין כרגע נתוני שכבות להצגה"
              />
            </SectionBlock>

            <SectionBlock title="לפי תפקיד בסגל" icon="keyPlayer">
              <InsightCardsGrid
                items={model?.roleRows || []}
                emptyText="אין כרגע נתוני תפקידי סגל להצגה"
              />
            </SectionBlock>
          </Box>
        </DialogContent>
      </Sheet>
    </Drawer>
  )
}
