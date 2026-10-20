import { Link } from 'react-router-dom';
import { Eyebrow } from '../../components/ui';
import { FIRM, LAWYERS, SUPPORT } from '../../data/static';

const TIMELINE = [
  [2014, 'Firm founded in Victoria Island', 'Corporate and litigation practice, two partners.'],
  [2018, 'Family and property practices added', 'Halima Yusuf and Chidi Eze join the team.'],
  [2022, 'Abuja office opens', 'Serving clients in the FCT and the North.'],
  [2026, 'Online booking and client portal', 'Book, pay, share documents and follow your matter online.'],
];

const VALUES = [
  ['Honesty first', 'If you don’t need a lawyer, or your case is weak, we’ll tell you at the first meeting.'],
  ['Clarity on cost', 'Fees agreed in writing before work starts, in fixed amounts or clear stages.'],
  ['Confidentiality', 'What you tell us stays with your legal team. Our systems are encrypted and access is logged.'],
  ['Responsiveness', 'Replies within one business day, and your portal updated as your matter moves.'],
];

export default function About() {
  return (
    <main>
      <section className="page-hero">
        <div className="wrap page-hero-in">
          <div className="stack-22" style={{ flex: '1 1 480px' }}>
            <Eyebrow>ABOUT THE FIRM</Eyebrow>
            <h1 className="h1">Good legal advice should be <em>easy to reach</em></h1>
            <p className="lead">John &amp; Doe is a firm of barristers and solicitors in Lagos and Abuja. We help people and businesses understand where they stand, make good decisions and get things resolved.</p>
          </div>
          <div className="stats stats-card">
            {[[FIRM.founded, 'Founded in Lagos'], ['6', 'People on the team'], ['2', 'Offices'], ['5', 'Languages spoken']].map(([n, l]) => (
              <div key={l}><span className="stat-n">{n}</span><span className="stat-l">{l}</span></div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap split split-top" style={{ gap: 72 }}>
          <div className="split-l stack-22">
            <Eyebrow>OUR STORY</Eyebrow>
            <h2 className="h2">Started to do things differently</h2>
            <p className="lead">Adaeze Okafor and Tunde Bakare met as young associates at a large commercial firm. They kept seeing the same thing: people who needed a lawyer didn’t know where to start, what it would cost, or whether their problem was even a legal one.</p>
            <p className="lead">In {FIRM.founded} they started John &amp; Doe to do it differently — honest first conversations, fees agreed upfront, and advice written so clients can act on it. The firm has grown by word of mouth, adding family, property and immigration practices as clients asked for them.</p>
          </div>
          <ol className="timeline">
            {TIMELINE.map(([y, t, d]) => (
              <li key={y}><span className="tl-y">{y}</span><span><span className="tl-t">{t}</span><span className="tl-d">{d}</span></span></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="sec sec-grey">
        <div className="wrap stack-48">
          <div className="stack-18" style={{ maxWidth: 640 }}>
            <Eyebrow>WHAT WE STAND FOR</Eyebrow>
            <h2 className="h2">Four commitments to every client</h2>
          </div>
          <div className="values">
            {VALUES.map(([t, d], i) => (
              <div key={t} className="value"><span className="area-n">0{i + 1}</span><span className="value-t">{t}</span><span className="value-d">{d}</span></div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap stack-48">
          <div className="stack-18" style={{ maxWidth: 700 }}>
            <Eyebrow>THE TEAM</Eyebrow>
            <h2 className="h2">Small enough to know everyone on your matter</h2>
          </div>
          <div className="lawyer-grid">
            {['adaeze', 'tunde', 'halima', 'chidi'].map((id) => {
              const l = LAWYERS.find((x) => x.id === id);
              return (
                <Link key={l.id} to={`/lawyers/${l.id}`} className="lawyer-card">
                  <div className="lawyer-ph"><span>{l.initials}</span></div>
                  <span className="lawyer-meta">
                    <span className="lawyer-name">{l.name}</span>
                    <span className="lawyer-role">{l.title}{l.tag === 'Co-founder' ? ' · Co-founder' : ''}</span>
                    <span className="lawyer-focus">{l.focus}</span>
                  </span>
                </Link>
              );
            })}
          </div>
          <div className="support">
            {SUPPORT.map((s) => (
              <div key={s.name}><span className="who-t">{s.name}</span><span className="who-d">{s.role}</span></div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec sec-grey sec-tight">
        <div className="wrap split split-top" style={{ gap: 64 }}>
          <div className="split-l stack-18">
            <h2 className="h2 h2-sm">Memberships &amp; regulation</h2>
            <p className="lead lead-sm">All our lawyers are enrolled as Barristers and Solicitors of the Supreme Court of Nigeria and are members of the Nigerian Bar Association.</p>
            <span className="muted-sm">Nigerian Bar Association &nbsp;·&nbsp; Section on Business Law &nbsp;·&nbsp; Lagos Chamber of Commerce</span>
          </div>
          <div className="split-l stack-18" id="careers">
            <h2 className="h2 h2-sm">Work with us</h2>
            <p className="lead lead-sm">We’re glad to hear from lawyers and graduates who care about clear, client-first practice.</p>
            <a className="link-under self-start" href="mailto:careers@harborvale.legal">See openings</a>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="wrap cta-in">
          <h2 className="h2" style={{ color: '#fff' }}>Ready to talk it through?</h2>
          <Link to="/book" className="btn btn-accent">Book a consultation</Link>
        </div>
      </section>
    </main>
  );
}
