import { SLOT_TIMES } from '../data/static';
import { iso, midnight, isWeekend, dow } from './dates';

const hash = (s) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
};

const minutes = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

// Status of one lawyer's slot: 'open' | 'taken' | 'past'
export function slotStatus(lawyerId, dateIso, time, appointments, ignoreApptId) {
  const date = new Date(dateIso + 'T00:00:00');
  if (isWeekend(date)) return 'taken';
  const today = midnight();
  if (date < today) return 'past';
  if (date.getTime() === today.getTime()) {
    const now = new Date();
    if (minutes(time) <= now.getHours() * 60 + now.getMinutes() + 60) return 'past';
  }
  const booked = appointments.some(
    (a) => a.id !== ignoreApptId && a.lawyerId === lawyerId && a.date === dateIso && a.time === time && a.status !== 'cancelled'
  );
  if (booked) return 'taken';
  return hash(`${lawyerId}|${dateIso}|${time}`) < 0.3 ? 'taken' : 'open';
}

// Slots for a set of candidate lawyers (any one free => open). Returns [{time, status, lawyerId}]
export function slotsFor(lawyerIds, dateIso, appointments, ignoreApptId) {
  return SLOT_TIMES.map((time) => {
    let status = 'taken';
    let lawyerId = null;
    let sawPast = false;
    for (const id of lawyerIds) {
      const s = slotStatus(id, dateIso, time, appointments, ignoreApptId);
      if (s === 'open') {
        status = 'open';
        lawyerId = id;
        break;
      }
      if (s === 'past') sawPast = true;
    }
    if (status !== 'open' && sawPast) status = 'past';
    return { time, status, lawyerId };
  }).filter((s) => s.status !== 'past');
}

export const openCount = (lawyerIds, dateIso, appointments, ignoreApptId) =>
  slotsFor(lawyerIds, dateIso, appointments, ignoreApptId).filter((s) => s.status === 'open').length;

// Next open slot within 20 days: {date, time, lawyerId, dow} | null
export function nextOpen(lawyerIds, appointments, from = midnight()) {
  for (let i = 0; i < 20; i++) {
    const d = new Date(from);
    d.setDate(d.getDate() + i);
    const key = iso(d);
    const hit = slotsFor(lawyerIds, key, appointments).find((s) => s.status === 'open');
    if (hit) return { date: key, time: hit.time, lawyerId: hit.lawyerId, dow: dow(d) };
  }
  return null;
}

// Earliest `n` open slots across the candidate lawyers: [{date, time, lawyerId}]
export function earliest(lawyerIds, appointments, n = 3, from = midnight()) {
  const out = [];
  for (let i = 0; i < 30 && out.length < n; i++) {
    const d = new Date(from);
    d.setDate(d.getDate() + i);
    const key = iso(d);
    for (const s of slotsFor(lawyerIds, key, appointments)) {
      if (s.status === 'open' && out.length < n) out.push({ date: key, time: s.time, lawyerId: s.lawyerId });
    }
  }
  return out;
}
