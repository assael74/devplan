// playerProfile/desktop/modules/payments/PlayerPaymentsModule.js

import React from 'react'
import { Box, Tabs, TabList, Tab, TabPanel, Typography } from '@mui/joy'

import SectionPanel from '../../../../sharedProfile/desktop/SectionPanel.js'
import EmptyState from '../../../../sharedProfile/EmptyState.js'

import PaymentsToolbar from './components/toolbar/PaymentsToolbar.js'
import PaymentsTable from './components/table/PaymentsTable'
import ParentsTab from './components/ParentsTab'
import EditDrawer from './components/drawer/EditDrawer.js'

import { moduleSx as sx } from './sx/module.sx'

import { usePlayerPaymentsModuleModel } from '../../../sharedModules/payments'

export default function PlayerPaymentsModule({ entity, context }) {
  const model = usePlayerPaymentsModuleModel({ entity })

  const {
    player,
    desktopTab,
    filters,
    editingPayment,

    itemsFiltered,
    summary,
    options,

    setDesktopTab,
    setFilters,
    setEditingPayment,
  } = model

  return (
    <SectionPanel>
      {!player ? (
        <EmptyState title="אין שחקן" desc="לא התקבל אובייקט שחקן." />
      ) : (
        <Box sx={{ width: '100%' }}>
          <Tabs value={desktopTab} onChange={(_, value) => setDesktopTab(value)}>
            <TabList sx={{ mb: 1 }}>
              <Tab value={0}>
                <Typography level="body-sm">פרטי הורה</Typography>
              </Tab>

              <Tab value={1}>
                <Typography level="body-sm">תשלומים</Typography>
              </Tab>
            </TabList>

            <TabPanel value={0} sx={{ px: 1, py: 0.5 }}>
              <ParentsTab player={player} />
            </TabPanel>

            <TabPanel value={1} sx={{ px: 1, py: 0.5 }}>
              <Box sx={sx.boxWrap}>
                <PaymentsToolbar
                  filters={filters}
                  onChangeFilters={setFilters}
                  options={options}
                  summary={summary}
                />
              </Box>

              {itemsFiltered.length === 0 ? (
                <EmptyState
                  title="אין תשלומים"
                  desc="אין נתוני תשלום בהתאמה לפילטרים."
                />
              ) : (
                <PaymentsTable
                  items={itemsFiltered}
                  onEdit={payment => setEditingPayment(payment)}
                />
              )}
            </TabPanel>
          </Tabs>
        </Box>
      )}

      <EditDrawer
        open={!!editingPayment}
        payment={editingPayment}
        context={{ ...context, player }}
        onClose={() => setEditingPayment(null)}
        onSaved={() => setEditingPayment(null)}
      />
    </SectionPanel>
  )
}
