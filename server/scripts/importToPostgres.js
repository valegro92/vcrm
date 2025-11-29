/**
 * Script per importare i dati dal file Excel nel database PostgreSQL
 * 
 * Uso:
 * 1. Da locale con DATABASE_URL: DATABASE_URL=postgres://... node server/scripts/importToPostgres.js
 * 2. Dalla console Sevalla: node server/scripts/importToPostgres.js
 */

const XLSX = require('xlsx');
const path = require('path');
const { Pool } = require('pg');

// Configurazione database
const getDatabaseUrl = () => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  // Fallback per Sevalla internal connection
  return 'postgres://vcrm-db:vcrm-db@vcrm-db-nlntg-postgresql.vcrm-db-nlntg.svc.cluster.local:5432/vcrm-db';
};

const pool = new Pool({
  connectionString: getDatabaseUrl(),
  ssl: false
});

// Mappa le fasi dall'Excel alle fasi del CRM
const mapStage = (fase) => {
  const stageMap = {
    'Lead': 'Lead',
    'In contatto': 'Contatto',
    'Follow Up da fare': 'Proposta',
    'Chiuso Vinto': 'Chiuso Vinto',
    'Fare fattura': 'Chiuso Vinto',
    'Stand By': 'Negoziazione',
    'Chiuso Perso': 'Chiuso Perso'
  };
  return stageMap[fase] || 'Lead';
};

// Estrai il nome pulito del cliente
const cleanCompanyName = (cliente) => {
  if (!cliente) return null;
  // Rimuovi virgole e prendi la prima parte (il nome principale)
  return cliente.split(',')[0].trim();
};

async function importData() {
  console.log('🚀 Avvio importazione dati...\n');
  
  try {
    // Test connessione
    console.log('📡 Connessione al database...');
    await pool.query('SELECT NOW()');
    console.log('✅ Connessione riuscita!\n');

    // Crea le tabelle se non esistono
    console.log('📋 Verifica/creazione tabelle...');
    await createTables();
    console.log('✅ Tabelle pronte!\n');

    // Leggi il file Excel
    console.log('📖 Lettura file Excel...');
    const excelPath = path.join(__dirname, '../../Contatto (crm.lead).xlsx');
    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet);
    
    // Filtra solo le righe che hanno dati validi (escludi le righe di riepilogo)
    const data = rawData.filter(row => 
      row['Fase'] && 
      row['Opportunità'] && 
      !row['Fase'].includes('(') // Escludi "Lead (3)", "In contatto (2)", etc.
    );
    
    console.log(`✅ Trovate ${data.length} opportunità valide\n`);

    // Crea un utente di default se non esiste
    console.log('👤 Creazione utente di default...');
    const userId = await ensureDefaultUser();
    console.log(`✅ Utente ID: ${userId}\n`);

    // Estrai i clienti unici e creali come contatti
    console.log('📇 Importazione contatti...');
    const clientiUnici = [...new Set(data.map(row => cleanCompanyName(row['Cliente'])).filter(Boolean))];
    const contactMap = new Map();
    
    for (const cliente of clientiUnici) {
      const contactId = await upsertContact(cliente, userId);
      contactMap.set(cliente, contactId);
    }
    console.log(`✅ Importati ${clientiUnici.length} contatti\n`);

    // Importa le opportunità
    console.log('💼 Importazione opportunità...');
    let importedCount = 0;
    let skippedCount = 0;

    for (const row of data) {
      const companyName = cleanCompanyName(row['Cliente']);
      const contactId = companyName ? contactMap.get(companyName) : null;
      
      const opportunity = {
        title: row['Opportunità'],
        company: companyName,
        value: parseFloat(row['Ricavi previsti']) || 0,
        stage: mapStage(row['Fase']),
        probability: Math.round(parseFloat(row['Probabilità']) || 0),
        owner: row['Addetto vendite'] || 'Valentino Grossi',
        contactId: contactId,
        userId: userId,
        notes: row['Attività'] || null
      };

      const result = await upsertOpportunity(opportunity);
      if (result.inserted) {
        importedCount++;
      } else {
        skippedCount++;
      }
    }

    console.log(`✅ Opportunità importate: ${importedCount}`);
    console.log(`⏭️ Opportunità già esistenti (saltate): ${skippedCount}\n`);

    // Riepilogo finale
    console.log('='.repeat(50));
    console.log('📊 RIEPILOGO IMPORTAZIONE');
    console.log('='.repeat(50));
    
    const stats = await getStats();
    console.log(`👥 Totale contatti nel DB: ${stats.contacts}`);
    console.log(`💼 Totale opportunità nel DB: ${stats.opportunities}`);
    console.log(`💰 Valore totale pipeline: €${stats.totalValue.toLocaleString('it-IT')}`);
    console.log('='.repeat(50));
    
    console.log('\n✨ Importazione completata con successo!');
    
  } catch (error) {
    console.error('❌ Errore durante l\'importazione:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

async function createTables() {
  // Users table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      "fullName" VARCHAR(255),
      avatar VARCHAR(10),
      phone VARCHAR(50),
      company VARCHAR(255),
      role VARCHAR(50) DEFAULT 'user',
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Contacts table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS contacts (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      company VARCHAR(255),
      email VARCHAR(255),
      phone VARCHAR(50),
      value DECIMAL(10, 2) DEFAULT 0,
      status VARCHAR(50) DEFAULT 'Lead',
      avatar VARCHAR(10),
      "lastContact" DATE,
      notes TEXT,
      "userId" INTEGER REFERENCES users(id) ON DELETE SET NULL,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Opportunities table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS opportunities (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      company VARCHAR(255),
      value DECIMAL(10, 2) DEFAULT 0,
      stage VARCHAR(50) DEFAULT 'Lead',
      probability INTEGER DEFAULT 0,
      "openDate" DATE,
      "closeDate" DATE,
      owner VARCHAR(255),
      "contactId" INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
      "userId" INTEGER REFERENCES users(id) ON DELETE SET NULL,
      "originalStage" VARCHAR(50),
      notes TEXT,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tasks table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      type VARCHAR(50) DEFAULT 'Chiamata',
      priority VARCHAR(50) DEFAULT 'Media',
      "dueDate" DATE,
      status VARCHAR(50) DEFAULT 'Da fare',
      "contactId" INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
      "opportunityId" INTEGER REFERENCES opportunities(id) ON DELETE SET NULL,
      "userId" INTEGER REFERENCES users(id) ON DELETE SET NULL,
      description TEXT,
      "completedAt" TIMESTAMP,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function ensureDefaultUser() {
  const bcrypt = require('bcryptjs');
  
  // Controlla se esiste già un utente
  const result = await pool.query('SELECT id FROM users LIMIT 1');
  if (result.rows.length > 0) {
    return result.rows[0].id;
  }
  
  // Crea utente di default
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const insertResult = await pool.query(`
    INSERT INTO users (username, email, password, "fullName", role)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
  `, ['admin', 'admin@vcrm.it', hashedPassword, 'Amministratore', 'admin']);
  
  return insertResult.rows[0].id;
}

async function upsertContact(companyName, userId) {
  // Controlla se il contatto esiste già
  const existing = await pool.query(
    'SELECT id FROM contacts WHERE LOWER(name) = LOWER($1) OR LOWER(company) = LOWER($1)',
    [companyName]
  );
  
  if (existing.rows.length > 0) {
    return existing.rows[0].id;
  }
  
  // Crea nuovo contatto
  const avatars = ['👤', '🏢', '💼', '🎯', '⭐'];
  const avatar = avatars[Math.floor(Math.random() * avatars.length)];
  
  const result = await pool.query(`
    INSERT INTO contacts (name, company, status, avatar, "userId")
    VALUES ($1, $2, 'Cliente', $3, $4)
    RETURNING id
  `, [companyName, companyName, avatar, userId]);
  
  return result.rows[0].id;
}

async function upsertOpportunity(opp) {
  // Controlla se l'opportunità esiste già (stesso titolo e azienda)
  const existing = await pool.query(
    'SELECT id FROM opportunities WHERE LOWER(title) = LOWER($1) AND (LOWER(company) = LOWER($2) OR ($2 IS NULL AND company IS NULL))',
    [opp.title, opp.company]
  );
  
  if (existing.rows.length > 0) {
    return { inserted: false, id: existing.rows[0].id };
  }
  
  // Crea nuova opportunità
  const result = await pool.query(`
    INSERT INTO opportunities (title, company, value, stage, probability, owner, "contactId", "userId", "originalStage", notes, "openDate")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_DATE)
    RETURNING id
  `, [
    opp.title,
    opp.company,
    opp.value,
    opp.stage,
    opp.probability,
    opp.owner,
    opp.contactId,
    opp.userId,
    opp.stage,
    opp.notes
  ]);
  
  return { inserted: true, id: result.rows[0].id };
}

async function getStats() {
  const contacts = await pool.query('SELECT COUNT(*) as count FROM contacts');
  const opportunities = await pool.query('SELECT COUNT(*) as count, COALESCE(SUM(value), 0) as total FROM opportunities');
  
  return {
    contacts: parseInt(contacts.rows[0].count),
    opportunities: parseInt(opportunities.rows[0].count),
    totalValue: parseFloat(opportunities.rows[0].total)
  };
}

// Esegui
importData().catch(err => {
  console.error('Errore fatale:', err);
  process.exit(1);
});
