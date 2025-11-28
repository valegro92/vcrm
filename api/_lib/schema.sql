-- vCRM PostgreSQL Schema
-- Questo file contiene lo schema del database per Vercel/Neon PostgreSQL

-- Users table
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
);

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  value DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'Lead',
  avatar VARCHAR(10),
  "lastContact" DATE,
  notes TEXT,
  "userId" INTEGER REFERENCES users(id) ON DELETE SET NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Opportunities table
CREATE TABLE IF NOT EXISTS opportunities (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  value DECIMAL(10,2) DEFAULT 0,
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
);

-- Tasks table
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
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contacts_userId ON contacts("userId");
CREATE INDEX IF NOT EXISTS idx_opportunities_userId ON opportunities("userId");
CREATE INDEX IF NOT EXISTS idx_opportunities_contactId ON opportunities("contactId");
CREATE INDEX IF NOT EXISTS idx_tasks_userId ON tasks("userId");
CREATE INDEX IF NOT EXISTS idx_tasks_contactId ON tasks("contactId");
CREATE INDEX IF NOT EXISTS idx_tasks_opportunityId ON tasks("opportunityId");

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password, "fullName", avatar, role)
VALUES ('admin', 'admin@vcrm.local', '$2a$10$Z9jX5VqZ5Z5Z5Z5Z5Z5Z5uKq7dZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'Administrator', 'AD', 'admin')
ON CONFLICT (username) DO NOTHING;
