const DOW = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const pad = (n) => String(n).padStart(2, '0');

export const midnight = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseISO = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
export const isWeekend = (d) => d.getDay() === 0 || d.getDay() === 6;

// First business day on or after `from`, then `n` business days after (or before, if negative) that.
export const businessDay = (n = 0, from = midnight()) => {
  let d = new Date(from);
  while (isWeekend(d)) d = addDays(d, 1);
  let left = n;
  while (left > 0) {
    d = addDays(d, 1);
    if (!isWeekend(d)) left--;
  }
  while (left < 0) {
    d = addDays(d, -1);
    if (!isWeekend(d)) left++;
  }
  return d;
};

export const mondayOf = (d) => addDays(midnight(d), -((d.getDay() + 6) % 7));

export const dow = (d) => DOW[d.getDay()];
export const dowTitle = (d) => dow(d)[0] + dow(d).slice(1).toLowerCase();
export const dayShort = (d) => `${dowTitle(d)} ${d.getDate()} ${MONTHS[d.getMonth()]}`; // Tue 20 Oct
export const dateShort = (d) => `${d.getDate()} ${MONTHS[d.getMonth()]}`; // 20 Oct
export const monthYear = (d) => `${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;
export const monthShort = (d) => MONTHS[d.getMonth()];

export const isoShort = (s) => dateShort(parseISO(s));
export const isoDay = (s) => dayShort(parseISO(s));

export const addMinutes = (time, mins) => {
  const [h, m] = time.split(':').map(Number);
  const t = h * 60 + m + mins;
  return `${pad(Math.floor(t / 60))}:${pad(t % 60)}`;
};

export const daysUntil = (isoDate) => Math.round((parseISO(isoDate) - midnight()) / 86400000);

export const relativeDay = (isoDate) => {
  const n = daysUntil(isoDate);
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  return dayShort(parseISO(isoDate));
};

export const timeAgo = (ts) => {
  const mins = Math.max(0, Math.round((Date.now() - ts) / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h}h ago`;
  return dateShort(new Date(ts));
};

export const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};
