const XLSX = require('xlsx');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('../database/db');
const { createTables } = require('../database/schema');

const importData = async () => {
  try {
    console.log('Creating tables...');
    await createTables();

    // Disabilita temporaneamente foreign keys
    db.run('PRAGMA foreign_keys = OFF');

    // Pulisci dati esistenti
    await new Promise((resolve) => {
      db.serialize(() => {
        db.run('DELETE FROM tasks', () => {
          db.run('DELETE FROM opportunities', () => {
            db.run('DELETE FROM contacts', () => {
              db.run('DELETE FROM users', resolve);
            });
          });
        });
      });
    });

    console.log('Old data cleared');

    // Crea utente admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO users (username, email, password, fullName, avatar, role)
        VALUES (?, ?, ?, ?, ?, ?)
      `, ['admin', 'admin@vcrm.it', hashedPassword, 'Valentino Grossi', 'VG', 'admin'], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('Admin user created');

    // Leggi Excel
    const excelPath = path.join(__dirname, '../../Contatto (crm.lead).xlsx');
    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`Found ${data.length} rows in Excel`);

    // Filtra solo le righe con dati completi
    const opportunities = data.filter(row => row.Opportunità && row.Cliente);

    console.log(`Importing ${opportunities.length} opportunities...`);

    // Estrai contatti unici prima
    const uniqueClients = [...new Set(opportunities.map(o => o.Cliente))];
    console.log(`Creating ${uniqueClients.length} contacts first...`);

    for (const client of uniqueClients) {
      const avatar = client.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2);
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO contacts (name, company, email, phone, value, status, avatar, lastContact, userId)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          client,
          client,
          `${client.toLowerCase().replace(/[^a-z0-9]/g, '')}@example.com`,
          `+39 ${Math.floor(Math.random() * 900000000) + 100000000}`,
          0,
          'Cliente',
          avatar,
          new Date().toISOString().split('T')[0],
          1
        ], function(err) {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    console.log('Contacts created, now creating opportunities...');

    // Mappa delle fasi
    const stageMap = {
      'Lead': 'Lead',
      'Lead (3)': 'Lead',
      'In contatto': 'In contatto',
      'In contatto (2)': 'In contatto',
      'Follow Up da fare': 'Follow Up da fare',
      'Follow Up da fare (1)': 'Follow Up da fare',
      'Revisionare offerta': 'Revisionare offerta',
      'Chiuso Vinto': 'Chiuso Vinto',
      'Chiuso Perso': 'Chiuso Perso',
      'Stand By': 'Revisionare offerta'
    };

    // Importa opportunità
    let imported = 0;
    for (const row of opportunities) {
      const stage = stageMap[row.Fase] || 'Lead';
      const isWon = stage === 'Chiuso Vinto';
      const isLost = stage === 'Chiuso Perso';

      // Determina date basandosi sulla fase
      const now = new Date();
      let openDate, closeDate;

      if (isWon || isLost) {
        // Se chiusa, metti data chiusura casuale negli ultimi 6 mesi
        const randomDaysAgo = Math.floor(Math.random() * 180);
        closeDate = new Date(now.getTime() - randomDaysAgo * 24 * 60 * 60 * 1000);
        openDate = new Date(closeDate.getTime() - Math.random() * 60 * 24 * 60 * 60 * 1000);
      } else {
        // Se aperta, data apertura negli ultimi 3 mesi, chiusura futura
        const randomDaysAgo = Math.floor(Math.random() * 90);
        openDate = new Date(now.getTime() - randomDaysAgo * 24 * 60 * 60 * 1000);
        const randomDaysAhead = Math.floor(Math.random() * 90) + 30;
        closeDate = new Date(now.getTime() + randomDaysAhead * 24 * 60 * 60 * 1000);
      }

      await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO opportunities (
            title, company, value, stage, probability,
            openDate, closeDate, owner, userId, originalStage
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          row.Opportunità,
          row.Cliente,
          row['Ricavi previsti'] || 0,
          stage,
          row['Probabilità'] || 0,
          openDate.toISOString().split('T')[0],
          closeDate.toISOString().split('T')[0],
          row['Addetto vendite'] || 'Valentino Grossi',
          1,
          isWon ? 'Chiuso Vinto' : (isLost ? 'Chiuso Perso' : null)
        ], function(err) {
          if (err) reject(err);
          else resolve();
        });
      });

      imported++;
    }

    console.log(`Imported ${imported} opportunities`);

    // Riabilita foreign keys
    db.run('PRAGMA foreign_keys = ON');

    console.log('✅ Data import completed successfully!');

    setTimeout(() => {
      db.close();
      process.exit(0);
    }, 1000);

  } catch (error) {
    console.error('❌ Error importing data:', error);
    process.exit(1);
  }
};

importData();
