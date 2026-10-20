export const FIRM = {
  name: 'Harbor & Vale Legal',
  founded: 2014,
  years: 12,
  email: 'hello@harborvale.legal',
  lagos: { street: '14 Adetokunbo Ademola Street', city: 'Victoria Island, Lagos', hours: 'Mon–Fri, 8:30 – 17:30', phone: '+234 1 700 0142', email: 'lagos@harborvale.legal' },
  abuja: { street: '7 Aminu Kano Crescent', city: 'Wuse 2, Abuja', hours: 'Tue & Thu, 9:00 – 17:00', phone: '+234 9 461 0188', email: 'abuja@harborvale.legal' },
};

export const AREAS = [
  {
    id: 'family', short: 'Family', name: 'Family & Divorce', bookName: 'Family & divorce', fee: 25000, dur: 45,
    blurb: 'Divorce, custody, maintenance, prenuptial agreements and family estates.',
    lead: 'Calm, practical help through some of life’s hardest moments — with agreements that protect you and your children, and court only when it’s needed.',
    chips: ['English or Hausa', 'Video for clients abroad', 'Fixed fees for most agreements'],
    handles: [
      ['Divorce & separation', 'Petitions for dissolution, judicial separation, and agreeing terms out of court.'],
      ['Child custody & access', 'Parenting plans, custody applications and changes when circumstances move on.'],
      ['Maintenance & support', 'Spousal and child maintenance, school fees and enforcing existing orders.'],
      ['Property on separation', 'Dividing the matrimonial home, land and business interests fairly.'],
      ['Prenuptial agreements', 'Clear agreements before marriage, including for couples in different countries.'],
      ['Wills & family estates', 'Drafting wills, letters of administration and resolving disputes between relatives.'],
    ],
    process: [
      ['Consultation', 'We listen, explain your options and the likely timeline.'],
      ['Engagement', 'Scope and fee agreed in a signed engagement letter.'],
      ['Preparing papers', 'We draft agreements or court documents for your review.'],
      ['Negotiation or hearing', 'We negotiate with the other side, or represent you in court.'],
      ['Resolution', 'Final agreement or order, and what to do next.'],
    ],
    fees: [['Initial consultation (45 min)', 'Fixed', '₦25,000'], ['Custody or parenting agreement', 'Fixed', '₦350,000'], ['Prenuptial agreement', 'Fixed', '₦450,000'], ['Uncontested divorce', 'Staged', '₦600,000'], ['Contested proceedings', 'Per stage', 'Quoted']],
    bring: ['Marriage certificate', 'Children’s birth certificates', 'Any court papers you’ve received', 'A rough list of shared property and expenses'],
    faqs: [
      ['How long does a divorce take in Nigeria?', 'It depends on whether both spouses agree and on the court’s calendar. We’ll give you a realistic estimate at the consultation.'],
      ['Can you help if my spouse lives abroad?', 'Yes. We regularly work with clients and spouses outside Nigeria using video meetings and electronic documents.'],
      ['Will this be kept private?', 'Everything you share is confidential and seen only by your legal team.'],
    ],
  },
  {
    id: 'property', short: 'Property', name: 'Property & Real Estate', bookName: 'Property & real estate', fee: 30000, dur: 45,
    blurb: 'Land purchases, title searches, Governor’s consent, tenancy and landlord disputes.',
    lead: 'Buy, sell and lease with confidence. We run the checks, read the documents and make sure your title is safe before money changes hands.',
    chips: ['Title searches included', 'Lagos & Abuja registries', 'Video for clients abroad'],
    handles: [
      ['Land & house purchases', 'Due diligence, contracts of sale and completion for residential and commercial property.'],
      ['Title verification', 'Searches at the land registry, survey checks and tracing the root of title.'],
      ['Governor’s consent & registration', 'Applying for consent, stamping and registering your deed.'],
      ['Tenancy agreements', 'Drafting and reviewing leases for landlords and tenants.'],
      ['Landlord & tenant disputes', 'Recovery of premises, arrears and notices under Lagos tenancy law.'],
      ['Property development', 'Joint-venture and development agreements, and off-plan purchase reviews.'],
    ],
    process: [
      ['Consultation', 'We review the property details and explain the checks needed.'],
      ['Engagement', 'Scope and fee agreed in a signed engagement letter.'],
      ['Due diligence', 'Searches, survey verification and document review.'],
      ['Contract & completion', 'We negotiate terms, supervise payment and sign-off.'],
      ['Registration', 'Consent, stamping and registration of your title.'],
    ],
    fees: [['Initial consultation (45 min)', 'Fixed', '₦30,000'], ['Title search & report', 'Fixed', '₦120,000'], ['Residential purchase', 'Staged', '₦450,000'], ['Tenancy agreement', 'Fixed', '₦90,000'], ['Recovery of premises', 'Per stage', 'Quoted']],
    bring: ['Survey plan and Certificate of Occupancy (if any)', 'Draft or signed sale agreement', 'Receipts of payments made', 'Seller’s ID and contact details'],
    faqs: [
      ['How do I know the land isn’t under acquisition?', 'We check the official gazette and registry records for acquisition and encumbrances as part of the title search.'],
      ['Can you act if I live abroad?', 'Yes — we handle the whole process with you by video and electronic documents, and can hold documents safely for you.'],
      ['Do you handle Abuja property?', 'Yes, through our Wuse 2 office, with the same fixed-fee approach.'],
    ],
  },
  {
    id: 'business', short: 'Corporate', name: 'Corporate & Commercial', bookName: 'Corporate & commercial', fee: 40000, dur: 60,
    blurb: 'CAC registration, contracts, shareholder agreements, compliance and investment.',
    lead: 'A dependable legal partner as your business grows — from incorporation and contracts to investment rounds and compliance.',
    chips: ['Fixed-fee incorporation', 'Contracts in plain language', 'Foreign-investor experience'],
    handles: [
      ['Company registration', 'CAC incorporation, business names, post-incorporation filings and annual returns.'],
      ['Commercial contracts', 'Supplier, distribution, service and agency agreements drafted to protect you.'],
      ['Shareholder agreements', 'Governance, exit and dispute terms between founders and investors.'],
      ['Investment & fundraising', 'Term sheets, subscription agreements and due diligence.'],
      ['Regulatory compliance', 'Licences, tax registrations and sector-specific approvals.'],
      ['Mergers & restructuring', 'Share and asset transfers, reorganisations and winding up.'],
    ],
    process: [
      ['Consultation', 'We understand the business and what you’re trying to achieve.'],
      ['Engagement', 'Scope and fee agreed in a signed engagement letter.'],
      ['Drafting & filings', 'We prepare documents and make the necessary filings.'],
      ['Negotiation', 'We negotiate with the counterparty on your behalf.'],
      ['Completion', 'Signing, filing and a closing set of documents.'],
    ],
    fees: [['Initial consultation (60 min)', 'Fixed', '₦40,000'], ['Company registration (CAC)', 'Fixed', '₦150,000'], ['Shareholder agreement', 'Fixed', '₦500,000'], ['Commercial contract review', 'Fixed', '₦120,000'], ['Investment transaction', 'Staged', 'Quoted']],
    bring: ['Proposed company names (three options)', 'Directors’ and shareholders’ IDs', 'Draft contracts or term sheets', 'Your business plan or a short summary'],
    faqs: [
      ['How long does CAC registration take?', 'Typically 3–7 working days once names are cleared and documents are complete.'],
      ['Can you help a foreign company enter Nigeria?', 'Yes. We handle incorporation, expatriate quota, tax registration and regulatory approvals.'],
      ['Do you offer retainers for small businesses?', 'Yes — a monthly retainer gives you a lawyer on call for contracts and queries.'],
    ],
  },
  {
    id: 'employment', short: 'Employment', name: 'Employment', bookName: 'Employment', fee: 25000, dur: 45,
    blurb: 'Wrongful dismissal, unpaid entitlements, employment contracts and workplace policies.',
    lead: 'For employees who need their rights explained and employers who want to get it right the first time.',
    chips: ['Employees and employers', 'Settlement-first approach', 'Fixed fees for contracts'],
    handles: [
      ['Wrongful dismissal', 'Challenging terminations and negotiating fair exit terms.'],
      ['Unpaid entitlements', 'Salary arrears, gratuity, pension and other benefits.'],
      ['Employment contracts', 'Drafting and reviewing contracts, including executive agreements.'],
      ['Workplace policies', 'Handbooks, disciplinary procedures and compliance for employers.'],
      ['Redundancy', 'Process, notice and severance advice for both sides.'],
      ['Restrictive covenants', 'Non-compete, confidentiality and non-solicitation terms.'],
    ],
    process: [
      ['Consultation', 'We review your documents and explain where you stand.'],
      ['Engagement', 'Scope and fee agreed in a signed engagement letter.'],
      ['Demand & negotiation', 'A formal demand and settlement discussions.'],
      ['Proceedings', 'National Industrial Court proceedings if needed.'],
      ['Resolution', 'Settlement or judgment, and enforcement.'],
    ],
    fees: [['Initial consultation (45 min)', 'Fixed', '₦25,000'], ['Contract review', 'Fixed', '₦60,000'], ['Demand letter', 'Fixed', '₦75,000'], ['Negotiated exit', 'Staged', '₦250,000'], ['Court proceedings', 'Per stage', 'Quoted']],
    bring: ['Your employment contract and any amendments', 'Letter of termination or query', 'Recent payslips', 'Relevant emails or messages'],
    faqs: [
      ['I was dismissed without notice. What can I do?', 'Often you can claim notice pay and other entitlements. We’ll review your contract at the consultation.'],
      ['Is there a time limit to claim?', 'Yes — limitation periods apply, so it’s best to speak to us promptly.'],
      ['Do you advise employers too?', 'Yes, on contracts, policies and handling disciplinary matters properly.'],
    ],
  },
  {
    id: 'immigration', short: 'Immigration', name: 'Immigration', bookName: 'Immigration', fee: 30000, dur: 45,
    blurb: 'Visas, residence permits, expatriate quota and citizenship applications.',
    lead: 'Clear guidance through Nigerian immigration processes for individuals, families and companies bringing in talent.',
    chips: ['Individuals and companies', 'English, Igbo, French', 'Remote consultations'],
    handles: [
      ['Business & work visas', 'STR visas, work permits and renewals.'],
      ['Expatriate quota', 'Applications, extensions and compliance for foreign hires.'],
      ['Residence permits', 'CERPAC and residence for dependants.'],
      ['Citizenship', 'Naturalisation and registration applications.'],
      ['Family immigration', 'Spouse and child applications in and out of Nigeria.'],
      ['Compliance audits', 'Reviewing your workforce’s status before inspections.'],
    ],
    process: [
      ['Consultation', 'We confirm your eligibility and the right route.'],
      ['Engagement', 'Scope and fee agreed in a signed engagement letter.'],
      ['Document preparation', 'We assemble and review your application.'],
      ['Submission', 'Filing and follow-up with the authorities.'],
      ['Approval', 'Collection and next-step guidance.'],
    ],
    fees: [['Initial consultation (45 min)', 'Fixed', '₦30,000'], ['Business visa support', 'Fixed', '₦140,000'], ['Expatriate quota', 'Fixed', '₦380,000'], ['Residence permit', 'Fixed', '₦160,000'], ['Citizenship application', 'Staged', 'Quoted']],
    bring: ['Passport bio page', 'Current visa or permit', 'Employer or sponsor letter', 'Passport photographs'],
    faqs: [
      ['Can I consult from outside Nigeria?', 'Yes, all immigration consultations are available by video.'],
      ['How long does an expatriate quota take?', 'Usually several weeks, depending on the ministry. We give you an estimate upfront.'],
      ['Do you handle visa refusals?', 'Yes, we advise on re-application and appeals.'],
    ],
  },
  {
    id: 'disputes', short: 'Disputes', name: 'Litigation & Disputes', bookName: 'Litigation & disputes', fee: 35000, dur: 60,
    blurb: 'Debt recovery, contract disputes, court representation and arbitration.',
    lead: 'Firm, strategic representation when negotiation isn’t enough — with honest advice on cost, risk and timing at every stage.',
    chips: ['Court & arbitration', 'Early case assessment', 'Staged fees'],
    handles: [
      ['Debt recovery', 'Demand letters, statutory demands and recovery proceedings.'],
      ['Contract disputes', 'Breach of contract claims and defences.'],
      ['Court representation', 'High Court and appellate advocacy in Lagos and Abuja.'],
      ['Arbitration & mediation', 'Alternative dispute resolution, domestic and international.'],
      ['Injunctions', 'Urgent applications to protect assets or rights.'],
      ['Enforcement', 'Securing and enforcing judgments.'],
    ],
    process: [
      ['Consultation', 'Case assessment, options and likely cost.'],
      ['Engagement', 'Scope and fee agreed in a signed engagement letter.'],
      ['Pre-action', 'Letters, negotiation and evidence gathering.'],
      ['Proceedings', 'Pleadings, hearings and trial.'],
      ['Resolution', 'Judgment, settlement and enforcement.'],
    ],
    fees: [['Initial consultation (60 min)', 'Fixed', '₦35,000'], ['Demand letter', 'Fixed', '₦75,000'], ['Case assessment memo', 'Fixed', '₦200,000'], ['Debt recovery', 'Success-linked', 'Quoted'], ['Litigation', 'Per stage', 'Quoted']],
    bring: ['Contracts and correspondence', 'Invoices and proof of payment', 'Any court papers or demand letters', 'A timeline of events'],
    faqs: [
      ['Is it worth going to court?', 'Not always. We’ll give an honest view of your chances and costs before you decide.'],
      ['How are litigation fees charged?', 'In stages, agreed in advance, so you can plan each step.'],
      ['Can disputes be settled out of court?', 'Many are. We negotiate first wherever it serves you.'],
    ],
  },
];

export const BOOKABLE_AREAS = [
  ...AREAS,
  { id: 'unsure', name: 'Not sure yet', bookName: 'Not sure yet', fee: 25000, dur: 45 },
];
export const areaById = (id) => BOOKABLE_AREAS.find((a) => a.id === id);

export const LAWYERS = [
  {
    id: 'adaeze', name: 'Adaeze Okafor', initials: 'AO', title: 'Managing Partner', short: 'Managing Partner · Corporate',
    langs: ['English', 'Igbo'], focus: 'Corporate & commercial', areas: ['business', 'property', 'disputes', 'unsure'], office: 'Lagos',
    tag: 'Co-founder', quote: 'Leads our corporate practice and advises founders, investors and growing companies.',
    about: [
      'Adaeze advises on company formation, commercial contracts, shareholder arrangements and investment transactions. She works closely with founders from first registration through to funding rounds.',
      'She co-founded Harbor & Vale in 2014 after practising at a large commercial firm in Lagos, and works from our Victoria Island office.',
    ],
    edu: ['LL.B, University of Nigeria, Nsukka', 'B.L., Nigerian Law School', 'Called to the Nigerian Bar, 2008'],
    work: ['Company incorporation and governance', 'Shareholder and investment agreements', 'Commercial contract negotiation'],
  },
  {
    id: 'tunde', name: 'Tunde Bakare', initials: 'TB', title: 'Partner', short: 'Partner · Litigation & Disputes',
    langs: ['English', 'Yoruba'], focus: 'Litigation, disputes, employment', areas: ['disputes', 'employment', 'business', 'unsure'], office: 'Lagos & Abuja',
    tag: 'Co-founder', quote: 'Leads our litigation team and represents clients in court and arbitration.',
    about: [
      'Tunde represents individuals and businesses in commercial disputes, employment matters and debt recovery. He is known for clear case assessments and for settling matters early where that serves the client.',
      'He co-founded Harbor & Vale in 2014 and splits his time between Lagos and Abuja.',
    ],
    edu: ['LL.B, University of Lagos', 'B.L., Nigerian Law School', 'Called to the Nigerian Bar, 2007'],
    work: ['High Court and appellate advocacy', 'Employment disputes', 'Arbitration and debt recovery'],
  },
  {
    id: 'halima', name: 'Halima Yusuf', initials: 'HY', title: 'Senior Associate', short: 'Senior Associate · Family',
    langs: ['English', 'Hausa'], focus: 'Family & divorce', areas: ['family', 'employment', 'unsure'], office: 'Lagos',
    tag: 'Senior Associate', quote: 'Leads our family and divorce practice. Known for steady, practical advice that keeps children at the centre of every decision.',
    about: [
      'Halima advises on divorce, custody, maintenance and the division of family property, and drafts prenuptial agreements for couples in Nigeria and abroad. She prefers negotiated settlements where possible, and is an experienced advocate when a matter needs to go to court.',
      'Before joining Harbor & Vale in 2018, she practised at a family law firm in Kaduna. She works from our Lagos office, and with clients in the North by video and at our Abuja office.',
    ],
    edu: ['LL.B, Ahmadu Bello University', 'B.L., Nigerian Law School', 'Called to the Nigerian Bar, 2012'],
    work: ['Parenting and custody agreements', 'Uncontested and contested divorce', 'Maintenance and enforcement'],
  },
  {
    id: 'chidi', name: 'Chidi Eze', initials: 'CE', title: 'Associate', short: 'Associate · Property & Immigration',
    langs: ['English', 'Igbo', 'French'], focus: 'Property & immigration', areas: ['property', 'immigration', 'business', 'unsure'], office: 'Lagos',
    tag: 'Associate', quote: 'Handles property transactions and immigration matters for individuals and companies.',
    about: [
      'Chidi handles land and house purchases, title verification and registration, as well as visas, residence permits and expatriate quota applications.',
      'He joined Harbor & Vale in 2020 and is fluent in French, which helps with clients and companies relocating from francophone Africa and Europe.',
    ],
    edu: ['LL.B, University of Benin', 'B.L., Nigerian Law School', 'Called to the Nigerian Bar, 2016'],
    work: ['Land due diligence and title searches', 'Expatriate quota and visas', 'Tenancy and landlord disputes'],
  },
];
export const lawyerById = (id) => LAWYERS.find((l) => l.id === id);
export const lawyersForArea = (areaId) => LAWYERS.filter((l) => l.areas.includes(areaId));

export const SUPPORT = [
  { name: 'Funmi Bello', role: 'Paralegal · documents & filings', initials: 'FB' },
  { name: 'Kemi Adisa', role: 'Client relations · first contact', initials: 'KA' },
];

export const FORMATS = [
  { id: 'office', name: 'In our office', note: 'Victoria Island, Lagos', label: 'Office consultation' },
  { id: 'video', name: 'Video call', note: 'Link sent on confirmation', label: 'Video consultation' },
  { id: 'phone', name: 'Phone call', note: 'We call you', label: 'Phone consultation' },
];

export const ARTICLES = [
  {
    id: 'first-divorce-consultation', tag: 'FAMILY', title: 'What happens at your first divorce consultation', author: 'halima', read: 6, area: 'family',
    body: [
      'A first consultation is a conversation, not a commitment. Its purpose is to help you understand where you stand before you decide anything.',
      'Expect to be asked about your marriage, your children, and what you own together. Bring your marriage certificate and your children’s birth certificates if you can; they save time.',
      'Your lawyer will explain the options — negotiated agreement, mediation, or court — together with a realistic view of timing and cost. You’ll leave with a short written summary of what was discussed.',
      'Nothing is filed and no one is contacted until you decide to go ahead and sign an engagement letter.',
    ],
  },
  {
    id: 'buying-land-lagos', tag: 'PROPERTY', title: 'Buying land in Lagos: the checks to make before you pay', author: 'chidi', read: 8, area: 'property',
    body: [
      'Most land disputes in Lagos could have been avoided by checks made before payment. Four matter above all.',
      'First, verify the seller’s root of title at the land registry. Second, check the survey plan against the gazette to make sure the land isn’t under government acquisition or committed to someone else. Third, confirm there are no encumbrances such as mortgages or caveats. Fourth, make sure the deed will be stamped and registered, with Governor’s consent where it applies.',
      'Never pay the full price before these checks are complete, and pay only into an account in the seller’s verified name.',
    ],
  },
  {
    id: 'cac-registration', tag: 'CORPORATE', title: 'Registering a company with CAC, step by step', author: 'adaeze', read: 5, area: 'business',
    body: [
      'Registering a company with the Corporate Affairs Commission is straightforward when your documents are ready.',
      'Start by reserving a name — have three options in case your first choice is taken. Next, prepare your memorandum and articles, and gather IDs and addresses for each director and shareholder.',
      'After filing and approval you receive your certificate of incorporation. Then register for tax, and open a business bank account. We handle each of these steps on a fixed fee.',
    ],
  },
  {
    id: 'custody-what-courts-look-at', tag: 'FAMILY', title: 'Custody arrangements: what courts look at', author: 'halima', read: 7, area: 'family',
    body: [
      'Nigerian courts decide custody on one principle above all: the welfare of the child.',
      'Judges look at the child’s age and needs, the stability of each home, each parent’s ability to provide, and — for older children — the child’s own wishes.',
      'Agreements reached between parents and approved by the court are usually faster, cheaper and easier on children than a contested hearing.',
    ],
  },
];
export const articleById = (id) => ARTICLES.find((a) => a.id === id);
export const HOME_ARTICLES = ARTICLES.slice(0, 3);

export const HOME_FAQS = [
  ['Does booking a consultation make you my lawyer?', 'No. The consultation is a chance to understand your situation and your options. We act for you only once we’ve both signed an engagement letter.'],
  ['What if I don’t know which area I need?', 'Choose “Not sure yet” and describe your situation. We’ll match you with the right lawyer.'],
  ['How do I pay?', 'By card, bank transfer or USSD when you book. Your receipt arrives by email straight away.'],
  ['Can I bring documents?', 'Yes — upload them when you book so your lawyer can review them beforehand, or bring copies on the day.'],
];

export const STAGES = ['Consultation', 'Engagement', 'Preparing papers', 'Filing & hearing', 'Resolution'];
export const SLOT_TIMES = ['09:00', '09:45', '10:30', '11:15', '12:00', '14:00', '14:45', '15:30', '16:15', '17:00'];
