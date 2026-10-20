import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Eyebrow } from '../../components/ui';
import { useStore } from '../../store';
import { ARTICLES, FORMATS, areaById, lawyerById } from '../../data/static';
import { earliest } from '../../lib/availability';
import { dayShort, parseISO } from '../../lib/dates';
import { naira } from '../../lib/format';

export default function LawyerProfile() {
  const { id } = useParams();
  const { db } = useStore();
  const nav = useNavigate();
  const l = lawyerById(id);
  const [format, setFormat] = useState('video');
  const slots = useMemo(() => (l ? earliest([l.id], db.appointments, 6) : []), [l, db.appointments]);
  if (!l) return <Navigate to="/about" replace />;

  const areaId = l.areas.find((a) => a !== 'unsure');
  const area = areaById(areaId);
  const articles = ARTICLES.filter((a) => a.author === l.id);
  const byDay = slots.reduce((m, s) => ((m[s.date] = m[s.date] || []).push(s), m), {});
  const go = (s) => nav('/book', { state: { areaId, lawyerId: l.id, format, date: s?.date, time: s?.time } });

  return (
    <main>
      <section className="page-hero">
        <div className="wrap">
          <nav aria-label="Breadcrumb" className="crumbs">
            <Link to="/">Home</Link> &nbsp;/&nbsp; <Link to="/about">Our Lawyers</Link> &nbsp;/&nbsp; <span>{l.name}</span>
          </nav>
          <div className="profile-hero">
            <div className="profile-ph"><span>{l.initials}</span></div>
            <div className="stack-18" style={{ flex: 1 }}>
              <Eyebrow>{l.title.toUpperCase()}</Eyebrow>
              <h1 className="h1">{l.name}</h1>
              <p className="lead">{l.quote}</p>
              <span className="muted-sm">{l.focus} &nbsp;·&nbsp; {l.langs.join(', ')}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="wrap profile-main">
        <div className="profile-l stack-40">
          <section className="stack-18">
            <h2 className="h2 h2-sm">About {l.name.split(' ')[0]}</h2>
            {l.about.map((p, i) => (<p key={i} className="lead lead-sm">{p}</p>))}
          </section>
          <section className="cols-2">
            <div className="info-card">
              <span className="eyebrow-sm">EDUCATION &amp; CALL</span>
              {l.edu.map((e) => (<span key={e}>{e}</span>))}
            </div>
            <div className="info-card">
              <span className="eyebrow-sm">TYPICAL WORK</span>
              {l.work.map((e) => (<span key={e}>{e}</span>))}
            </div>
          </section>
          {articles.length > 0 && (
            <section className="stack-18">
              <h2 className="h2 h2-sm">Insights by {l.name.split(' ')[0]}</h2>
              <div>
                {articles.map((a) => (
                  <Link key={a.id} to={`/insights/${a.id}`} className="art-row">
                    <span><span className="art-t">{a.title}</span><span className="muted-sm">{a.read} min read</span></span>
                    <span>→</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="profile-card" aria-label={`Book with ${l.name.split(' ')[0]}`}>
          <span className="profile-card-t">Book with {l.name.split(' ')[0]}</span>
          <div className="seg">
            {FORMATS.map((f) => (
              <button key={f.id} type="button" aria-pressed={format === f.id} className={format === f.id ? 'seg-sel' : ''} onClick={() => setFormat(f.id)}>
                {f.id === 'office' ? 'In office' : f.id === 'video' ? 'Video' : 'Phone'}
              </button>
            ))}
          </div>
          {Object.entries(byDay).map(([date, list]) => (
            <div key={date} className="slot-day">
              <span className="slot-day-t">{dayShort(parseISO(date))}</span>
              <div className="quick-slots">
                {list.map((s) => (<button key={s.time} type="button" className="time" onClick={() => go(s)}>{s.time}</button>))}
              </div>
            </div>
          ))}
          <div className="profile-fee"><span>Consultation · {area.dur} min</span><strong>{naira(area.fee)}</strong></div>
          <button type="button" className="btn btn-navy btn-block" onClick={() => go(slots[0])}>See all times</button>
        </aside>
      </div>
    </main>
  );
}
