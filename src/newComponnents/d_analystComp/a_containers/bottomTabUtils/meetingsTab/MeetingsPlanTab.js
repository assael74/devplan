import * as React from 'react';
import moment from 'moment';
import 'moment/locale/he';
import { normalizeMeetings, buildSlotsForWindow, isOverlap } from './helpers/meetingUtils.js'
import { heWeekdays, defaultWeeklyHours, heMonths } from './helpers/meetingUtils.js'
import { cardSheetProps, photoBoxProps, typoCardProps, dayCardSheetProps, sheetPanelProps, busyRowProps } from './X_Style'
import { buttonRowProps } from './X_Style'
import { Box, Sheet, Typography, Button, Select, Option, Chip, ChipDelete, Input, Divider, Stack } from '@mui/joy';
import { Modal, ModalDialog } from '@mui/joy';
import NewMeetingFormv2 from '../../../../f_forms/F_NewMeetingV2.js';

moment.locale('he');

// ===== component =====
export default function MeetingsPlanTab({
  isMobile,
  data = [],
  actions = {},
  players = [],
  meetings = [],
  formProps = {},
  durationMin = 60,
  maxPerDay = Infinity,
  initialMonth = moment(),
  title = 'תכנון פגישות',
  limitToPlayersCount = false,
}){
  // basic state
  const [month, setMonth] = React.useState(initialMonth.month());
  const [year,  setYear ] = React.useState(initialMonth.year());
  const [weeklyHours, setWeeklyHours] = React.useState(structuredClone(defaultWeeklyHours));
  const [blockedDays, setBlockedDays] = React.useState(new Set());
  const [perDateExtraHours, setPerDateExtraHours] = React.useState({});
  const [showHoursPanel, setShowHoursPanel] = React.useState(true);
  const [hoursEditor, setHoursEditor] = React.useState({ open:false, weekday:0, rows:[] });
  const [dateHoursEditor, setDateHoursEditor] = React.useState({ open:false, dateStr:'', rows:[] });

  // form state
  const [formOpen, setFormOpen] = React.useState(false);
  const [formInit, setFormInit] = React.useState(null);

  // view mode
  const projectPlayers = React.useMemo(
    () => (Array.isArray(players) ? players.filter(p => p?.type === 'project') : []),
    [players]
  );
  const [viewMode, setViewMode] = React.useState('calendar'); // 'calendar' | 'byPlayer'
  const [selectedPlayerId, setSelectedPlayerId] = React.useState(projectPlayers[0]?.id || '');
  React.useEffect(()=>{
    if(!selectedPlayerId && projectPlayers.length) setSelectedPlayerId(projectPlayers[0].id);
  },[projectPlayers, selectedPlayerId]);

  // calendar base
  const ym = moment({ year, month, day:1 });
  const daysInMonth = ym.daysInMonth();
  const weeks = React.useMemo(() => {
    const firstDow = moment({ year, month, day: 1 }).day(); // 0=א' ... 6=שבת
    const res = [];
    let w = [];
    for (let i = 0; i < firstDow; i++) w.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      w.push(moment({ year, month, day: d }));
      if (w.length === 7) { res.push(w); w = []; }
    }
    if (w.length) { while (w.length < 7) w.push(null); res.push(w); }
    return res;
  }, [year, month, daysInMonth]);

  // month meetings first (avoid TDZ)
  const monthMeetings = React.useMemo(()=>{
    const src = (Array.isArray(meetings) && meetings.length) ? meetings : (Array.isArray(data) ? data : []);
    return normalizeMeetings(src, durationMin).filter(m => m.start.year()===year && m.start.month()===month);
  },[meetings, data, durationMin, year, month]);

  const totalProjectPlayers = projectPlayers.length;
  const playersWithMeeting = React.useMemo(() => {
  // נספור כל שחקן פעם אחת בלבד
    const projectIds = new Set(projectPlayers.map(p => p.id));
    const met = new Set();
    for (const m of monthMeetings) {
      if (projectIds.has(m.playerId)) met.add(m.playerId);
    }
    return met.size;
  }, [projectPlayers, monthMeetings]);

  // maps
  const meetingsByDate = React.useMemo(()=>{
    const map = {};
    for(const m of monthMeetings){
      const k = m.start.format('YYYY-MM-DD');
      (map[k] ||= []).push(m);
    }
    Object.values(map).forEach(list => list.sort((a,b)=>a.start.valueOf()-b.start.valueOf()));
    return map;
  },[monthMeetings]);

  const playerMeetingsByDate = React.useMemo(()=>{
    if(!selectedPlayerId) return {};
    const map = {};
    for(const m of monthMeetings){
      if(m.playerId !== selectedPlayerId) continue;
      const k = m.start.format('YYYY-MM-DD');
      (map[k] ||= []).push(m);
    }
    Object.values(map).forEach(list => list.sort((a,b)=>a.start.valueOf()-b.start.valueOf()));
    return map;
  },[monthMeetings, selectedPlayerId]);

  // slots
  const allSlots = React.useMemo(()=>{
    const out = [];
    for(let d=1; d<=daysInMonth; d++){
      const date = moment({ year, month, day:d });
      const dateStr = date.format('YYYY-MM-DD');
      if(blockedDays.has(dateStr)) continue;
      const weekday = date.day();
      const tmpl  = weeklyHours[weekday] || [];
      const extra = perDateExtraHours[dateStr] || [];
      const windows = [...tmpl, ...extra].filter(w=>Array.isArray(w) && w.length===2);
      let daily = [];
      for(const [from,to] of windows) daily = daily.concat(buildSlotsForWindow(date, from, to, durationMin));
      if(Number.isFinite(maxPerDay)) daily = daily.slice(0, maxPerDay);
      for(const s of daily) out.push({ ...s, dateStr });
    }
    return (limitToPlayersCount && players.length>0) ? out.slice(0, players.length) : out;
  },[year, month, daysInMonth, weeklyHours, perDateExtraHours, blockedDays, durationMin, maxPerDay, limitToPlayersCount, players.length]);

  const yearsRange = React.useMemo(()=>{
    const y = moment().year();
    return [y-1, y, y+1, y+2];
  },[]);

  // ui actions
  function toggleBlockDay(dateStr){
    setBlockedDays(prev=>{
      const c = new Set(prev);
      c.has(dateStr) ? c.delete(dateStr) : c.add(dateStr);
      return c;
    });
  }
  function openWeekdayEditor(weekday){
    setHoursEditor({ open:true, weekday, rows:(weeklyHours[weekday]||[]).map(([from,to])=>({from,to})) });
  }
  function saveWeekdayEditor(){
    const { weekday, rows } = hoursEditor;
    const clean = rows.filter(r=>r.from && r.to).map(r=>[r.from,r.to]);
    setWeeklyHours(prev=>({ ...prev, [weekday]: clean }));
    setHoursEditor({ open:false, weekday:0, rows:[] });
  }
  function openDateEditor(dateStr){
    setDateHoursEditor({ open:true, dateStr, rows:(perDateExtraHours[dateStr]||[]).map(([from,to])=>({from,to})) });
  }
  function saveDateEditor(){
    const { dateStr, rows } = dateHoursEditor;
    const clean = rows.filter(r=>r.from && r.to).map(r=>[r.from,r.to]);
    setPerDateExtraHours(prev=>({ ...prev, [dateStr]: clean }));
    setDateHoursEditor({ open:false, dateStr:'', rows:[] });
  }

  const MAX_SLOTS_PER_PLAYER = 20;
  const isByPlayer = viewMode === 'byPlayer';
  // day cards builder
  function renderDayCard(m, meetingsMap) {
    const date = m;
    const dateStr = date.format('YYYY-MM-DD');
    const weekday = date.day();
    const label = `${date.format('DD/MM/YY')} • ${heWeekdays[weekday]}`;
    const daySlots = allSlots.filter(s => s.dateStr === dateStr);
    const dayMeetings = meetingsMap[dateStr] || [];

    return (
      <Sheet key={dateStr} {...dayCardSheetProps(blockedDays, dateStr)}>
        <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:1 }}>
          <Typography level="title-sm" fontSize="11px">{label}</Typography>
          <Box sx={{ display:'flex', gap:0.5 }}>
            <Chip
              size="sm"
              variant={blockedDays.has(dateStr)?'solid':'soft'}
              color={blockedDays.has(dateStr)?'danger':'neutral'}
              onClick={()=>toggleBlockDay(dateStr)}
            >
              <Typography color="primary" fontSize="10px">חסום</Typography>
            </Chip>
            <Button size="sm" variant="plain" onClick={()=>openDateEditor(dateStr)}>
              <Typography color="primary" fontSize="10px">שעות יום</Typography>
            </Button>
          </Box>
        </Box>

        <Divider />

        <Box sx={{ height:'25vh', overflow:'auto' }}>
          {!!dayMeetings.length && (
            <Stack gap={0.5} sx={{ mb:0.5 }}>
              {dayMeetings.map((mm, idx) => {
                const pf = players.find(p => p?.id === mm.playerId);
                const playerFullName = pf?.playerFullName || pf?.playerName || 'לא נמצא שחקן';
                return (
                  <Button key={`${mm.id || mm.start.valueOf()}-${idx}`} size="sm" variant="solid">
                    <Typography fontSize="10px" sx={{ color:'#fff' }}>
                      {mm.start.format('HH:mm')}–{mm.end.format('HH:mm')}{` • ${playerFullName}`}
                    </Typography>
                  </Button>
                );
              })}
            </Stack>
          )}

          <Box sx={{ display:'grid', gridTemplateColumns:'1fr', gap:0.5, mt:0.5 }}>
            {daySlots.map(slot => {
              const busy = (meetingsByDate[dateStr] || [])
                .some(m2 => isOverlap(slot.start, slot.end, m2.start, m2.end));
              const mins = slot.end.diff(slot.start, 'minutes');
              const rowHeight = `${(mins / 60) * 36}px`;

              if (busy) {
                return (
                  <Sheet key={`${slot.key}-busy`} {...busyRowProps(rowHeight)}>
                    <Typography level="body-xs">
                      {slot.start.format('HH:mm')}–{slot.end.format('HH:mm')} • תפוס
                    </Typography>
                  </Sheet>
                );
              }

              return (
                <Button
                  key={slot.key}
                  {...buttonRowProps(rowHeight)}
                  onClick={() => {
                    setFormInit({
                      meetingDate: slot.start.format('YYYY-MM-DD'),
                      meetingHour: slot.start.format('HH:mm'),
                      durationMin,
                      ...(viewMode === 'byPlayer' && selectedPlayerId ? { playerId: selectedPlayerId } : {}),
                      meetingFor: `${slot.start.format('MM')}-${slot.start.format('YYYY')}`,
                    });
                    setFormOpen(true);
                  }}
                >
                  {slot.start.format('HH:mm')}–{slot.end.format('HH:mm')}
                </Button>
              );
            })}

            {!daySlots.length && (
              <Typography level="body-xs" sx={{ color:'neutral.500', textAlign:'center' }}>
                אין סלוטים ליום זה
              </Typography>
            )}
          </Box>
        </Box>

      </Sheet>
    );
  }

  const makePlayerCards = () => {
    return projectPlayers.map((p) => {
      const name =
        p.playerFullName ||
        p.playerName ||
        `${p.playerFirstName || ''} ${p.playerLastName || ''}`.trim();

      // קבוצה ומועדון
      const t = formProps?.teams?.find?.(i => i?.id === p?.teamId);
      const c = formProps?.clubs?.find?.(i => i?.id === p?.clubId);
      const teamName = t?.teamName || '';
      const clubName = c?.clubName || '';

      // בדיקה אם יש פגישה בחודש הנוכחי
      const playerMeeting = monthMeetings.find(m => m.playerId === p.id);
      const hasMeeting = !!playerMeeting;

      const statusLabel = hasMeeting ? 'מתואם' : 'צריך לתאם';
      const statusColor = hasMeeting ? 'success' : 'warning';
      const statusVariant = hasMeeting ? 'soft' : 'outlined';

      // טקסט על הכפתור
      const buttonText = hasMeeting
        ? `${playerMeeting.meetingDate ?
          moment(playerMeeting.meetingDate).format('DD/MM')
          :
          playerMeeting.start.format('DD/MM')} • ${playerMeeting.meetingHour || playerMeeting.start.format('HH:mm')}`
        : 'לתיאום פגישה';

      return (
        <Sheet key={p.id} {...cardSheetProps}>
          {/* כותרת: אוואטר + שם שחקן */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box src={p.photo || '/default-avatar.png'} alt={name} {...photoBoxProps}  />
            <Box sx={{ flex: 1, minWidth: 0, direction: 'rtl', textAlign: 'right' }}>
              <Typography {...typoCardProps}>
                {name}
              </Typography>
              <Box>
                <Typography level="body-xs" sx={{ fontSize: '10px', color: 'neutral.600' }}>
                  {teamName && <>{teamName}</>}
                  {clubName && teamName && ' • '}
                  {clubName && <>{clubName}</>}
                </Typography>
                <Chip size="sm" color={statusColor} variant={statusVariant}>
                  <Typography fontSize='10px'>{statusLabel}</Typography>
                </Chip>
              </Box>
            </Box>
          </Box>

          <Divider />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              size="sm"
              variant={hasMeeting ? 'solid' : 'soft'}
              color={hasMeeting ? 'primary' : 'warning'}
              sx={{ fontSize: '11px', px: 1.5, width: '100%' }}
              onClick={() => {
                setFormInit({
                  playerId: p.id,
                  meetingDate: playerMeeting?.meetingDate || '',
                  meetingHour: playerMeeting?.meetingHour || '',
                  meetingFor: `${String(month + 1).padStart(2, '0')}-${year}`,
                  durationMin,
                });
                setFormOpen(true);
              }}
            >
              {buttonText}
            </Button>
          </Box>
        </Sheet>
      );
    });
  };

  // ===== render =====
  return (
    <Sheet sx={{ p:2, borderRadius:'xl', display:'flex', flexDirection:'column', gap:2, overflow: 'auto', height: '66vh' }}>
      <Box sx={{ display:'flex', alignItems:'center', gap:1, flexWrap:'wrap' }}>
        <Typography level="title-md">{title}</Typography>

        <Select size="sm" value={month} onChange={(_,v)=>typeof v==='number' && setMonth(v)} sx={{ minWidth:140 }}>
          {heMonths.map((label, idx)=><Option key={label} value={idx}>{label}</Option>)}
        </Select>

        <Select size="sm" value={year} onChange={(_,v)=>typeof v==='number' && setYear(v)} sx={{ minWidth:110 }}>
          {yearsRange.map(y=><Option key={y} value={y}>{y}</Option>)}
        </Select>

        <Divider orientation="vertical" />

        <Chip variant="soft" size="sm">סה״כ סלוטים: {allSlots.length}</Chip>
        {!!totalProjectPlayers && (
          <Chip
            variant="soft"
            color={playersWithMeeting === totalProjectPlayers ? 'success' : 'warning'}
            size="sm"
          >
            פגישות: {playersWithMeeting}/{totalProjectPlayers}
          </Chip>
        )}

        <Divider orientation="vertical" />

        <Button size="sm" variant="outlined" onClick={()=>setShowHoursPanel(v=>!v)} disabled={isByPlayer}>
          {showHoursPanel ? 'הסתר הגדרת שעות' : 'הצג הגדרת שעות'}
        </Button>

        <Button
          size="sm"
          color='success'
          variant="outlined"
          onClick={() => {
            setViewMode(m => {
              const next = m === 'calendar' ? 'byPlayer' : 'calendar';
              if (next === 'byPlayer') setShowHoursPanel(false);
              return next;
            });
          }}
        >
          {viewMode === 'calendar' ? 'תכנון לפי שחקן' : 'תכנון לפי שעות'}
        </Button>

      </Box>

      {showHoursPanel && !isByPlayer && (
        <Sheet variant="soft" sx={{ p:1.5, borderRadius:'lg', display:'grid', gap:1, gridTemplateColumns:'repeat(7, minmax(0,1fr))' }}>
          {heWeekdays.map((w, idx)=>(
            <Sheet key={idx} {...sheetPanelProps}>
              <Typography level="title-sm">{w}</Typography>
              <Stack gap={0.5}>
                {(weeklyHours[idx]||[]).map(([from,to], i)=>(
                  <Chip key={`${i}-${from}-${to}`} size="sm" variant="soft">
                    {from}–{to}
                    <ChipDelete onDelete={()=>{
                      setWeeklyHours(prev=>{
                        const copy = { ...prev };
                        const arr = [...(copy[idx]||[])];
                        arr.splice(i,1);
                        copy[idx] = arr;
                        return copy;
                      });
                    }}/>
                  </Chip>
                ))}
              </Stack>
              <Button size="sm" variant="soft" onClick={()=>openWeekdayEditor(idx)}>הוסף חלון</Button>
            </Sheet>
          ))}
        </Sheet>
      )}

      <Box sx={{ display:'grid', gridTemplateColumns:'repeat(7, minmax(160px,1fr))', gap:1, p:1.5 }}>
        {viewMode === 'calendar' ? (
          <Box sx={{ display:'flex', flexDirection:'column', gap:1, width:'100%' }}>
            {weeks.map((w, wi) => (
              <Box key={wi} dir="ltr" sx={{ display:'grid', gridTemplateColumns:'repeat(7, minmax(160px,1fr))', gap:1 }}>
                {w.map((m, ci) => (
                  m
                    ? renderDayCard(m, meetingsByDate)
                    : <Box key={`e-${ci}`} sx={{ visibility:'hidden' }} />
                ))}
              </Box>
            ))}
          </Box>
        ) : (
          makePlayerCards()
        )}
      </Box>

      {/* עורך שעות שבועי */}
      <Modal open={hoursEditor.open} onClose={()=>setHoursEditor({ open:false, weekday:0, rows:[] })}>
        <ModalDialog variant="outlined" sx={{ minWidth:420 }}>
          <Typography level="title-md">הגדרת שעות ליום {heWeekdays[hoursEditor.weekday||0]}</Typography>
          <Divider />
          <Stack gap={1} sx={{ mt:1 }}>
            {hoursEditor.rows.map((row,i)=>(
              <Box key={i} sx={{ display:'flex', gap:1 }}>
                <Input
                  size="sm"
                  placeholder="מ־שעה HH:mm"
                  value={row.from}
                  onChange={e=>setHoursEditor(prev=>({ ...prev, rows: prev.rows.map((r,idx)=>idx===i?{...r, from:e.target.value}:r) }))}
                />
                <Input
                  size="sm"
                  placeholder="עד־שעה HH:mm"
                  value={row.to}
                  onChange={e=>setHoursEditor(prev=>({ ...prev, rows: prev.rows.map((r,idx)=>idx===i?{...r, to:e.target.value}:r) }))}
                />
                <Button
                  variant="plain"
                  size="sm"
                  onClick={()=>setHoursEditor(prev=>({ ...prev, rows: prev.rows.filter((_,idx)=>idx!==i) }))}
                >
                מחק
                </Button>
              </Box>
            ))}
            <Button
              size="sm"
              variant="soft"
              onClick={()=>setHoursEditor(prev=>({ ...prev, rows:[...prev.rows, { from:'14:00', to:'19:00' }] }))}
            >
            הוסף חלון
            </Button>
          </Stack>
          <Divider sx={{ my:1 }} />
          <Box sx={{ display:'flex', gap:1, justifyContent:'flex-end' }}>
            <Button variant="plain" onClick={()=>setHoursEditor({ open:false, weekday:0, rows:[] })}>בטל</Button>
            <Button variant="solid" onClick={saveWeekdayEditor}>שמור</Button>
          </Box>
        </ModalDialog>
      </Modal>

      {/* עורך שעות ליום ספציפי */}
      <Modal open={dateHoursEditor.open} onClose={()=>setDateHoursEditor({ open:false, dateStr:'', rows:[] })}>
        <ModalDialog variant="outlined" sx={{ minWidth:420 }}>
          <Typography level="title-md">הוספת/עריכת שעות ליום {dateHoursEditor.dateStr}</Typography>
          <Divider />
          <Stack gap={1} sx={{ mt:1 }}>
            {dateHoursEditor.rows.map((row,i)=>(
              <Box key={i} sx={{ display:'flex', gap:1 }}>
                <Input
                  size="sm"
                  placeholder="מ־שעה HH:mm"
                  value={row.from}
                  onChange={e=>setDateHoursEditor(prev=>({ ...prev, rows: prev.rows.map((r,idx)=>idx===i?{...r, from:e.target.value}:r) }))}
                />
                <Input
                  size="sm"
                  placeholder="עד־שעה HH:mm"
                  value={row.to}
                  onChange={e=>setDateHoursEditor(prev=>({ ...prev, rows: prev.rows.map((r,idx)=>idx===i?{...r, to:e.target.value}:r) }))}
                />
                <Button
                  variant="plain"
                  size="sm"
                  onClick={()=>setDateHoursEditor(prev=>({ ...prev, rows: prev.rows.filter((_,idx)=>idx!==i) }))}
                >
                מחק
                </Button>
              </Box>
            ))}
            <Button
              size="sm"
              variant="soft"
              onClick={()=>setDateHoursEditor(prev=>({ ...prev, rows:[...prev.rows, { from:'14:00', to:'19:00' }] }))}
            >
            הוסף חלון
            </Button>
          </Stack>
          <Divider sx={{ my:1 }} />
          <Box sx={{ display:'flex', gap:1, justifyContent:'flex-end' }}>
            <Button variant="plain" onClick={()=>setDateHoursEditor({ open:false, dateStr:'', rows:[] })}>בטל</Button>
            <Button variant="solid" onClick={saveDateEditor}>שמור</Button>
          </Box>
        </ModalDialog>
      </Modal>

      {/* טופס יצירת פגישה */}
      <NewMeetingFormv2
        open={formOpen}
        players={players}
        isMobile={isMobile}
        formProps={formProps}
        initialData={formInit}
        onClose={()=>setFormOpen(false)}
        onSave={async(finalData)=>{
          if(typeof actions?.onAdd==='function') await actions.onAdd(finalData, { source:'MeetingsPlan' });
          setFormOpen(false);
        }}
      />
    </Sheet>
  );
}
