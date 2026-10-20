import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eyebrow, Portrait } from '../../components/ui';
import { useSectionNav } from '../../components/PublicLayout';
import { useStore } from '../../store';
import { AREAS, BOOKABLE_AREAS, FIRM, HOME_ARTICLES, HOME_FAQS, LAWYERS, areaById, lawyerById, lawyersForArea } from '../../data/static';
import { earliest, nextOpen } from '../../lib/availability';
import { dowTitle, parseISO, relativeDay } from '../../lib/dates';
import { naira } from '../../lib/format';

function Hero() {
  const section = useSectionNav();
  const skyline = (w, h, bg, rects) => (
    <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMax slice">
      <rect width={w} height={h} fill={bg} />
      {rects.map((r, i) => (<rect key={i} x={r[0]} y={r[1]} width={r[2]} height={h - r[1]} fill={r[3]} opacity={r[4]} />))}
    </svg>
  );
  return (
    <section id="top" className="hero">
      <div className="wrap hero-in">
        <div className="hero-copy">
          <h1>Considered,<br />Personal<br />Legal Counsel</h1>
          <p>for <strong>Families, Professionals</strong> and Growing Businesses in Lagos &amp; Abuja</p>
          <div className="hero-cta">
            <Link to="/book" className="btn btn-navy">Book a consultation</Link>
            <a href="#/" className="link-under" onClick={(e) => { e.preventDefault(); section('lawyers'); }}>Meet our lawyers</a>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="hero-panel hp1">
            {skyline(200, 300, '#3A4D74', [[0, 170, 30, '#22314F'], [34, 120, 26, '#1C2B4B'], [64, 150, 36, '#2A3B5E'], [104, 90, 22, '#1C2B4B'], [130, 140, 40, '#22314F'], [174, 180, 26, '#2A3B5E']])}
          </div>
          <div className="hero-panel hp2">
            {skyline(200, 400, '#D7A584', [[0, 230, 34, '#9A5634'], [38, 150, 30, '#7C4428'], [72, 200, 40, '#A4603C'], [116, 110, 26, '#7C4428'], [146, 180, 54, '#8E4E2F']])}
          </div>
          <div className="hero-panel hp3">
            {skyline(200, 500, '#BFC6D1', [[0, 250, 28, '#7F8A9C'], [32, 180, 34, '#5F6B80'], [70, 230, 30, '#7F8A9C'], [104, 140, 28, '#4E5A70'], [136, 210, 64, '#6D788C'], [0, 440, 200, '#3A4D74', 0.55]])}
          </div>
        </div>
      </div>
    </section>
  );
}

function QuickBook() {
  const { db } = useStore();
  const nav = useNavigate();
  const [areaId, setAreaId] = useState('family');
  const cands = useMemo(() => lawyersForArea(areaId), [areaId]);
  const slots = useMemo(() => earliest(cands.map((l) => l.id), db.appointments, 3), [cands, db.appointments]);
  const [pick, setPick] = useState(0);
  const lead = slots[0] ? lawyerById(slots[0].lawyerId) : cands[0];
  const area = areaById(areaId);
  const chosen = slots[Math.min(pick, slots.length - 1)];
  return (
    <div className="quick">
      <div className="quick-head">
        <span>Book in 4 quick steps</span>
        <span className="muted-sm">Step 1 of 4</span>
      </div>
      <div className="bar"><div style={{ width: '25%' }} /></div>
      <div className="quick-block">
        <span className="label-md">What do you need help with?</span>
        <div className="chips">
          {['family', 'property', 'business', 'employment', 'immigration', 'unsure'].map((id) => (
            <button key={id} type="button" aria-pressed={areaId === id} className={`chip${areaId === id ? ' chip-sel' : ''}`} onClick={() => { setAreaId(id); setPick(0); }}>
              {id === 'business' ? 'Business' : areaById(id).bookName.replace(' & real estate', '')}
            </button>
          ))}
        </div>
      </div>
      <div className="quick-block">
        <span className="label-md">Earliest times with {lead?.name}</span>
        <div className="quick-slots">
          {slots.map((s, i) => (
            <button key={s.date + s.time} type="button" aria-pressed={pick === i} className={`time${pick === i ? ' time-sel' : ''}`} onClick={() => setPick(i)}>
              {dowTitle(parseISO(s.date))} {s.time}
            </button>
          ))}
        </div>
      </div>
      <button type="button" className="btn btn-accent btn-block" onClick={() => nav('/book', { state: { areaId, lawyerId: chosen?.lawyerId, date: chosen?.date, time: chosen?.time } })}>
        Continue
      </button>
      <span className="muted-sm center">{area.dur}-min consultation · from {naira(area.fee)} · free to reschedule</span>
    </div>
  );
}

export default function Home() {
  const { db } = useStore();
  const statements = [
    ['Plain-language advice', 'Your options, the risks and a realistic timeline — and the key points in writing after every consultation.'],
    ['Fixed fees where we can', 'Most work is quoted as a fixed fee or in clear stages, agreed in an engagement letter before we begin.'],
    ['Always know where things stand', 'A private client portal with updates, documents and invoices, and replies within one business day.'],
  ];
  return (
    <main>
      <Hero />

      <section className="statement">
        <p>Practical legal counsel for families, professionals and businesses — from first conversation to final resolution.</p>
      </section>

      <section id="book" className="sec book-sec">
        <div className="wrap split">
          <div className="split-l stack-22">
            <Eyebrow>BOOK A CONSULTATION</Eyebrow>
            <h2 className="h2">Speak with a lawyer this week — booked in under two minutes</h2>
            <p className="lead">Choose your matter, the lawyer you’d like to see and a time that suits you. Meet us in our Victoria Island office, by video, or by phone.</p>
            <ul className="ticks">
              <li>Fee shown before you pay — from ₦25,000</li>
              <li>Reminders by SMS &amp; WhatsApp</li>
              <li>Confidential from first contact</li>
            </ul>
          </div>
          <QuickBook />
        </div>
      </section>

      <section id="about" className="sec sec-grey">
        <div className="wrap split split-top">
          <div className="split-l stack-22">
            <Eyebrow>ABOUT THE FIRM</Eyebrow>
            <h2 className="h2">A Lagos firm built on clear advice and <em>close relationships</em></h2>
            <p className="lead">Harbor &amp; Vale was founded in {FIRM.founded} by Adaeze Okafor and Tunde Bakare on a simple belief: legal advice should be easy to reach, easy to understand and fairly priced.</p>
            <p className="lead">Our four lawyers and support team work from Victoria Island and Abuja, acting for individuals and families through difficult moments, and for businesses that need a dependable partner as they grow.</p>
            <Link to="/about" className="link-under self-start">Our story and team</Link>
          </div>
          <div className="stats">
            {[[FIRM.years, 'years in practice'], ['6', 'practice areas'], ['2', 'offices, Lagos & Abuja'], ['5', 'languages spoken']].map(([n, l]) => (
              <div key={l}><span className="stat-n">{n}</span><span className="stat-l">{l}</span></div>
            ))}
          </div>
        </div>
      </section>

      <section id="areas" className="sec">
        <div className="wrap stack-56">
          <div className="sec-head">
            <div className="stack-18" style={{ maxWidth: 640 }}>
              <Eyebrow>PRACTICE AREAS</Eyebrow>
              <h2 className="h2">Where we can help</h2>
            </div>
            <p className="lead lead-sm" style={{ maxWidth: 380 }}>Each area sets out the issues we handle, how the process works and the consultation fee — before you book.</p>
          </div>
          <div className="areas-grid">
            {AREAS.map((a, i) => (
              <Link key={a.id} to={`/practice/${a.id}`} className="area-row">
                <span className="area-n">0{i + 1}</span>
                <span className="area-b">
                  <span className="area-name">{a.name}</span>
                  <span className="area-desc">{a.blurb}</span>
                  <span className="area-fee">Consultation from {naira(a.fee)} &nbsp;→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="sec sec-navy">
        <div className="wrap stack-56">
          <div className="stack-18" style={{ maxWidth: 660 }}>
            <Eyebrow light>HOW WE WORK</Eyebrow>
            <h2 className="h2">Advice you can act on, fees you can plan for</h2>
          </div>
          <div className="three">
            {statements.map(([t, d]) => (
              <div key={t} className="how"><span className="how-t">{t}</span><span className="how-d">{d}</span></div>
            ))}
          </div>
        </div>
      </section>

      <section id="lawyers" className="sec">
        <div className="wrap stack-56">
          <div className="stack-18" style={{ maxWidth: 640 }}>
            <Eyebrow>OUR LAWYERS</Eyebrow>
            <h2 className="h2">Know who you’ll be speaking to</h2>
          </div>
          <div className="lawyer-grid">
            {LAWYERS.slice().sort((a, b) => ['adaeze', 'tunde', 'halima', 'chidi'].indexOf(a.id) - ['adaeze', 'tunde', 'halima', 'chidi'].indexOf(b.id)).map((l) => {
              const n = nextOpen([l.id], db.appointments);
              return (
                <Link key={l.id} to={`/lawyers/${l.id}`} className="lawyer-card">
                  <div className="lawyer-ph"><span>{l.initials}</span></div>
                  <span className="lawyer-meta">
                    <span className="lawyer-name">{l.name}</span>
                    <span className="lawyer-role">{l.short}</span>
                    <span className="lawyer-next">{n ? `Next free: ${relativeDay(n.date) === 'Today' || relativeDay(n.date) === 'Tomorrow' ? relativeDay(n.date) : dowTitle(parseISO(n.date))} ${n.time}` : 'See availability'} &nbsp;→</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="sec sec-grey sec-tight">
        <div className="wrap split split-top" style={{ gap: 56 }}>
          <div className="stack-18" style={{ flex: '1 1 300px' }}>
            <Eyebrow>WHO WE ACT FOR</Eyebrow>
            <h2 className="h2 h2-sm">From a first home to a first investor</h2>
          </div>
          <div className="who">
            {[['Individuals & families', 'Divorce, custody, wills, property, work'], ['Small & growing businesses', 'Registration, contracts, staff, disputes'], ['Nigerians abroad', 'Land at home, family matters, documents'], ['Investors & foreign companies', 'Market entry, expatriate quota, compliance']].map(([t, d]) => (
              <div key={t}><span className="who-t">{t}</span><span className="who-d">{d}</span></div>
            ))}
          </div>
        </div>
      </section>

      <section id="insights" className="sec">
        <div className="wrap stack-48">
          <div className="sec-head">
            <div className="stack-18">
              <Eyebrow>INSIGHTS</Eyebrow>
              <h2 className="h2">Understand your situation first</h2>
            </div>
            <Link to="/insights" className="link-under">All insights</Link>
          </div>
          <div className="insight-grid">
            {HOME_ARTICLES.map((a) => (
              <Link key={a.id} to={`/insights/${a.id}`} className="insight">
                <span className="insight-tag">{a.tag}</span>
                <span className="insight-title">{a.title}</span>
                <span className="insight-by">{lawyerById(a.author).name} · {a.read} min read</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="sec sec-grey">
        <div className="wrap" style={{ maxWidth: 820 }}>
          <h2 className="h2 center" style={{ fontSize: 40, marginBottom: 40 }}>Before you book</h2>
          <div className="faq">
            {HOME_FAQS.map(([q, a], i) => (
              <details key={q} open={i === 0}><summary>{q}</summary><p>{a}</p></details>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="sec">
        <div className="wrap split split-top" style={{ gap: 64 }}>
          <div className="split-l stack-20">
            <Eyebrow>CONTACT</Eyebrow>
            <h2 className="h2">Visit, call, or book online</h2>
            <p className="lead">Video consultations are available nationwide and for clients abroad.</p>
            <Link to="/book" className="btn btn-accent self-start">Book a consultation</Link>
          </div>
          <div className="offices">
            {[['Lagos', FIRM.lagos], ['Abuja', FIRM.abuja]].map(([n, o]) => (
              <div key={n} className="office">
                <span className="office-n">{n}</span>
                <span>{o.street}<br />{o.city}</span>
                <span>{o.hours}</span>
                <span>{o.phone}<br />{o.email}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
