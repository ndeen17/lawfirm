import { useMemo, useState } from 'react';
import { addDays, dow, iso, mondayOf, midnight, monthYear, dayShort, parseISO } from '../lib/dates';
import { openCount, slotsFor } from '../lib/availability';
import { IconLeft, IconRight } from './ui';

const MAX_WEEKS = 4;

// Week-by-week date + time picker. `value` = {date, time}; calls onChange({date, time}).
export default function SlotPicker({ lawyerIds, appointments, value, onChange, ignoreApptId }) {
  const [week, setWeek] = useState(() => {
    if (!value?.date) return 0;
    const diff = Math.floor((mondayOf(parseISO(value.date)) - mondayOf(midnight())) / (7 * 86400000));
    return Math.max(0, Math.min(MAX_WEEKS - 1, diff));
  });
  const monday = useMemo(() => addDays(mondayOf(midnight()), week * 7), [week]);
  const days = useMemo(() => [0, 1, 2, 3, 4].map((i) => addDays(monday, i)), [monday]);
  const today = midnight();

  const info = (d) => {
    const key = iso(d);
    const past = d < today;
    const count = past ? 0 : openCount(lawyerIds, key, appointments, ignoreApptId);
    return { key, past, count };
  };

  const selected = value?.date;
  const slots = selected ? slotsFor(lawyerIds, selected, appointments, ignoreApptId) : [];

  const pickDay = (d) => {
    const key = iso(d);
    const first = slotsFor(lawyerIds, key, appointments, ignoreApptId).find((s) => s.status === 'open');
    onChange({ date: key, time: first ? first.time : null });
  };

  return (
    <div className="slotpicker">
      <div className="slot-head">
        <span className="slot-month">{monthYear(monday)}</span>
        <span className="slot-nav">
          <button type="button" className="sq-btn" aria-label="Previous week" disabled={week === 0} onClick={() => setWeek(week - 1)}>
            <IconLeft size={16} stroke="#1C2B4B" />
          </button>
          <button type="button" className="sq-btn" aria-label="Next week" disabled={week >= MAX_WEEKS - 1} onClick={() => setWeek(week + 1)}>
            <IconRight size={16} stroke="#1C2B4B" />
          </button>
        </span>
      </div>
      <div className="day-grid">
        {days.map((d) => {
          const { key, past, count } = info(d);
          const sel = key === selected;
          return (
            <button
              key={key}
              type="button"
              disabled={past || count === 0}
              aria-pressed={sel}
              className={`day${sel ? ' day-sel' : ''}`}
              onClick={() => pickDay(d)}
            >
              <span className="day-dow">{dow(d)}</span>
              <span className="day-num">{d.getDate()}</span>
              <span className="day-count">{past ? '—' : count === 0 ? 'Full' : `${count} slot${count > 1 ? 's' : ''}`}</span>
            </button>
          );
        })}
      </div>
      {selected && (
        <div className="slot-times">
          <span className="label-md">Available times · {dayShort(parseISO(selected))}</span>
          <div className="time-grid">
            {slots.map((s) =>
              s.status === 'taken' ? (
                <button key={s.time} type="button" disabled className="time time-taken">{s.time}</button>
              ) : (
                <button
                  key={s.time}
                  type="button"
                  aria-pressed={s.time === value.time}
                  className={`time${s.time === value.time ? ' time-sel' : ''}`}
                  onClick={() => onChange({ date: selected, time: s.time })}
                >
                  {s.time}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
