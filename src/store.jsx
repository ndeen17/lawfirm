import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { buildSeed, DEMO_PASSWORD } from './data/seed';
import { slotsFor, slotStatus } from './lib/availability';
import { areaById, lawyersForArea, lawyerById, STAGES } from './data/static';
import { uid, fileKind } from './lib/format';
import { iso, addDays, midnight } from './lib/dates';

const KEY = 'hv-demo-db-v1';
const SESSION_KEY = 'hv-demo-session';
const Ctx = createContext(null);

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const db = JSON.parse(raw);
      if (db && db.v === 1) return db;
    }
  } catch {
    /* fall through to a fresh seed */
  }
  return buildSeed();
}

export function StoreProvider({ children }) {
  const [db, setDb] = useState(load);
  const [toasts, setToasts] = useState([]);
  const [sessionId, setSessionId] = useState(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY);
    } catch {
      return null;
    }
  });
  const setSession = useCallback((id) => {
    setSessionId(id);
    try {
      if (id) sessionStorage.setItem(SESSION_KEY, id);
      else sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  }, []);
  const dbRef = useRef(db);
  dbRef.current = db;

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(db));
    } catch {
      /* storage full or blocked: demo keeps working in memory */
    }
  }, [db]);

  // Keep several open tabs (e.g. client + lawyer side by side) in sync.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === KEY && e.newValue) {
        try {
          setDb(JSON.parse(e.newValue));
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toast = useCallback((text, tone = 'ok') => {
    const id = uid('t');
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  // Apply a mutation to a deep copy of the db and commit it synchronously.
  const mutate = useCallback((fn) => {
    const draft = structuredClone(dbRef.current);
    const result = fn(draft);
    dbRef.current = draft;
    setDb(draft);
    return result;
  }, []);

  const actions = useMemo(() => {
    const log = (d, text) => d.activity.unshift({ id: uid('ac'), ts: Date.now(), text });
    const userName = (d, id) => d.users.find((u) => u.id === id)?.name || 'Client';

    const nextInvoiceId = (d) => `INV-0${++d.counters.inv}`;

    const payInvoice = (id, method) => {
        mutate((d) => {
          const inv = d.invoices.find((x) => x.id === id);
          if (!inv) return;
          inv.status = 'paid';
          inv.paidAt = Date.now();
          inv.method = method;
          d.documents.push({ id: uid('d'), clientId: inv.clientId, matterId: inv.matterId, name: `Receipt — ${inv.id}`, kind: 'receipt', status: 'generated', by: 'system', fileKind: 'PDF', ts: Date.now(), invoiceId: inv.id });
          log(d, `${userName(d, inv.clientId)} paid ${inv.id}`);
        });
    };

    return {
      login(email, password) {
        const u = dbRef.current.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase() && x.password === password);
        if (!u) return null;
        setSession(u.id);
        return u;
      },
      loginAs(userId) {
        setSession(userId);
      },
      logout() {
        setSession(null);
      },
      resetDemo() {
        const fresh = buildSeed();
        dbRef.current = fresh;
        setDb(fresh);
        setSession(null);
      },

      // ---- Booking (public site) ----
      bookConsultation({ areaId, lawyerId, format, date, time, brief, details, files, payMethod }) {
        const result = mutate((d) => {
          const area = areaById(areaId);
          let lid = lawyerId;
          if (lid === 'first') {
            const cands = lawyersForArea(areaId).map((l) => l.id);
            lid = slotsFor(cands, date, d.appointments).find((s) => s.time === time && s.status === 'open')?.lawyerId || cands[0];
          }
          // Client account: reuse by email or create one.
          let user = d.users.find((u) => u.role === 'client' && u.email.toLowerCase() === details.email.trim().toLowerCase());
          let newAccount = false;
          if (!user) {
            user = { id: uid('u'), role: 'client', name: details.name.trim(), email: details.email.trim(), password: DEMO_PASSWORD, phone: details.phone, reminder: details.reminder };
            d.users.push(user);
            newAccount = true;
          } else {
            user.phone = details.phone || user.phone;
            user.reminder = details.reminder || user.reminder;
          }
          const invoiceId = nextInvoiceId(d);
          const bookingRef = `BK-${++d.counters.booking}`;
          d.invoices.push({
            id: invoiceId, clientId: user.id, matterId: null, desc: 'Consultation',
            lines: [{ desc: `Initial consultation — ${area.bookName} (${area.dur} min)`, amount: area.fee }], vat: 0,
            status: 'paid', issued: Date.now(), due: iso(midnight()), paidAt: Date.now(), method: payMethod,
          });
          const appt = {
            id: uid('ap'), ref: bookingRef, clientId: user.id, lawyerId: lid, areaId, format, date, time, dur: area.dur,
            status: 'confirmed', fee: area.fee, brief: brief || '', deadlines: details.deadlines || '', notes: '', createdAt: Date.now(), matterId: null, invoiceId,
          };
          d.appointments.push(appt);
          d.documents.push({ id: uid('d'), clientId: user.id, matterId: null, name: 'Consultation receipt', kind: 'receipt', status: 'generated', by: 'system', fileKind: 'PDF', ts: Date.now(), invoiceId });
          (files || []).forEach((f) =>
            d.documents.push({ id: uid('d'), clientId: user.id, matterId: null, name: f.name, kind: 'upload', status: 'received', by: 'you', fileKind: fileKind(f.name), size: f.size, ts: Date.now() })
          );
          d.messages.push({
            id: uid('m'), clientId: user.id, from: 'staff', senderName: lawyerById(lid).name,
            text: `Hello ${user.name.split(' ')[0]}, thank you for booking. I’ve received your details${files?.length ? ' and documents' : ''} and will review them before we speak.`,
            ts: Date.now() + 1, read: false,
          });
          log(d, `New booking: ${user.name} — ${area.bookName} with ${lawyerById(lid).name}`);
          return { appointment: appt, user, newAccount, invoiceId, lawyerId: lid };
        });
        const current = dbRef.current.users.find((u) => u.id === sessionId);
        if (!current || current.role === 'client') setSession(result.user.id);
        return result;
      },

      cancelAppointment(id) {
        mutate((d) => {
          const a = d.appointments.find((x) => x.id === id);
          if (!a) return;
          a.status = 'cancelled';
          log(d, `${userName(d, a.clientId)} cancelled their ${areaById(a.areaId).bookName} consultation`);
        });
      },
      rescheduleAppointment(id, date, time) {
        return mutate((d) => {
          const a = d.appointments.find((x) => x.id === id);
          if (!a) return false;
          if (slotStatus(a.lawyerId, date, time, d.appointments, id) !== 'open') return false;
          a.date = date;
          a.time = time;
          log(d, `${userName(d, a.clientId)} rescheduled to ${date} ${time}`);
          return true;
        });
      },
      updateAppointment(id, patch) {
        mutate((d) => {
          const a = d.appointments.find((x) => x.id === id);
          if (a) Object.assign(a, patch);
        });
      },
      completeAppointment(id) {
        mutate((d) => {
          const a = d.appointments.find((x) => x.id === id);
          if (a) {
            a.status = 'completed';
            log(d, `Consultation with ${userName(d, a.clientId)} marked complete`);
          }
        });
      },

      // ---- Matters ----
      openMatter({ apptId, title }) {
        return mutate((d) => {
          const a = d.appointments.find((x) => x.id === apptId);
          if (!a) return null;
          const id = `HV-2026-0${++d.counters.matter}`;
          const lawyer = lawyerById(a.lawyerId);
          d.matters.push({
            id, clientId: a.clientId, title, areaId: a.areaId, leadId: a.lawyerId, team: [lawyer.name, 'Funmi Bello'], stage: 1,
            updates: [{ ts: Date.now(), text: 'Thank you for meeting with us. We’ve prepared an engagement letter setting out the scope of work and fees — please review and sign it in your portal.' }],
            opened: Date.now(),
          });
          a.matterId = id;
          d.documents.forEach((doc) => {
            if (doc.clientId === a.clientId && !doc.matterId) doc.matterId = id;
          });
          d.documents.push({ id: uid('d'), clientId: a.clientId, matterId: id, name: `Engagement letter — ${title}`, kind: 'engagement', status: 'needs-signature', by: lawyer.name, fileKind: 'PDF', ts: Date.now() });
          d.documents.push({ id: uid('d'), clientId: a.clientId, matterId: id, name: 'Valid ID', kind: 'upload', status: 'requested', by: lawyer.name, fileKind: 'PDF', purpose: 'id', note: 'NIN slip, international passport or driver’s licence', ts: Date.now() });
          d.messages.push({ id: uid('m'), clientId: a.clientId, from: 'staff', senderName: lawyer.name, text: `Thank you for your time today. I’ve opened your matter (${id}) and shared an engagement letter for you to sign.`, ts: Date.now() + 1, read: false });
          log(d, `Matter ${id} opened for ${userName(d, a.clientId)}`);
          return id;
        });
      },
      setStage(matterId, stage, text) {
        mutate((d) => {
          const m = d.matters.find((x) => x.id === matterId);
          if (!m) return;
          m.stage = stage;
          m.updates.unshift({ ts: Date.now(), text: text || `Your matter has moved to “${STAGES[stage]}”.` });
          log(d, `${m.id} moved to ${STAGES[stage]}`);
        });
      },
      postUpdate(matterId, text) {
        mutate((d) => {
          const m = d.matters.find((x) => x.id === matterId);
          if (!m) return;
          m.updates.unshift({ ts: Date.now(), text });
          log(d, `Update posted on ${m.id}`);
        });
      },

      // ---- Documents ----
      signDocument(docId, name) {
        mutate((d) => {
          const doc = d.documents.find((x) => x.id === docId);
          if (!doc) return;
          doc.status = 'signed';
          doc.signedName = name;
          doc.signedAt = Date.now();
          log(d, `${userName(d, doc.clientId)} signed “${doc.name}”`);
          const m = d.matters.find((x) => x.id === doc.matterId);
          if (m && doc.kind === 'engagement' && m.stage < 2) {
            m.stage = 2;
            m.updates.unshift({ ts: Date.now(), text: 'Engagement letter signed — thank you. We are now preparing your papers and will share drafts for your review.' });
          }
        });
      },
      uploadDocument({ clientId, matterId, name, size, requestId, by }) {
        mutate((d) => {
          if (requestId) {
            const r = d.documents.find((x) => x.id === requestId);
            if (r) {
              r.status = 'received';
              r.fileName = name;
              r.size = size;
              r.fileKind = fileKind(name);
              r.ts = Date.now();
              r.by = 'you';
            }
          } else {
            d.documents.push({ id: uid('d'), clientId, matterId, name, kind: 'upload', status: by === 'staff' ? 'shared' : 'received', by: by === 'staff' ? by : 'you', fileKind: fileKind(name), size, ts: Date.now() });
          }
          log(d, `${userName(d, clientId)} — document ${by === 'staff' ? 'shared' : 'uploaded'}: ${name}`);
        });
      },
      requestDocument({ clientId, matterId, name, note, by }) {
        mutate((d) => {
          d.documents.push({ id: uid('d'), clientId, matterId, name, kind: 'upload', status: 'requested', by, fileKind: 'PDF', note, ts: Date.now() });
        });
      },
      shareDocument({ clientId, matterId, name, needsSignature, by }) {
        mutate((d) => {
          d.documents.push({
            id: uid('d'), clientId, matterId, name, kind: needsSignature ? 'engagement' : 'shared',
            status: needsSignature ? 'needs-signature' : 'shared', by, fileKind: 'PDF', ts: Date.now(),
          });
          log(d, `“${name}” shared with ${userName(d, clientId)}`);
        });
      },

      // ---- Invoices ----
      payInvoice,
      createInvoice({ clientId, matterId, desc, amount, vat, dueDays }) {
        return mutate((d) => {
          const id = nextInvoiceId(d);
          d.invoices.push({
            id, clientId, matterId, desc, lines: [{ desc, amount }], vat: vat ? Math.round(amount * 0.075) : 0, status: 'due',
            issued: Date.now(), due: iso(addDays(midnight(), dueDays)),
          });
          log(d, `${id} issued to ${userName(d, clientId)}`);
          return id;
        });
      },
      markInvoicePaid(id) {
        payInvoice(id, 'Bank transfer');
      },

      // ---- Messages ----
      sendMessage({ clientId, text, from, senderName }) {
        mutate((d) => {
          d.messages.push({ id: uid('m'), clientId, from, senderName, text, ts: Date.now(), read: false });
          log(d, from === 'client' ? `${senderName} sent a message` : `${senderName} messaged ${userName(d, clientId)}`);
        });
      },
      markRead(clientId, reader) {
        const need = dbRef.current.messages.some((m) => m.clientId === clientId && !m.read && m.from !== reader);
        if (!need) return;
        mutate((d) => {
          d.messages.forEach((m) => {
            if (m.clientId === clientId && m.from !== reader) m.read = true;
          });
        });
      },
    };
  }, [mutate, setSession, sessionId]);

  const value = useMemo(() => {
    const user = sessionId ? db.users.find((u) => u.id === sessionId) || null : null;
    return { db, user, toast, toasts, ...actions };
  }, [db, toasts, toast, actions]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useStore = () => useContext(Ctx);
