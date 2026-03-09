//// / teamDashboard/playersList/deskTop/B_DeskTopPlayersList.js
import React, { useMemo, useState } from 'react';
import { useTheme } from '@mui/joy/styles';
import { iconAbilitiesUi } from '../../../../b_styleObjects/icons/abilitiesIcons';
import { groupAbilitiesByDomain } from '../../../../x_utils/abilitiesList';
import { boxDomaimProps } from './X_Style'
import { Box, Grid, Typography, Chip, LinearProgress, Divider, Stack, Input, Switch, Tooltip, CircularProgress } from '@mui/joy';
import { Card, CardContent } from '@mui/joy';
import JoyStarRatingStatic from '../../../../h_componnetsUtils/rating/JoyStarRating';
import FloatingAddButton from '../../../../d_analystComp/a_containers/J_FloatingAddButton.js'
import NewEvaluationForm from '../../../../f_forms/J_NewEvaluation.js'

/* ---------- Helpers ---------- */
const isFilled = (v) => typeof v === 'number' && v > 0 && !Number.isNaN(v);
const toFixed1 = (n) => (Number.isFinite(n) ? (Math.round(n * 10) / 10).toFixed(1) : '—');
const clamp0to5 = (v) => (Number.isFinite(v) ? Math.min(5, Math.max(0, v)) : 0);

function scoreColor(v) {
  if (!Number.isFinite(v)) return 'neutral';
  if (v >= 4) return 'success';
  if (v >= 3) return 'primary';
  if (v > 0) return 'warning';
  return 'neutral';
}

function calcDomainScore(items) {
  const filledItems = items.filter(i => isFilled(i.value));
  if (!filledItems.length) return NaN;
  const hasWeights = filledItems.some(i => typeof i.weight === 'number' && i.weight > 0);
  if (hasWeights) {
    const wSum = filledItems.reduce((s, i) => s + (i.weight || 0), 0);
    if (!wSum) return NaN;
    return filledItems.reduce((s, i) => s + i.value * (i.weight || 0), 0) / wSum;
  }
  return filledItems.reduce((s, i) => s + i.value, 0) / filledItems.length;
}

/* שורת כוכבים עם מספר בצד, בטוחה לערכים חסרים */
const StarRow = ({ label, value }) => {
  const numLabel = toFixed1(value);
  const starValue = clamp0to5(value);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography fontSize="14px" level="body-xs" color="neutral">
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography fontSize="14px" level="body-xs" color="neutral">
          {numLabel}
        </Typography>
        <JoyStarRatingStatic value={starValue} size="md" /* precision={0.5} */ />
      </Box>
    </Box>
  );
};

/* ---------- Main Component ---------- */
export default function DeskTopPlayerAbilitiesList({
  view,
  player,
  actions,
  isMobile,
  formProps,
}) {
  const theme = useTheme();

  const domains = useMemo(
    () => groupAbilitiesByDomain(player?.abilities || {}),
    [player?.abilities]
  );

  // סיכומי-על
  const total = useMemo(() => domains.reduce((s, d) => s + d.items.length, 0), [domains]);
  const filled = useMemo(
    () => domains.reduce((s, d) => s + d.items.filter(i => isFilled(i.value)).length, 0),
    [domains]
  );
  const allScores = useMemo(
    () => domains.flatMap(d => d.items.map(i => i.value)).filter(isFilled),
    [domains]
  );
  const avgAll = useMemo(
    () => (allScores.length ? allScores.reduce((s, x) => s + x, 0) / allScores.length : NaN),
    [allScores]
  );

  // שליטת UI
  const [showOnlyFilled, setShowOnlyFilled] = useState(false);
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  // סינון & חיפוש
  const filteredDomains = useMemo(() => {
    return domains.map(d => {
      const items = d.items.filter(i => {
        const passFilled = showOnlyFilled ? isFilled(i.value) : true;
        const passQuery = q ? (i.label?.toLowerCase().includes(q) || i.id?.toLowerCase().includes(q)) : true;
        return passFilled && passQuery;
      });
      return { ...d, items };
    }).filter(d => d.items.length > 0);
  }, [domains, showOnlyFilled, q]);

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1.5, overflowY: 'auto', height: '75vh' }}>
      {/* Header / סרגל בקרה */}
      <Card variant="soft">
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid xs={12} md={4}>
              <Typography level="title-sm">סיכום כולל</Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                <Chip size="sm" variant="soft">{`הושלמו ${filled}/${total}`}</Chip>
                <Chip size="sm" variant="soft" color={scoreColor(avgAll)}>{`ממוצע: ${toFixed1(avgAll)}`}</Chip>
              </Stack>
            </Grid>

            <Grid xs={12} md={4}>
              {/* ⭐⭐ כוכבים: רמה ופוטנציאל ⭐⭐ */}
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3, alignItems: 'center', ml: 1}}>
                <StarRow label="יכולת נוכחית" value={player?.level} />
                <StarRow label="פוטנציאל" value={player?.levelPotential} />
              </Box>
            </Grid>

            <Grid xs={12} md={4}>
              <Stack direction={{ xs:'column', sm:'row' }} spacing={1} alignItems={{ xs:'stretch', sm:'center' }} justifyContent="flex-end">
                <Input
                  size="sm"
                  placeholder="חיפוש יכולת…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  sx={{ maxWidth: 280 }}
                />
                <Stack direction="row" spacing={1} alignItems="center">
                  <Switch
                    checked={showOnlyFilled}
                    onChange={(e) => setShowOnlyFilled(e.target.checked)}
                    size="sm"
                  />
                  <Typography level="body-sm" sx={{ whiteSpace: 'nowrap' }}>
                    הצג רק מלאים
                  </Typography>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Domain cards */}
      <Grid container spacing={2}>
        {filteredDomains.map((domain) => {
          const domainAvg = calcDomainScore(domain.items);
          const pct = Number.isFinite(domainAvg) ? (domainAvg / 5) * 100 : 0;
          const dColor = scoreColor(domainAvg);
          const filledCount = domain.items.filter(i => isFilled(i.value)).length;

          return (
            <Grid key={domain.domain} xs={12} sm={6} lg={4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  {/* כותרת כרטיס */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography level="title-sm" startDecorator={iconAbilitiesUi({ id: domain.domain })}>
                      {domain.domainLabel}
                    </Typography>
                    <Chip size="sm" variant="soft">{`${filledCount}/${domain.items.length}`}</Chip>
                  </Stack>

                  {/* טבעת ממוצע + פס */}
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ my: 1 }}>
                    <Box sx={{ position: 'relative', width: 48, height: 48 }}>
                      <CircularProgress determinate value={pct} color={dColor} size="sm" sx={{ width: 48, height: 48 }} />
                      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography level="body-xs">{toFixed1(domainAvg)}</Typography>
                      </Box>
                    </Box>
                    <Stack spacing={0.25}>
                      <Typography level="body-xs" sx={{ color: 'neutral.500' }}>ממוצע דומיין</Typography>
                      <LinearProgress determinate value={pct} color={dColor} sx={{ width: 160 }} />
                    </Stack>
                  </Stack>

                  <Divider sx={{ my: 1 }} />

                  {/* רשימת יכולות */}
                  <Stack spacing={0.6}>
                    {domain.items.map((it) => {
                      const value = it.value;
                      const filled = isFilled(value);
                      const p = filled ? (value / 5) * 100 : 0;
                      const c = filled ? scoreColor(value) : 'neutral';

                      return (
                        <Box key={it.id} {...boxDomaimProps}>
                          <Tooltip title={it?.description || it?.label || ''}>
                            <Typography level="body-sm" startDecorator={iconAbilitiesUi({ id: it.id })}>
                              {it.label}
                            </Typography>
                          </Tooltip>
                          <Chip size="sm" variant={filled ? 'soft' : 'outlined'} color={c}>
                            {filled ? value : '—'}
                          </Chip>

                          <LinearProgress
                            determinate
                            value={p}
                            color={c}
                            size="sm"
                            variant="plain"
                            sx={{ gridColumn: '1 / -1' }}
                          />
                        </Box>
                      );
                    })}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* אין תוצאות אחרי סינון */}
      {filteredDomains.length === 0 && (
        <Card variant="soft">
          <CardContent>
            <Typography level="body-sm" sx={{ color: 'neutral.500' }}>
              אין תוצאות לתצוגה — נסה לבטל “הצג רק מלאים” או נקה את החיפוש.
            </Typography>
          </CardContent>
        </Card>
      )}

    </Box>
  );
}
