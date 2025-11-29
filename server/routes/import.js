const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('../database/db');

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
  return cliente.split(',')[0].trim();
};

// POST /api/import/excel - Importa i dati dal file Excel
router.post('/excel', async (req, res) => {
  // Verifica chiave segreta
  const secretKey = req.headers['x-import-key'] || req.query.key;
  const expectedKey = process.env.IMPORT_SECRET_KEY || 'vcrm-import-2024';
  
  if (secretKey !== expectedKey) {
    return res.status(403).json({ error: 'Chiave di importazione non valida' });
  }

  const isPostgres = db.type === 'postgres';
  const results = {
    success: false,
    contactsImported: 0,
    opportunitiesImported: 0,
    errors: []
  };

  try {
    // Leggi il file Excel
    const excelPath = path.join(__dirname, '../../Contatto (crm.lead).xlsx');
    
    let workbook;
    try {
      workbook = XLSX.readFile(excelPath);
    } catch (e) {
      return res.status(400).json({ error: 'File Excel non trovato', details: e.message });
    }

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet);
    
    // Filtra solo le righe valide
    const data = rawData.filter(row => 
      row['Fase'] && 
      row['Opportunità'] && 
      !row['Fase'].includes('(')
    );

    // Assicurati che esista un utente
    let userId;
    if (isPostgres) {
      const userResult = await db.pool.query('SELECT id FROM users LIMIT 1');
      if (userResult.rows.length > 0) {
        userId = userResult.rows[0].id;
      } else {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const insertResult = await db.pool.query(
          'INSERT INTO users (username, email, password, "fullName", role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
          ['admin', 'admin@vcrm.it', hashedPassword, 'Amministratore', 'admin']
        );
        userId = insertResult.rows[0].id;
      }
    } else {
      // SQLite
      userId = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM users LIMIT 1', [], async (err, row) => {
          if (err) return reject(err);
          if (row) return resolve(row.id);
          
          const hashedPassword = await bcrypt.hash('admin123', 10);
          db.run(
            'INSERT INTO users (username, email, password, fullName, role) VALUES (?, ?, ?, ?, ?)',
            ['admin', 'admin@vcrm.it', hashedPassword, 'Amministratore', 'admin'],
            function(err) {
              if (err) return reject(err);
              resolve(this.lastID);
            }
          );
        });
      });
    }

    // Importa i contatti unici
    const clientiUnici = [...new Set(data.map(row => cleanCompanyName(row['Cliente'])).filter(Boolean))];
    const contactMap = new Map();
    
    for (const cliente of clientiUnici) {
      try {
        const contactId = await upsertContact(cliente, userId, isPostgres);
        contactMap.set(cliente, contactId);
        results.contactsImported++;
      } catch (e) {
        results.errors.push(`Errore contatto ${cliente}: ${e.message}`);
      }
    }

    // Importa le opportunità
    for (const row of data) {
      try {
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

        const result = await upsertOpportunity(opportunity, isPostgres);
        if (result.inserted) {
          results.opportunitiesImported++;
        }
      } catch (e) {
        results.errors.push(`Errore opportunità ${row['Opportunità']}: ${e.message}`);
      }
    }

    results.success = true;
    
    // Aggiungi statistiche finali
    if (isPostgres) {
      const stats = await db.pool.query('SELECT COUNT(*) as contacts FROM contacts');
      const oppStats = await db.pool.query('SELECT COUNT(*) as opportunities, COALESCE(SUM(value), 0) as total FROM opportunities');
      results.totalContacts = parseInt(stats.rows[0].contacts);
      results.totalOpportunities = parseInt(oppStats.rows[0].opportunities);
      results.totalValue = parseFloat(oppStats.rows[0].total);
    }

    res.json(results);

  } catch (error) {
    results.errors.push(error.message);
    res.status(500).json(results);
  }
});

// GET /api/import/status - Verifica lo stato del database
router.get('/status', async (req, res) => {
  const isPostgres = db.type === 'postgres';
  
  try {
    let stats;
    if (isPostgres) {
      const contacts = await db.pool.query('SELECT COUNT(*) as count FROM contacts');
      const opportunities = await db.pool.query('SELECT COUNT(*) as count, COALESCE(SUM(value), 0) as total FROM opportunities');
      const users = await db.pool.query('SELECT COUNT(*) as count FROM users');
      
      stats = {
        dbType: 'PostgreSQL',
        connected: true,
        users: parseInt(users.rows[0].count),
        contacts: parseInt(contacts.rows[0].count),
        opportunities: parseInt(opportunities.rows[0].count),
        totalValue: parseFloat(opportunities.rows[0].total)
      };
    } else {
      stats = await new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) as contacts FROM contacts', [], (err, contactRow) => {
          if (err) return reject(err);
          db.get('SELECT COUNT(*) as opportunities, COALESCE(SUM(value), 0) as total FROM opportunities', [], (err, oppRow) => {
            if (err) return reject(err);
            db.get('SELECT COUNT(*) as users FROM users', [], (err, userRow) => {
              if (err) return reject(err);
              resolve({
                dbType: 'SQLite',
                connected: true,
                users: userRow.users,
                contacts: contactRow.contacts,
                opportunities: oppRow.opportunities,
                totalValue: oppRow.total
              });
            });
          });
        });
      });
    }
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message, connected: false });
  }
});

// Funzione helper per inserire/aggiornare contatto
async function upsertContact(companyName, userId, isPostgres) {
  const avatars = ['👤', '🏢', '💼', '🎯', '⭐'];
  const avatar = avatars[Math.floor(Math.random() * avatars.length)];

  if (isPostgres) {
    const existing = await db.pool.query(
      'SELECT id FROM contacts WHERE LOWER(name) = LOWER($1) OR LOWER(company) = LOWER($1)',
      [companyName]
    );
    
    if (existing.rows.length > 0) {
      return existing.rows[0].id;
    }
    
    const result = await db.pool.query(
      'INSERT INTO contacts (name, company, status, avatar, "userId") VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [companyName, companyName, 'Cliente', avatar, userId]
    );
    return result.rows[0].id;
  } else {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT id FROM contacts WHERE LOWER(name) = LOWER(?) OR LOWER(company) = LOWER(?)',
        [companyName, companyName],
        (err, row) => {
          if (err) return reject(err);
          if (row) return resolve(row.id);
          
          db.run(
            'INSERT INTO contacts (name, company, status, avatar, userId) VALUES (?, ?, ?, ?, ?)',
            [companyName, companyName, 'Cliente', avatar, userId],
            function(err) {
              if (err) return reject(err);
              resolve(this.lastID);
            }
          );
        }
      );
    });
  }
}

// Funzione helper per inserire/aggiornare opportunità
async function upsertOpportunity(opp, isPostgres) {
  if (isPostgres) {
    const existing = await db.pool.query(
      'SELECT id FROM opportunities WHERE LOWER(title) = LOWER($1) AND (LOWER(company) = LOWER($2) OR ($2 IS NULL AND company IS NULL))',
      [opp.title, opp.company]
    );
    
    if (existing.rows.length > 0) {
      return { inserted: false, id: existing.rows[0].id };
    }
    
    const result = await db.pool.query(
      `INSERT INTO opportunities (title, company, value, stage, probability, owner, "contactId", "userId", "originalStage", notes, "openDate")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_DATE) RETURNING id`,
      [opp.title, opp.company, opp.value, opp.stage, opp.probability, opp.owner, opp.contactId, opp.userId, opp.stage, opp.notes]
    );
    return { inserted: true, id: result.rows[0].id };
  } else {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT id FROM opportunities WHERE LOWER(title) = LOWER(?) AND (LOWER(company) = LOWER(?) OR (? IS NULL AND company IS NULL))',
        [opp.title, opp.company, opp.company],
        (err, row) => {
          if (err) return reject(err);
          if (row) return resolve({ inserted: false, id: row.id });
          
          db.run(
            `INSERT INTO opportunities (title, company, value, stage, probability, owner, contactId, userId, originalStage, notes, openDate)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, date('now'))`,
            [opp.title, opp.company, opp.value, opp.stage, opp.probability, opp.owner, opp.contactId, opp.userId, opp.stage, opp.notes],
            function(err) {
              if (err) return reject(err);
              resolve({ inserted: true, id: this.lastID });
            }
          );
        }
      );
    });
  }
}

module.exports = router;
