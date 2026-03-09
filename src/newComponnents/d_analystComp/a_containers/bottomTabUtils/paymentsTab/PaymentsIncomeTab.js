// bottomTabUtils/tabs/PaymentsIncomeTab.js
import React from 'react';
import { sheetTabsProps, boxWraperPanelProps } from './X_Style'
import { Box, Typography, Sheet, Button } from '@mui/joy';
import IncomeTableView from './IncomeTableView';
import IncomeChartView from './IncomeChartView';
import { AnimatePresence, motion } from 'framer-motion';

export default function PaymentsIncomeTab({
  data = [],
  formProps = {},
  title = 'פירוט הכנסה',
}) {
  const [view, setView] = React.useState('table');
  const MotionBox = motion.create(Box);

  return (
    <Box sx={{ width: '100%', py: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <Box sx={{ display: 'flex', flexDirection: 'row', mb: 2, pr: { md: 1, xs: 1 } }}>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size='sm'
            variant={view === 'table' ? 'solid' : 'soft'}
            color="primary"
            sx={{ transform: view === 'table' ? 'scale(1.05)' : 'none' }}
            onClick={() => setView('table')}
          >
            טבלה
          </Button>
          <Button
            variant={view === 'chart' ? 'solid' : 'soft'}
            color="primary"
            size='sm'
            sx={{ transform: view === 'chart' ? 'scale(1.05)' : 'none' }}
            onClick={() => setView('chart')}
          >
            גרף
          </Button>
        </Box>
      </Box>

      <Sheet {...sheetTabsProps}>
        <AnimatePresence mode="wait">
          <MotionBox key={view} {...boxWraperPanelProps}>
            {view === 'table' && (
              <IncomeTableView
                payments={data}
                players={formProps.players}
                teams={formProps.teams}
                clubs={formProps.clubs}
              />
            )}

            {view === 'chart' && (
              <IncomeChartView
                payments={data}
                players={formProps.players}
                teams={formProps.teams}
                clubs={formProps.clubs}
              />
            )}
          </MotionBox>
          </AnimatePresence>
      </Sheet>
    </Box>
  );
}
