import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  Users, TrendingUp, Target, CheckSquare, Calendar, Settings, Bell, 
  Search, Plus, MoreHorizontal, Phone, Mail, Building2, Euro, Clock, 
  ArrowUpRight, ArrowDownRight, Filter, ChevronDown, ChevronRight,
  GripVertical, X, Edit2, Trash2, Eye, FileText, Tag, User, 
  Briefcase, MapPin, Globe, Hash, Percent, CalendarDays, AlertCircle,
  CheckCircle2, XCircle, Pause, Play, Archive, Copy, Download,
  Upload, RefreshCw, MoreVertical, ChevronLeft, Home, PieChart as PieChartIcon,
  List, LayoutGrid, SlidersHorizontal, Save, Send, MessageSquare,
  Paperclip, Link2, Star, StarOff, Flag, Zap, Activity, DollarSign
} from 'lucide-react';

// ==================== DATI INIZIALI ====================

const initialOpportunities = [
  // LEAD
  {
    id: 1,
    codice: 'OPP-2025-001',
    titolo: 'Corso formazione Sardegna',
    azienda: 'Sardegna formazione',
    aziendaId: 1,
    contatto: '',
    contattoEmail: '',
    contattoTelefono: '',
    valore: 9000,
    valoreRicorrente: 0,
    fase: 'Lead',
    probabilita: 97,
    dataCreazione: '2025-01-01',
    dataChiusuraPrevista: '2025-03-15',
    dataUltimaModifica: '2025-01-22',
    responsabile: 'Valentino Grossi',
    responsabileId: 1,
    team: ['Valentino Grossi'],
    origine: 'Sito Web',
    tipologia: 'Nuovo Cliente',
    prodotti: ['Formazione'],
    note: '',
    attivita: [],
    documenti: [],
    tags: ['Formazione'],
    priorita: 'Bassa',
    preferita: false,
    archiviata: false,
  },
  {
    id: 2,
    codice: 'OPP-2025-002',
    titolo: 'Corsi formazione regione Marche',
    azienda: 'BLM',
    aziendaId: 2,
    contatto: '',
    contattoEmail: '',
    contattoTelefono: '',
    valore: 0,
    valoreRicorrente: 0,
    fase: 'Lead',
    probabilita: 99,
    dataCreazione: '2025-01-05',
    dataChiusuraPrevista: '2025-04-01',
    dataUltimaModifica: '2025-01-20',
    responsabile: 'Valentino Grossi',
    responsabileId: 1,
    team: ['Valentino Grossi'],
    origine: 'Referral',
    tipologia: 'Nuovo Cliente',
    prodotti: ['Formazione'],
    note: '',
    attivita: [],
    documenti: [],
    tags: ['Formazione', 'Marche'],
    priorita: 'Bassa',
    preferita: false,
    archiviata: false,
  },
  {
    id: 3,
    codice: 'OPP-2025-003',
    titolo: 'Opportunità per PROBE SRL',
    azienda: 'PROBE SRL',
    aziendaId: 3,
    contatto: 'Marco Luciano',
    contattoEmail: '',
    contattoTelefono: '',
    valore: 0,
    valoreRicorrente: 0,
    fase: 'Lead',
    probabilita: 99,
    dataCreazione: '2025-01-08',
    dataChiusuraPrevista: '2025-03-20',
    dataUltimaModifica: '2025-01-21',
    responsabile: 'Valentino Grossi',
    responsabileId: 1,
    team: ['Valentino Grossi'],
    origine: 'Cold Call',
    tipologia: 'Nuovo Cliente',
    prodotti: [],
    note: '',
    attivita: [],
    documenti: [],
    tags: [],
    priorita: 'Bassa',
    preferita: false,
    archiviata: false,
  },
  // IN CONTATTO
  {
    id: 4,
    codice: 'OPP-2025-004',
    titolo: 'Formazione Litteracy AI',
    azienda: 'SPED srl',
    aziendaId: 4,
    contatto: '',
    contattoEmail: '',
    contattoTelefono: '',
    valore: 1000,
    valoreRicorrente: 0,
    fase: 'In contatto',
    probabilita: 98,
    dataCreazione: '2025-01-10',
    dataChiusuraPrevista: '2025-02-28',
    dataUltimaModifica: '2025-01-22',
    responsabile: 'Valentino Grossi',
    responsabileId: 1,
    team: ['Valentino Grossi'],
    origine: 'Referral',
    tipologia: 'Nuovo Cliente',
    prodotti: ['Formazione AI', 'Litteracy AI'],
    note: '',
    attivita: [],
    documenti: [],
    tags: ['AI', 'Formazione'],
    priorita: 'Bassa',
    preferita: false,
    archiviata: false,
  },
  {
    id: 5,
    codice: 'OPP-2025-005',
    titolo: 'Corso rivenditori',
    azienda: 'NTS INFORMATICA SRL',
    aziendaId: 5,
    contatto: '',
    contattoEmail: '',
    contattoTelefono: '',
    valore: 800,
    valoreRicorrente: 0,
    fase: 'In contatto',
    probabilita: 30,
    dataCreazione: '2025-01-12',
    dataChiusuraPrevista: '2025-03-15',
    dataUltimaModifica: '2025-01-20',
    responsabile: 'Valentino Grossi',
    responsabileId: 1,
    team: ['Valentino Grossi'],
    origine: 'Cross-selling',
    tipologia: 'Upselling',
    prodotti: ['Formazione'],
    note: '',
    attivita: [],
    documenti: [],
    tags: ['Rivenditori'],
    priorita: 'Bassa',
    preferita: false,
    archiviata: false,
  },
  // FOLLOW UP DA FARE
  {
    id: 6,
    codice: 'OPP-2025-006',
    titolo: 'Workshop',
    azienda: 'Harley&Dikkinson Consulting S.r.l.',
    aziendaId: 6,
    contatto: '',
    contattoEmail: '',
    contattoTelefono: '',
    valore: 800,
    valoreRicorrente: 0,
    fase: 'Follow Up',
    probabilita: 88,
    dataCreazione: '2025-01-05',
    dataChiusuraPrevista: '2025-02-15',
    dataUltimaModifica: '2025-01-18',
    responsabile: 'Valentino Grossi',
    responsabileId: 1,
    team: ['Valentino Grossi'],
    origine: 'Evento',
    tipologia: 'Nuovo Cliente',
    prodotti: ['Workshop'],
    note: '',
    attivita: [],
    documenti: [],
    tags: ['Workshop'],
    priorita: 'Bassa',
    preferita: false,
    archiviata: false,
  },
  // CHIUSO VINTO
  {
    id: 7,
    codice: 'OPP-2025-007',
    titolo: 'Edizione 6 SMAT',
    azienda: 'INREBUS TECHNOLOGIES SRL',
    aziendaId: 7,
    contatto: '',
    contattoEmail: '',
    contattoTelefono: '',
    valore: 850,
    valoreRicorrente: 0,
    fase: 'Chiusa Vinta',
    probabilita: 100,
    dataCreazione: '2024-11-01',
    dataChiusuraPrevista: '2025-01-15',
    dataChiusuraEffettiva: '2025-01-10',
    dataUltimaModifica: '2025-01-10',
    responsabile: 'Valentino Grossi',
    responsabileId: 1,
    team: ['Valentino Grossi'],
    origine: 'Cross-selling',
    tipologia: 'Upselling',
    prodotti: ['Formazione SMAT'],
    note: '',
    attivita: [],
    documenti: [],
    tags: ['SMAT', 'Won'],
    priorita: 'Bassa',
    preferita: false,
    archiviata: false,
  },
  {
    id: 8,
    codice: 'OPP-2025-008',
    titolo: 'AI adoption per Romina',
    azienda: 'Romina',
    aziendaId: 8,
    contatto: '',
    contattoEmail: '',
    contattoTelefono: '',
    valore: 1500,
    valoreRicorrente: 0,
    fase: 'Chiusa Vinta',
    probabilita: 100,
    dataCreazione: '2024-12-01',
    dataChiusuraPrevista: '2025-01-20',
    dataChiusuraEffettiva: '2025-01-15',
    dataUltimaModifica: '2025-01-15',
    responsabile: 'Valentino Grossi',
    responsabileId: 1,
    team: ['Valentino Grossi'],
    origine: 'Referral',
    tipologia: 'Nuovo Cliente',
    prodotti: ['AI Adoption'],
    note: '',
    attivita: [
      { id: 1, tipo: 'Email', descrizione: 'Fatturare anticipo', data: '2025-01-20', completata: false },
    ],
    documenti: [],
    tags: ['AI', 'Won'],
    priorita: 'Bassa',
    preferita: false,
    archiviata: false,
  },
  {
    id: 9,
    codice: 'OPP-2025-009',
    titolo: 'Consulenza Digital ACE',
    azienda: 'CNA Abruzzo',
    aziendaId: 9,
    contatto: '',
    contattoEmail: '',
    contattoTelefono: '',
    valore: 4000,
    valoreRicorrente: 0,
    fase: 'Chiusa Vinta',
    probabilita: 100,
    dataCreazione: '2024-10-15',
    dataChiusuraPrevista: '2024-12-20',
    dataChiusuraEffettiva: '2024-12-18',
    dataUltimaModifica: '2024-12-18',
    responsabile: 'Valentino Grossi',
    responsabileId: 1,
    team: ['Valentino Grossi'],
    origine: 'Partner',
    tipologia: 'Nuovo Cliente',
    prodotti: ['Consulenza Digital'],
    note: '',
    attivita: [
      { id: 1, tipo: 'Email', descrizione: 'Fattura 1', data: '2025-01-10', completata: false },
    ],
    documenti: [],
    tags: ['Consulenza', 'Won'],
    priorita: 'Bassa',
    preferita: false,
    archiviata: false,
  },
  {
    id: 10,
    codice: 'OPP-2025-010',
    titolo: 'Consulenza Strategica per SMAT',
    azienda: 'INREBUS TECHNOLOGIES SRL',
    aziendaId: 7,
    contatto: '',
    contattoEmail: '',
    contattoTelefono: '',
    valore: 1500,
    valoreRicorrente: 0,
    fase: 'Chiusa Vinta',
    probabilita: 100,
    dataCreazione: '2024-11-10',
    dataChiusuraPrevista: '2025-01-10',
    dataChiusuraEffettiva: '2025-01-08',
    dataUltimaModifica: '2025-01-08',
    responsabile: 'Valentino Grossi',
    responsabileId: 1,
    team: ['Valentino Grossi'],
    origine: 'Cross-selling',
    tipologia: 'Upselling',
    prodotti: ['Consulenza Strategica'],
    note: '',
    attivita: [
      { id: 1, tipo: 'Email', descrizione: 'Da erogare', data: '2025-01-15', completata: false },
    ],
    documenti: [],
    tags: ['SMAT', 'Consulenza', 'Won'],
    priorita: 'Bassa',
    preferita: false,
    archiviata: false,
  },
  {
    id: 11,
    codice: 'OPP-2025-011',
    titolo: 'Litteracy AI | Fondazione PuntoSUD',
    azienda: 'INREBUS TECHNOLOGIES SRL',
    aziendaId: 7,
    contatto: '',
    contattoEmail: '',
    contattoTelefono: '',
    valore: 2200,
    valoreRicorrente: 0,
    fase: 'Chiusa Vinta',
    probabilita: 100,
    dataCreazione: '2024-10-01',
    dataChiusuraPrevista: '2024-12-15',
    dataChiusuraEffettiva: '2024-12-10',
    dataUltimaModifica: '2024-12-10',
    responsabile: 'Valentino Grossi',
    responsabileId: 1,
    team: ['Valentino Grossi'],
    origine: 'Partner',
    tipologia: 'Nuovo Cliente',
    prodotti: ['Litteracy AI'],
    note: '',
    attivita: [
      { id: 1, tipo: 'Email', descrizione: 'da fatturare', data: '2025-01-05', completata: false },
    ],
    documenti: [],
    tags: ['AI', 'Fondazione', 'Won'],
    priorita: 'Bassa',
    preferita: false,
    archiviata: false,
  },
  {
    id: 12,
    codice: 'OPP-2025-012',
    titolo: 'Formazione GenAI',
    azienda: 'YDEA SRL',
    aziendaId: 10,
    contatto: '',
    contattoEmail: '',
    contattoTelefono: '',
    valore: 3500,
    valoreRicorrente: 0,
    fase: 'Chiusa Vinta',
    probabilita: 100,
    dataCreazione: '2024-09-15',
    dataChiusuraPrevista: '2024-11-30',
    dataChiusuraEffettiva: '2024-11-25',
    dataUltimaModifica: '2024-11-25',
    responsabile: 'Valentino Grossi',
    responsabileId: 1,
    team: ['Valentino Grossi'],
    origine: 'Referral',
    tipologia: 'Nuovo Cliente',
    prodotti: ['Formazione GenAI'],
    note: '',
    attivita: [],
    documenti: [],
    tags: ['GenAI', 'Formazione', 'Won'],
    priorita: 'Bassa',
    preferita: false,
    archiviata: false,
  },
  {
    id: 13,
    codice: 'OPP-2025-013',
    titolo: 'Formazione GenAI',
    azienda: 'NTS INFORMATICA SRL',
    aziendaId: 5,
    contatto: '',
    contattoEmail: '',
    contattoTelefono: '',
    valore: 4650,
    valoreRicorrente: 0,
    fase: 'Chiusa Vinta',
    probabilita: 100,
    dataCreazione: '2024-08-20',
    dataChiusuraPrevista: '2024-10-30',
    dataChiusuraEffettiva: '2024-10-28',
    dataUltimaModifica: '2024-10-28',
    responsabile: 'Valentino Grossi',
    responsabileId: 1,
    team: ['Valentino Grossi'],
    origine: 'Cross-selling',
    tipologia: 'Upselling',
    prodotti: ['Formazione GenAI'],
    note: '',
    attivita: [],
    documenti: [],
    tags: ['GenAI', 'Formazione', 'Won'],
    priorita: 'Bassa',
    preferita: false,
    archiviata: false,
  },
  {
    id: 14,
    codice: 'OPP-2025-014',
    titolo: 'Corso per SMAT (TO)',
    azienda: 'INREBUS TECHNOLOGIES SRL',
    aziendaId: 7,
    contatto: '',
    contattoEmail: '',
    contattoTelefono: '',
    valore: 5100,
    valoreRicorrente: 0,
    fase: 'Chiusa Vinta',
    probabilita: 100,
    dataCreazione: '2024-07-01',
    dataChiusuraPrevista: '2024-09-15',
    dataChiusuraEffettiva: '2024-09-10',
    dataUltimaModifica: '2024-09-10',
    responsabile: 'Valentino Grossi',
    responsabileId: 1,
    team: ['Valentino Grossi'],
    origine: 'Cross-selling',
    tipologia: 'Upselling',
    prodotti: ['Corso SMAT'],
    note: '',
    attivita: [],
    documenti: [],
    tags: ['SMAT', 'Torino', 'Won'],
    priorita: 'Bassa',
    preferita: false,
    archiviata: false,
  },
  // FARE FATTURA
  {
    id: 15,
    codice: 'OPP-2025-015',
    titolo: 'Docenza Dati e infrastrutture Digitali',
    azienda: "UNIVERSITA' DEGLI STUDI DI TERAMO",
    aziendaId: 11,
    contatto: '',
    contattoEmail: '',
    contattoTelefono: '',
    valore: 750,
    valoreRicorrente: 0,
    fase: 'Proposta',
    probabilita: 100,
    dataCreazione: '2025-01-02',
    dataChiusuraPrevista: '2025-02-10',
    dataUltimaModifica: '2025-01-20',
    responsabile: 'Valentino Grossi',
    responsabileId: 1,
    team: ['Valentino Grossi'],
    origine: 'Partner',
    tipologia: 'Nuovo Cliente',
    prodotti: ['Docenza'],
    note: 'Da fatturare',
    attivita: [],
    documenti: [],
    tags: ['Università', 'Docenza'],
    priorita: 'Bassa',
    preferita: false,
    archiviata: false,
  },
  {
    id: 16,
    codice: 'OPP-2025-016',
    titolo: 'Workshop | due lezioni',
    azienda: 'CNA Teramo',
    aziendaId: 12,
    contatto: '',
    contattoEmail: '',
    contattoTelefono: '',
    valore: 360,
    valoreRicorrente: 0,
    fase: 'Proposta',
    probabilita: 63,
    dataCreazione: '2025-01-08',
    dataChiusuraPrevista: '2025-02-20',
    dataUltimaModifica: '2025-01-18',
    responsabile: 'Valentino Grossi',
    responsabileId: 1,
    team: ['Valentino Grossi'],
    origine: 'Partner',
    tipologia: 'Nuovo Cliente',
    prodotti: ['Workshop'],
    note: 'Da fatturare',
    attivita: [],
    documenti: [],
    tags: ['CNA', 'Workshop'],
    priorita: 'Bassa',
    preferita: false,
    archiviata: false,
  },
  // STAND BY
  {
    id: 17,
    codice: 'OPP-2025-017',
    titolo: 'Corso Litteracy Segreteria MMG Toscana',
    azienda: '',
    aziendaId: 0,
    contatto: '',
    contattoEmail: '',
    contattoTelefono: '',
    valore: 1200,
    valoreRicorrente: 0,
    fase: 'Negoziazione',
    probabilita: 20,
    dataCreazione: '2025-01-05',
    dataChiusuraPrevista: '2025-04-01',
    dataUltimaModifica: '2025-01-15',
    responsabile: 'Valentino Grossi',
    responsabileId: 1,
    team: ['Valentino Grossi'],
    origine: 'Referral',
    tipologia: 'Nuovo Cliente',
    prodotti: ['Litteracy AI'],
    note: 'Stand By',
    attivita: [],
    documenti: [],
    tags: ['Toscana', 'Stand By'],
    priorita: 'Bassa',
    preferita: false,
    archiviata: false,
  },
  {
    id: 18,
    codice: 'OPP-2025-018',
    titolo: 'Opportunità per Go-on Group',
    azienda: 'Go-on Group',
    aziendaId: 13,
    contatto: '',
    contattoEmail: '',
    contattoTelefono: '',
    valore: 1200,
    valoreRicorrente: 0,
    fase: 'Negoziazione',
    probabilita: 20,
    dataCreazione: '2025-01-10',
    dataChiusuraPrevista: '2025-03-30',
    dataUltimaModifica: '2025-01-18',
    responsabile: 'Valentino Grossi',
    responsabileId: 1,
    team: ['Valentino Grossi'],
    origine: 'Cold Call',
    tipologia: 'Nuovo Cliente',
    prodotti: [],
    note: 'Stand By',
    attivita: [],
    documenti: [],
    tags: ['Stand By'],
    priorita: 'Bassa',
    preferita: false,
    archiviata: false,
  },
  {
    id: 19,
    codice: 'OPP-2025-019',
    titolo: 'Opportunità per APLUS SRL',
    azienda: 'APLUS SRL',
    aziendaId: 14,
    contatto: '',
    contattoEmail: '',
    contattoTelefono: '',
    valore: 900,
    valoreRicorrente: 0,
    fase: 'Negoziazione',
    probabilita: 30,
    dataCreazione: '2025-01-12',
    dataChiusuraPrevista: '2025-03-15',
    dataUltimaModifica: '2025-01-20',
    responsabile: 'Valentino Grossi',
    responsabileId: 1,
    team: ['Valentino Grossi'],
    origine: 'Referral',
    tipologia: 'Nuovo Cliente',
    prodotti: [],
    note: 'Stand By',
    attivita: [],
    documenti: [],
    tags: ['Stand By'],
    priorita: 'Bassa',
    preferita: false,
    archiviata: false,
  },
  // CHIUSO PERSO
  {
    id: 20,
    codice: 'OPP-2025-020',
    titolo: 'Formazione MilkLab Agenzia Brescia',
    azienda: 'DANDI SRL',
    aziendaId: 15,
    contatto: '',
    contattoEmail: '',
    contattoTelefono: '',
    valore: 800,
    valoreRicorrente: 0,
    fase: 'Chiusa Persa',
    probabilita: 0,
    dataCreazione: '2024-11-01',
    dataChiusuraPrevista: '2025-01-15',
    dataChiusuraEffettiva: '2025-01-10',
    dataUltimaModifica: '2025-01-10',
    responsabile: 'Valentino Grossi',
    responsabileId: 1,
    team: ['Valentino Grossi'],
    origine: 'Referral',
    tipologia: 'Nuovo Cliente',
    prodotti: ['Formazione'],
    note: '',
    motivoPerdita: 'Budget insufficiente',
    attivita: [],
    documenti: [],
    tags: ['Lost'],
    priorita: 'Bassa',
    preferita: false,
    archiviata: true,
  },
  {
    id: 21,
    codice: 'OPP-2025-021',
    titolo: 'Formazione Profession AI',
    azienda: 'ProAI SRL',
    aziendaId: 16,
    contatto: '',
    contattoEmail: '',
    contattoTelefono: '',
    valore: 850,
    valoreRicorrente: 0,
    fase: 'Chiusa Persa',
    probabilita: 0,
    dataCreazione: '2024-10-15',
    dataChiusuraPrevista: '2024-12-20',
    dataChiusuraEffettiva: '2024-12-15',
    dataUltimaModifica: '2024-12-15',
    responsabile: 'Valentino Grossi',
    responsabileId: 1,
    team: ['Valentino Grossi'],
    origine: 'Sito Web',
    tipologia: 'Nuovo Cliente',
    prodotti: ['Formazione AI'],
    note: '',
    motivoPerdita: 'Concorrenza',
    attivita: [],
    documenti: [],
    tags: ['AI', 'Lost'],
    priorita: 'Bassa',
    preferita: false,
    archiviata: true,
  },
  {
    id: 22,
    codice: 'OPP-2025-022',
    titolo: 'Corso GenAI Architetti',
    azienda: 'COCONTEST ITALY SRL',
    aziendaId: 17,
    contatto: '',
    contattoEmail: '',
    contattoTelefono: '',
    valore: 2000,
    valoreRicorrente: 0,
    fase: 'Chiusa Persa',
    probabilita: 0,
    dataCreazione: '2024-09-01',
    dataChiusuraPrevista: '2024-11-15',
    dataChiusuraEffettiva: '2024-11-10',
    dataUltimaModifica: '2024-11-10',
    responsabile: 'Valentino Grossi',
    responsabileId: 1,
    team: ['Valentino Grossi'],
    origine: 'Evento',
    tipologia: 'Nuovo Cliente',
    prodotti: ['Corso GenAI'],
    note: '',
    motivoPerdita: 'Tempistiche non compatibili',
    attivita: [],
    documenti: [],
    tags: ['GenAI', 'Architetti', 'Lost'],
    priorita: 'Bassa',
    preferita: false,
    archiviata: true,
  },
  {
    id: 2,
    codice: 'OPP-2024-002',
    titolo: 'Migrazione Cloud Infrastructure',
    azienda: 'Digital Agency SpA',
    aziendaId: 2,
    contatto: 'Laura Bianchi',
    contattoEmail: 'l.bianchi@digitalagency.it',
    contattoTelefono: '+39 06 7654321',
    valore: 42000,
    valoreRicorrente: 8500,
    fase: 'Proposta',
    probabilita: 60,
    dataCreazione: '2024-01-05',
    dataChiusuraPrevista: '2024-02-28',
    dataUltimaModifica: '2024-01-20',
    responsabile: 'Sara Blu',
    responsabileId: 2,
    team: ['Sara Blu'],
    origine: 'Referral',
    tipologia: 'Upselling',
    prodotti: ['Cloud Migration', 'Supporto Premium'],
    note: 'Proposta inviata, in attesa di feedback. Budget approvato internamente.',
    attivita: [
      { id: 1, tipo: 'Meeting', descrizione: 'Analisi requisiti', data: '2024-01-08', completata: true },
      { id: 2, tipo: 'Email', descrizione: 'Invio proposta commerciale', data: '2024-01-18', completata: true },
      { id: 3, tipo: 'Chiamata', descrizione: 'Follow-up proposta', data: '2024-01-28', completata: false },
    ],
    documenti: [
      { id: 1, nome: 'Proposta_Cloud_Migration.pdf', tipo: 'PDF', dimensione: '3.1 MB', data: '2024-01-18' },
    ],
    tags: ['Cloud', 'Upselling'],
    priorita: 'Media',
    preferita: true,
    archiviata: false,
  },
  {
    id: 3,
    codice: 'OPP-2024-003',
    titolo: 'Consulenza AI e Machine Learning',
    azienda: 'Innovate Corp',
    aziendaId: 3,
    contatto: 'Giuseppe Verdi',
    contattoEmail: 'g.verdi@innovate.it',
    contattoTelefono: '+39 011 9876543',
    valore: 65000,
    valoreRicorrente: 0,
    fase: 'Negoziazione',
    probabilita: 80,
    dataCreazione: '2023-12-15',
    dataChiusuraPrevista: '2024-02-15',
    dataUltimaModifica: '2024-01-21',
    responsabile: 'Mario Neri',
    responsabileId: 1,
    team: ['Mario Neri', 'Luca Verdi'],
    origine: 'Evento',
    tipologia: 'Nuovo Cliente',
    prodotti: ['Consulenza AI', 'Training Team', 'Implementazione ML'],
    note: 'Negoziazione in corso su termini contrattuali. Cliente molto interessato.',
    attivita: [
      { id: 1, tipo: 'Meeting', descrizione: 'Presentazione progetto', data: '2023-12-20', completata: true },
      { id: 2, tipo: 'Meeting', descrizione: 'Workshop tecnico', data: '2024-01-10', completata: true },
      { id: 3, tipo: 'Meeting', descrizione: 'Negoziazione contratto', data: '2024-01-22', completata: false },
    ],
    documenti: [
      { id: 1, nome: 'Progetto_AI_Innovate.pdf', tipo: 'PDF', dimensione: '5.2 MB', data: '2023-12-20' },
      { id: 2, nome: 'Contratto_Draft.pdf', tipo: 'PDF', dimensione: '890 KB', data: '2024-01-15' },
    ],
    tags: ['AI', 'Enterprise', 'Hot Lead'],
    priorita: 'Alta',
    preferita: true,
    archiviata: false,
  },
  {
    id: 4,
    codice: 'OPP-2024-004',
    titolo: 'Sistema CRM Personalizzato',
    azienda: 'Smart Systems',
    aziendaId: 4,
    contatto: 'Anna Ferrari',
    contattoEmail: 'anna.ferrari@smartsys.it',
    contattoTelefono: '+39 055 1472583',
    valore: 38000,
    valoreRicorrente: 6000,
    fase: 'Chiusa Vinta',
    probabilita: 100,
    dataCreazione: '2023-11-20',
    dataChiusuraPrevista: '2024-02-10',
    dataChiusuraEffettiva: '2024-01-18',
    dataUltimaModifica: '2024-01-18',
    responsabile: 'Sara Blu',
    responsabileId: 2,
    team: ['Sara Blu', 'Marco Gialli'],
    origine: 'Cold Call',
    tipologia: 'Nuovo Cliente',
    prodotti: ['CRM Enterprise', 'Integrazione API', 'Formazione'],
    note: 'Contratto firmato! Inizio progetto previsto per febbraio.',
    attivita: [
      { id: 1, tipo: 'Chiamata', descrizione: 'Cold call iniziale', data: '2023-11-20', completata: true },
      { id: 2, tipo: 'Meeting', descrizione: 'Demo prodotto', data: '2023-12-05', completata: true },
      { id: 3, tipo: 'Meeting', descrizione: 'Firma contratto', data: '2024-01-18', completata: true },
    ],
    documenti: [
      { id: 1, nome: 'Contratto_SmartSystems.pdf', tipo: 'PDF', dimensione: '1.2 MB', data: '2024-01-18' },
    ],
    tags: ['CRM', 'Won'],
    priorita: 'Media',
    preferita: false,
    archiviata: false,
  },
  {
    id: 5,
    codice: 'OPP-2024-005',
    titolo: 'Automazione Marketing Suite',
    azienda: 'Future Tech',
    aziendaId: 5,
    contatto: 'Paolo Colombo',
    contattoEmail: 'p.colombo@futuretech.it',
    contattoTelefono: '+39 041 3698521',
    valore: 28000,
    valoreRicorrente: 4500,
    fase: 'Qualificazione',
    probabilita: 25,
    dataCreazione: '2024-01-15',
    dataChiusuraPrevista: '2024-04-01',
    dataUltimaModifica: '2024-01-19',
    responsabile: 'Mario Neri',
    responsabileId: 1,
    team: ['Mario Neri'],
    origine: 'LinkedIn',
    tipologia: 'Nuovo Cliente',
    prodotti: ['Marketing Automation', 'Email Marketing', 'Analytics'],
    note: 'Lead da qualificare. Primo contatto positivo.',
    attivita: [
      { id: 1, tipo: 'Email', descrizione: 'Primo contatto LinkedIn', data: '2024-01-15', completata: true },
      { id: 2, tipo: 'Chiamata', descrizione: 'Chiamata qualificazione', data: '2024-01-25', completata: false },
    ],
    documenti: [],
    tags: ['Marketing', 'SMB'],
    priorita: 'Bassa',
    preferita: false,
    archiviata: false,
  },
  {
    id: 6,
    codice: 'OPP-2024-006',
    titolo: 'Sviluppo App Mobile Enterprise',
    azienda: 'Tech Solutions Srl',
    aziendaId: 1,
    contatto: 'Marco Rossi',
    contattoEmail: 'marco.rossi@techsol.it',
    contattoTelefono: '+39 02 1234567',
    valore: 55000,
    valoreRicorrente: 9000,
    fase: 'Proposta',
    probabilita: 50,
    dataCreazione: '2024-01-08',
    dataChiusuraPrevista: '2024-03-20',
    dataUltimaModifica: '2024-01-21',
    responsabile: 'Sara Blu',
    responsabileId: 2,
    team: ['Sara Blu', 'Luca Verdi'],
    origine: 'Cross-selling',
    tipologia: 'Cross-selling',
    prodotti: ['App iOS', 'App Android', 'Backend API'],
    note: 'Opportunità di cross-selling su cliente esistente.',
    attivita: [
      { id: 1, tipo: 'Meeting', descrizione: 'Raccolta requisiti', data: '2024-01-12', completata: true },
      { id: 2, tipo: 'Email', descrizione: 'Invio preventivo', data: '2024-01-20', completata: true },
    ],
    documenti: [
      { id: 1, nome: 'Preventivo_App_Mobile.pdf', tipo: 'PDF', dimensione: '1.8 MB', data: '2024-01-20' },
    ],
    tags: ['Mobile', 'Cross-selling'],
    priorita: 'Media',
    preferita: false,
    archiviata: false,
  },
  {
    id: 7,
    codice: 'OPP-2024-007',
    titolo: 'Integrazione E-commerce',
    azienda: 'Retail Plus',
    aziendaId: 6,
    contatto: 'Giulia Neri',
    contattoEmail: 'g.neri@retailplus.it',
    contattoTelefono: '+39 02 5551234',
    valore: 32000,
    valoreRicorrente: 5000,
    fase: 'Chiusa Persa',
    probabilita: 0,
    dataCreazione: '2023-12-01',
    dataChiusuraPrevista: '2024-01-30',
    dataChiusuraEffettiva: '2024-01-15',
    dataUltimaModifica: '2024-01-15',
    responsabile: 'Mario Neri',
    responsabileId: 1,
    team: ['Mario Neri'],
    origine: 'Sito Web',
    tipologia: 'Nuovo Cliente',
    prodotti: ['E-commerce Integration', 'Payment Gateway'],
    note: 'Persa per budget. Cliente ha scelto soluzione più economica.',
    motivoPerdita: 'Budget insufficiente',
    concorrente: 'Competitor XYZ',
    attivita: [
      { id: 1, tipo: 'Meeting', descrizione: 'Presentazione soluzione', data: '2023-12-10', completata: true },
      { id: 2, tipo: 'Email', descrizione: 'Proposta commerciale', data: '2023-12-20', completata: true },
    ],
    documenti: [],
    tags: ['E-commerce', 'Lost'],
    priorita: 'Media',
    preferita: false,
    archiviata: true,
  },
  {
    id: 8,
    codice: 'OPP-2024-008',
    titolo: 'Business Intelligence Dashboard',
    azienda: 'Data Insights Srl',
    aziendaId: 7,
    contatto: 'Roberto Marini',
    contattoEmail: 'r.marini@datainsights.it',
    contattoTelefono: '+39 06 9998877',
    valore: 48000,
    valoreRicorrente: 7500,
    fase: 'Negoziazione',
    probabilita: 75,
    dataCreazione: '2024-01-02',
    dataChiusuraPrevista: '2024-02-20',
    dataUltimaModifica: '2024-01-22',
    responsabile: 'Sara Blu',
    responsabileId: 2,
    team: ['Sara Blu', 'Mario Neri'],
    origine: 'Partner',
    tipologia: 'Nuovo Cliente',
    prodotti: ['BI Platform', 'Custom Dashboards', 'Data Integration'],
    note: 'In fase finale di negoziazione. Richiesto sconto 10%.',
    attivita: [
      { id: 1, tipo: 'Meeting', descrizione: 'Demo BI Platform', data: '2024-01-08', completata: true },
      { id: 2, tipo: 'Meeting', descrizione: 'Negoziazione prezzi', data: '2024-01-20', completata: true },
      { id: 3, tipo: 'Email', descrizione: 'Invio proposta finale', data: '2024-01-25', completata: false },
    ],
    documenti: [
      { id: 1, nome: 'Proposta_BI_DataInsights.pdf', tipo: 'PDF', dimensione: '2.9 MB', data: '2024-01-20' },
    ],
    tags: ['BI', 'Analytics', 'Hot Lead'],
    priorita: 'Alta',
    preferita: true,
    archiviata: false,
  },
];

const pipelineStages = [
  { id: 'qualificazione', nome: 'Qualificazione', colore: '#3b82f6', probabilitaDefault: 25 },
  { id: 'proposta', nome: 'Proposta', colore: '#8b5cf6', probabilitaDefault: 50 },
  { id: 'negoziazione', nome: 'Negoziazione', colore: '#f59e0b', probabilitaDefault: 75 },
  { id: 'chiusa-vinta', nome: 'Chiusa Vinta', colore: '#10b981', probabilitaDefault: 100 },
  { id: 'chiusa-persa', nome: 'Chiusa Persa', colore: '#ef4444', probabilitaDefault: 0 },
];

const origini = ['Sito Web', 'Referral', 'LinkedIn', 'Cold Call', 'Evento', 'Partner', 'Cross-selling', 'Altro'];
const tipologie = ['Nuovo Cliente', 'Upselling', 'Cross-selling', 'Rinnovo'];
const prioritaOptions = ['Alta', 'Media', 'Bassa'];

const responsabili = [
  { id: 1, nome: 'Mario Neri', avatar: 'MN', email: 'mario.neri@azienda.it' },
  { id: 2, nome: 'Sara Blu', avatar: 'SB', email: 'sara.blu@azienda.it' },
  { id: 3, nome: 'Luca Verdi', avatar: 'LV', email: 'luca.verdi@azienda.it' },
  { id: 4, nome: 'Marco Gialli', avatar: 'MG', email: 'marco.gialli@azienda.it' },
];

const aziende = [
  { id: 1, nome: 'Tech Solutions Srl', settore: 'IT', citta: 'Milano' },
  { id: 2, nome: 'Digital Agency SpA', settore: 'Marketing', citta: 'Roma' },
  { id: 3, nome: 'Innovate Corp', settore: 'Consulenza', citta: 'Torino' },
  { id: 4, nome: 'Smart Systems', settore: 'IT', citta: 'Firenze' },
  { id: 5, nome: 'Future Tech', settore: 'Tecnologia', citta: 'Venezia' },
  { id: 6, nome: 'Retail Plus', settore: 'Retail', citta: 'Milano' },
  { id: 7, nome: 'Data Insights Srl', settore: 'Analytics', citta: 'Roma' },
];

// ==================== COMPONENTE PRINCIPALE ====================

function App() {
  const [opportunities, setOpportunities] = useState(initialOpportunities);
  const [activeView, setActiveView] = useState('lista'); // lista, kanban, dettaglio
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // create, edit
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    fase: [],
    responsabile: [],
    priorita: [],
    origine: [],
    mostraArchiviate: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'dataCreazione', direction: 'desc' });
  const [draggedItem, setDraggedItem] = useState(null);

  // Form state per nuova/modifica opportunità
  const [formData, setFormData] = useState({
    titolo: '',
    azienda: '',
    aziendaId: '',
    contatto: '',
    contattoEmail: '',
    contattoTelefono: '',
    valore: '',
    valoreRicorrente: '',
    fase: 'Qualificazione',
    probabilita: 25,
    dataChiusuraPrevista: '',
    responsabile: '',
    responsabileId: '',
    origine: '',
    tipologia: '',
    prodotti: [],
    note: '',
    priorita: 'Media',
    tags: [],
  });

  // ==================== CALCOLI E FILTRI ====================

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(opp => {
      // Ricerca testuale
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          opp.titolo.toLowerCase().includes(query) ||
          opp.azienda.toLowerCase().includes(query) ||
          opp.contatto.toLowerCase().includes(query) ||
          opp.codice.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Filtro archiviate
      if (!filters.mostraArchiviate && opp.archiviata) return false;

      // Filtro fase
      if (filters.fase.length > 0 && !filters.fase.includes(opp.fase)) return false;

      // Filtro responsabile
      if (filters.responsabile.length > 0 && !filters.responsabile.includes(opp.responsabile)) return false;

      // Filtro priorità
      if (filters.priorita.length > 0 && !filters.priorita.includes(opp.priorita)) return false;

      // Filtro origine
      if (filters.origine.length > 0 && !filters.origine.includes(opp.origine)) return false;

      return true;
    });
  }, [opportunities, searchQuery, filters]);

  const sortedOpportunities = useMemo(() => {
    const sorted = [...filteredOpportunities];
    sorted.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'valore' || sortConfig.key === 'probabilita') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredOpportunities, sortConfig]);

  // KPI Calculations
  const kpis = useMemo(() => {
    const activeOpps = opportunities.filter(o => !o.archiviata && o.fase !== 'Chiusa Persa');
    const wonOpps = opportunities.filter(o => o.fase === 'Chiusa Vinta');
    const lostOpps = opportunities.filter(o => o.fase === 'Chiusa Persa');
    
    const totalPipeline = activeOpps.reduce((sum, o) => sum + o.valore, 0);
    const weightedPipeline = activeOpps.reduce((sum, o) => sum + (o.valore * o.probabilita / 100), 0);
    const wonValue = wonOpps.reduce((sum, o) => sum + o.valore, 0);
    const avgDealSize = activeOpps.length > 0 ? totalPipeline / activeOpps.length : 0;
    const winRate = (wonOpps.length + lostOpps.length) > 0 
      ? (wonOpps.length / (wonOpps.length + lostOpps.length) * 100) 
      : 0;

    return {
      totalPipeline,
      weightedPipeline,
      wonValue,
      avgDealSize,
      winRate,
      activeCount: activeOpps.length,
      wonCount: wonOpps.length,
      lostCount: lostOpps.length,
    };
  }, [opportunities]);

  // Pipeline data per grafico
  const pipelineData = useMemo(() => {
    return pipelineStages.slice(0, 4).map(stage => {
      const stageOpps = opportunities.filter(o => o.fase === stage.nome && !o.archiviata);
      return {
        name: stage.nome,
        valore: stageOpps.reduce((sum, o) => sum + o.valore, 0),
        count: stageOpps.length,
        colore: stage.colore,
      };
    });
  }, [opportunities]);

  // ==================== HANDLERS ====================

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => {
      const currentValues = prev[filterType];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [filterType]: newValues };
    });
  };

  const clearFilters = () => {
    setFilters({
      fase: [],
      responsabile: [],
      priorita: [],
      origine: [],
      mostraArchiviate: false,
    });
  };

  const openCreateModal = () => {
    setFormData({
      titolo: '',
      azienda: '',
      aziendaId: '',
      contatto: '',
      contattoEmail: '',
      contattoTelefono: '',
      valore: '',
      valoreRicorrente: '',
      fase: 'Qualificazione',
      probabilita: 25,
      dataChiusuraPrevista: '',
      responsabile: '',
      responsabileId: '',
      origine: '',
      tipologia: '',
      prodotti: [],
      note: '',
      priorita: 'Media',
      tags: [],
    });
    setModalMode('create');
    setShowModal(true);
  };

  const openEditModal = (opp) => {
    setFormData({
      ...opp,
      valore: opp.valore.toString(),
      valoreRicorrente: opp.valoreRicorrente.toString(),
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const handleSaveOpportunity = () => {
    if (modalMode === 'create') {
      const newOpp = {
        ...formData,
        id: Math.max(...opportunities.map(o => o.id)) + 1,
        codice: `OPP-2024-${String(opportunities.length + 1).padStart(3, '0')}`,
        valore: Number(formData.valore) || 0,
        valoreRicorrente: Number(formData.valoreRicorrente) || 0,
        dataCreazione: new Date().toISOString().split('T')[0],
        dataUltimaModifica: new Date().toISOString().split('T')[0],
        attivita: [],
        documenti: [],
        preferita: false,
        archiviata: false,
      };
      setOpportunities(prev => [...prev, newOpp]);
    } else {
      setOpportunities(prev => prev.map(o => 
        o.id === formData.id 
          ? { 
              ...formData, 
              valore: Number(formData.valore) || 0,
              valoreRicorrente: Number(formData.valoreRicorrente) || 0,
              dataUltimaModifica: new Date().toISOString().split('T')[0] 
            }
          : o
      ));
    }
    setShowModal(false);
  };

  const handleDeleteOpportunity = (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questa opportunità?')) {
      setOpportunities(prev => prev.filter(o => o.id !== id));
      if (selectedOpportunity?.id === id) {
        setSelectedOpportunity(null);
        setActiveView('lista');
      }
    }
  };

  const handleArchiveOpportunity = (id) => {
    setOpportunities(prev => prev.map(o => 
      o.id === id ? { ...o, archiviata: !o.archiviata } : o
    ));
  };

  const handleToggleFavorite = (id) => {
    setOpportunities(prev => prev.map(o => 
      o.id === id ? { ...o, preferita: !o.preferita } : o
    ));
  };

  const handleStageChange = (id, newStage) => {
    const stage = pipelineStages.find(s => s.nome === newStage);
    setOpportunities(prev => prev.map(o => 
      o.id === id 
        ? { 
            ...o, 
            fase: newStage, 
            probabilita: stage?.probabilitaDefault || o.probabilita,
            dataUltimaModifica: new Date().toISOString().split('T')[0],
            ...(newStage === 'Chiusa Vinta' || newStage === 'Chiusa Persa' 
              ? { dataChiusuraEffettiva: new Date().toISOString().split('T')[0] } 
              : {})
          }
        : o
    ));
  };

  // Drag & Drop handlers
  const handleDragStart = (e, opp) => {
    setDraggedItem(opp);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, newStage) => {
    e.preventDefault();
    if (draggedItem && draggedItem.fase !== newStage) {
      handleStageChange(draggedItem.id, newStage);
    }
    setDraggedItem(null);
  };

  const viewOpportunityDetail = (opp) => {
    setSelectedOpportunity(opp);
    setActiveView('dettaglio');
  };

  // ==================== COMPONENTI UI ====================

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStageColor = (fase) => {
    const stage = pipelineStages.find(s => s.nome === fase);
    return stage?.colore || '#64748b';
  };

  const getPriorityColor = (priorita) => {
    switch (priorita) {
      case 'Alta': return '#ef4444';
      case 'Media': return '#f59e0b';
      case 'Bassa': return '#10b981';
      default: return '#64748b';
    }
  };

  // ==================== RENDER COMPONENTS ====================

  // Sidebar
  const Sidebar = () => (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>
        <div style={styles.logoIcon}>v</div>
        <span style={styles.logoText}>CRM</span>
      </div>

      <nav style={styles.nav}>
        <div style={styles.navSection}>
          <span style={styles.navSectionTitle}>MENU</span>
          <button 
            style={{...styles.navItem, ...(activeView !== 'dettaglio' ? styles.navItemActive : {})}}
            onClick={() => { setActiveView('lista'); setSelectedOpportunity(null); }}
          >
            <Target size={20} />
            <span>Opportunità</span>
          </button>
        </div>

        <div style={styles.navSection}>
          <span style={styles.navSectionTitle}>VISTE</span>
          <button 
            style={{...styles.navSubItem, ...(activeView === 'lista' ? styles.navSubItemActive : {})}}
            onClick={() => setActiveView('lista')}
          >
            <List size={18} />
            <span>Lista</span>
          </button>
          <button 
            style={{...styles.navSubItem, ...(activeView === 'kanban' ? styles.navSubItemActive : {})}}
            onClick={() => setActiveView('kanban')}
          >
            <LayoutGrid size={18} />
            <span>Kanban</span>
          </button>
        </div>
      </nav>

      <div style={styles.sidebarFooter}>
        <div style={styles.userInfo}>
          <div style={styles.userAvatar}>VB</div>
          <div style={styles.userDetails}>
            <span style={styles.userName}>Valentino</span>
            <span style={styles.userRole}>Admin</span>
          </div>
        </div>
      </div>
    </aside>
  );

  // Header
  const Header = () => (
    <header style={styles.header}>
      <div style={styles.headerLeft}>
        {activeView === 'dettaglio' && (
          <button 
            style={styles.backButton}
            onClick={() => { setActiveView('lista'); setSelectedOpportunity(null); }}
          >
            <ChevronLeft size={20} />
            <span>Indietro</span>
          </button>
        )}
        <h1 style={styles.pageTitle}>
          {activeView === 'dettaglio' ? selectedOpportunity?.titolo : 'Opportunità'}
        </h1>
      </div>

      <div style={styles.headerCenter}>
        <div style={styles.searchBox}>
          <Search size={18} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Cerca opportunità..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
          {searchQuery && (
            <button 
              style={styles.clearSearch}
              onClick={() => setSearchQuery('')}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div style={styles.headerRight}>
        <button style={styles.iconButton}>
          <Bell size={20} />
          <span style={styles.notificationBadge}>3</span>
        </button>
        <button style={styles.primaryButton} onClick={openCreateModal}>
          <Plus size={18} />
          <span>Nuova Opportunità</span>
        </button>
      </div>
    </header>
  );

  // KPI Cards
  const KPICards = () => (
    <div style={styles.kpiGrid}>
      <div style={styles.kpiCard}>
        <div style={styles.kpiHeader}>
          <span style={styles.kpiLabel}>Pipeline Totale</span>
          <div style={{...styles.kpiIcon, backgroundColor: '#dbeafe', color: '#3b82f6'}}>
            <Euro size={20} />
          </div>
        </div>
        <div style={styles.kpiValue}>{formatCurrency(kpis.totalPipeline)}</div>
        <div style={styles.kpiSubtext}>{kpis.activeCount} opportunità attive</div>
      </div>

      <div style={styles.kpiCard}>
        <div style={styles.kpiHeader}>
          <span style={styles.kpiLabel}>Pipeline Ponderata</span>
          <div style={{...styles.kpiIcon, backgroundColor: '#ede9fe', color: '#8b5cf6'}}>
            <Target size={20} />
          </div>
        </div>
        <div style={styles.kpiValue}>{formatCurrency(kpis.weightedPipeline)}</div>
        <div style={styles.kpiSubtext}>Valore atteso</div>
      </div>

      <div style={styles.kpiCard}>
        <div style={styles.kpiHeader}>
          <span style={styles.kpiLabel}>Vinte</span>
          <div style={{...styles.kpiIcon, backgroundColor: '#d1fae5', color: '#10b981'}}>
            <CheckCircle2 size={20} />
          </div>
        </div>
        <div style={styles.kpiValue}>{formatCurrency(kpis.wonValue)}</div>
        <div style={styles.kpiSubtext}>{kpis.wonCount} opportunità chiuse</div>
      </div>

      <div style={styles.kpiCard}>
        <div style={styles.kpiHeader}>
          <span style={styles.kpiLabel}>Win Rate</span>
          <div style={{...styles.kpiIcon, backgroundColor: '#fef3c7', color: '#f59e0b'}}>
            <TrendingUp size={20} />
          </div>
        </div>
        <div style={styles.kpiValue}>{kpis.winRate.toFixed(1)}%</div>
        <div style={styles.kpiSubtext}>Tasso di conversione</div>
      </div>
    </div>
  );

  // Toolbar con filtri
  const Toolbar = () => (
    <div style={styles.toolbar}>
      <div style={styles.toolbarLeft}>
        <button 
          style={{...styles.filterButton, ...(showFilters ? styles.filterButtonActive : {})}}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} />
          <span>Filtri</span>
          {(filters.fase.length + filters.responsabile.length + filters.priorita.length + filters.origine.length) > 0 && (
            <span style={styles.filterCount}>
              {filters.fase.length + filters.responsabile.length + filters.priorita.length + filters.origine.length}
            </span>
          )}
          <ChevronDown size={16} style={{ transform: showFilters ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>

        {(filters.fase.length + filters.responsabile.length + filters.priorita.length + filters.origine.length) > 0 && (
          <button style={styles.clearFiltersButton} onClick={clearFilters}>
            <X size={14} />
            <span>Cancella filtri</span>
          </button>
        )}

        <div style={styles.viewToggle}>
          <button 
            style={{...styles.viewToggleButton, ...(activeView === 'lista' ? styles.viewToggleButtonActive : {})}}
            onClick={() => setActiveView('lista')}
          >
            <List size={18} />
          </button>
          <button 
            style={{...styles.viewToggleButton, ...(activeView === 'kanban' ? styles.viewToggleButtonActive : {})}}
            onClick={() => setActiveView('kanban')}
          >
            <LayoutGrid size={18} />
          </button>
        </div>
      </div>

      <div style={styles.toolbarRight}>
        <span style={styles.resultCount}>
          {filteredOpportunities.length} risultati
        </span>
      </div>
    </div>
  );

  // Pannello Filtri
  const FilterPanel = () => (
    <div style={{...styles.filterPanel, display: showFilters ? 'block' : 'none'}}>
      <div style={styles.filterGrid}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Fase</label>
          <div style={styles.filterOptions}>
            {pipelineStages.map(stage => (
              <label key={stage.id} style={styles.filterCheckbox}>
                <input
                  type="checkbox"
                  checked={filters.fase.includes(stage.nome)}
                  onChange={() => handleFilterChange('fase', stage.nome)}
                />
                <span style={{...styles.filterTag, borderColor: stage.colore, color: stage.colore}}>
                  {stage.nome}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Responsabile</label>
          <div style={styles.filterOptions}>
            {responsabili.map(resp => (
              <label key={resp.id} style={styles.filterCheckbox}>
                <input
                  type="checkbox"
                  checked={filters.responsabile.includes(resp.nome)}
                  onChange={() => handleFilterChange('responsabile', resp.nome)}
                />
                <span style={styles.filterTagNeutral}>{resp.nome}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Priorità</label>
          <div style={styles.filterOptions}>
            {prioritaOptions.map(p => (
              <label key={p} style={styles.filterCheckbox}>
                <input
                  type="checkbox"
                  checked={filters.priorita.includes(p)}
                  onChange={() => handleFilterChange('priorita', p)}
                />
                <span style={{...styles.filterTag, borderColor: getPriorityColor(p), color: getPriorityColor(p)}}>
                  {p}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Origine</label>
          <div style={styles.filterOptions}>
            {origini.map(o => (
              <label key={o} style={styles.filterCheckbox}>
                <input
                  type="checkbox"
                  checked={filters.origine.includes(o)}
                  onChange={() => handleFilterChange('origine', o)}
                />
                <span style={styles.filterTagNeutral}>{o}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterCheckboxSingle}>
            <input
              type="checkbox"
              checked={filters.mostraArchiviate}
              onChange={() => setFilters(prev => ({ ...prev, mostraArchiviate: !prev.mostraArchiviate }))}
            />
            <span>Mostra archiviate</span>
          </label>
        </div>
      </div>
    </div>
  );

  // Lista Opportunità
  const OpportunityList = () => (
    <div style={styles.tableContainer}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th} onClick={() => handleSort('codice')}>
              <div style={styles.thContent}>
                Codice
                {sortConfig.key === 'codice' && (
                  <ChevronDown size={14} style={{ transform: sortConfig.direction === 'asc' ? 'rotate(180deg)' : 'none' }} />
                )}
              </div>
            </th>
            <th style={styles.th} onClick={() => handleSort('titolo')}>
              <div style={styles.thContent}>
                Opportunità
                {sortConfig.key === 'titolo' && (
                  <ChevronDown size={14} style={{ transform: sortConfig.direction === 'asc' ? 'rotate(180deg)' : 'none' }} />
                )}
              </div>
            </th>
            <th style={styles.th} onClick={() => handleSort('azienda')}>
              <div style={styles.thContent}>
                Azienda
                {sortConfig.key === 'azienda' && (
                  <ChevronDown size={14} style={{ transform: sortConfig.direction === 'asc' ? 'rotate(180deg)' : 'none' }} />
                )}
              </div>
            </th>
            <th style={styles.th} onClick={() => handleSort('valore')}>
              <div style={styles.thContent}>
                Valore
                {sortConfig.key === 'valore' && (
                  <ChevronDown size={14} style={{ transform: sortConfig.direction === 'asc' ? 'rotate(180deg)' : 'none' }} />
                )}
              </div>
            </th>
            <th style={styles.th}>Fase</th>
            <th style={styles.th} onClick={() => handleSort('probabilita')}>
              <div style={styles.thContent}>
                Prob.
                {sortConfig.key === 'probabilita' && (
                  <ChevronDown size={14} style={{ transform: sortConfig.direction === 'asc' ? 'rotate(180deg)' : 'none' }} />
                )}
              </div>
            </th>
            <th style={styles.th} onClick={() => handleSort('dataChiusuraPrevista')}>
              <div style={styles.thContent}>
                Chiusura
                {sortConfig.key === 'dataChiusuraPrevista' && (
                  <ChevronDown size={14} style={{ transform: sortConfig.direction === 'asc' ? 'rotate(180deg)' : 'none' }} />
                )}
              </div>
            </th>
            <th style={styles.th}>Responsabile</th>
            <th style={styles.th}>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {sortedOpportunities.map(opp => (
            <tr 
              key={opp.id} 
              style={{...styles.tr, ...(opp.archiviata ? styles.trArchived : {})}}
              onClick={() => viewOpportunityDetail(opp)}
            >
              <td style={styles.td}>
                <div style={styles.codeCell}>
                  {opp.preferita && <Star size={14} fill="#f59e0b" color="#f59e0b" />}
                  <span style={styles.code}>{opp.codice}</span>
                </div>
              </td>
              <td style={styles.td}>
                <div style={styles.titleCell}>
                  <span style={styles.oppTitle}>{opp.titolo}</span>
                  <div style={styles.tags}>
                    {opp.tags.slice(0, 2).map(tag => (
                      <span key={tag} style={styles.tag}>{tag}</span>
                    ))}
                    {opp.tags.length > 2 && (
                      <span style={styles.tagMore}>+{opp.tags.length - 2}</span>
                    )}
                  </div>
                </div>
              </td>
              <td style={styles.td}>
                <div style={styles.companyCell}>
                  <Building2 size={16} style={styles.cellIcon} />
                  <div>
                    <span style={styles.companyName}>{opp.azienda}</span>
                    <span style={styles.contactName}>{opp.contatto}</span>
                  </div>
                </div>
              </td>
              <td style={styles.td}>
                <div style={styles.valueCell}>
                  <span style={styles.mainValue}>{formatCurrency(opp.valore)}</span>
                  {opp.valoreRicorrente > 0 && (
                    <span style={styles.recurringValue}>+{formatCurrency(opp.valoreRicorrente)}/anno</span>
                  )}
                </div>
              </td>
              <td style={styles.td}>
                <span style={{...styles.stageBadge, backgroundColor: `${getStageColor(opp.fase)}15`, color: getStageColor(opp.fase), borderColor: getStageColor(opp.fase)}}>
                  {opp.fase}
                </span>
              </td>
              <td style={styles.td}>
                <div style={styles.probabilityCell}>
                  <div style={styles.probabilityBar}>
                    <div 
                      style={{
                        ...styles.probabilityFill, 
                        width: `${opp.probabilita}%`,
                        backgroundColor: opp.probabilita >= 75 ? '#10b981' : opp.probabilita >= 50 ? '#f59e0b' : '#3b82f6'
                      }} 
                    />
                  </div>
                  <span style={styles.probabilityText}>{opp.probabilita}%</span>
                </div>
              </td>
              <td style={styles.td}>
                <span style={styles.dateText}>{formatDate(opp.dataChiusuraPrevista)}</span>
              </td>
              <td style={styles.td}>
                <div style={styles.ownerCell}>
                  <div style={styles.ownerAvatar}>
                    {opp.responsabile.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span>{opp.responsabile}</span>
                </div>
              </td>
              <td style={styles.td} onClick={(e) => e.stopPropagation()}>
                <div style={styles.actionsCell}>
                  <button 
                    style={styles.actionButton}
                    onClick={(e) => { e.stopPropagation(); viewOpportunityDetail(opp); }}
                    title="Visualizza"
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    style={styles.actionButton}
                    onClick={(e) => { e.stopPropagation(); openEditModal(opp); }}
                    title="Modifica"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    style={styles.actionButton}
                    onClick={(e) => { e.stopPropagation(); handleToggleFavorite(opp.id); }}
                    title={opp.preferita ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
                  >
                    {opp.preferita ? <Star size={16} fill="#f59e0b" color="#f59e0b" /> : <StarOff size={16} />}
                  </button>
                  <button 
                    style={{...styles.actionButton, ...styles.actionButtonDanger}}
                    onClick={(e) => { e.stopPropagation(); handleDeleteOpportunity(opp.id); }}
                    title="Elimina"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {sortedOpportunities.length === 0 && (
        <div style={styles.emptyState}>
          <Target size={48} style={styles.emptyIcon} />
          <h3 style={styles.emptyTitle}>Nessuna opportunità trovata</h3>
          <p style={styles.emptyText}>Prova a modificare i filtri o crea una nuova opportunità</p>
          <button style={styles.primaryButton} onClick={openCreateModal}>
            <Plus size={18} />
            <span>Nuova Opportunità</span>
          </button>
        </div>
      )}
    </div>
  );

  // Vista Kanban
  const KanbanView = () => (
    <div style={styles.kanbanContainer}>
      {pipelineStages.slice(0, 4).map(stage => {
        const stageOpps = filteredOpportunities.filter(o => o.fase === stage.nome);
        const stageValue = stageOpps.reduce((sum, o) => sum + o.valore, 0);

        return (
          <div 
            key={stage.id}
            style={styles.kanbanColumn}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage.nome)}
          >
            <div style={{...styles.kanbanHeader, borderTopColor: stage.colore}}>
              <div style={styles.kanbanHeaderInfo}>
                <h3 style={styles.kanbanTitle}>{stage.nome}</h3>
                <span style={styles.kanbanCount}>{stageOpps.length}</span>
              </div>
              <span style={styles.kanbanValue}>{formatCurrency(stageValue)}</span>
            </div>

            <div style={styles.kanbanCards}>
              {stageOpps.map(opp => (
                <div
                  key={opp.id}
                  style={styles.kanbanCard}
                  draggable
                  onDragStart={(e) => handleDragStart(e, opp)}
                  onClick={() => viewOpportunityDetail(opp)}
                >
                  <div style={styles.kanbanCardHeader}>
                    <span style={styles.kanbanCardCode}>{opp.codice}</span>
                    {opp.preferita && <Star size={14} fill="#f59e0b" color="#f59e0b" />}
                  </div>
                  <h4 style={styles.kanbanCardTitle}>{opp.titolo}</h4>
                  <div style={styles.kanbanCardCompany}>
                    <Building2 size={14} />
                    <span>{opp.azienda}</span>
                  </div>
                  <div style={styles.kanbanCardFooter}>
                    <span style={styles.kanbanCardValue}>{formatCurrency(opp.valore)}</span>
                    <span style={{...styles.kanbanCardProb, color: opp.probabilita >= 75 ? '#10b981' : opp.probabilita >= 50 ? '#f59e0b' : '#3b82f6'}}>
                      {opp.probabilita}%
                    </span>
                  </div>
                  <div style={styles.kanbanCardMeta}>
                    <Clock size={12} />
                    <span>{formatDate(opp.dataChiusuraPrevista)}</span>
                  </div>
                  <div style={styles.kanbanCardOwner}>
                    <div style={styles.kanbanCardAvatar}>
                      {opp.responsabile.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span>{opp.responsabile}</span>
                  </div>
                </div>
              ))}

              <button style={styles.addCardButton} onClick={openCreateModal}>
                <Plus size={16} />
                <span>Aggiungi</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  // Dettaglio Opportunità
  const OpportunityDetail = () => {
    if (!selectedOpportunity) return null;
    const opp = opportunities.find(o => o.id === selectedOpportunity.id) || selectedOpportunity;

    return (
      <div style={styles.detailContainer}>
        <div style={styles.detailMain}>
          {/* Header Info */}
          <div style={styles.detailCard}>
            <div style={styles.detailCardHeader}>
              <div style={styles.detailTitleSection}>
                <div style={styles.detailCodeRow}>
                  <span style={styles.detailCode}>{opp.codice}</span>
                  <span style={{...styles.stageBadge, backgroundColor: `${getStageColor(opp.fase)}15`, color: getStageColor(opp.fase), borderColor: getStageColor(opp.fase)}}>
                    {opp.fase}
                  </span>
                  <span style={{...styles.priorityBadge, backgroundColor: `${getPriorityColor(opp.priorita)}15`, color: getPriorityColor(opp.priorita)}}>
                    {opp.priorita}
                  </span>
                </div>
                <h2 style={styles.detailTitle}>{opp.titolo}</h2>
              </div>
              <div style={styles.detailActions}>
                <button 
                  style={styles.actionButton}
                  onClick={() => handleToggleFavorite(opp.id)}
                >
                  {opp.preferita ? <Star size={20} fill="#f59e0b" color="#f59e0b" /> : <StarOff size={20} />}
                </button>
                <button style={styles.actionButton} onClick={() => openEditModal(opp)}>
                  <Edit2 size={20} />
                </button>
                <button style={styles.secondaryButton}>
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>

            {/* Valore e Probabilità */}
            <div style={styles.detailValueSection}>
              <div style={styles.detailValueBox}>
                <span style={styles.detailValueLabel}>Valore Opportunità</span>
                <span style={styles.detailValueAmount}>{formatCurrency(opp.valore)}</span>
                {opp.valoreRicorrente > 0 && (
                  <span style={styles.detailValueRecurring}>+{formatCurrency(opp.valoreRicorrente)}/anno ricorrente</span>
                )}
              </div>
              <div style={styles.detailValueBox}>
                <span style={styles.detailValueLabel}>Valore Ponderato</span>
                <span style={styles.detailValueAmount}>{formatCurrency(opp.valore * opp.probabilita / 100)}</span>
              </div>
              <div style={styles.detailProbBox}>
                <span style={styles.detailValueLabel}>Probabilità</span>
                <div style={styles.detailProbCircle}>
                  <svg width="80" height="80" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="35" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                    <circle 
                      cx="40" cy="40" r="35" fill="none" 
                      stroke={opp.probabilita >= 75 ? '#10b981' : opp.probabilita >= 50 ? '#f59e0b' : '#3b82f6'}
                      strokeWidth="6"
                      strokeDasharray={`${opp.probabilita * 2.2} 220`}
                      strokeLinecap="round"
                      transform="rotate(-90 40 40)"
                    />
                  </svg>
                  <span style={styles.detailProbText}>{opp.probabilita}%</span>
                </div>
              </div>
            </div>

            {/* Pipeline Progress */}
            <div style={styles.pipelineProgress}>
              {pipelineStages.slice(0, 4).map((stage, idx) => {
                const isActive = stage.nome === opp.fase;
                const isPast = pipelineStages.findIndex(s => s.nome === opp.fase) > idx;
                return (
                  <div 
                    key={stage.id} 
                    style={{
                      ...styles.pipelineStep,
                      ...(isActive ? styles.pipelineStepActive : {}),
                      ...(isPast ? styles.pipelineStepPast : {}),
                    }}
                    onClick={() => handleStageChange(opp.id, stage.nome)}
                  >
                    <div style={{
                      ...styles.pipelineStepDot,
                      backgroundColor: isActive || isPast ? stage.colore : '#e2e8f0',
                    }}>
                      {isPast && <CheckCircle2 size={14} color="white" />}
                    </div>
                    <span style={{
                      ...styles.pipelineStepLabel,
                      color: isActive ? stage.colore : isPast ? '#64748b' : '#94a3b8',
                      fontWeight: isActive ? 600 : 400,
                    }}>
                      {stage.nome}
                    </span>
                    {idx < 3 && (
                      <div style={{
                        ...styles.pipelineStepLine,
                        backgroundColor: isPast ? stage.colore : '#e2e8f0',
                      }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info Azienda e Contatto */}
          <div style={styles.detailGrid}>
            <div style={styles.detailCard}>
              <h3 style={styles.detailCardTitle}>
                <Building2 size={18} />
                Azienda
              </h3>
              <div style={styles.detailInfoList}>
                <div style={styles.detailInfoItem}>
                  <span style={styles.detailInfoLabel}>Nome</span>
                  <span style={styles.detailInfoValue}>{opp.azienda}</span>
                </div>
              </div>
            </div>

            <div style={styles.detailCard}>
              <h3 style={styles.detailCardTitle}>
                <User size={18} />
                Contatto
              </h3>
              <div style={styles.detailInfoList}>
                <div style={styles.detailInfoItem}>
                  <span style={styles.detailInfoLabel}>Nome</span>
                  <span style={styles.detailInfoValue}>{opp.contatto}</span>
                </div>
                <div style={styles.detailInfoItem}>
                  <span style={styles.detailInfoLabel}>Email</span>
                  <a href={`mailto:${opp.contattoEmail}`} style={styles.detailInfoLink}>{opp.contattoEmail}</a>
                </div>
                <div style={styles.detailInfoItem}>
                  <span style={styles.detailInfoLabel}>Telefono</span>
                  <a href={`tel:${opp.contattoTelefono}`} style={styles.detailInfoLink}>{opp.contattoTelefono}</a>
                </div>
              </div>
            </div>
          </div>

          {/* Dettagli Opportunità */}
          <div style={styles.detailCard}>
            <h3 style={styles.detailCardTitle}>
              <FileText size={18} />
              Dettagli
            </h3>
            <div style={styles.detailInfoGrid}>
              <div style={styles.detailInfoItem}>
                <span style={styles.detailInfoLabel}>Origine</span>
                <span style={styles.detailInfoValue}>{opp.origine}</span>
              </div>
              <div style={styles.detailInfoItem}>
                <span style={styles.detailInfoLabel}>Tipologia</span>
                <span style={styles.detailInfoValue}>{opp.tipologia}</span>
              </div>
              <div style={styles.detailInfoItem}>
                <span style={styles.detailInfoLabel}>Data Creazione</span>
                <span style={styles.detailInfoValue}>{formatDate(opp.dataCreazione)}</span>
              </div>
              <div style={styles.detailInfoItem}>
                <span style={styles.detailInfoLabel}>Chiusura Prevista</span>
                <span style={styles.detailInfoValue}>{formatDate(opp.dataChiusuraPrevista)}</span>
              </div>
              <div style={styles.detailInfoItem}>
                <span style={styles.detailInfoLabel}>Responsabile</span>
                <div style={styles.ownerCell}>
                  <div style={styles.ownerAvatar}>
                    {opp.responsabile.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span>{opp.responsabile}</span>
                </div>
              </div>
              <div style={styles.detailInfoItem}>
                <span style={styles.detailInfoLabel}>Ultima Modifica</span>
                <span style={styles.detailInfoValue}>{formatDate(opp.dataUltimaModifica)}</span>
              </div>
            </div>

            {opp.prodotti && opp.prodotti.length > 0 && (
              <div style={styles.detailSection}>
                <span style={styles.detailInfoLabel}>Prodotti/Servizi</span>
                <div style={styles.productTags}>
                  {opp.prodotti.map(p => (
                    <span key={p} style={styles.productTag}>{p}</span>
                  ))}
                </div>
              </div>
            )}

            {opp.note && (
              <div style={styles.detailSection}>
                <span style={styles.detailInfoLabel}>Note</span>
                <p style={styles.detailNote}>{opp.note}</p>
              </div>
            )}

            {opp.tags && opp.tags.length > 0 && (
              <div style={styles.detailSection}>
                <span style={styles.detailInfoLabel}>Tags</span>
                <div style={styles.tags}>
                  {opp.tags.map(tag => (
                    <span key={tag} style={styles.tag}>{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Attività */}
          <div style={styles.detailCard}>
            <div style={styles.detailCardHeaderRow}>
              <h3 style={styles.detailCardTitle}>
                <CheckSquare size={18} />
                Attività
              </h3>
              <button style={styles.smallButton}>
                <Plus size={14} />
                <span>Aggiungi</span>
              </button>
            </div>
            <div style={styles.activityList}>
              {opp.attivita && opp.attivita.map(att => (
                <div key={att.id} style={{...styles.activityItem, ...(att.completata ? styles.activityItemCompleted : {})}}>
                  <div style={{
                    ...styles.activityIcon,
                    backgroundColor: att.completata ? '#d1fae5' : '#dbeafe',
                    color: att.completata ? '#10b981' : '#3b82f6',
                  }}>
                    {att.tipo === 'Chiamata' && <Phone size={14} />}
                    {att.tipo === 'Email' && <Mail size={14} />}
                    {att.tipo === 'Meeting' && <Calendar size={14} />}
                    {att.tipo === 'Documento' && <FileText size={14} />}
                  </div>
                  <div style={styles.activityContent}>
                    <span style={styles.activityTitle}>{att.descrizione}</span>
                    <span style={styles.activityMeta}>
                      <span style={styles.activityType}>{att.tipo}</span>
                      <span>•</span>
                      <span>{formatDate(att.data)}</span>
                    </span>
                  </div>
                  <div style={styles.activityStatus}>
                    {att.completata ? (
                      <CheckCircle2 size={18} color="#10b981" />
                    ) : (
                      <div style={styles.activityPending} />
                    )}
                  </div>
                </div>
              ))}
              {(!opp.attivita || opp.attivita.length === 0) && (
                <p style={styles.emptyText}>Nessuna attività registrata</p>
              )}
            </div>
          </div>

          {/* Documenti */}
          <div style={styles.detailCard}>
            <div style={styles.detailCardHeaderRow}>
              <h3 style={styles.detailCardTitle}>
                <Paperclip size={18} />
                Documenti
              </h3>
              <button style={styles.smallButton}>
                <Upload size={14} />
                <span>Carica</span>
              </button>
            </div>
            <div style={styles.documentList}>
              {opp.documenti && opp.documenti.map(doc => (
                <div key={doc.id} style={styles.documentItem}>
                  <div style={styles.documentIcon}>
                    <FileText size={20} />
                  </div>
                  <div style={styles.documentInfo}>
                    <span style={styles.documentName}>{doc.nome}</span>
                    <span style={styles.documentMeta}>{doc.dimensione} • {formatDate(doc.data)}</span>
                  </div>
                  <button style={styles.actionButton}>
                    <Download size={16} />
                  </button>
                </div>
              ))}
              {(!opp.documenti || opp.documenti.length === 0) && (
                <p style={styles.emptyText}>Nessun documento allegato</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Destra */}
        <div style={styles.detailSidebar}>
          <div style={styles.detailCard}>
            <h3 style={styles.detailCardTitle}>Azioni Rapide</h3>
            <div style={styles.quickActions}>
              <button style={styles.quickActionButton}>
                <Phone size={16} />
                <span>Chiama</span>
              </button>
              <button style={styles.quickActionButton}>
                <Mail size={16} />
                <span>Email</span>
              </button>
              <button style={styles.quickActionButton}>
                <Calendar size={16} />
                <span>Pianifica</span>
              </button>
              <button style={styles.quickActionButton}>
                <MessageSquare size={16} />
                <span>Nota</span>
              </button>
            </div>
          </div>

          <div style={styles.detailCard}>
            <h3 style={styles.detailCardTitle}>Cambia Fase</h3>
            <div style={styles.stageButtons}>
              {pipelineStages.map(stage => (
                <button
                  key={stage.id}
                  style={{
                    ...styles.stageButton,
                    ...(opp.fase === stage.nome ? { backgroundColor: stage.colore, color: 'white', borderColor: stage.colore } : {}),
                  }}
                  onClick={() => handleStageChange(opp.id, stage.nome)}
                >
                  {stage.nome}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.detailCard}>
            <h3 style={styles.detailCardTitle}>Team</h3>
            <div style={styles.teamList}>
              {opp.team && opp.team.map(member => (
                <div key={member} style={styles.teamMember}>
                  <div style={styles.teamAvatar}>
                    {member.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span>{member}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Modal Crea/Modifica
  const OpportunityModal = () => (
    <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>
            {modalMode === 'create' ? 'Nuova Opportunità' : 'Modifica Opportunità'}
          </h2>
          <button style={styles.closeButton} onClick={() => setShowModal(false)}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.modalBody}>
          <div style={styles.formGrid}>
            <div style={styles.formGroupFull}>
              <label style={styles.formLabel}>Titolo Opportunità *</label>
              <input
                type="text"
                style={styles.formInput}
                value={formData.titolo}
                onChange={(e) => setFormData({ ...formData, titolo: e.target.value })}
                placeholder="Es. Implementazione Sistema ERP"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Azienda *</label>
              <select
                style={styles.formSelect}
                value={formData.azienda}
                onChange={(e) => {
                  const az = aziende.find(a => a.nome === e.target.value);
                  setFormData({ ...formData, azienda: e.target.value, aziendaId: az?.id || '' });
                }}
              >
                <option value="">Seleziona azienda</option>
                {aziende.map(az => (
                  <option key={az.id} value={az.nome}>{az.nome}</option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Contatto</label>
              <input
                type="text"
                style={styles.formInput}
                value={formData.contatto}
                onChange={(e) => setFormData({ ...formData, contatto: e.target.value })}
                placeholder="Nome contatto"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Email Contatto</label>
              <input
                type="email"
                style={styles.formInput}
                value={formData.contattoEmail}
                onChange={(e) => setFormData({ ...formData, contattoEmail: e.target.value })}
                placeholder="email@esempio.it"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Telefono Contatto</label>
              <input
                type="tel"
                style={styles.formInput}
                value={formData.contattoTelefono}
                onChange={(e) => setFormData({ ...formData, contattoTelefono: e.target.value })}
                placeholder="+39 ..."
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Valore (€) *</label>
              <input
                type="number"
                style={styles.formInput}
                value={formData.valore}
                onChange={(e) => setFormData({ ...formData, valore: e.target.value })}
                placeholder="0"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Valore Ricorrente (€/anno)</label>
              <input
                type="number"
                style={styles.formInput}
                value={formData.valoreRicorrente}
                onChange={(e) => setFormData({ ...formData, valoreRicorrente: e.target.value })}
                placeholder="0"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Fase</label>
              <select
                style={styles.formSelect}
                value={formData.fase}
                onChange={(e) => {
                  const stage = pipelineStages.find(s => s.nome === e.target.value);
                  setFormData({ 
                    ...formData, 
                    fase: e.target.value,
                    probabilita: stage?.probabilitaDefault || formData.probabilita
                  });
                }}
              >
                {pipelineStages.map(stage => (
                  <option key={stage.id} value={stage.nome}>{stage.nome}</option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Probabilità (%)</label>
              <input
                type="number"
                style={styles.formInput}
                value={formData.probabilita}
                onChange={(e) => setFormData({ ...formData, probabilita: Math.min(100, Math.max(0, Number(e.target.value))) })}
                min="0"
                max="100"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Data Chiusura Prevista</label>
              <input
                type="date"
                style={styles.formInput}
                value={formData.dataChiusuraPrevista}
                onChange={(e) => setFormData({ ...formData, dataChiusuraPrevista: e.target.value })}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Responsabile</label>
              <select
                style={styles.formSelect}
                value={formData.responsabile}
                onChange={(e) => {
                  const resp = responsabili.find(r => r.nome === e.target.value);
                  setFormData({ ...formData, responsabile: e.target.value, responsabileId: resp?.id || '' });
                }}
              >
                <option value="">Seleziona responsabile</option>
                {responsabili.map(resp => (
                  <option key={resp.id} value={resp.nome}>{resp.nome}</option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Origine</label>
              <select
                style={styles.formSelect}
                value={formData.origine}
                onChange={(e) => setFormData({ ...formData, origine: e.target.value })}
              >
                <option value="">Seleziona origine</option>
                {origini.map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Tipologia</label>
              <select
                style={styles.formSelect}
                value={formData.tipologia}
                onChange={(e) => setFormData({ ...formData, tipologia: e.target.value })}
              >
                <option value="">Seleziona tipologia</option>
                {tipologie.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Priorità</label>
              <select
                style={styles.formSelect}
                value={formData.priorita}
                onChange={(e) => setFormData({ ...formData, priorita: e.target.value })}
              >
                {prioritaOptions.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div style={styles.formGroupFull}>
              <label style={styles.formLabel}>Note</label>
              <textarea
                style={styles.formTextarea}
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="Aggiungi note..."
                rows={3}
              />
            </div>
          </div>
        </div>

        <div style={styles.modalFooter}>
          <button style={styles.secondaryButton} onClick={() => setShowModal(false)}>
            Annulla
          </button>
          <button 
            style={styles.primaryButton} 
            onClick={handleSaveOpportunity}
            disabled={!formData.titolo || !formData.azienda || !formData.valore}
          >
            <Save size={18} />
            <span>{modalMode === 'create' ? 'Crea Opportunità' : 'Salva Modifiche'}</span>
          </button>
        </div>
      </div>
    </div>
  );

  // ==================== RENDER PRINCIPALE ====================

  return (
    <div style={styles.app}>
      <Sidebar />
      
      <main style={styles.main}>
        <Header />
        
        <div style={styles.content}>
          {activeView !== 'dettaglio' && (
            <>
              <KPICards />
              <Toolbar />
              <FilterPanel />
              {activeView === 'lista' && <OpportunityList />}
              {activeView === 'kanban' && <KanbanView />}
            </>
          )}
          
          {activeView === 'dettaglio' && <OpportunityDetail />}
        </div>
      </main>

      {showModal && <OpportunityModal />}
    </div>
  );
}

// ==================== STILI ====================

const styles = {
  app: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
  },

  // Sidebar
  sidebar: {
    width: '260px',
    backgroundColor: '#0f172a',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    height: '100vh',
    zIndex: 100,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '24px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: '700',
  },
  logoText: {
    fontSize: '22px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  nav: {
    flex: 1,
    padding: '20px 12px',
    overflowY: 'auto',
  },
  navSection: {
    marginBottom: '24px',
  },
  navSectionTitle: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: '0.5px',
    padding: '0 12px',
    marginBottom: '8px',
    display: 'block',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.2s',
    width: '100%',
    textAlign: 'left',
  },
  navItemActive: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
  },
  navSubItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 16px 10px 28px',
    background: 'transparent',
    border: 'none',
    color: '#64748b',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    borderRadius: '6px',
    transition: 'all 0.2s',
    width: '100%',
    textAlign: 'left',
  },
  navSubItemActive: {
    background: 'rgba(59, 130, 246, 0.1)',
    color: '#3b82f6',
  },
  sidebarFooter: {
    padding: '16px 20px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '600',
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'white',
  },
  userRole: {
    fontSize: '12px',
    color: '#64748b',
  },

  // Main
  main: {
    flex: 1,
    marginLeft: '260px',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },

  // Header
  header: {
    backgroundColor: 'white',
    padding: '16px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 12px',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '8px',
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#0f172a',
  },
  headerCenter: {
    flex: 1,
    maxWidth: '500px',
    margin: '0 32px',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#f1f5f9',
    padding: '10px 16px',
    borderRadius: '10px',
    border: '1px solid transparent',
    transition: 'all 0.2s',
  },
  searchIcon: {
    color: '#64748b',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    background: 'transparent',
    fontSize: '14px',
    color: '#1e293b',
    outline: 'none',
  },
  clearSearch: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  iconButton: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    backgroundColor: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    position: 'relative',
    color: '#64748b',
    transition: 'all 0.2s',
  },
  notificationBadge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    width: '18px',
    height: '18px',
    backgroundColor: '#ef4444',
    borderRadius: '50%',
    fontSize: '11px',
    fontWeight: '600',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
  },
  secondaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  smallButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    backgroundColor: '#f1f5f9',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  // Content
  content: {
    flex: 1,
    padding: '24px 32px',
    overflowY: 'auto',
  },

  // KPI Cards
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    marginBottom: '24px',
  },
  kpiCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  kpiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
  },
  kpiLabel: {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '500',
  },
  kpiIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '4px',
  },
  kpiSubtext: {
    fontSize: '13px',
    color: '#94a3b8',
  },

  // Toolbar
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: '16px 20px',
    borderRadius: '12px',
    marginBottom: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  toolbarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  toolbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  filterButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  filterButtonActive: {
    borderColor: '#3b82f6',
    color: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  filterCount: {
    backgroundColor: '#3b82f6',
    color: 'white',
    fontSize: '11px',
    fontWeight: '600',
    padding: '2px 6px',
    borderRadius: '10px',
  },
  clearFiltersButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 12px',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '13px',
    color: '#ef4444',
    cursor: 'pointer',
  },
  viewToggle: {
    display: 'flex',
    backgroundColor: '#f1f5f9',
    borderRadius: '8px',
    padding: '4px',
  },
  viewToggleButton: {
    padding: '8px 12px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewToggleButtonActive: {
    backgroundColor: 'white',
    color: '#3b82f6',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  resultCount: {
    fontSize: '14px',
    color: '#64748b',
  },

  // Filter Panel
  filterPanel: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    animation: 'slideIn 0.2s ease-out',
  },
  filterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  filterLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
  },
  filterOptions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  filterCheckbox: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  filterTag: {
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    border: '1px solid',
    backgroundColor: 'white',
  },
  filterTagNeutral: {
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    border: '1px solid #e2e8f0',
    backgroundColor: 'white',
    color: '#64748b',
  },
  filterCheckboxSingle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#64748b',
    cursor: 'pointer',
  },

  // Table
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '14px 16px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    cursor: 'pointer',
    userSelect: 'none',
  },
  thContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  tr: {
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  trArchived: {
    opacity: 0.6,
  },
  td: {
    padding: '16px',
    fontSize: '14px',
    color: '#1e293b',
    borderBottom: '1px solid #f1f5f9',
    verticalAlign: 'middle',
  },
  codeCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  code: {
    fontFamily: 'monospace',
    fontSize: '13px',
    color: '#64748b',
  },
  titleCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  oppTitle: {
    fontWeight: '600',
    color: '#0f172a',
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
  },
  tag: {
    padding: '2px 8px',
    backgroundColor: '#f1f5f9',
    borderRadius: '4px',
    fontSize: '11px',
    color: '#64748b',
    fontWeight: '500',
  },
  tagMore: {
    padding: '2px 8px',
    backgroundColor: '#e2e8f0',
    borderRadius: '4px',
    fontSize: '11px',
    color: '#64748b',
    fontWeight: '500',
  },
  companyCell: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
  },
  cellIcon: {
    color: '#94a3b8',
    marginTop: '2px',
  },
  companyName: {
    display: 'block',
    fontWeight: '500',
  },
  contactName: {
    display: 'block',
    fontSize: '13px',
    color: '#64748b',
  },
  valueCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  mainValue: {
    fontWeight: '600',
    color: '#0f172a',
  },
  recurringValue: {
    fontSize: '12px',
    color: '#10b981',
  },
  stageBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    border: '1px solid',
  },
  priorityBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
  },
  probabilityCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  probabilityBar: {
    width: '60px',
    height: '6px',
    backgroundColor: '#e2e8f0',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  probabilityFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  probabilityText: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#64748b',
    minWidth: '35px',
  },
  dateText: {
    color: '#64748b',
    fontSize: '13px',
  },
  ownerCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  ownerAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: '600',
    color: 'white',
  },
  actionsCell: {
    display: 'flex',
    gap: '4px',
  },
  actionButton: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    backgroundColor: 'white',
    color: '#64748b',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  actionButtonDanger: {
    ':hover': {
      borderColor: '#ef4444',
      color: '#ef4444',
      backgroundColor: '#fef2f2',
    },
  },

  // Empty State
  emptyState: {
    padding: '60px 20px',
    textAlign: 'center',
  },
  emptyIcon: {
    color: '#cbd5e1',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px',
  },
  emptyText: {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '20px',
  },

  // Kanban
  kanbanContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    minHeight: '600px',
  },
  kanbanColumn: {
    backgroundColor: '#f1f5f9',
    borderRadius: '12px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
  },
  kanbanHeader: {
    padding: '12px',
    backgroundColor: 'white',
    borderRadius: '8px',
    marginBottom: '12px',
    borderTop: '3px solid',
  },
  kanbanHeaderInfo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '4px',
  },
  kanbanTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#0f172a',
  },
  kanbanCount: {
    backgroundColor: '#e2e8f0',
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748b',
  },
  kanbanValue: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#3b82f6',
  },
  kanbanCards: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    overflowY: 'auto',
  },
  kanbanCard: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '14px',
    cursor: 'grab',
    transition: 'all 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  kanbanCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  kanbanCardCode: {
    fontFamily: 'monospace',
    fontSize: '11px',
    color: '#94a3b8',
  },
  kanbanCardTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: '8px',
    lineHeight: '1.3',
  },
  kanbanCardCompany: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#64748b',
    marginBottom: '12px',
  },
  kanbanCardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  kanbanCardValue: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#0f172a',
  },
  kanbanCardProb: {
    fontSize: '13px',
    fontWeight: '600',
  },
  kanbanCardMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#94a3b8',
    marginBottom: '10px',
  },
  kanbanCardOwner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    paddingTop: '10px',
    borderTop: '1px solid #f1f5f9',
    fontSize: '12px',
    color: '#64748b',
  },
  kanbanCardAvatar: {
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '9px',
    fontWeight: '600',
    color: 'white',
  },
  addCardButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '12px',
    backgroundColor: 'transparent',
    border: '2px dashed #cbd5e1',
    borderRadius: '8px',
    color: '#94a3b8',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginTop: 'auto',
  },

  // Detail View
  detailContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 320px',
    gap: '24px',
  },
  detailMain: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  detailSidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  detailCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  detailCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
  },
  detailCardHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  detailTitleSection: {
    flex: 1,
  },
  detailCodeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
  },
  detailCode: {
    fontFamily: 'monospace',
    fontSize: '14px',
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    padding: '4px 10px',
    borderRadius: '6px',
  },
  detailTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#0f172a',
  },
  detailActions: {
    display: 'flex',
    gap: '8px',
  },
  detailValueSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr auto',
    gap: '24px',
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    marginBottom: '20px',
  },
  detailValueBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  detailValueLabel: {
    fontSize: '13px',
    color: '#64748b',
    fontWeight: '500',
  },
  detailValueAmount: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#0f172a',
  },
  detailValueRecurring: {
    fontSize: '13px',
    color: '#10b981',
    fontWeight: '500',
  },
  detailProbBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  detailProbCircle: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailProbText: {
    position: 'absolute',
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
  },
  pipelineProgress: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 0',
  },
  pipelineStep: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    position: 'relative',
    flex: 1,
    cursor: 'pointer',
  },
  pipelineStepActive: {},
  pipelineStepPast: {},
  pipelineStepDot: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    zIndex: 1,
  },
  pipelineStepLabel: {
    fontSize: '12px',
    textAlign: 'center',
    transition: 'all 0.2s',
  },
  pipelineStepLine: {
    position: 'absolute',
    top: '16px',
    left: '50%',
    width: '100%',
    height: '3px',
    zIndex: 0,
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  detailCardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: '16px',
  },
  detailInfoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  detailInfoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },
  detailInfoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  detailInfoLabel: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  detailInfoValue: {
    fontSize: '14px',
    color: '#0f172a',
    fontWeight: '500',
  },
  detailInfoLink: {
    fontSize: '14px',
    color: '#3b82f6',
    textDecoration: 'none',
  },
  detailSection: {
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #f1f5f9',
  },
  productTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '8px',
  },
  productTag: {
    padding: '6px 12px',
    backgroundColor: '#eff6ff',
    color: '#3b82f6',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
  },
  detailNote: {
    fontSize: '14px',
    color: '#374151',
    lineHeight: '1.6',
    marginTop: '8px',
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  activityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    transition: 'all 0.2s',
  },
  activityItemCompleted: {
    opacity: 0.7,
  },
  activityIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#0f172a',
    display: 'block',
  },
  activityMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#64748b',
    marginTop: '4px',
  },
  activityType: {
    backgroundColor: '#e2e8f0',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  activityStatus: {
    display: 'flex',
    alignItems: 'center',
  },
  activityPending: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    border: '2px solid #cbd5e1',
  },
  documentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  documentItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
  },
  documentIcon: {
    width: '40px',
    height: '40px',
    backgroundColor: '#dbeafe',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#3b82f6',
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#0f172a',
    display: 'block',
  },
  documentMeta: {
    fontSize: '12px',
    color: '#64748b',
  },
  quickActions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
  },
  quickActionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  stageButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  stageButton: {
    padding: '10px 16px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left',
  },
  teamList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  teamMember: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    color: '#374151',
  },
  teamAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: '600',
    color: 'white',
  },

  // Modal
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '20px',
    width: '700px',
    maxWidth: '90vw',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    animation: 'slideIn 0.3s ease-out',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 24px 0',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#0f172a',
  },
  closeButton: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  modalBody: {
    padding: '24px',
    overflowY: 'auto',
    flex: 1,
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  formGroupFull: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    gridColumn: 'span 2',
  },
  formLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
  },
  formInput: {
    padding: '10px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1e293b',
    transition: 'all 0.2s',
    outline: 'none',
  },
  formSelect: {
    padding: '10px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1e293b',
    backgroundColor: 'white',
    cursor: 'pointer',
    outline: 'none',
  },
  formTextarea: {
    padding: '10px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1e293b',
    resize: 'vertical',
    minHeight: '80px',
    outline: 'none',
    fontFamily: 'inherit',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '16px 24px 24px',
    borderTop: '1px solid #f1f5f9',
  },
};

export default App;
