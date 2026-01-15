# Contributing to VAIB

Grazie per il tuo interesse nel contribuire a VAIB! 🎉

## 🚀 Quick Start

```bash
# Fork e clone
git clone https://github.com/YOUR_USERNAME/vcrm.git
cd vcrm

# Installa dipendenze
npm install
npm run install:server

# Configura environment
cp .env.example .env
# Modifica .env con le tue credenziali

# Avvia in development
npm run dev
```

## 📋 Workflow

### 1. Crea un Branch

```bash
git checkout -b feature/nome-feature
# oppure
git checkout -b fix/nome-bug
```

### 2. Naming Convention

- `feature/` - Nuove funzionalità
- `fix/` - Bug fix
- `docs/` - Documentazione
- `refactor/` - Refactoring codice
- `test/` - Aggiunta test

### 3. Commit Messages

Usiamo [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add AI Builder quick actions
fix: resolve dark mode flickering
docs: update API documentation
refactor: simplify UIConfigContext
```

### 4. Pull Request

1. Assicurati che il build passi: `npm run build`
2. Testa manualmente le modifiche
3. Aggiorna la documentazione se necessario
4. Crea una PR con descrizione chiara

## 🏗️ Struttura Progetto

```
vaib/
├── src/                    # Frontend React
│   ├── api/               # API client
│   ├── components/        # UI Components
│   ├── context/           # React Context
│   └── AppWithDB.js       # Main App
├── server/                 # Backend Node.js
│   ├── config/            # Configurazioni
│   ├── database/          # Schema
│   ├── middleware/        # Middleware
│   ├── routes/            # API routes
│   └── server.js          # Entry point
└── docs/                   # Documentazione
```

## 📝 Code Style

### JavaScript/React

- Usa functional components con hooks
- Preferisci `const` a `let`
- Usa destructuring quando possibile
- Nomi componenti in PascalCase
- Nomi funzioni/variabili in camelCase

### CSS

- Preferisci inline styles o CSS-in-JS per componenti isolati
- Usa CSS variables per temi
- Mobile-first approach

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 🐛 Bug Reports

Apri una issue con:
- Descrizione del problema
- Steps to reproduce
- Expected vs actual behavior
- Screenshots se utili
- Browser/OS version

## 💡 Feature Requests

Apri una issue con:
- Descrizione della feature
- Use case / perché è utile
- Mockup o esempi se possibile

## 📜 Code of Conduct

- Sii rispettoso
- Feedback costruttivo
- Aiuta i newcomers
- Celebra i contributi

## 🙏 Riconoscimenti

Tutti i contributori sono elencati nel README e nel file AUTHORS.

---

Domande? Apri una issue o contattaci su [Twitter](https://twitter.com/vaib_app).
