import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Eyebrow, Portrait } from '../../components/ui';
import { useStore } from '../../store';
import { AREAS, SUPPORT, lawyersForArea } from '../../data/static';
import { nextOpen } from '../../lib/availability';
import { dayShort, parseISO } from '../../lib/dates';
import { naira } from '../../lib/format';

export default function PracticeArea() {
  const { id } = useParams();
  const { db } = useStore();
  const nav = useNavigate();
  const area = AREAS.find((a) => a.id === id);
  if (!area) return <Navigate to="/" replace />;
  const idx = AREAS.indexOf(area) + 1;
  const team = lawyersForArea(area.id).filter((l) => l.id !== 'unsure').slice(0, 2);
  const lead = team[0];
  const next = nextOpen(team.map((l) => l.id), db.appointments);
  const book = () => nav('/book', { state: { areaId: area.id, lawyerId: next?.lawyerId, date: next?.date, time: next?.time } });

  return (
    <main>
      <section className="page-hero">
        <div className="wrap">
          <nav aria-label="Breadcrumb" className="crumbs">
            <Link to="/">Home</Link> &nbsp;/&nbsp; <Link to="/" state={{ scroll: 'areas' }}>Practice Areas</Link> &nbsp;/&nbsp; <span>{area.name}</span>
          </nav>
          <div className="page-hero-in" style={{ paddingTop: 28 }}>
            <div className="stack-22" style={{ flex: '1 1 480px' }}>
              <Eyebrow>PRACTICE AREA 0{idx}</Eyebrow>
              <h1 className="h1">{area.name}</h1>
              <p className="lead">{area.lead}</p>
              <div className="feature-chips">
                {area.chips.map((c) => (<span key={c}><i />{c}</span>))}
              </div>
            </div>
            <aside className="book-card" aria-label="Book this service">
              <span className="eyebrow-sm">INITIAL CONSULTATION</span>
              <span className="book-price"><strong>{naira(area.fee)}</strong> <span>· {area.dur} min</span></span>
              <span className="muted-sm">In office, by video or by phone. Includes a written summary of your options afterwards.</span>
              {next && <span className="book-next">Next available: {dayShort(parseISO(next.date))}, {next.time}</span>}
              <button type="button" className="btn btn-accent btn-block" onClick={book}>Book a consultation</button>
              <span className="muted-sm center">Free to reschedule up to 24 hours before</span>
            </aside>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap stack-40">
          <h2 className="h2 h2-md">What we can help with</h2>
          <div className="handles">
            {area.handles.map(([t, d]) => (
              <div key={t} className="handle"><span className="handle-t">{t}</span><span className="handle-d">{d}</span></div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec sec-navy">
        <div className="wrap stack-48">
          <div className="stack-18">
            <Eyebrow light>THE PROCESS</Eyebrow>
            <h2 className="h2">How a {area.short.toLowerCase()} matter usually runs</h2>
          </div>
          <ol className="process">
            {area.process.map(([t, d], i) => (
              <li key={t}><span className="process-n">0{i + 1}</span><span className="process-t">{t}</span><span className="process-d">{d}</span></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="sec">
        <div className="wrap split split-top" style={{ gap: 64 }}>
          <div className="stack-18" style={{ flex: '2 1 560px' }}>
            <h2 className="h2 h2-md">Typical fees</h2>
            <p className="lead lead-sm">A guide only — your exact fee is confirmed in writing after the consultation. VAT applies.</p>
            <div className="table-wrap">
              <table className="fee-table">
                <thead><tr><th>SERVICE</th><th>FEE TYPE</th><th className="r">FROM</th></tr></thead>
                <tbody>
                  {area.fees.map(([s, t, f]) => (<tr key={s}><td>{s}</td><td>{t}</td><td className="r">{f}</td></tr>))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bring">
            <h3>What to have ready</h3>
            <span className="muted-sm">You can upload these when you book.</span>
            {area.bring.map((b) => (<span key={b}><i />{b}</span>))}
          </div>
        </div>
      </section>

      <section className="sec sec-grey">
        <div className="wrap split split-top" style={{ gap: 64 }}>
          <div className="stack-22" style={{ flex: '1 1 320px' }}>
            <h2 className="h2 h2-sm">Your {area.short.toLowerCase()} team</h2>
            {team.map((l, i) => (
              <Link key={l.id} to={`/lawyers/${l.id}`} className="team-row">
                <Portrait initials={l.initials} w={56} h={68} />
                <span><span className="lawyer-name">{l.name}</span><span className="lawyer-role">{l.title}{i === 0 ? ' · leads these matters' : ''}</span><span className="lawyer-next">View profile &nbsp;→</span></span>
              </Link>
            ))}
            <div className="team-row">
              <Portrait initials={SUPPORT[0].initials} w={56} h={68} />
              <span><span className="lawyer-name">{SUPPORT[0].name}</span><span className="lawyer-role">{SUPPORT[0].role}</span></span>
            </div>
          </div>
          <div className="stack-22" style={{ flex: '1 1 420px' }}>
            <h2 className="h2 h2-sm">Common questions</h2>
            <div className="faq">
              {area.faqs.map(([q, a], i) => (<details key={q} open={i === 0}><summary>{q}</summary><p>{a}</p></details>))}
            </div>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="wrap cta-in cta-col">
          <h2 className="h2" style={{ color: '#fff' }}>Talk it through with {lead?.name.split(' ')[0]} this week</h2>
          <p style={{ color: '#C9D0DC', margin: 0 }}>{area.dur} minutes, {naira(area.fee)}, in office or by video.</p>
          <button type="button" className="btn btn-accent" onClick={book}>Book a consultation</button>
        </div>
      </section>
    </main>
  );
}
