import * as React from 'react';
import moment from 'moment';
import 'moment/locale/he';

moment.locale('he');

export const heWeekdays = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
export const heMonths   = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
export const defaultWeeklyHours = { 0:[['14:00','19:00']],1:[['14:00','19:00']],2:[['14:00','19:00']],
  3:[['14:00','19:00']],4:[['14:00','19:00']],5:[['10:00','13:00']],6:[] };


function toMoment(v){
  if(!v) return null;
  if(moment.isMoment(v)) return v.clone();
  if(v instanceof Date) return moment(v);
  if(typeof v==='number') return moment(v);
  if(typeof v==='string') return moment(v);
  if(typeof v==='object' && typeof v.toDate==='function') return moment(v.toDate());
  return null;
}
function timeOn(date, hhmm){
  const [h,m] = hhmm.split(':').map(Number);
  return moment(date).hours(h).minutes(m).seconds(0).milliseconds(0);
}
export function buildSlotsForWindow(date, fromHHMM, toHHMM, durationMin=60){
  const start = timeOn(date, fromHHMM);
  const end   = timeOn(date, toHHMM);
  const out = [];
  let t = start.clone();
  while (t.clone().add(durationMin,'minute').isSameOrBefore(end)){
    out.push({ start:t.clone(), end:t.clone().add(durationMin,'minute'), key:`${t.valueOf()}-${durationMin}` });
    t = t.add(durationMin,'minute');
  }
  return out;
}
function startFromDateHour(dateStr, hhmm){
  if(!dateStr || !hhmm) return null;
  const d = toMoment(dateStr);
  if(!d) return null;
  const [h,m] = hhmm.split(':').map(Number);
  return d.clone().hours(h).minutes(m).seconds(0).milliseconds(0);
}
export function normalizeMeetings(arr=[], fallback=60){
  return arr.filter(Boolean).map(m=>{
    const start =
      toMoment(m.start) || toMoment(m.startAt) ||
      startFromDateHour(m.meetingDate, m.meetingHour) ||
      startFromDateHour(m.date, m.time);
    if(!start) return null;
    const end =
      toMoment(m.end) || toMoment(m.endAt) ||
      (m.endHour ? startFromDateHour(m.meetingDate||m.date, m.endHour) : null) ||
      start.clone().add(Number(m.durationMin||fallback),'minute');
    if(!end || !end.isAfter(start)) return null;
    return { ...m, start, end };
  }).filter(Boolean);
}
export function isOverlap(aStart, aEnd, bStart, bEnd){
  return aStart.isBefore(bEnd) && bStart.isBefore(aEnd);
}
