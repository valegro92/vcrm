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

module.exports = router;
