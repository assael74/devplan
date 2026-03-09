import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import moment from 'moment';
import { useTheme } from '@mui/joy/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  Drawer, Sheet, Box, Grid, Card, CardContent, Typography, Chip,
  LinearProgress, Stack, Divider, IconButton, Button, Tooltip, Select, Option, Input
} from '@mui/joy';

import { iconUi } from '../b_styleObjects/icons/IconIndex.js';
import { iconAbilitiesUi } from '../b_styleObjects/icons/abilitiesIcons.js'; // ⬅️ אייקונים לפי הקובץ שצירפת
import { drawerConsProps, sheetWraperProps1, boxContentWraperProps, clearButtProps, footerBoxProps } from './X_Style';
import useGenericActions from './X_UseGenericActions';
import { abilitiesList } from '../x_utils/abilitiesList.js';
import { mergeAbilitiesWeighted } from './helpers/calcultor.js';
import { buildAbilitiesFormEntry } from './helpers/X_Actions.js';
import PlayerSelectField from './allFormInputs/selectUi/PlayerSelectField.js';
import RoleSelectField from './allFormInputs/selectUi/RoleSelectField.js';
import RoleTypeSelect from './allFormInputs/selectUi/RoleTypeSelectField.js';
import DateInputField from './allFormInputs/dateUi/DateInputField.js';

/* ---------- Consts ---------- */
const growthStageOptions = [
  { value: 1, label: 'מאוד מוקדם' },
  { value: 2, label: 'מוקדם' },
  { value: 3, label: 'בזמן' },
  { value: 4, label: 'מאוחר' },
  { value: 5, label: 'מאוד מאוחר' },
];

const abilitiesLabels = {
  1: '1 - צריך שיפור',
  2: '2 - מתחת למצופה',
  3: '3 - ממוצע',
  4: '4 - טוב',
  5: '5 - מצוין',
};

const isNum = (v) => typeof v === 'number' && !Number.isNaN(v);
const toFixed1 = (n) => (Number.isFinite(n) ? (Math.round(n * 10) / 10).toFixed(1) : '—');

/* ---------- Small UI helpers ---------- */
const ParamLabel = ({ iconId, children }) => (
  <Typography
    level="body-sm"
    fontWeight="lg"
    startDecorator={iconUi({ id: iconId, size: 'xs' })}
    sx={{ mb: 0.25, display: 'flex', alignItems: 'center', gap: 0.5 }}
  >
    {children}
  </Typography>
);

const AbilityLabel = ({ abilityId, children }) => (
  <Typography
    level="body-sm"
    fontWeight="lg"
    fontSize='12px'
    startDecorator={iconAbilitiesUi({ id: abilityId, size: 'small' })}
    sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}
  >
    {children}
  </Typography>
);

/* בחירה מהירה 1–5 בצ’יפים קומפקטיים */
function ScorePicker({ value, onChange, size = 'sm' }) {
  return (
    <Stack direction="row" spacing={0.6}>
      {[1, 2, 3, 4, 5].map((n) => {
        const active = value === n;
        return (
          <Chip
            key={n}
            size={size}
            variant={active ? 'solid' : 'outlined'}
            color={active ? 'primary' : 'neutral'}
            onClick={() => onChange(n)}
            sx={{ cursor: 'pointer', minWidth: 0, justifyContent: 'center' }}
          >
            {n}
          </Chip>
        );
      })}
    </Stack>
  );
}

/* קיבוץ היכולות לדומיינים – מדלגים על growthStage (בטופס הימני) */
function useAbilityGroups() {
  return useMemo(() => {
    const groups = abilitiesList.reduce((acc, a) => {
      if (a.id === 'growthStage') return acc;
      acc[a.domain] = acc[a.domain] || [];
      acc[a.domain].push(a);
      return acc;
    }, {});
    const order = Object.keys(groups);
    return { groups, order };
  }, []);
}

/* סטטיסטיקות לדומיין */
function calcDomainStats(domainAbilities, values) {
  const vals = domainAbilities.map(a => values?.[a.id]).filter(isNum);
  const filled = vals.length;
  const total = domainAbilities.length;
  const avg = filled ? vals.reduce((s, x) => s + x, 0) / filled : NaN;
  return { filled, total, avg };
}

/* ---------- Main Component ---------- */
export default function NewEvaluationForm({
  view,
  type,
  open,
  onAdd,
  onEdit,
  setOpen,
  formProps,
  onSaveAbilities,
  ...props
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const wasOpenRef = useRef(open);

  const getInitialState = useCallback(() => ({
    playerId: view === 'profilePlayer' ? props.player?.id : '',
    reportDate: moment().format('YYYY-MM-DD'),
    evaluatorId: '',
    evaluatorRole: '',
    note: '',
    abilities: {},
  }), [view, props.player?.id]);

  const validationRules = {
    playerId: (val) => String(val ?? '').trim() === '',
    reportDate: (val) => String(val ?? '').trim() === '',
    evaluatorId: (val) => String(val ?? '').trim() === '',
    evaluatorRole: (val) => String(val ?? '').trim() === '',
  };

  const {
    data,
    errors,
    handleChange,
    handleSubmit: submitGeneric,
    handleClose,
    resetForm
  } = useGenericActions({
    initialState: getInitialState(),
    validationRules,
    onSubmit: async (formData) => {
      const playerId = formData.playerId;
      const player = (formProps?.players || []).find(i => i.id === playerId);

      const oldAbilities = player?.abilities || {};
      const newAbilities = formData.abilities || {};

      const playerUpdateData = mergeAbilitiesWeighted(oldAbilities, newAbilities, playerId);
      const abilitiesUpdateData = buildAbilitiesFormEntry(formData);

      const newPlayer = { ...playerUpdateData, docAbilitiesId: player?.docAbilitiesId };
      const abilitiesDoc = { docId: player?.docAbilitiesId, ...abilitiesUpdateData };

      await onEdit({ oldItem: {}, newItem: newPlayer, type: 'players' });
      await onSaveAbilities?.({ newFormData: abilitiesDoc, docId: player?.docAbilitiesId, type: 'abilities' });

      setOpen(false);
    }
  });

  useEffect(() => {
    const wasOpen = wasOpenRef.current;
    if (open && !wasOpen) resetForm(getInitialState());
    wasOpenRef.current = open;
  }, [open, getInitialState, resetForm]);

  const { groups, order } = useAbilityGroups();

  const summary = useMemo(() => {
    const all = abilitiesList.filter(a => a.id !== 'growthStage');
    const vals = all.map(a => data.abilities?.[a.id]).filter(isNum);
    const filledAll = vals.length;
    const totalAll = all.length;
    const avgAll = filledAll ? vals.reduce((s, x) => s + x, 0) / filledAll : NaN;
    return { filledAll, totalAll, avgAll };
  }, [data.abilities]);

  return (
    <Drawer {...drawerConsProps(open, setOpen)}>
      <Sheet {...sheetWraperProps1}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography level="h5" fontWeight="lg">טופס הערכת שחקן</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
              <Chip size="sm" variant="soft">{`הושלמו ${summary.filledAll}/${summary.totalAll}`}</Chip>
              <Chip size="sm" variant="soft" color="primary">{`ממוצע: ${toFixed1(summary.avgAll)}`}</Chip>
            </Stack>
          </Box>
          <IconButton size={isMobile ? 'sm' : 'md'} onClick={() => { resetForm(); setOpen(false); }}>
            {iconUi({ id: 'close' })}
          </IconButton>
        </Box>
        <Divider />

        <Box {...boxContentWraperProps('abilities', isMobile)}>
          <Grid container spacing={1} sx={{ mt: 1 }}>
            {/* LEFT PANEL (wider) */}
            <Grid xs={12} md={4} lg={3} order={{ xs: 2, md: 1 }}>
              <Card variant="soft" sx={{ position: { md: 'sticky' }, top: 12 }}>
                <CardContent sx={{ p: 1.25 }}>
                  <Typography level="title-sm" sx={{ mb: 0.5 }}>פרטי דו״ח</Typography>

                  <Grid container spacing={1}>
                    <Grid xs={12}>
                      <ParamLabel iconId="user">שחקן</ParamLabel>
                      <PlayerSelectField
                        error={errors.playerId}
                        options={formProps?.players || []}
                        value={data.playerId}
                        formProps={formProps}
                        required
                        size="sm"
                        readOnly={view === 'profilePlayer'}
                        onChange={(v) => handleChange('playerId', typeof v === 'object' ? v?.id : v)}
                      />
                    </Grid>

                    <Grid xs={12}>
                      <ParamLabel iconId="calendar">תאריך דו״ח</ParamLabel>
                      <DateInputField
                        value={data.reportDate}
                        onChange={(val) => handleChange('reportDate', val)}
                        context="reportDate"
                        required
                        size="sm"
                        error={errors.reportDate}
                      />
                    </Grid>

                    <Grid xs={12}>
                      <ParamLabel iconId="id-badge">שם המעריך</ParamLabel>
                      <RoleSelectField
                        error={errors.evaluatorId}
                        options={formProps?.roles || []}
                        value={data.evaluatorId} // הרכיב התומך: id או אובייקט
                        formProps={formProps}
                        required
                        size="sm"
                        onChange={(objOrId) => {
                          const id = typeof objOrId === 'object' ? objOrId?.id : objOrId;
                          handleChange('evaluatorId', id || '');
                        }}
                        placeholder="שם המעריך"
                      />
                    </Grid>

                    <Grid xs={12}>
                      <ParamLabel iconId="shield-check">תפקיד המעריך</ParamLabel>
                      <RoleTypeSelect
                        required
                        error={errors.evaluatorRole}
                        value={data.evaluatorRole}
                        size="sm"
                        onChange={(val) => handleChange('evaluatorRole', val)}
                      />
                    </Grid>

                    <Grid xs={12}>
                      <AbilityLabel abilityId="growthStage">שלב התפתחות</AbilityLabel>
                      <Select
                        size="sm"
                        value={data.abilities?.growthStage ?? ''}
                        onChange={(_, val) =>
                          handleChange('abilities', { ...data.abilities, growthStage: val })
                        }
                        slotProps={{ listbox: { sx: { maxHeight: 240, width: '100%' } } }}
                        placeholder="בחר שלב התפתחות"
                      >
                        {growthStageOptions.map((opt) => (
                          <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                        ))}
                      </Select>
                    </Grid>

                    <Grid xs={12}>
                      <ParamLabel iconId="note">הערות נוספות</ParamLabel>
                      <Input
                        value={data.note}
                        size="sm"
                        onChange={(e) => handleChange('note', e.target.value)}
                        placeholder="הקלד הערות..."
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* RIGHT — abilities area (narrower) */}
            <Grid xs={12} md={8} lg={9} order={{ xs: 1, md: 2 }} sx={{ mt: 0.5 }}>
              <Grid container spacing={2}>
                {order.map((domain) => {
                  const abilities = groups[domain] || [];
                  const { filled, total, avg } = calcDomainStats(abilities, data.abilities || {});
                  return (
                    <Grid key={domain} xs={12} sx={{ minWidth: '80%' }}>
                      <Card variant="outlined">
                        <CardContent sx={{ p: 1.25 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
                            <Typography
                              level="title-sm"
                              startDecorator={iconAbilitiesUi({ id: domain, size: 'small' })}
                            >
                              {abilities[0]?.domainLabel || domain}
                            </Typography>
                            <Stack direction="row" spacing={0.75} alignItems="center">
                              <Chip size="sm" variant="soft">{`${filled}/${total}`}</Chip>
                              <Chip size="sm" variant="soft" color="primary">{`ממוצע: ${toFixed1(avg)}`}</Chip>
                            </Stack>
                          </Stack>

                          <LinearProgress
                            determinate
                            value={Number.isFinite(avg) ? (avg / 5) * 100 : 0}
                            sx={{ mb: 1 }}
                          />

                          <Grid container spacing={1.2}>
                            {abilities.map((ability) => {
                              const val = data.abilities?.[ability.id];
                              return (
                                <Grid key={ability.id} xs={12} sm={3}>
                                  <AbilityLabel abilityId={ability.id}>{ability.label}</AbilityLabel>

                                  <ScorePicker
                                    value={isNum(val) ? val : undefined}
                                    size="sm"
                                    onChange={(n) =>
                                      handleChange('abilities', {
                                        ...data.abilities,
                                        [ability.id]: n,
                                      })
                                    }
                                  />

                                  <Typography level="body-xs" sx={{ mt: 0.2, color: 'neutral.500' }}>
                                    {isNum(val) ? abilitiesLabels[val] : 'לא נבחר'}
                                  </Typography>
                                </Grid>
                              );
                            })}
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Grid>
          </Grid>
        </Box>

        <Box {...footerBoxProps}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
            spacing={1.2}
          >
            {/* פעולות משניות */}
            <Stack direction="row" spacing={0.8}>
              <Tooltip title="נקה שדות">
                <IconButton
                  variant="plain"
                  color="neutral"
                  onClick={handleClose}
                  sx={{ borderRadius: 'xl' }}
                >
                  {iconUi({ id: 'clear' })}
                </IconButton>
              </Tooltip>

              <Button
                variant="soft"
                color="neutral"
                onClick={() => setOpen(false)}
                startDecorator={iconUi({ id: 'close', size: 'xs' })}
                sx={{ minWidth: 110 }}
              >
                בטל
              </Button>
            </Stack>

            {/* פעולה ראשית */}
            <Button
              color="success"
              variant="solid"
              onClick={submitGeneric}
              startDecorator={iconUi({ id: 'check', size: 'xs' })}
              sx={{ minWidth: { xs: '100%', sm: 160 }, borderRadius: 'lg' }}
            >
              שמור הערכה
            </Button>
          </Stack>
        </Box>

      </Sheet>
    </Drawer>
  );
}
