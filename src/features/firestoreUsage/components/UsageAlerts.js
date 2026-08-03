import React from 'react'
import {
  Alert,
  Box,
  Card,
  Chip,
  Typography,
} from '@mui/joy'

import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'

const buildAlerts = viewModel => {
  const alerts = []
  const heaviestCollection = viewModel.collections[0]

  if (heaviestCollection) {
    const reads = Number(heaviestCollection.reads || 0)
    const writes = Number(heaviestCollection.writes || 0)
    const readKb = Number(heaviestCollection.estimatedReadKb || 0)
    const writeKb = Number(heaviestCollection.estimatedWriteKb || 0)
    const averageReadKb = reads > 0 ? readKb / reads : 0
    const isHeavy = heaviestCollection.totalEstimatedKb >= 1000

    alerts.push({
      id: isHeavy ? 'heavy-collection' : 'top-collection',
      color: isHeavy ? 'danger' : 'primary',
      icon: isHeavy ? <ErrorOutlineRoundedIcon /> : <WarningAmberRoundedIcon />,
      title: isHeavy
        ? `${heaviestCollection.name} מעביר נפח נתונים גבוה`
        : `${heaviestCollection.name} הוא מקור ה-payload הגדול ביותר בסשן`,
      description: isHeavy
        ? 'הנפח אינו חיוב בפני עצמו, אך הוא עלול להשפיע על זמן טעינה, זיכרון ותעבורה.'
        : 'זהו מדד ביצועים ונפח בלבד — לא התראת חיוב.',
      metrics: [
        { label: 'קריאות מסמך', value: reads.toLocaleString('he-IL') },
        { label: 'נפח קריאה משוער', value: `${readKb.toFixed(2)} KB` },
        { label: 'ממוצע למסמך', value: `${averageReadKb.toFixed(2)} KB` },
        ...(writes > 0
          ? [{ label: 'כתיבות', value: writes.toLocaleString('he-IL') }]
          : []),
        ...(writeKb > 0
          ? [{ label: 'נפח כתיבה משוער', value: `${writeKb.toFixed(2)} KB` }]
          : []),
      ],
      note: reads > 0
        ? `מבחינת מכסת Firestore: ${reads.toLocaleString('he-IL')} קריאות מסמך בלבד מתוך המכסה היומית.`
        : 'לא נרשמו קריאות מסמך עבור Collection זה בסשן הנוכחי.',
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
    <Card
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 'lg',
        boxShadow: 'sm',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
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

              {Array.isArray(alert.metrics) && alert.metrics.length > 0 ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 0.75,
                    mt: 1,
                  }}
                >
                  {alert.metrics.map(metric => (
                    <Chip
                      key={`${alert.id}-${metric.label}`}
                      size="sm"
                      variant="outlined"
                      color="neutral"
                    >
                      {metric.label}: {metric.value}
                    </Chip>
                  ))}
                </Box>
              ) : null}

              {alert.note ? (
                <Typography
                  level="body-xs"
                  sx={{ mt: 1, fontWeight: 600 }}
                >
                  {alert.note}
                </Typography>
              ) : null}
            </Box>
          </Alert>
        ))}
      </Box>
    </Card>
  )
}
