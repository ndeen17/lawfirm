import { businessDay, iso, addDays, midnight } from '../lib/dates';

export const DEMO_PASSWORD = 'demo1234';

const now = () => Date.now();
const ago = (mins) => now() - mins * 60000;
const day = (n) => iso(businessDay(n));

export function buildSeed() {
  const users = [
    { id: 'u_ngozi', role: 'client', name: 'Ngozi Adebayo', email: 'ngozi.adebayo@example.com', password: DEMO_PASSWORD, phone: '+234 803 000 0000', reminder: 'WhatsApp' },
    { id: 'u_emeka', role: 'client', name: 'Emeka Nwosu', email: 'emeka.nwosu@example.com', password: DEMO_PASSWORD, phone: '+234 802 555 0191', reminder: 'SMS' },
    { id: 'u_aisha', role: 'client', name: 'Aisha Bello', email: 'aisha.bello@example.com', password: DEMO_PASSWORD, phone: '+234 706 331 0472', reminder: 'WhatsApp' },
    { id: 'u_tolu', role: 'client', name: 'Tolu Martins', email: 'tolu@martinsfoods.example.com', password: DEMO_PASSWORD, phone: '+234 815 220 8841', reminder: 'Email only' },
    { id: 'u_halima', role: 'lawyer', lawyerId: 'halima', name: 'Halima Yusuf', email: 'halima@harborvale.legal', password: DEMO_PASSWORD, title: 'Senior Associate' },
    { id: 'u_chidi', role: 'lawyer', lawyerId: 'chidi', name: 'Chidi Eze', email: 'chidi@harborvale.legal', password: DEMO_PASSWORD, title: 'Associate' },
    { id: 'u_adaeze', role: 'partner', lawyerId: 'adaeze', name: 'Adaeze Okafor', email: 'adaeze@harborvale.legal', password: DEMO_PASSWORD, title: 'Managing Partner' },
    { id: 'u_tunde', role: 'partner', lawyerId: 'tunde', name: 'Tunde Bakare', email: 'tunde@harborvale.legal', password: DEMO_PASSWORD, title: 'Partner' },
  ];

  const appointments = [
    { id: 'ap_1', clientId: 'u_ngozi', lawyerId: 'halima', areaId: 'family', format: 'video', date: day(1), time: '10:30', dur: 45, status: 'confirmed', fee: 25000, brief: 'My spouse and I have separated and I want to understand custody arrangements for our two children.', notes: '', createdAt: ago(60 * 70), matterId: 'HV-2026-0142', invoiceId: 'INV-0318' },
    { id: 'ap_2', clientId: 'u_emeka', lawyerId: 'chidi', areaId: 'property', format: 'office', date: day(0), time: '14:45', dur: 45, status: 'confirmed', fee: 30000, brief: 'Review of title documents for a plot in Lekki before final payment.', notes: '', createdAt: ago(60 * 26), matterId: 'HV-2026-0139', invoiceId: 'INV-0325' },
    { id: 'ap_3', clientId: 'u_aisha', lawyerId: 'tunde', areaId: 'employment', format: 'phone', date: day(1), time: '14:00', dur: 45, status: 'confirmed', fee: 25000, brief: 'Follow-up on demand letter response from former employer.', notes: '', createdAt: ago(60 * 20), matterId: 'HV-2026-0131', invoiceId: null },
    { id: 'ap_4', clientId: 'u_tolu', lawyerId: 'adaeze', areaId: 'business', format: 'video', date: day(2), time: '11:15', dur: 60, status: 'confirmed', fee: 40000, brief: 'Registering a food distribution company and a shareholders’ agreement with my business partner.', notes: '', createdAt: ago(55), matterId: null, invoiceId: 'INV-0335' },
    { id: 'ap_5', clientId: 'u_aisha', lawyerId: 'tunde', areaId: 'employment', format: 'office', date: day(-4), time: '10:30', dur: 45, status: 'completed', fee: 25000, brief: 'Dismissed without notice after 6 years.', notes: 'Strong claim for notice pay and gratuity. Demand letter issued.', createdAt: ago(60 * 24 * 8), matterId: 'HV-2026-0131', invoiceId: null },
    { id: 'ap_6', clientId: 'u_emeka', lawyerId: 'chidi', areaId: 'property', format: 'video', date: day(-3), time: '09:45', dur: 45, status: 'completed', fee: 30000, brief: 'Buying land in Lekki.', notes: 'Survey plan looks consistent; title search ordered.', createdAt: ago(60 * 24 * 7), matterId: 'HV-2026-0139', invoiceId: null },
  ];

  const matters = [
    {
      id: 'HV-2026-0142', clientId: 'u_ngozi', title: 'Custody arrangement', areaId: 'family', leadId: 'halima', team: ['Halima Yusuf', 'Funmi Bello'], stage: 1,
      updates: [{ ts: ago(60 * 24 * 3), text: 'We’ve drafted your proposed parenting plan and will share it for your review after the consultation.' }],
      opened: ago(60 * 24 * 5),
    },
    {
      id: 'HV-2026-0139', clientId: 'u_emeka', title: 'Land purchase — Lekki', areaId: 'property', leadId: 'chidi', team: ['Chidi Eze', 'Funmi Bello'], stage: 2,
      updates: [{ ts: ago(60 * 30), text: 'Title search is back. The root of title checks out; we are now verifying the survey plan against the gazette.' }],
      opened: ago(60 * 24 * 9),
    },
    {
      id: 'HV-2026-0131', clientId: 'u_aisha', title: 'Wrongful dismissal claim', areaId: 'employment', leadId: 'tunde', team: ['Tunde Bakare', 'Funmi Bello'], stage: 3,
      updates: [{ ts: ago(60 * 24 * 2), text: 'Your former employer has responded to the demand letter and denies liability. We are preparing to file at the National Industrial Court.' }],
      opened: ago(60 * 24 * 21),
    },
  ];

  const documents = [
    { id: 'd_1', clientId: 'u_ngozi', matterId: 'HV-2026-0142', name: 'Engagement letter — draft', kind: 'engagement', status: 'needs-signature', by: 'Halima Yusuf', fileKind: 'PDF', ts: ago(60 * 24 * 2) },
    { id: 'd_2', clientId: 'u_ngozi', matterId: 'HV-2026-0142', name: 'Children’s birth certificates', kind: 'upload', status: 'received', by: 'you', fileKind: 'JPG', ts: ago(60 * 24 * 4) },
    { id: 'd_3', clientId: 'u_ngozi', matterId: 'HV-2026-0142', name: 'Consultation receipt', kind: 'receipt', status: 'generated', by: 'system', fileKind: 'PDF', ts: ago(60 * 24 * 4), invoiceId: 'INV-0318' },
    { id: 'd_4', clientId: 'u_ngozi', matterId: 'HV-2026-0142', name: 'Valid ID', kind: 'upload', status: 'requested', by: 'Halima Yusuf', fileKind: 'PDF', purpose: 'id', note: 'NIN slip, international passport or driver’s licence', ts: ago(60 * 24 * 2) },
    { id: 'd_5', clientId: 'u_emeka', matterId: 'HV-2026-0139', name: 'Engagement letter — Land purchase', kind: 'engagement', status: 'signed', by: 'Chidi Eze', fileKind: 'PDF', ts: ago(60 * 24 * 8), signedName: 'Emeka Nwosu', signedAt: ago(60 * 24 * 7) },
    { id: 'd_6', clientId: 'u_emeka', matterId: 'HV-2026-0139', name: 'Deed of assignment (copy)', kind: 'upload', status: 'received', by: 'you', fileKind: 'PDF', ts: ago(60 * 24 * 6) },
    { id: 'd_7', clientId: 'u_aisha', matterId: 'HV-2026-0131', name: 'Engagement letter — Employment claim', kind: 'engagement', status: 'signed', by: 'Tunde Bakare', fileKind: 'PDF', ts: ago(60 * 24 * 18), signedName: 'Aisha Bello', signedAt: ago(60 * 24 * 17) },
    { id: 'd_8', clientId: 'u_aisha', matterId: 'HV-2026-0131', name: 'Letter of termination', kind: 'upload', status: 'received', by: 'you', fileKind: 'PDF', ts: ago(60 * 24 * 20) },
  ];

  const invoices = [
    { id: 'INV-0318', clientId: 'u_ngozi', matterId: 'HV-2026-0142', desc: 'Consultation', lines: [{ desc: 'Initial consultation — Family & divorce (45 min)', amount: 25000 }], vat: 0, status: 'paid', issued: ago(60 * 24 * 4), due: iso(addDays(midnight(), -4)), paidAt: ago(60 * 24 * 4), method: 'Card' },
    { id: 'INV-0331', clientId: 'u_ngozi', matterId: 'HV-2026-0142', desc: 'Retainer', lines: [{ desc: 'Custody / parenting agreement — fixed fee', amount: 350000 }], vat: 26250, status: 'due', issued: ago(60 * 24 * 2), due: iso(addDays(midnight(), 7)) },
    { id: 'INV-0325', clientId: 'u_emeka', matterId: 'HV-2026-0139', desc: 'Title search & report', lines: [{ desc: 'Title search & report', amount: 120000 }], vat: 9000, status: 'paid', issued: ago(60 * 24 * 7), due: iso(addDays(midnight(), -2)), paidAt: ago(60 * 24 * 6), method: 'Bank transfer' },
    { id: 'INV-0322', clientId: 'u_aisha', matterId: 'HV-2026-0131', desc: 'Demand letter & negotiation', lines: [{ desc: 'Demand letter and settlement negotiation', amount: 75000 }], vat: 5625, status: 'due', issued: ago(60 * 24 * 14), due: iso(addDays(midnight(), -3)) },
    { id: 'INV-0335', clientId: 'u_tolu', matterId: null, desc: 'Consultation', lines: [{ desc: 'Initial consultation — Corporate & commercial (60 min)', amount: 40000 }], vat: 0, status: 'paid', issued: ago(55), due: iso(midnight()), paidAt: ago(55), method: 'Card' },
  ];

  const messages = [
    { id: 'm_1', clientId: 'u_ngozi', from: 'staff', senderName: 'Halima Yusuf', text: 'Thanks for the certificates. Please have the school fee receipts handy for Tuesday if you can.', ts: ago(120), read: false },
    { id: 'm_2', clientId: 'u_emeka', from: 'staff', senderName: 'Chidi Eze', text: 'Hi Emeka, the survey plan has been matched to the gazette. I’d like to walk you through the results at 14:45 today.', ts: ago(60 * 30), read: true },
    { id: 'm_3', clientId: 'u_emeka', from: 'client', senderName: 'Emeka Nwosu', text: 'Great, thank you. I’ll bring the receipts from the seller.', ts: ago(60 * 29), read: false },
    { id: 'm_4', clientId: 'u_aisha', from: 'client', senderName: 'Aisha Bello', text: 'Have they replied to the second demand letter yet?', ts: ago(60 * 8), read: false },
  ];

  const activity = [
    { id: 'ac_1', ts: ago(55), text: 'New booking: Tolu Martins — Corporate & commercial with Adaeze Okafor' },
    { id: 'ac_2', ts: ago(120), text: 'Halima Yusuf messaged Ngozi Adebayo' },
    { id: 'ac_3', ts: ago(60 * 8), text: 'Aisha Bello sent a message on HV-2026-0131' },
    { id: 'ac_4', ts: ago(60 * 29), text: 'Emeka Nwosu sent a message on HV-2026-0139' },
  ];

  return { v: 1, users, appointments, matters, documents, invoices, messages, activity, counters: { inv: 335, matter: 147, booking: 1042 } };
}
