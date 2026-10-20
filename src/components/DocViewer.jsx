import { useState } from 'react';
import { Modal, Logo, IconCheck } from './ui';
import { naira, invoiceTotal, fileSize } from '../lib/format';
import { dateShort, parseISO } from '../lib/dates';
import { FIRM, areaById, lawyerById } from '../data/static';

const fullDate = (ts) => {
  const d = new Date(ts);
  return `${dateShort(d)} ${d.getFullYear()}`;
};

function Letterhead() {
  return (
    <div className="sheet-head">
      <Logo to="/" size="md" tagline={false} />
      <div className="sheet-addr">
        {FIRM.lagos.street}<br />{FIRM.lagos.city}<br />{FIRM.lagos.phone}
      </div>
    </div>
  );
}

function InvoiceSheet({ inv, client, kind }) {
  const paid = inv.status === 'paid';
  return (
    <div className="sheet print-sheet">
      <Letterhead />
      <div className="sheet-title">
        <h3>{kind === 'receipt' ? 'Receipt' : 'Invoice'} {inv.id}</h3>
        {paid && <span className="stamp">PAID</span>}
      </div>
      <div className="sheet-meta">
        <div><span>Billed to</span><strong>{client?.name}</strong><em>{client?.email}</em></div>
        <div><span>Issued</span><strong>{fullDate(inv.issued)}</strong></div>
        <div><span>{paid ? 'Paid' : 'Due'}</span><strong>{paid ? `${fullDate(inv.paidAt)} · ${inv.method}` : fullDate(parseISO(inv.due))}</strong></div>
      </div>
      <table className="sheet-table">
        <thead><tr><th>Description</th><th className="r">Amount</th></tr></thead>
        <tbody>
          {inv.lines.map((l, i) => (<tr key={i}><td>{l.desc}</td><td className="r">{naira(l.amount)}</td></tr>))}
          {inv.vat > 0 && (<tr><td>VAT (7.5%)</td><td className="r">{naira(inv.vat)}</td></tr>)}
          <tr className="total"><td>Total</td><td className="r">{naira(invoiceTotal(inv))}</td></tr>
        </tbody>
      </table>
      {!paid && <p className="sheet-note">Pay online from your client portal, or by transfer to Harbor Trust Bank, account 0123456789, quoting {inv.id}.</p>}
      <p className="sheet-foot">John &amp; Doe Legal · Barristers &amp; Solicitors of the Supreme Court of Nigeria</p>
    </div>
  );
}

function EngagementSheet({ doc, db, canSign, onSign }) {
  const [name, setName] = useState('');
  const [agree, setAgree] = useState(false);
  const client = db.users.find((u) => u.id === doc.clientId);
  const matter = db.matters.find((m) => m.id === doc.matterId);
  const lawyer = matter ? lawyerById(matter.leadId) : null;
  const retainer = db.invoices.find((i) => i.matterId === doc.matterId && i.status !== 'paid' && i.desc !== 'Consultation');
  const area = matter ? areaById(matter.areaId) : null;
  const signed = doc.status === 'signed';
  const nameOk = name.trim().toLowerCase() === (client?.name || '').toLowerCase() || name.trim().split(/\s+/).length >= 2;
  return (
    <div className="sheet print-sheet">
      <Letterhead />
      <div className="sheet-title"><h3>Engagement letter</h3>{signed && <span className="stamp">SIGNED</span>}</div>
      <p className="sheet-p">{fullDate(doc.ts)}</p>
      <p className="sheet-p"><strong>{client?.name}</strong><br />{client?.email}</p>
      <p className="sheet-p"><strong>Re: {matter ? `${matter.title} (${matter.id})` : doc.name}</strong></p>
      <p className="sheet-p">Dear {client?.name.split(' ')[0]},</p>
      <p className="sheet-p">Thank you for instructing John &amp; Doe Legal. This letter sets out the terms on which we will act for you{area ? ` in your ${area.bookName.toLowerCase()} matter` : ''}.</p>
      <ol className="sheet-list">
        <li><strong>Scope.</strong> We will advise you, prepare the documents needed and, where agreed, negotiate or represent you in relation to the matter described above. Court proceedings are quoted separately.</li>
        <li><strong>Your lawyer.</strong> {lawyer ? `${lawyer.name} will lead your matter, supported by our paralegal team.` : 'A named lawyer will lead your matter.'}</li>
        <li><strong>Fees.</strong> {retainer ? `Our fee is ${naira(invoiceTotal(retainer))} (${retainer.desc.toLowerCase()}, including VAT), invoiced as ${retainer.id}.` : 'Our fees are agreed in writing before work begins, as a fixed amount or in clear stages. VAT applies.'}</li>
        <li><strong>Confidentiality.</strong> Everything you tell us is confidential and seen only by your legal team.</li>
        <li><strong>Communication.</strong> We reply within one business day, and post updates to your client portal as your matter moves.</li>
      </ol>
      <p className="sheet-p">Yours sincerely,<br /><span className="sig">{lawyer?.name || 'John & Doe Legal'}</span><br />John &amp; Doe Legal</p>
      <div className="sig-block">
        {signed ? (
          <>
            <span className="sig-label">Signed by client</span>
            <span className="sig sig-big">{doc.signedName}</span>
            <span className="muted-sm">Electronically signed on {fullDate(doc.signedAt)}</span>
          </>
        ) : canSign ? (
          <div className="sign-form no-print">
            <span className="sig-label">Sign electronically</span>
            <div className="field">
              <label htmlFor="signname">Type your full name to sign</label>
              <input id="signname" value={name} onChange={(e) => setName(e.target.value)} placeholder={client?.name} />
            </div>
            {name && <span className="sig sig-big">{name}</span>}
            <label className="check">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              I have read and agree to these terms.
            </label>
            <button type="button" className="btn btn-accent" disabled={!agree || !nameOk} onClick={() => onSign(name.trim())}>
              <IconCheck size={16} /> Sign engagement letter
            </button>
          </div>
        ) : (
          <span className="muted-sm">Awaiting client signature.</span>
        )}
      </div>
    </div>
  );
}

function FileSheet({ doc }) {
  return (
    <div className="sheet file-sheet">
      <span className="file-badge">{doc.fileKind}</span>
      <h3>{doc.fileName || doc.name}</h3>
      <p className="muted-sm">{doc.size ? fileSize(doc.size) + ' · ' : ''}Uploaded {fullDate(doc.ts)}</p>
      <p className="muted-sm">Document preview isn’t available in this demo. In the live system, uploaded files open in a secure viewer.</p>
    </div>
  );
}

export default function DocViewer({ doc, db, canSign, onSign, onClose }) {
  const client = db.users.find((u) => u.id === doc.clientId);
  let body;
  if (doc.kind === 'receipt' || doc.kind === 'invoice') {
    const inv = db.invoices.find((i) => i.id === doc.invoiceId);
    body = inv ? <InvoiceSheet inv={inv} client={client} kind={doc.kind} /> : <FileSheet doc={doc} />;
  } else if (doc.kind === 'engagement') {
    body = <EngagementSheet doc={doc} db={db} canSign={canSign && doc.status === 'needs-signature'} onSign={onSign} />;
  } else {
    body = <FileSheet doc={doc} />;
  }
  return (
    <Modal
      title={doc.name}
      wide
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Close</button>
          {doc.kind !== 'upload' && doc.kind !== 'shared' && <button type="button" className="btn btn-navy" onClick={() => window.print()}>Print / Save as PDF</button>}
        </>
      }
    >
      {body}
    </Modal>
  );
}

export function InvoiceViewer({ inv, db, onClose }) {
  const client = db.users.find((u) => u.id === inv.clientId);
  return (
    <Modal
      title={inv.id}
      wide
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Close</button>
          <button type="button" className="btn btn-navy" onClick={() => window.print()}>Print / Save as PDF</button>
        </>
      }
    >
      <InvoiceSheet inv={inv} client={client} kind="invoice" />
    </Modal>
  );
}
