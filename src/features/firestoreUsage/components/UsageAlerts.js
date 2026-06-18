import React from 'react'
import {
  Alert,
  Box,
  Card,
  Typography,
} from '@mui/joy'

import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'

const buildAlerts = viewModel => {
  const alerts = []
  const heaviestCollection = viewModel.collections[0]

  if (
    heaviestCollection &&
    heaviestCollection.totalEstimatedKb >= 1000
  ) {
    alerts.push({
      id: 'heavy-collection',
      color: 'danger',
      icon: <ErrorOutlineRoundedIcon />,
      title: `${heaviestCollection.name} הוא ה-collection הכבד ביותר`,
      description:
        `${heaviestCollection.totalEstimatedKb.toFixed(2)} KB נטענו או נכתבו בסשן. ` +
        'כדאי לבדוק pagination, lazy loading או פיצול payload.',
    })
  } else if (heaviestCollection) {
    alerts.push({
      id: 'top-collection',
      color: 'warning',
      icon: <WarningAmberRoundedIcon />,
      title: `${heaviestCollection.name} מוביל בצריכת נתונים`,
      description:
        `${heaviestCollection.totalEstimatedKb.toFixed(2)} KB בסשן הנוכחי. ` +
        'כדאי לעקוב אם המספר ממשיך לגדול לאורך עבודה רגילה.',
    })
  }

  if (viewModel.totals.listenerUpdates > 100) {
    alerts.push({
      id: 'listeners',
      color: 'warning',
      icon: <WarningAmberRoundedIcon />,
      title: 'כמות גבוהה של Listener Updates',
      description:
        `${viewModel.totals.listenerUpdates} עדכוני listener נרשמו בסשן. ` +
        'כדאי לבדוק listeners שנפתחים מחדש או מאזינים למסמכים גדולים.',
    })
  }

  if (viewModel.expensiveActions.length > 0) {
    alerts.push({
      id: 'expensive-actions',
      color: 'danger',
      icon: <ErrorOutlineRoundedIcon />,
      title: 'זוהו פעולות שעברו את סף הגודל',
      description:
        `${viewModel.expensiveActions.length} פעולות מופיעות ברשימת הפעולות הכבדות.`,
    })
  }

  if (alerts.length === 0) {
    alerts.push({
      id: 'healthy',
      color: 'success',
      icon: <CheckCircleOutlineRoundedIcon />,
      title: 'לא זוהו חריגות מרכזיות',
      description:
        'הסשן הנוכחי נמצא בטווחים שהוגדרו. מומלץ לבדוק גם אחרי פעולות יצירה, עדכון ומחיקה.',
    })
  }

  return alerts.slice(0, 4)
}

export default function UsageAlerts({ viewModel }) {
  const alerts = buildAlerts(viewModel)

  return (
    <Card variant="outlined" sx={{ p: 2, borderRadius: 'lg', boxShadow: 'sm' }}>
      <Typography level="title-lg" sx={{ mb: 1.5 }}>
        התראות מערכת
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {alerts.map(alert => (
          <Alert
            key={alert.id}
            color={alert.color}
            variant="soft"
            startDecorator={alert.icon}
            sx={{ alignItems: 'flex-start', borderRadius: 'md' }}
          >
            <Box>
              <Typography level="title-sm">
                {alert.title}
              </Typography>

              <Typography level="body-xs" sx={{ mt: 0.5 }}>
                {alert.description}
              </Typography>
            </Box>
          </Alert>
        ))}
      </Box>
    </Card>
  )
}
