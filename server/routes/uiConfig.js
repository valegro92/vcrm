/**
 * UI Configuration API Routes
 * Manages per-user UI configurations for schema-driven UI
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getOne, runQuery } = require('../database/helpers');
const { DEFAULT_UI_CONFIG } = require('../config/defaultUIConfig');
const db = require('../database/db');

/**
 * GET /api/ui-config/me
 * Get current user's active UI configuration
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    let config = await getOne(
      'SELECT * FROM ui_configs WHERE "userId" = ? AND "isActive" = true',
      [userId]
    );

    if (!config) {
      return res.json({
        id: null,
        userId: userId,
        name: 'default',
        version: DEFAULT_UI_CONFIG.version,
        config: DEFAULT_UI_CONFIG,
        isDefault: true
      });
    }

    let parsedConfig = config.config;
    if (typeof parsedConfig === 'string') {
      parsedConfig = JSON.parse(parsedConfig);
    }

    res.json({
      id: config.id,
      userId: config.userId,
      name: config.name,
      version: config.version,
      config: parsedConfig,
      isDefault: false,
      updatedAt: config.updatedAt
    });

  } catch (error) {
    console.error('[UI Config] Error getting config:', error);
    res.status(500).json({ error: 'Errore nel recupero della configurazione' });
  }
});

/**
 * GET /api/ui-config/default
 * Get the default UI configuration
 */
router.get('/default', authMiddleware, (req, res) => {
  res.json({
    version: DEFAULT_UI_CONFIG.version,
    config: DEFAULT_UI_CONFIG
  });
});

/**
 * POST /api/ui-config
 * Create or update user's UI configuration
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { config, name = 'default' } = req.body;

    if (!config) {
      return res.status(400).json({ error: 'Config is required' });
    }

    if (!config.version || !config.theme || !config.pages) {
      return res.status(400).json({ error: 'Invalid config structure' });
    }

    const isPostgres = db.type === 'postgres';
    const configJson = isPostgres ? config : JSON.stringify(config);

    const existing = await getOne(
      'SELECT id FROM ui_configs WHERE "userId" = ? AND name = ?',
      [userId, name]
    );

    if (existing) {
      if (isPostgres) {
        await runQuery(
          'UPDATE ui_configs SET config = $1, version = $2, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $3',
          [configJson, config.version, existing.id]
        );
      } else {
        await runQuery(
          'UPDATE ui_configs SET config = ?, version = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
          [configJson, config.version, existing.id]
        );
      }
      res.json({ success: true, id: existing.id, action: 'updated' });
    } else {
      const query = isPostgres
        ? 'INSERT INTO ui_configs ("userId", name, version, config) VALUES ($1, $2, $3, $4) RETURNING id'
        : 'INSERT INTO ui_configs (userId, name, version, config) VALUES (?, ?, ?, ?)';

      const result = await runQuery(query, [userId, name, config.version, configJson]);
      const newId = result.lastID || (result.rows && result.rows[0]?.id);

      res.json({ success: true, id: newId, action: 'created' });
    }

  } catch (error) {
    console.error('[UI Config] Error saving config:', error);
    res.status(500).json({ error: 'Errore nel salvataggio della configurazione' });
  }
});

/**
 * PATCH /api/ui-config/theme
 * Update only theme settings
 */
router.patch('/theme', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { theme } = req.body;

    if (!theme) {
      return res.status(400).json({ error: 'Theme is required' });
    }

    let config = await getOne(
      'SELECT * FROM ui_configs WHERE "userId" = ? AND "isActive" = true',
      [userId]
    );

    let currentConfig = config
      ? (typeof config.config === 'string' ? JSON.parse(config.config) : config.config)
      : { ...DEFAULT_UI_CONFIG };

    currentConfig.theme = { ...currentConfig.theme, ...theme };

    const isPostgres = db.type === 'postgres';
    const configJson = isPostgres ? currentConfig : JSON.stringify(currentConfig);

    if (config) {
      if (isPostgres) {
        await runQuery(
          'UPDATE ui_configs SET config = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2',
          [configJson, config.id]
        );
      } else {
        await runQuery(
          'UPDATE ui_configs SET config = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
          [configJson, config.id]
        );
      }
    } else {
      const query = isPostgres
        ? 'INSERT INTO ui_configs ("userId", name, version, config) VALUES ($1, $2, $3, $4)'
        : 'INSERT INTO ui_configs (userId, name, version, config) VALUES (?, ?, ?, ?)';
      await runQuery(query, [userId, 'default', currentConfig.version, configJson]);
    }

    res.json({ success: true, theme: currentConfig.theme });

  } catch (error) {
    console.error('[UI Config] Error updating theme:', error);
    res.status(500).json({ error: 'Errore nell aggiornamento del tema' });
  }
});

/**
 * PATCH /api/ui-config/pages/:pageId/visibility
 * Toggle page visibility
 */
router.patch('/pages/:pageId/visibility', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { pageId } = req.params;
    const { visible } = req.body;

    if (typeof visible !== 'boolean') {
      return res.status(400).json({ error: 'visible must be a boolean' });
    }

    let config = await getOne(
      'SELECT * FROM ui_configs WHERE "userId" = ? AND "isActive" = true',
      [userId]
    );

    let currentConfig = config
      ? (typeof config.config === 'string' ? JSON.parse(config.config) : config.config)
      : { ...DEFAULT_UI_CONFIG };

    if (currentConfig.pages[pageId]) {
      currentConfig.pages[pageId].visible = visible;
    } else {
      return res.status(404).json({ error: 'Page not found' });
    }

    const isPostgres = db.type === 'postgres';
    const configJson = isPostgres ? currentConfig : JSON.stringify(currentConfig);

    if (config) {
      if (isPostgres) {
        await runQuery(
          'UPDATE ui_configs SET config = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2',
          [configJson, config.id]
        );
      } else {
        await runQuery(
          'UPDATE ui_configs SET config = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
          [configJson, config.id]
        );
      }
    } else {
      const query = isPostgres
        ? 'INSERT INTO ui_configs ("userId", name, version, config) VALUES ($1, $2, $3, $4)'
        : 'INSERT INTO ui_configs (userId, name, version, config) VALUES (?, ?, ?, ?)';
      await runQuery(query, [userId, 'default', currentConfig.version, configJson]);
    }

    res.json({ success: true, pageId, visible });

  } catch (error) {
    console.error('[UI Config] Error updating page visibility:', error);
    res.status(500).json({ error: 'Errore nell aggiornamento della visibilita' });
  }
});

/**
 * POST /api/ui-config/reset
 * Reset user's config to default
 */
router.post('/reset', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    await runQuery('DELETE FROM ui_configs WHERE "userId" = ?', [userId]);

    res.json({
      success: true,
      message: 'Configurazione resettata',
      config: DEFAULT_UI_CONFIG
    });

  } catch (error) {
    console.error('[UI Config] Error resetting config:', error);
    res.status(500).json({ error: 'Errore nel reset della configurazione' });
  }
});

/**
 * POST /api/ui-config/ai-generate
 * Generate UI config changes via AI based on natural language
 */
router.post('/ai-generate', authMiddleware, async (req, res) => {
  try {
    const { prompt, currentConfig } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (prompt.length > 500) {
      return res.status(400).json({ error: 'Prompt too long (max 500 characters)' });
    }

    console.log(`[AI Builder] Generating UI config for: "${prompt.substring(0, 50)}..."`);

    // Call AI to generate config changes
    const result = await generateUIConfigWithAI(prompt, currentConfig || DEFAULT_UI_CONFIG);

    if (result.success) {
      // Also save the changes to database
      const userId = req.userId;
      const updatedConfig = mergeConfigs(currentConfig || DEFAULT_UI_CONFIG, result.changes);

      const isPostgres = db.type === 'postgres';
      const configJson = isPostgres ? updatedConfig : JSON.stringify(updatedConfig);

      const existing = await getOne(
        'SELECT id FROM ui_configs WHERE "userId" = ? AND "isActive" = true',
        [userId]
      );

      if (existing) {
        if (isPostgres) {
          await runQuery(
            'UPDATE ui_configs SET config = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2',
            [configJson, existing.id]
          );
        } else {
          await runQuery(
            'UPDATE ui_configs SET config = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
            [configJson, existing.id]
          );
        }
      } else {
        const query = isPostgres
          ? 'INSERT INTO ui_configs ("userId", name, version, config) VALUES ($1, $2, $3, $4)'
          : 'INSERT INTO ui_configs (userId, name, version, config) VALUES (?, ?, ?, ?)';
        await runQuery(query, [userId, 'default', updatedConfig.version, configJson]);
      }

      res.json({
        success: true,
        changes: result.changes,
        description: result.description,
        model: result.model
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Errore nella generazione della configurazione'
      });
    }

  } catch (error) {
    console.error('[AI Builder] Error:', error);
    res.status(500).json({ error: 'Errore nella generazione AI' });
  }
});

/**
 * AI UI Config Generator
 */
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Models optimized for JSON generation
const AI_MODELS = [
  'google/gemini-2.0-flash-exp:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'deepseek/deepseek-chat-v3-0324:free',
  'qwen/qwq-32b:free'
];

const UI_BUILDER_PROMPT = `Sei un AI specializzato nella generazione di configurazioni UI per un'applicazione CRM.

L'utente descriverà in linguaggio naturale cosa vuole cambiare nell'interfaccia, e tu devi generare SOLO un oggetto JSON valido con le modifiche richieste.

SCHEMA CONFIGURAZIONE UI:
{
  "theme": {
    "mode": "light" | "dark",
    "primaryColor": "#hex6",
    "accentColor": "#hex6",
    "borderRadius": "none" | "small" | "medium" | "large",
    "density": "compact" | "normal" | "comfortable"
  },
  "navigation": {
    "position": "sidebar" | "top",
    "collapsed": boolean,
    "showLabels": boolean
  },
  "homePage": "dashboard" | "pipeline" | "contacts" | "tasks",
  "globalSettings": {
    "dateFormat": "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD",
    "currency": "EUR" | "USD" | "GBP",
    "language": "it" | "en"
  }
}

COLORI DISPONIBILI:
- Blu: #3b82f6 (primary), #60a5fa (light)
- Viola: #8b5cf6 (primary), #a78bfa (light)
- Verde: #10b981 (primary), #34d399 (light)
- Rosso: #ef4444 (primary), #f87171 (light)
- Arancione: #f97316 (primary), #fb923c (light)
- Rosa: #ec4899 (primary), #f472b6 (light)
- Indaco: #6366f1 (primary), #818cf8 (light)
- Teal: #14b8a6 (primary), #2dd4bf (light)
- Giallo: #eab308 (primary), #facc15 (light)

REGOLE:
1. Rispondi SOLO con JSON valido, nessun testo aggiuntivo
2. Includi SOLO le proprietà che devono cambiare
3. Per tema scuro usa mode: "dark", per chiaro mode: "light"
4. Usa colori hex validi a 6 cifre

CONFIGURAZIONE ATTUALE:
`;

async function generateUIConfigWithAI(userPrompt, currentConfig) {
  if (!OPENROUTER_API_KEY) {
    console.error('[AI Builder] OPENROUTER_API_KEY not set');
    return { success: false, error: 'API key non configurata' };
  }

  const systemPrompt = UI_BUILDER_PROMPT + JSON.stringify(currentConfig.theme, null, 2);

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Modifica la UI secondo questa richiesta: "${userPrompt}"\n\nRispondi SOLO con il JSON delle modifiche.` }
  ];

  for (let i = 0; i < AI_MODELS.length; i++) {
    const model = AI_MODELS[i];
    console.log(`[AI Builder] Trying model: ${model}`);

    try {
      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://vcrm.app',
          'X-Title': 'vCRM AI Builder'
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          max_tokens: 500,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        console.error(`[AI Builder] Model ${model} failed:`, response.status);
        continue;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        console.log(`[AI Builder] Empty response from ${model}`);
        continue;
      }

      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.log(`[AI Builder] No JSON found in response from ${model}`);
        continue;
      }

      try {
        const changes = JSON.parse(jsonMatch[0]);
        console.log(`[AI Builder] Success with ${model}:`, changes);

        // Generate description
        const description = generateDescription(changes);

        return {
          success: true,
          changes: changes,
          description: description,
          model: model
        };
      } catch (parseErr) {
        console.log(`[AI Builder] Invalid JSON from ${model}:`, parseErr.message);
        continue;
      }

    } catch (err) {
      console.error(`[AI Builder] Error with ${model}:`, err.message);
      continue;
    }
  }

  return { success: false, error: 'Nessun modello AI disponibile' };
}

function generateDescription(changes) {
  const parts = [];

  if (changes.theme) {
    if (changes.theme.mode) {
      parts.push(changes.theme.mode === 'dark' ? 'Tema scuro' : 'Tema chiaro');
    }
    if (changes.theme.primaryColor) {
      parts.push(`Colore primario: ${changes.theme.primaryColor}`);
    }
    if (changes.theme.density) {
      const densityMap = { compact: 'compatta', normal: 'normale', comfortable: 'spaziosa' };
      parts.push(`Densità ${densityMap[changes.theme.density]}`);
    }
    if (changes.theme.borderRadius) {
      const radiusMap = { none: 'nessuno', small: 'piccoli', medium: 'medi', large: 'grandi' };
      parts.push(`Bordi ${radiusMap[changes.theme.borderRadius]}`);
    }
  }

  return parts.length > 0 ? parts.join(', ') : 'Modifiche applicate';
}

function mergeConfigs(base, changes) {
  const result = JSON.parse(JSON.stringify(base));

  if (changes.theme) {
    result.theme = { ...result.theme, ...changes.theme };
  }
  if (changes.navigation) {
    result.navigation = { ...result.navigation, ...changes.navigation };
  }
  if (changes.homePage) {
    result.homePage = changes.homePage;
  }
  if (changes.globalSettings) {
    result.globalSettings = { ...result.globalSettings, ...changes.globalSettings };
  }

  return result;
}

module.exports = router;
