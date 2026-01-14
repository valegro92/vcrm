# vCRM - CRM Valentino

## 📦 Installazione

### 1. Installa dipendenze frontend
```bash
npm install
```

### 2. Installa dipendenze backend
```bash
npm run install:server
```

### 3. Inizializza database
```bash
npm run server:init
```

Questo creerà il database SQLite e inserirà dati di esempio.

## 🎯 Utilizzo

### Avvio rapido (frontend + backend)
```bash
npm run dev
```

Questo avvierà:
- Frontend su http://localhost:3000
- Backend su http://localhost:5001

### Avvio separato

**Solo Frontend:**
```bash
npm start
```

**Solo Backend:**
```bash
npm run server
```

**Backend in modalità sviluppo (con auto-restart):**
```bash
npm run server:dev
```

## 🔑 Credenziali Demo

```
Username: admin
Password: admin123
```

## 🗂️ Struttura Progetto

```
vCRM/
├── public/              # File statici
├── src/                 # Frontend React
│   ├── api/            # Client API
│   ├── components/     # Componenti React
│   ├── constants/      # Costanti
│   ├── data/           # Dati iniziali
│   └── AppWithDB.js    # App principale con DB
├── server/             # Backend Node.js
│   ├── database/       # Database e schema
│   ├── middleware/     # Middleware Express
│   ├── routes/         # API routes
│   ├── scripts/        # Script utilità
│   └── server.js       # Server principale
└── README.md
```

## 📊 Funzionalità Principali

### Dashboard
- KPI in tempo reale (Pipeline totale, tasso conversione, ecc.)
- Grafici vendite mensili
- Distribuzione pipeline per fase
- Lista opportunità e attività recenti

### Pipeline Vendite
- Visualizzazione Kanban con 7 fasi
- Drag & drop per spostare opportunità
- Filtro per anno
- Statistiche per ogni fase

### Gestione Contatti
- Creazione, modifica, eliminazione contatti
- Ricerca e filtri
- Informazioni dettagliate (email, telefono, azienda)

### Gestione Opportunità
- CRUD completo
- Associazione con contatti
- Tracking probabilità e valore
- Date apertura/chiusura

### Gestione Attività
- Creazione attività (chiamate, email, meeting, documenti)
- Priorità e scadenze
- Toggle completamento
- Associazione con contatti

## 🔧 API Endpoints

### Autenticazione
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registrazione

### Contatti
- `GET /api/contacts` - Lista contatti
- `GET /api/contacts/:id` - Dettaglio contatto
- `POST /api/contacts` - Crea contatto
- `PUT /api/contacts/:id` - Aggiorna contatto
- `DELETE /api/contacts/:id` - Elimina contatto

### Opportunità
- `GET /api/opportunities` - Lista opportunità
- `GET /api/opportunities/:id` - Dettaglio opportunità
- `POST /api/opportunities` - Crea opportunità
- `PUT /api/opportunities/:id` - Aggiorna opportunità
- `DELETE /api/opportunities/:id` - Elimina opportunità
- `PATCH /api/opportunities/:id/stage` - Aggiorna fase

### Attività
- `GET /api/tasks` - Lista attività
- `GET /api/tasks/:id` - Dettaglio attività
- `POST /api/tasks` - Crea attività
- `PUT /api/tasks/:id` - Aggiorna attività
- `DELETE /api/tasks/:id` - Elimina attività
- `PATCH /api/tasks/:id/toggle` - Toggle completamento

## 🛠️ Tecnologie Utilizzate

### Frontend
- React 18
- Recharts (grafici)
- Lucide React (icone)
- Date-fns (date)

### Backend
- Node.js
- Express
- SQLite3
- JWT (autenticazione)
- Bcrypt (password hashing)

## 📝 Note

- I dati sono persistenti nel database SQLite (`server/database/crm.db`)
- Le password sono hashate con bcrypt
- JWT token valido per 24 ore
- Il backend include middleware di autenticazione per tutte le route protette

## 🔐 Sicurezza

- Autenticazione JWT
- Password hashate con bcrypt
- CORS configurato
- Validazione input
- SQL injection protection (prepared statements)

## 🚧 Prossimi Sviluppi

- [ ] Calendario attività
- [ ] Report avanzati
- [ ] Export dati (CSV, PDF)
- [ ] Email integration
- [ ] Multi-tenancy
- [ ] Notifiche real-time
- [ ] Dashboard personalizzabili

## 📄 Licenza

MIT

## 👨‍💻 Autore

Sviluppato con Claude Code
