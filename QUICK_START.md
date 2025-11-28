# 🚀 Avvio Rapido vCRM

## Primo avvio (setup completo)

```bash
# 1. Installa dipendenze frontend
npm install

# 2. Installa dipendenze backend
npm run install:server

# 3. Inizializza database con dati demo
npm run server:init

# 4. Avvia frontend + backend insieme
npm run dev
```

## Avvio successivo (dopo il setup)

```bash
npm run dev
```

Oppure avvia separatamente:

```bash
# In un terminale
npm run server:dev

# In un altro terminale
npm start
```

## 🌐 URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Health Check**: http://localhost:5001/api/health

## 🔑 Login

```
Username: admin
Password: admin123
```

## ✅ Verifica che funzioni

1. Apri http://localhost:3000
2. Vedrai la schermata di login
3. Inserisci le credenziali demo
4. Dovresti vedere la dashboard con dati reali dal database!

## 🔧 Comandi utili

```bash
# Reinstalla database (pulisce tutti i dati!)
npm run server:init

# Avvia solo backend
npm run server

# Avvia solo frontend
npm start

# Avvia backend in dev mode (con auto-restart)
npm run server:dev
```

## 📊 Cosa puoi fare

- ✅ Visualizzare dashboard con KPI reali
- ✅ Gestire contatti (aggiungi, modifica, elimina)
- ✅ Creare opportunità di vendita
- ✅ Spostare opportunità tra fasi (drag & drop)
- ✅ Gestire attività e task
- ✅ Tutti i dati sono persistenti nel database!

## 🐛 Risoluzione problemi

### Porta già in uso
Se vedi errore "EADDRINUSE":
1. Controlla se un altro processo usa la porta 5001
2. Cambia porta in `server/.env` e `.env`

### Database non trovato
```bash
npm run server:init
```

### Dipendenze mancanti
```bash
npm install
npm run install:server
```

## 📁 Database

Il database SQLite si trova in: `server/database/crm.db`

Per resettarlo completamente:
```bash
rm server/database/crm.db
npm run server:init
```

## 🎉 Enjoy!

Ora hai un CRM completo e funzionante con database reale!
