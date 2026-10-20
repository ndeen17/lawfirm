import { useState } from 'react';
import { Modal, Field, Pill } from '../../components/ui';
import { useStore } from '../../store';
import { areaById, lawyerById, FORMATS } from '../../data/static';
import { iso, midnight, isoDay } from '../../lib/dates';
import { invoiceTotal, naira } from '../../lib/format';

// Data scoped to the signed-in staff member. Partners see the whole firm.
export function useStaffData() {
  const { db, user } = useStore();
  const all = user.role === 'partner';
  const me = user.lawyerId;
  const appts = db.appointments.filter((a) => all || a.lawyerId === me);
  const matters = db.matters.filter((m) => all || m.leadId === me);
  const clientIds = new Set([...appts.map((a) => a.clientId), ...matters.map((m) => m.clientId)]);
  const clients = db.users.filter((u) => u.role === 'client' && clientIds.has(u.id));
  const invoices = db.invoices.filter((i) => clientIds.has(i.clientId));
  const messages = db.messages.filter((m) => clientIds.has(m.clientId));
  const docs = db.documents.filter((d) => clientIds.has(d.clientId));
  const clientById = (id) => db.users.find((u) => u.id === id);
  const today = iso(midnight());
  return { db, user, all, me, appts, matters, clients, invoices, messages, docs, clientById, today };
}

export const fmtTone = (s) => ({ confirmed: 'neutral', completed: 'ok', cancelled: 'warn' }[s] || 'neutral');

export function OpenMatterModal({ appt, onClose, onDone }) {
  const { openMatter, toast, db } = useStore();
  const area = areaById(appt.areaId);
  const client = db.users.find((u) => u.id === appt.clientId);
  const [title, setTitle] = useState(`${area.bookName} matter`);
  return (
    <Modal
      title="Open a matter"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button
            type="button"
            className="btn btn-accent"
            disabled={!title.trim()}
            onClick={() => {
              const id = openMatter({ apptId: appt.id, title: title.trim() });
              toast(`Matter ${id} opened — engagement letter sent to ${client.name.split(' ')[0]}`);
              onDone?.(id);
              onClose();
            }}
          >
            Open matter &amp; send engagement letter
          </button>
        </>
      }
    >
      <p className="modal-lead">Creates a matter for {client.name}, shares an engagement letter to sign and requests a valid ID. They’ll see it in their portal straight away.</p>
      <Field label="Matter title" htmlFor="mt"><input id="mt" value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
    </Modal>
  );
}

export function NewInvoiceModal({ clientId, matterId, onClose }) {
  const { createInvoice, toast } = useStore();
  const { clients, matters } = useStaffData();
  const [cid, setCid] = useState(clientId || clients[0]?.id);
  const [mid, setMid] = useState(matterId || '');
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [vat, setVat] = useState(true);
  const [due, setDue] = useState(14);
  const ms = matters.filter((m) => m.clientId === cid);
  const amt = Number(String(amount).replace(/[^\d.]/g, '')) || 0;
  const total = amt + (vat ? Math.round(amt * 0.075) : 0);
  return (
    <Modal
      title="New invoice"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button
            type="button"
            className="btn btn-accent"
            disabled={!desc.trim() || amt <= 0 || !cid}
            onClick={() => {
              const id = createInvoice({ clientId: cid, matterId: mid || ms[0]?.id || null, desc: desc.trim(), amount: amt, vat, dueDays: due });
              toast(`${id} issued — ${naira(total)} due in ${due} days`);
              onClose();
            }}
          >
            Issue invoice
          </button>
        </>
      }
    >
      <div className="stack-16">
        <Field label="Client" htmlFor="ic">
          <select id="ic" value={cid} onChange={(e) => { setCid(e.target.value); setMid(''); }} disabled={!!clientId}>
            {clients.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
        </Field>
        {ms.length > 0 && (
          <Field label="Matter" htmlFor="im">
            <select id="im" value={mid || ms[0].id} onChange={(e) => setMid(e.target.value)}>
              {ms.map((m) => (<option key={m.id} value={m.id}>{m.id} · {m.title}</option>))}
            </select>
          </Field>
        )}
        <Field label="Description" htmlFor="id"><input id="id" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="e.g. Stage 1 — drafting of parenting agreement" /></Field>
        <div className="form-grid">
          <Field label="Amount (₦)" htmlFor="ia"><input id="ia" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="350000" /></Field>
          <Field label="Due in" htmlFor="idue">
            <select id="idue" value={due} onChange={(e) => setDue(Number(e.target.value))}>
              <option value={7}>7 days</option><option value={14}>14 days</option><option value={30}>30 days</option>
            </select>
          </Field>
        </div>
        <label className="check"><input type="checkbox" checked={vat} onChange={(e) => setVat(e.target.checked)} /> Add VAT (7.5%)</label>
        <div className="inv-total"><span>Total</span><strong>{naira(total)}</strong></div>
      </div>
    </Modal>
  );
}

export function ShareDocModal({ client, matter, onClose, mode }) {
  const { shareDocument, requestDocument, user, toast } = useStore();
  const request = mode === 'request';
  const [name, setName] = useState(request ? '' : '');
  const [note, setNote] = useState('');
  const [sig, setSig] = useState(false);
  return (
    <Modal
      title={request ? 'Request a document' : 'Share a document'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button
            type="button"
            className="btn btn-accent"
            disabled={!name.trim()}
            onClick={() => {
              if (request) requestDocument({ clientId: client.id, matterId: matter?.id || null, name: name.trim(), note: note.trim(), by: user.name });
              else shareDocument({ clientId: client.id, matterId: matter?.id || null, name: name.trim(), needsSignature: sig, by: user.name });
              toast(request ? `Request sent to ${client.name.split(' ')[0]}` : `Shared with ${client.name.split(' ')[0]}`);
              onClose();
            }}
          >
            {request ? 'Send request' : 'Share with client'}
          </button>
        </>
      }
    >
      <div className="stack-16">
        <p className="modal-lead">{request ? `Ask ${client.name} to upload a document to their portal.` : `Add a document to ${client.name}’s portal.`}</p>
        <Field label="Document name" htmlFor="dn"><input id="dn" value={name} onChange={(e) => setName(e.target.value)} placeholder={request ? 'e.g. Proof of address' : 'e.g. Draft parenting agreement'} /></Field>
        {request ? (
          <Field label="Note to client" htmlFor="dnote" hint="(optional)"><input id="dnote" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Utility bill from the last 3 months" /></Field>
        ) : (
          <label className="check"><input type="checkbox" checked={sig} onChange={(e) => setSig(e.target.checked)} /> Client must sign this document</label>
        )}
      </div>
    </Modal>
  );
}

export function StagePanel({ matter, STAGES }) {
  const { setStage, postUpdate, toast } = useStore();
  const [text, setText] = useState('');
  const [advance, setAdvance] = useState(false);
  const last = matter.stage >= STAGES.length - 1;
  const post = () => {
    if (!text.trim() && !advance) return;
    if (advance && !last) setStage(matter.id, matter.stage + 1, text.trim() || undefined);
    else postUpdate(matter.id, text.trim());
    toast(advance && !last ? `Moved to ${STAGES[matter.stage + 1]}` : 'Update posted to client portal');
    setText('');
    setAdvance(false);
  };
  return (
    <div className="stack-14">
      <ol className="tracker">
        {STAGES.map((s, i) => (
          <li key={s}>
            <span className={`tracker-bar${i < matter.stage ? ' t-done' : i === matter.stage ? ' now' : ''}`} />
            <span className={`tracker-l${i === matter.stage ? ' now' : i > matter.stage ? ' later' : ''}`}>{s}</span>
          </li>
        ))}
      </ol>
      <div className="field">
        <label htmlFor={`upd-${matter.id}`}>Post an update to the client</label>
        <textarea id={`upd-${matter.id}`} rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. We’ve filed the petition. Next hearing date will be confirmed by the registry." />
      </div>
      <div className="row-between">
        {!last ? (
          <label className="check"><input type="checkbox" checked={advance} onChange={(e) => setAdvance(e.target.checked)} /> Also move to “{STAGES[matter.stage + 1]}”</label>
        ) : <span className="muted-sm">Final stage reached</span>}
        <button type="button" className="btn btn-navy btn-sm" onClick={post} disabled={!text.trim() && !advance}>Post update</button>
      </div>
      {matter.updates.length > 0 && (
        <ul className="update-log">
          {matter.updates.slice(0, 4).map((u, i) => (<li key={i}><b>{new Date(u.ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</b> {u.text}</li>))}
        </ul>
      )}
    </div>
  );
}

export function ApptMeta({ a }) {
  const f = FORMATS.find((x) => x.id === a.format);
  return <>{areaById(a.areaId).bookName} · {f.name} · {a.dur} min · {lawyerById(a.lawyerId).name}</>;
}

export { Pill, invoiceTotal, isoDay };
