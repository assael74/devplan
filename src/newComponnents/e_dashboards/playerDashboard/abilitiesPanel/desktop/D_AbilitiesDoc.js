import React, { useMemo, useEffect } from 'react';
import { useTheme } from '@mui/joy/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import useObjectUpdateActions from '../../../../g_quickForms/useObjectUpdateActions.js';

import {
  Drawer, Sheet, Box, Grid, Card, CardContent, Typography, Chip,
  LinearProgress, Stack, Divider, IconButton, Button, Tooltip, Avatar, Textarea
} from '@mui/joy';

import { iconUi } from '../../../../b_styleObjects/icons/IconIndex.js';
import { drawerConsProps, sheetWraperProps, boxContentWraperProps } from './X_Style';
import { abilitiesList } from '../../../../x_utils/abilitiesList.js';
import { getFullDateIl } from '../../../../x_utils/dateUtiles.js';
import RoleSelectField from '../../../../f_forms/allFormInputs/selectUi/RoleSelectField.js';
import RoleTypeSelect from '../../../../f_forms/allFormInputs/selectUi/RoleTypeSelectField.js';

const growthStageOptions = [
  { value: 1, label: 'מאוד מוקדם' },
  { value: 2, label: 'מוקדם' },
  { value: 3, label: 'בזמן' },
  { value: 4, label: 'מאוחר' },
  { value: 5, label: 'מאוד מאוחר' },
];

function labelForGrowthStage(val) {
  const opt = growthStageOptions.find(o => o.value === val);
  return opt ? opt.label : 'לא צוין';
}

const toFixed1 = (n) => (Number.isFinite(n) ? (Math.round(n * 10) / 10).toFixed(1) : '—');
const isFilledNum = (v) => typeof v === 'number' && !Number.isNaN(v);

/** קיבוץ יכולות לדומיינים */
function groupAbilities() {
  const groups = abilitiesList.reduce((acc, a) => {
    acc[a.domain] = acc[a.domain] || [];
    acc[a.domain].push(a);
    return acc;
  }, {});
  return { groups, order: Object.keys(groups) };
}

/** סטטיסטיקות לדומיין */
function domainStats(domainAbilities, abilitiesValues) {
  const vals = domainAbilities
    .map(a => abilitiesValues?.[a.id])
    .filter(isFilledNum);
  const filled = vals.length;
  const total = domainAbilities.length;
  const avg = filled ? vals.reduce((s, x) => s + x, 0) / filled : NaN;
  return { avg, filled, total };
}

export default function ReviewEvaluationSheet({
  open,
  setOpen,
  report,
  formProps,
  onEdit,
  onAdd,
  player,
  type = 'evaluationReport', // אופציונלי: שם טיפוס לוגי להוק
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const r = report || {};
  const abilitiesValues = r.abilities || {};

  // מידע שחקן/מועדון/קבוצה
  const playerName = player?.playerFullName || 'שחקן לא ידוע';
  const club = (formProps?.clubs || []).find(t => t.id === player?.clubId);
  const team = (formProps?.teams || []).find(t => t.id === player?.teamId);
  const clubName = club?.clubName || '';
  const teamName = team?.teamName || '';

  const {
    update,
    isDirty,
    setUpdate,
    handleSubmit,
    handleReset,
  } = useObjectUpdateActions({
    value: r,
    type,
    onSubmit: async (patch) => {
      const updated = { ...r, ...patch };
      if (onEdit) await onEdit(updated);
      else if (onAdd) await onAdd(updated);
      setOpen('');
    },
  });

  // סגירה מאפסת טיוטה
  useEffect(() => {
    if (!open) handleReset();
  }, [open, handleReset]);

  const { groups, order } = useMemo(() => groupAbilities(), []);

  // חישובי סיכום
  const summary = useMemo(() => {
    const allScores = abilitiesList
      .map(a => abilitiesValues[a.id])
      .filter(isFilledNum);
    const filledAll = allScores.length;
    const totalAll = abilitiesList.length;
    const avgAll = filledAll ? allScores.reduce((s, x) => s + x, 0) / filledAll : NaN;

    const perDomain = order.map((domain) => {
      const stats = domainStats(groups[domain], abilitiesValues);
      const label = groups[domain][0]?.domainLabel || domain;
      return { domain, label, ...stats };
    });

    const withAvg = perDomain.filter(d => Number.isFinite(d.avg));
    const strongest = withAvg.length ? withAvg.reduce((a, b) => (a.avg >= b.avg ? a : b)) : null;
    const weakest  = withAvg.length ? withAvg.reduce((a, b) => (a.avg <= b.avg ? a : b)) : null;

    return { avgAll, filledAll, totalAll, perDomain, strongest, weakest };
  }, [abilitiesValues, groups, order]);

  const roles = formProps?.roles || [];

  const EMPTY_ROLE = React.useMemo(
    () => ({ id: '', fullName: '', }),
    []
  );

  const selectedEvaluator = React.useMemo(() => {
    const id = update?.evaluatorId ?? report?.evaluatorId;
    return id ? roles.find(r => r.id === id) : undefined;
  }, [update?.evaluatorId, report?.evaluatorId, roles]);

  // ערכים מוצגים = patch || מקור
  const evaluatorId    = update.evaluatorId   ?? r.evaluatorId   ?? '';
  const evaluatorRole  = update.evaluatorRole ?? r.evaluatorRole ?? '';
  const note           = update.note          ?? r.note          ?? '';
  //console.log(selectedEvaluator)
  return (
    <Drawer {...drawerConsProps(open, setOpen)}>
      <Sheet {...sheetWraperProps}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, p: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
            <Avatar size="sm">{(playerName || '?').slice(0,1)}</Avatar>
            <Box>
              <Typography level="title-md" sx={{ lineHeight: 1.1 }}>{playerName}</Typography>
              <Typography level="body-xs" sx={{ color: 'neutral.500' }}>
                {clubName ? `${clubName} • ` : ''}{teamName ? `${teamName}` : ''}
              </Typography>
              <Typography level="body-xs" sx={{ color: 'neutral.500' }}>
                {getFullDateIl(r.reportDate)}
              </Typography>
            </Box>
          </Box>
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="הדפסה">
              <IconButton variant="plain" size="sm">{iconUi({ id: 'print' })}</IconButton>
            </Tooltip>
            <Tooltip title="שיתוף">
              <IconButton variant="plain" size="sm">{iconUi({ id: 'share' })}</IconButton>
            </Tooltip>
            <IconButton size="sm" onClick={() => setOpen('')}>
              {iconUi({ id: 'close' })}
            </IconButton>
          </Stack>
        </Box>
        <Divider />

        <Box {...boxContentWraperProps('evaluation', isMobile)}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* RIGHT / SIDE PANEL – Evaluator & Notes edit */}
            <Grid xs={12} md={4} lg={3} order={{ xs: 2, md: 1 }}>
              <Card variant="soft" sx={{ position: 'sticky', top: 12 }}>
                <CardContent>
                  <Typography level="title-sm" sx={{ mb: 1 }}>פרטי דו״ח</Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
                    <Chip size="sm" variant="soft">
                      {`הושלמו ${summary.filledAll}/${summary.totalAll}`}
                    </Chip>
                    <Chip size="sm" variant="soft">
                      {`שלב גדילה: ${labelForGrowthStage(abilitiesValues.growthStage)}`}
                    </Chip>
                  </Stack>

                  <Divider sx={{ my: 1 }} />

                  <Typography level="title-sm" sx={{ mb: 1 }}>עריכת מעריך / תפקיד</Typography>
                  <Box sx={{ display: 'grid', gap: 1.2, mb: 1.5 }}>
                    <RoleSelectField
                      options={formProps?.roles || []}
                      value={selectedEvaluator}
                      formProps={formProps}
                      size={isMobile ? 'sm' : 'md'}
                      onChange={(obj) => setUpdate({
                        evaluatorId: obj?.id ?? '',
                        evaluatorName: obj?.fullName ?? obj?.displayName ?? obj?.name ?? '',
                      })}
                      placeholder="שם המעריך"
                    />
                    <RoleTypeSelect
                      required
                      value={update?.evaluatorRole ?? r.evaluatorRole ?? ''}
                      size={isMobile ? 'sm' : 'md'}
                      onChange={(val) => setUpdate('evaluatorRole', val)}
                    />
                  </Box>

                  <Typography level="title-sm" sx={{ mb: 1 }}>הערות</Typography>
                  <Textarea
                    minRows={3}
                    value={note}
                    onChange={(e) => setUpdate('note', e.target.value)}
                    placeholder="הקלד הערות..."
                    size={isMobile ? 'sm' : 'md'}
                  />

                  <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                    <Button
                      onClick={handleSubmit}
                      color="success"
                      variant="solid"
                      size="md"
                      disabled={!isDirty}
                    >
                      שמור
                    </Button>
                    <Button
                      onClick={handleReset}
                      variant="outlined"
                      size="md"
                      disabled={!isDirty}
                    >
                      אפס
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* MAIN */}
            <Grid xs={12} md={8} lg={9} order={{ xs: 1, md: 2 }}>
              {/* Summary card */}
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid xs={12} sm={4}>
                      <Typography level="body-xs" sx={{ color: 'neutral.500' }}>ממוצע כללי</Typography>
                      <Typography level="h4" sx={{ mt: 0.5 }}>{toFixed1(summary.avgAll)}</Typography>
                      <LinearProgress determinate value={Number.isFinite(summary.avgAll) ? (summary.avgAll / 5) * 100 : 0} sx={{ mt: 1 }} />
                    </Grid>
                    <Grid xs={12} sm={4}>
                      <Typography level="body-xs" sx={{ color: 'neutral.500' }}>חוזקה יחסית</Typography>
                      <Typography level="title-lg" sx={{ mt: 0.5 }}>
                        {summary.strongest ? `${summary.strongest.label} • ${toFixed1(summary.strongest.avg)}` : '—'}
                      </Typography>
                      <LinearProgress determinate value={summary.strongest ? (summary.strongest.avg / 5) * 100 : 0} sx={{ mt: 1 }} />
                    </Grid>
                    <Grid xs={12} sm={4}>
                      <Typography level="body-xs" sx={{ color: 'neutral.500' }}>נקודת חולשה</Typography>
                      <Typography level="title-lg" sx={{ mt: 0.5 }}>
                        {summary.weakest ? `${summary.weakest.label} • ${toFixed1(summary.weakest.avg)}` : '—'}
                      </Typography>
                      <LinearProgress determinate value={summary.weakest ? (summary.weakest.avg / 5) * 100 : 0} sx={{ mt: 1 }} />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Domain cards */}
              <Grid container spacing={2}>
                {summary.perDomain.map((d) => (
                  <Grid key={d.domain} xs={12} sm={6} lg={4}>
                    <Card variant="soft">
                      <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                          <Typography level="title-sm">{d.label}</Typography>
                          <Chip size="sm" variant="soft">
                            {`${d.filled}/${d.total}`}
                          </Chip>
                        </Stack>
                        <LinearProgress determinate value={Number.isFinite(d.avg) ? (d.avg / 5) * 100 : 0} />
                        <Typography level="body-xs" sx={{ mt: 0.5, color: 'neutral.500' }}>
                          ממוצע: {toFixed1(d.avg)}
                        </Typography>

                        <Divider sx={{ my: 1.2 }} />

                        <Stack spacing={0.5}>
                          {groups[d.domain].map((a) => {
                            const val = abilitiesValues?.[a.id];
                            const filled = isFilledNum(val);
                            return (
                              <Stack key={a.id} direction="row" alignItems="center" justifyContent="space-between">
                                <Tooltip title={a?.description || a?.label || ''}>
                                  <Typography level="body-sm" sx={{ pr: 0.5 }}>{a.label}</Typography>
                                </Tooltip>
                                <Chip
                                  size="sm"
                                  variant={filled ? 'soft' : 'outlined'}
                                  color={filled ? 'primary' : 'neutral'}
                                >
                                  {filled ? val : '—'}
                                </Chip>
                              </Stack>
                            );
                          })}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Sheet>
    </Drawer>
  );
}
