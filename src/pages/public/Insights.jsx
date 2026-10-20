import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Eyebrow } from '../../components/ui';
import { ARTICLES, areaById, articleById, lawyerById } from '../../data/static';

export function InsightsIndex() {
  return (
    <main>
      <section className="page-hero">
        <div className="wrap stack-22">
          <Eyebrow>INSIGHTS</Eyebrow>
          <h1 className="h1">Understand your situation first</h1>
          <p className="lead" style={{ maxWidth: 620 }}>Plain-language guides from our lawyers on the questions clients ask most.</p>
        </div>
      </section>
      <section className="sec">
        <div className="wrap">
          <div className="insight-grid">
            {ARTICLES.map((a) => (
              <Link key={a.id} to={`/insights/${a.id}`} className="insight">
                <span className="insight-tag">{a.tag}</span>
                <span className="insight-title">{a.title}</span>
                <span className="insight-by">{lawyerById(a.author).name} · {a.read} min read</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export function Article() {
  const { id } = useParams();
  const nav = useNavigate();
  const a = articleById(id);
  if (!a) return <Navigate to="/insights" replace />;
  const author = lawyerById(a.author);
  const area = areaById(a.area);
  return (
    <main>
      <section className="page-hero">
        <div className="wrap">
          <nav aria-label="Breadcrumb" className="crumbs">
            <Link to="/">Home</Link> &nbsp;/&nbsp; <Link to="/insights">Insights</Link> &nbsp;/&nbsp; <span>{a.tag[0] + a.tag.slice(1).toLowerCase()}</span>
          </nav>
          <div className="stack-18" style={{ maxWidth: 760, paddingTop: 28 }}>
            <span className="insight-tag">{a.tag}</span>
            <h1 className="h1" style={{ fontSize: 44 }}>{a.title}</h1>
            <Link to={`/lawyers/${author.id}`} className="muted-sm">{author.name} · {a.read} min read</Link>
          </div>
        </div>
      </section>
      <section className="sec sec-tight">
        <div className="wrap article">
          {a.body.map((p, i) => (<p key={i}>{p}</p>))}
          <div className="article-cta">
            <span>Talk this through with {author.name.split(' ')[0]}.</span>
            <button type="button" className="btn btn-accent" onClick={() => nav('/book', { state: { areaId: a.area, lawyerId: author.id } })}>
              Book a {area.short.toLowerCase()} consultation
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
