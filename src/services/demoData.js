/**
 * Demo Data Service for VAIB
 * Generates realistic Italian freelancer data for demo mode
 */

// Helper to generate random dates
const randomDate = (daysAgo, daysAhead = 0) => {
  const today = new Date();
  const from = new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  const to = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  const date = new Date(from.getTime() + Math.random() * (to.getTime() - from.getTime()));
  return date.toISOString().split('T')[0];
};

// Demo user profile
export const demoUser = {
  id: 'demo-user',
  username: 'demo@vaib.app',
  email: 'demo@vaib.app',
  fullName: 'Marco Rossi',
  avatar: 'MR',
  company: 'Marco Rossi - Consulenza Web',
  role: 'user',
  isDemo: true
};

// Demo contacts - realistic Italian clients
export const demoContacts = [
  {
    id: 'demo-c1',
    name: 'Anna Bianchi',
    email: 'anna.bianchi@techstartup.it',
    phone: '+39 348 123 4567',
    company: 'TechStartup Milano',
    status: 'Cliente',
    value: 8500,
    lastContact: randomDate(5),
    avatar: 'AB',
    notes: 'Progetto redesign sito web in corso'
  },
  {
    id: 'demo-c2',
    name: 'Giuseppe Verdi',
    email: 'g.verdi@studioverdi.it',
    phone: '+39 335 987 6543',
    company: 'Studio Verdi & Associati',
    status: 'Cliente',
    value: 12000,
    lastContact: randomDate(12),
    avatar: 'GV',
    notes: 'Cliente storico, gestione sito + SEO'
  },
  {
    id: 'demo-c3',
    name: 'Laura Ferrari',
    email: 'laura@ferraridesign.com',
    phone: '+39 340 555 1234',
    company: 'Ferrari Design Studio',
    status: 'Lead',
    value: 3500,
    lastContact: randomDate(3),
    avatar: 'LF',
    notes: 'Interessata a landing page per nuovo prodotto'
  },
  {
    id: 'demo-c4',
    name: 'Roberto Esposito',
    email: 'r.esposito@ristorantebellaitalia.it',
    phone: '+39 366 789 0123',
    company: 'Ristorante Bella Italia',
    status: 'Cliente',
    value: 2800,
    lastContact: randomDate(20),
    avatar: 'RE',
    notes: 'Sito + sistema prenotazioni online'
  },
  {
    id: 'demo-c5',
    name: 'Chiara Moretti',
    email: 'chiara@moretti-consulting.it',
    phone: '+39 328 456 7890',
    company: 'Moretti Business Consulting',
    status: 'Prospect',
    value: 5000,
    lastContact: randomDate(8),
    avatar: 'CM',
    notes: 'Incontro fissato per presentazione servizi'
  },
  {
    id: 'demo-c6',
    name: 'Paolo Romano',
    email: 'paolo@ecommerce-italia.it',
    phone: '+39 347 234 5678',
    company: 'E-commerce Italia Srl',
    status: 'Cliente',
    value: 18500,
    lastContact: randomDate(2),
    avatar: 'PR',
    notes: 'Contratto annuale manutenzione e-commerce'
  },
  {
    id: 'demo-c7',
    name: 'Francesca Russo',
    email: 'f.russo@architetti-milano.it',
    phone: '+39 339 876 5432',
    company: 'Studio Architetti Milano',
    status: 'Lead',
    value: 4200,
    lastContact: randomDate(15),
    avatar: 'FR',
    notes: 'Portfolio online + configuratore 3D'
  }
];

// Demo opportunities with realistic pipeline stages
// Stages: 'Lead', 'In contatto', 'Follow Up da fare', 'Revisionare offerta', 'Chiuso Vinto', 'Chiuso Perso'
export const demoOpportunities = [
  {
    id: 'demo-o1',
    title: 'Redesign Sito TechStartup',
    company: 'TechStartup Milano',
    value: 8500,
    stage: 'Revisionare offerta',
    expectedClose: randomDate(0, 30),
    owner: 'Marco Rossi',
    contactId: 'demo-c1',
    probability: 75,
    notes: 'Progetto avviato, consegna prevista fine mese'
  },
  {
    id: 'demo-o2',
    title: 'SEO + Content Strategy',
    company: 'Studio Verdi & Associati',
    value: 4800,
    stage: 'Chiuso Vinto',
    expectedClose: randomDate(30),
    owner: 'Marco Rossi',
    contactId: 'demo-c2',
    probability: 100,
    notes: 'Contratto firmato, fattura emessa'
  },
  {
    id: 'demo-o3',
    title: 'Landing Page Nuovo Prodotto',
    company: 'Ferrari Design Studio',
    value: 3500,
    stage: 'Follow Up da fare',
    expectedClose: randomDate(0, 15),
    owner: 'Marco Rossi',
    contactId: 'demo-c3',
    probability: 50,
    notes: 'Preventivo inviato, in attesa di feedback'
  },
  {
    id: 'demo-o4',
    title: 'Sistema Prenotazioni Online',
    company: 'Ristorante Bella Italia',
    value: 2800,
    stage: 'Chiuso Vinto',
    expectedClose: randomDate(60),
    owner: 'Marco Rossi',
    contactId: 'demo-c4',
    probability: 100,
    notes: 'Completato e consegnato'
  },
  {
    id: 'demo-o5',
    title: 'Consulenza Digital Strategy',
    company: 'Moretti Business Consulting',
    value: 5000,
    stage: 'In contatto',
    expectedClose: randomDate(0, 45),
    owner: 'Marco Rossi',
    contactId: 'demo-c5',
    probability: 30,
    notes: 'Primo incontro fissato per la prossima settimana'
  },
  {
    id: 'demo-o6',
    title: 'Manutenzione E-commerce 2024',
    company: 'E-commerce Italia Srl',
    value: 18500,
    stage: 'Chiuso Vinto',
    expectedClose: randomDate(0, 90),
    owner: 'Marco Rossi',
    contactId: 'demo-c6',
    probability: 100,
    notes: 'Contratto annuale in corso'
  },
  {
    id: 'demo-o7',
    title: 'Portfolio + Configuratore 3D',
    company: 'Studio Architetti Milano',
    value: 4200,
    stage: 'Lead',
    expectedClose: randomDate(0, 25),
    owner: 'Marco Rossi',
    contactId: 'demo-c7',
    probability: 10,
    notes: 'Interessati, richiesta demo configuratore'
  },
  {
    id: 'demo-o8',
    title: 'App Mobile Delivery',
    company: 'Ristorante Bella Italia',
    value: 6500,
    stage: 'Revisionare offerta',
    expectedClose: randomDate(0, 40),
    owner: 'Marco Rossi',
    contactId: 'demo-c4',
    probability: 75,
    notes: 'Upselling cliente esistente'
  }
];

// Demo tasks with realistic deadlines
export const demoTasks = [
  {
    id: 'demo-t1',
    title: 'Consegnare mockup homepage TechStartup',
    description: 'Finalizzare i mockup Figma per la homepage',
    dueDate: randomDate(0, 3),
    priority: 'Alta',
    completed: false,
    contactId: 'demo-c1',
    contactName: 'Anna Bianchi',
    opportunityId: 'demo-o1'
  },
  {
    id: 'demo-t2',
    title: 'Call review SEO con Studio Verdi',
    description: 'Presentazione risultati Q3 e piano Q4',
    dueDate: randomDate(0, 5),
    priority: 'Media',
    completed: false,
    contactId: 'demo-c2',
    contactName: 'Giuseppe Verdi',
    opportunityId: 'demo-o2'
  },
  {
    id: 'demo-t3',
    title: 'Inviare preventivo rivisto Ferrari Design',
    description: 'Aggiornare preventivo con opzioni aggiuntive',
    dueDate: randomDate(0, 2),
    priority: 'Alta',
    completed: false,
    contactId: 'demo-c3',
    contactName: 'Laura Ferrari',
    opportunityId: 'demo-o3'
  },
  {
    id: 'demo-t4',
    title: 'Preparare presentazione Moretti',
    description: 'Slide deck per incontro digital strategy',
    dueDate: randomDate(0, 7),
    priority: 'Media',
    completed: false,
    contactId: 'demo-c5',
    contactName: 'Chiara Moretti',
    opportunityId: 'demo-o5'
  },
  {
    id: 'demo-t5',
    title: 'Aggiornamento sicurezza e-commerce',
    description: 'Patch sicurezza e aggiornamento plugin',
    dueDate: randomDate(0, 1),
    priority: 'Alta',
    completed: false,
    contactId: 'demo-c6',
    contactName: 'Paolo Romano',
    opportunityId: 'demo-o6'
  },
  {
    id: 'demo-t6',
    title: 'Backup mensile database clienti',
    description: 'Backup completo e verifica integrità',
    dueDate: randomDate(0, 10),
    priority: 'Bassa',
    completed: false
  },
  {
    id: 'demo-t7',
    title: 'Fattura manutenzione Q3 E-commerce Italia',
    description: 'Emettere fattura trimestrale',
    dueDate: randomDate(0, 4),
    priority: 'Alta',
    completed: false,
    contactId: 'demo-c6',
    contactName: 'Paolo Romano'
  },
  {
    id: 'demo-t8',
    title: 'Follow-up Laura Ferrari',
    description: 'Chiamare per feedback sul preventivo',
    dueDate: randomDate(0, 6),
    priority: 'Media',
    completed: false,
    contactId: 'demo-c3',
    contactName: 'Laura Ferrari'
  },
  // Some completed tasks
  {
    id: 'demo-t9',
    title: 'Setup ambiente staging TechStartup',
    description: 'Configurazione server di test',
    dueDate: randomDate(5),
    priority: 'Alta',
    completed: true,
    contactId: 'demo-c1',
    contactName: 'Anna Bianchi'
  },
  {
    id: 'demo-t10',
    title: 'Contratto firmato Studio Verdi',
    description: 'Raccolta firma e archiviazione',
    dueDate: randomDate(15),
    priority: 'Alta',
    completed: true,
    contactId: 'demo-c2',
    contactName: 'Giuseppe Verdi'
  }
];

// Demo invoices - mix of paid, pending, overdue
export const demoInvoices = [
  {
    id: 'demo-i1',
    number: 'INV-2024-001',
    opportunityId: 'demo-o2',
    client: 'Studio Verdi & Associati',
    amount: 4800,
    status: 'Pagata',
    issueDate: randomDate(45),
    dueDate: randomDate(15),
    paidDate: randomDate(10),
    description: 'SEO + Content Strategy Q3'
  },
  {
    id: 'demo-i2',
    number: 'INV-2024-002',
    opportunityId: 'demo-o4',
    client: 'Ristorante Bella Italia',
    amount: 2800,
    status: 'Pagata',
    issueDate: randomDate(60),
    dueDate: randomDate(30),
    paidDate: randomDate(25),
    description: 'Sistema prenotazioni online'
  },
  {
    id: 'demo-i3',
    number: 'INV-2024-003',
    opportunityId: 'demo-o6',
    client: 'E-commerce Italia Srl',
    amount: 4625,
    status: 'Pagata',
    issueDate: randomDate(90),
    dueDate: randomDate(60),
    paidDate: randomDate(55),
    description: 'Manutenzione Q2 2024'
  },
  {
    id: 'demo-i4',
    number: 'INV-2024-004',
    opportunityId: 'demo-o6',
    client: 'E-commerce Italia Srl',
    amount: 4625,
    status: 'In attesa',
    issueDate: randomDate(20),
    dueDate: randomDate(0, 10),
    description: 'Manutenzione Q3 2024'
  },
  {
    id: 'demo-i5',
    number: 'INV-2024-005',
    opportunityId: 'demo-o1',
    client: 'TechStartup Milano',
    amount: 4250,
    status: 'In attesa',
    issueDate: randomDate(10),
    dueDate: randomDate(0, 20),
    description: 'Acconto 50% redesign sito'
  },
  {
    id: 'demo-i6',
    number: 'INV-2024-006',
    client: 'Cliente vario - Consulenze',
    amount: 1200,
    status: 'Scaduta',
    issueDate: randomDate(50),
    dueDate: randomDate(20),
    description: 'Consulenza tecnica'
  },
  // Historical invoices for forfettario calculation
  {
    id: 'demo-i7',
    number: 'INV-2024-007',
    client: 'Vari clienti',
    amount: 15000,
    status: 'Pagata',
    issueDate: randomDate(150),
    dueDate: randomDate(120),
    paidDate: randomDate(115),
    description: 'Fatture Q1 2024'
  },
  {
    id: 'demo-i8',
    number: 'INV-2024-008',
    client: 'Vari clienti',
    amount: 12500,
    status: 'Pagata',
    issueDate: randomDate(240),
    dueDate: randomDate(210),
    paidDate: randomDate(200),
    description: 'Fatture Q4 2023'
  }
];

// Calculate demo totals
export const getDemoStats = () => {
  const totalInvoiced = demoInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidInvoices = demoInvoices.filter(i => i.status === 'Pagata');
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const pendingInvoices = demoInvoices.filter(i => i.status === 'In attesa');
  const totalPending = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  const forfettarioLimit = 85000;
  const forfettarioUsed = totalInvoiced;
  const forfettarioPercentage = Math.round((forfettarioUsed / forfettarioLimit) * 100);

  return {
    totalInvoiced,
    totalPaid,
    totalPending,
    forfettarioLimit,
    forfettarioUsed,
    forfettarioPercentage,
    forfettarioRemaining: forfettarioLimit - forfettarioUsed
  };
};

// Export all demo data
export const getAllDemoData = () => ({
  user: demoUser,
  contacts: demoContacts,
  opportunities: demoOpportunities,
  tasks: demoTasks,
  invoices: demoInvoices,
  stats: getDemoStats()
});
