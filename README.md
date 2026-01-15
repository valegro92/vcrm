# VAIB - Il CRM che si adatta parlandoci

<p align="center">
  <img src="https://img.shields.io/badge/version-2.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
  <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg" alt="Node">
  <img src="https://img.shields.io/badge/react-18.2.0-61dafb.svg" alt="React">
</p>

<p align="center">
  <strong>Il primo CRM pensato per freelancer e partite IVA forfettarie italiane.</strong><br>
  Personalizza l'interfaccia semplicemente descrivendola. Nessuna configurazione complessa.
</p>

---

## ✨ Cosa rende VAIB diverso

### 🪄 AI-First Customization
Descrivi come vuoi l'interfaccia e VAIB si adatta:
- *"Usa un tema scuro con colori verdi"*
- *"Nascondi le fatture dalla dashboard"*
- *"Rendi tutto più compatto"*

### 📊 Forfettario-Native
Monitoraggio automatico del limite €85.000 con alert intelligenti.

### 🚀 Zero Learning Curve
Setup conversazionale. Inizia a usarlo in 2 minuti.

---

## 🛠️ Stack Tecnologico

| Layer | Tecnologia |
|-------|------------|
| Frontend | React 18, Recharts, Lucide Icons |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| AI | OpenRouter (modelli gratuiti con fallback) |
| Auth | JWT + bcrypt |

---

## 📦 Quick Start

### Prerequisiti
- Node.js >= 18.0.0
- PostgreSQL (o usa il database cloud)

### Installazione

```bash
# 1. Clona il repository
git clone https://github.com/valegro92/vcrm.git
cd vcrm

# 2. Installa dipendenze
npm install
npm run install:server

# 3. Configura environment
cp .env.example .env
# Modifica .env con le tue credenziali

# 4. Avvia in development
npm run dev
```

### Credenziali Demo
```
Email: admin@example.com
Password: admin123
```

---

## 🏗️ Architettura

```
vaib/
├── src/                    # Frontend React
│   ├── api/               # API client
│   ├── components/        # UI Components
│   ├── context/           # React Context (UIConfig, Auth)
│   └── AppWithDB.js       # Main App
├── server/                 # Backend Node.js
│   ├── config/            # Configurazioni (UI defaults)
│   ├── database/          # Schema e migrations
│   ├── middleware/        # Auth, error handling
│   ├── routes/            # API endpoints
│   └── server.js          # Entry point
└── docs/                   # Documentazione
```

---

## 🎯 Funzionalità

### Core CRM
- **Dashboard** - KPI, grafici, panoramica attività
- **Pipeline** - Kanban drag & drop per opportunità
- **Contatti** - Gestione clienti e prospect
- **Progetti** - Tracking progetti attivi
- **Fatture** - Gestione fatturazione con stati
- **Attività** - Task management con priorità

### AI Features
- **AI Chatbot** - Interroga i tuoi dati in linguaggio naturale
- **AI Builder** - Personalizza l'interfaccia parlandoci
- **Schema-Driven UI** - Configurazione per-user persistente

### Forfettario Tools
- **Limite Tracker** - Monitoraggio €85.000
- **Alert Automatici** - Notifiche soglie
- **Report Fiscali** - Export per commercialista

---

## 🔌 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login utente |
| POST | `/api/auth/register` | Registrazione |

### Resources
| Resource | Endpoints |
|----------|-----------|
| Contacts | `GET/POST/PUT/DELETE /api/contacts` |
| Opportunities | `GET/POST/PUT/DELETE /api/opportunities` |
| Tasks | `GET/POST/PUT/DELETE /api/tasks` |
| Projects | `GET/POST/PUT/DELETE /api/projects` |
| Invoices | `GET/POST/PUT/DELETE /api/invoices` |

### AI & Config
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ui-config` | Get user UI config |
| POST | `/api/ui-config/generate` | AI generate config |
| PUT | `/api/ui-config/theme` | Update theme |
| POST | `/api/chat` | AI chatbot |

---

## 🔒 Sicurezza

- ✅ Autenticazione JWT
- ✅ Password hashing (bcrypt)
- ✅ CORS configurato
- ✅ SQL injection protection
- ✅ Input validation
- ✅ Rate limiting

---

## 🗺️ Roadmap

### v2.1 (In Progress)
- [ ] Onboarding guidato con AI
- [ ] Dark mode completo
- [ ] Mobile app (React Native)

### v2.2
- [ ] Integrazione email
- [ ] Calendario sincronizzato
- [ ] Notifiche push

### v3.0
- [ ] Multi-tenancy
- [ ] Marketplace integrazioni
- [ ] API pubblica

---

## 🤝 Contributing

Leggi [CONTRIBUTING.md](CONTRIBUTING.md) per le linee guida.

```bash
# Setup development
npm run dev

# Run tests
npm test

# Build production
npm run build
```

---

## 📄 License

MIT © 2024 VAIB

---

<p align="center">
  <strong>VAIB</strong> - Il CRM che si adatta parlandoci<br>
  <a href="https://vaib.app">Website</a> · <a href="https://docs.vaib.app">Docs</a> · <a href="https://twitter.com/vaib_app">Twitter</a>
</p>
