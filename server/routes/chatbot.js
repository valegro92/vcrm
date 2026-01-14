/**
 * AI Chatbot API Routes
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const aiChatbot = require('../services/aiChatbot');
const { getAll } = require('../database/helpers');

/**
 * POST /api/chatbot/message
 * Send a message to the AI chatbot
 */
router.post('/message', authMiddleware, async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;
        const userId = req.userId;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Message is required' });
        }

        if (message.length > 2000) {
            return res.status(400).json({ error: 'Message too long (max 2000 characters)' });
        }

        console.log(`[Chatbot] User ${userId} asked: "${message.substring(0, 100)}..."`);

        // Fetch all CRM data for context
        const [contacts, opportunities, tasks, invoices] = await Promise.all([
            getAll('SELECT * FROM contacts WHERE "userId" = ? OR "userId" IS NULL', [userId]),
            getAll('SELECT * FROM opportunities WHERE "userId" = ? OR "userId" IS NULL', [userId]),
            getAll('SELECT * FROM tasks WHERE "userId" = ? OR "userId" IS NULL', [userId]),
            getAll('SELECT * FROM invoices WHERE "userId" = ? OR "userId" IS NULL', [userId])
        ]);

        const crmData = { contacts, opportunities, tasks, invoices };

        // Call AI chatbot
        const result = await aiChatbot.chat(message, crmData, conversationHistory);

        console.log(`[Chatbot] Response from ${result.model || 'unknown'}: ${result.success ? 'success' : 'failed'}`);

        res.json({
            success: result.success,
            message: result.message,
            model: result.model,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('[Chatbot] Error:', error);
        res.status(500).json({
            success: false,
            error: 'Errore interno del server',
            message: 'Mi dispiace, si è verificato un errore. Riprova tra qualche momento.'
        });
    }
});

/**
 * GET /api/chatbot/suggestions
 * Get quick suggestions based on CRM data
 */
router.get('/suggestions', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;

        const [contacts, opportunities, tasks, invoices] = await Promise.all([
            getAll('SELECT * FROM contacts WHERE "userId" = ? OR "userId" IS NULL', [userId]),
            getAll('SELECT * FROM opportunities WHERE "userId" = ? OR "userId" IS NULL', [userId]),
            getAll('SELECT * FROM tasks WHERE "userId" = ? OR "userId" IS NULL', [userId]),
            getAll('SELECT * FROM invoices WHERE "userId" = ? OR "userId" IS NULL', [userId])
        ]);

        const crmData = { contacts, opportunities, tasks, invoices };
        const suggestions = aiChatbot.getQuickSuggestions(crmData);

        res.json({ suggestions });

    } catch (error) {
        console.error('[Chatbot] Suggestions error:', error);
        res.status(500).json({ error: 'Errore nel recupero dei suggerimenti' });
    }
});

/**
 * GET /api/chatbot/models
 * Get available AI models
 */
router.get('/models', authMiddleware, (req, res) => {
    res.json({
        models: aiChatbot.FREE_MODELS,
        count: aiChatbot.FREE_MODELS.length
    });
});

/**
 * POST /api/chatbot/quick-query
 * Predefined quick queries
 */
router.post('/quick-query', authMiddleware, async (req, res) => {
    try {
        const { queryType } = req.body;
        const userId = req.userId;

        const quickQueries = {
            'fatturato-anno': 'Quanto ho fatturato quest\'anno? Dammi il dettaglio mensile.',
            'budget-rimasto': 'Quanto budget forfettario mi rimane per quest\'anno?',
            'task-urgenti': 'Quali sono i miei task più urgenti?',
            'fatture-scadute': 'Ho fatture scadute? Se sì, quali?',
            'pipeline-status': 'Com\'è la mia pipeline commerciale?',
            'progetti-attivi': 'Quali progetti ho in corso?',
            'riepilogo-generale': 'Dammi un riepilogo generale della mia situazione business.',
            'prossime-scadenze': 'Quali sono le prossime scadenze importanti?'
        };

        const message = quickQueries[queryType];
        if (!message) {
            return res.status(400).json({ error: 'Query type not found' });
        }

        // Fetch CRM data
        const [contacts, opportunities, tasks, invoices] = await Promise.all([
            getAll('SELECT * FROM contacts WHERE "userId" = ? OR "userId" IS NULL', [userId]),
            getAll('SELECT * FROM opportunities WHERE "userId" = ? OR "userId" IS NULL', [userId]),
            getAll('SELECT * FROM tasks WHERE "userId" = ? OR "userId" IS NULL', [userId]),
            getAll('SELECT * FROM invoices WHERE "userId" = ? OR "userId" IS NULL', [userId])
        ]);

        const crmData = { contacts, opportunities, tasks, invoices };
        const result = await aiChatbot.chat(message, crmData, []);

        res.json({
            success: result.success,
            query: message,
            message: result.message,
            model: result.model,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('[Chatbot] Quick query error:', error);
        res.status(500).json({ error: 'Errore nella query rapida' });
    }
});

module.exports = router;
