const bcrypt = require('bcryptjs');
const db = require('../database/db');
const { createTables } = require('../database/schema');

const initializeDatabase = async () => {
  try {
    console.log('Creating tables...');
    await createTables();

    // Create default user
    const hashedPassword = await bcrypt.hash('admin123', 10);

    db.run(`
      INSERT OR IGNORE INTO users (username, email, password, fullName, avatar, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `, ['admin', 'admin@vcrm.it', hashedPassword, 'Amministratore', 'AD', 'admin'], (err) => {
      if (err) {
        console.error('Error creating default user:', err);
      } else {
        console.log('Default user created (username: admin, password: admin123)');
      }
    });

    // Insert sample contacts
    const contacts = [
      { name: 'Marco Rossi', company: 'Tech Solutions Srl', email: 'marco.rossi@techsol.it', phone: '+39 02 1234567', value: 45000, status: 'Cliente', avatar: 'MR', lastContact: '2024-01-15' },
      { name: 'Laura Bianchi', company: 'Digital Agency SpA', email: 'l.bianchi@digitalagency.it', phone: '+39 06 7654321', value: 32000, status: 'Lead', avatar: 'LB', lastContact: '2024-01-18' },
      { name: 'Giuseppe Verdi', company: 'Innovate Corp', email: 'g.verdi@innovate.it', phone: '+39 011 9876543', value: 78000, status: 'Prospect', avatar: 'GV', lastContact: '2024-01-20' },
      { name: 'Anna Ferrari', company: 'Smart Systems', email: 'anna.ferrari@smartsys.it', phone: '+39 055 1472583', value: 25000, status: 'Cliente', avatar: 'AF', lastContact: '2024-01-22' },
      { name: 'Paolo Colombo', company: 'Future Tech', email: 'p.colombo@futuretech.it', phone: '+39 041 3698521', value: 55000, status: 'Lead', avatar: 'PC', lastContact: '2024-01-23' }
    ];

    contacts.forEach(contact => {
      db.run(`
        INSERT OR IGNORE INTO contacts (name, company, email, phone, value, status, avatar, lastContact, userId)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
      `, [contact.name, contact.company, contact.email, contact.phone, contact.value, contact.status, contact.avatar, contact.lastContact]);
    });

    // Insert sample opportunities
    const opportunities = [
      { title: 'Implementazione ERP', company: 'Tech Solutions Srl', value: 85000, stage: 'Lead', probability: 10, closeDate: '2024-03-15', owner: 'Mario Neri', openDate: '2024-01-10' },
      { title: 'Migrazione Cloud', company: 'Digital Agency SpA', value: 42000, stage: 'In contatto', probability: 20, closeDate: '2024-02-28', owner: 'Sara Blu', openDate: '2024-01-12' },
      { title: 'Consulenza AI', company: 'Innovate Corp', value: 65000, stage: 'Follow Up da fare', probability: 40, closeDate: '2024-02-15', owner: 'Mario Neri', openDate: '2024-01-05' },
      { title: 'Sistema CRM', company: 'Smart Systems', value: 38000, stage: 'Chiuso Vinto', probability: 100, closeDate: '2024-01-25', owner: 'Sara Blu', openDate: '2024-01-08', originalStage: 'Chiuso Vinto' },
      { title: 'Automazione Marketing', company: 'Future Tech', value: 28000, stage: 'Lead', probability: 10, closeDate: '2024-04-01', owner: 'Mario Neri', openDate: '2024-01-20' }
    ];

    opportunities.forEach(opp => {
      db.run(`
        INSERT OR IGNORE INTO opportunities (title, company, value, stage, probability, closeDate, owner, userId, openDate, originalStage)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
      `, [opp.title, opp.company, opp.value, opp.stage, opp.probability, opp.closeDate, opp.owner, opp.openDate, opp.originalStage || null]);
    });

    // Insert sample tasks
    const tasks = [
      { title: 'Follow-up chiamata Tech Solutions', type: 'Chiamata', priority: 'Alta', dueDate: '2024-01-25', status: 'Da fare' },
      { title: 'Preparare proposta Digital Agency', type: 'Documento', priority: 'Alta', dueDate: '2024-01-26', status: 'In corso' },
      { title: 'Demo prodotto Innovate Corp', type: 'Meeting', priority: 'Media', dueDate: '2024-01-28', status: 'Da fare' },
      { title: 'Inviare contratto Smart Systems', type: 'Email', priority: 'Alta', dueDate: '2024-01-24', status: 'Completata' },
      { title: 'Revisione offerta Future Tech', type: 'Documento', priority: 'Bassa', dueDate: '2024-01-30', status: 'Da fare' }
    ];

    tasks.forEach(task => {
      db.run(`
        INSERT OR IGNORE INTO tasks (title, type, priority, dueDate, status, userId)
        VALUES (?, ?, ?, ?, ?, 1)
      `, [task.title, task.type, task.priority, task.dueDate, task.status]);
    });

    console.log('Database initialized with sample data');

    setTimeout(() => {
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        } else {
          console.log('Database connection closed');
        }
        process.exit(0);
      });
    }, 1000);

  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

initializeDatabase();
