/**
 * AI Chatbot Service for vCRM
 * Integrates with OpenRouter to provide intelligent CRM assistance
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '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';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Free models with fallback - ordered by preference
const FREE_MODELS = [
    'deepseek/deepseek-r1:free',
    'google/gemini-2.0-flash-exp:free',
    'meta-llama/llama-4-maverick:free',
    'qwen/qwen-2.5-72b-instruct:free',
    'mistralai/mistral-small-3.1-24b-instruct:free',
    'deepseek/deepseek-chat:free',
    'google/gemini-2.5-flash-preview-05-20:free'
];

/**
 * Build CRM context from user data
 */
function buildCRMContext(data) {
    const { contacts, opportunities, tasks, invoices } = data;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Calculate key metrics
    const totalContacts = contacts?.length || 0;
    const clienti = contacts?.filter(c => c.status === 'Cliente').length || 0;
    const prospects = contacts?.filter(c => c.status === 'Prospect').length || 0;

    // Opportunities analysis
    const wonOpportunities = opportunities?.filter(o => o.stage === 'won') || [];
    const openOpportunities = opportunities?.filter(o => !['won', 'lost'].includes(o.stage)) || [];
    const totalPipeline = openOpportunities.reduce((sum, o) => sum + (parseFloat(o.value) || 0), 0);
    const wonValue = wonOpportunities.reduce((sum, o) => sum + (parseFloat(o.value) || 0), 0);

    // Invoice analysis
    const allInvoices = invoices || [];
    const paidInvoices = allInvoices.filter(i => i.status === 'paid');
    const pendingInvoices = allInvoices.filter(i => i.status === 'pending');
    const overdueInvoices = allInvoices.filter(i => i.status === 'overdue');

    // Current year invoicing (forfettario - based on paidDate for cash basis)
    const currentYearPaid = paidInvoices.filter(i => {
        const paidDate = i.paidDate ? new Date(i.paidDate) : null;
        return paidDate && paidDate.getFullYear() === currentYear;
    });
    const currentYearTotal = currentYearPaid.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);

    // Monthly breakdown for current year
    const monthlyBreakdown = {};
    for (let m = 0; m <= currentMonth; m++) {
        const monthInvoices = currentYearPaid.filter(i => {
            const paidDate = new Date(i.paidDate);
            return paidDate.getMonth() === m;
        });
        const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
                           'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
        monthlyBreakdown[monthNames[m]] = monthInvoices.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
    }

    // Tasks analysis
    const allTasks = tasks || [];
    const pendingTasks = allTasks.filter(t => t.status !== 'completed');
    const overdueTasks = pendingTasks.filter(t => {
        if (!t.dueDate) return false;
        return new Date(t.dueDate) < now;
    });
    const highPriorityTasks = pendingTasks.filter(t => t.priority === 'high');

    // Projects (won opportunities with project status)
    const projects = wonOpportunities;
    const projectsInProgress = projects.filter(p => p.projectStatus === 'in_lavorazione' || !p.projectStatus);
    const projectsInReview = projects.filter(p => p.projectStatus === 'in_revisione');
    const projectsDelivered = projects.filter(p => p.projectStatus === 'consegnato');
    const projectsClosed = projects.filter(p => p.projectStatus === 'chiuso');

    // Forfettario limit tracking (85K)
    const forfettarioLimit = 85000;
    const remainingBudget = forfettarioLimit - currentYearTotal;
    const percentageUsed = ((currentYearTotal / forfettarioLimit) * 100).toFixed(1);

    // Build context string
    return `
## CONTESTO CRM ATTUALE (Dati in tempo reale)

### Regime Forfettario
- Limite annuale: €85.000
- Fatturato ${currentYear} (incassato): €${currentYearTotal.toLocaleString('it-IT')}
- Budget rimanente: €${remainingBudget.toLocaleString('it-IT')}
- Percentuale utilizzata: ${percentageUsed}%

### Fatturazione Mensile ${currentYear}
${Object.entries(monthlyBreakdown).map(([month, value]) => `- ${month}: €${value.toLocaleString('it-IT')}`).join('\n')}

### Fatture
- Totale fatture: ${allInvoices.length}
- Pagate: ${paidInvoices.length} (€${paidInvoices.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0).toLocaleString('it-IT')})
- In attesa: ${pendingInvoices.length} (€${pendingInvoices.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0).toLocaleString('it-IT')})
- Scadute: ${overdueInvoices.length} (€${overdueInvoices.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0).toLocaleString('it-IT')})

### Contatti
- Totale: ${totalContacts}
- Clienti attivi: ${clienti}
- Prospects: ${prospects}
- Lead: ${totalContacts - clienti - prospects}

### Pipeline Commerciale
- Opportunità aperte: ${openOpportunities.length}
- Valore pipeline: €${totalPipeline.toLocaleString('it-IT')}
- Opportunità vinte: ${wonOpportunities.length}
- Valore vinto: €${wonValue.toLocaleString('it-IT')}

### Progetti Attivi
- In lavorazione: ${projectsInProgress.length}
- In revisione: ${projectsInReview.length}
- Consegnati: ${projectsDelivered.length}
- Chiusi: ${projectsClosed.length}

### Attività
- Task pendenti: ${pendingTasks.length}
- Task scaduti: ${overdueTasks.length}
- Alta priorità: ${highPriorityTasks.length}

### Lista Progetti Attivi
${projectsInProgress.slice(0, 5).map(p => `- "${p.title}" - ${p.company || 'N/A'} - €${(p.value || 0).toLocaleString('it-IT')}`).join('\n') || 'Nessun progetto attivo'}

### Task Urgenti
${overdueTasks.slice(0, 5).map(t => `- "${t.title}" - Scaduto il ${new Date(t.dueDate).toLocaleDateString('it-IT')}`).join('\n') || 'Nessun task scaduto'}

### Fatture In Attesa
${pendingInvoices.slice(0, 5).map(i => `- ${i.invoiceNumber || 'N/A'} - ${i.clientName || 'N/A'} - €${(i.amount || 0).toLocaleString('it-IT')} - Scade: ${i.dueDate ? new Date(i.dueDate).toLocaleDateString('it-IT') : 'N/A'}`).join('\n') || 'Nessuna fattura in attesa'}
`;
}

/**
 * System prompt for the AI assistant
 */
const SYSTEM_PROMPT = `Sei l'assistente AI di vCRM, un sistema CRM/PM progettato per freelancer italiani in regime forfettario.

Il tuo ruolo è:
1. Rispondere a domande sui dati del CRM (fatture, contatti, opportunità, progetti, task)
2. Fornire analisi e insights sui dati
3. Dare suggerimenti per migliorare il business
4. Aiutare l'utente a navigare e usare il software
5. Ricordare scadenze e task importanti

Regole importanti:
- Rispondi SEMPRE in italiano
- Sii conciso ma completo
- Usa i dati reali forniti nel contesto
- Per il regime forfettario: il fatturato conta sulla DATA DI INCASSO (paidDate), non sulla data fattura
- Il limite forfettario è €85.000 annui
- Quando dai cifre, formattale in italiano (es: €1.234,56)
- Se non hai dati sufficienti per rispondere, dillo chiaramente
- Suggerisci azioni concrete quando appropriato

Funzionalità del software che puoi spiegare:
- Dashboard: panoramica KPI e metriche
- Pipeline: gestione opportunità commerciali (Lead → Contatto → Proposta → Negoziazione → Vinto/Perso)
- Contatti: gestione clienti, prospects, lead
- Progetti: gestione progetti vinti (In Lavorazione → In Revisione → Consegnato → Chiuso)
- Attività: task con priorità e scadenze
- Scadenziario Fatture: tracking fatture con stato forfettario
- Calendario: vista calendario attività`;

/**
 * Call OpenRouter API with fallback
 */
async function callOpenRouter(messages, modelIndex = 0) {
    if (modelIndex >= FREE_MODELS.length) {
        throw new Error('Tutti i modelli AI sono temporaneamente non disponibili. Riprova tra qualche minuto.');
    }

    const model = FREE_MODELS[modelIndex];
    console.log(`[AI Chatbot] Trying model: ${model}`);

    try {
        const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'https://vcrm.app',
                'X-Title': 'vCRM Assistant'
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                max_tokens: 1500,
                temperature: 0.7,
                top_p: 0.9
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error(`[AI Chatbot] Model ${model} failed:`, response.status, errorData);

            // Try next model
            if (response.status === 429 || response.status === 503 || response.status === 500) {
                console.log(`[AI Chatbot] Falling back to next model...`);
                return callOpenRouter(messages, modelIndex + 1);
            }

            throw new Error(errorData.error?.message || `API error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.choices || !data.choices[0]?.message?.content) {
            console.log(`[AI Chatbot] Empty response from ${model}, trying next...`);
            return callOpenRouter(messages, modelIndex + 1);
        }

        console.log(`[AI Chatbot] Success with model: ${model}`);
        return {
            content: data.choices[0].message.content,
            model: model,
            usage: data.usage
        };

    } catch (error) {
        console.error(`[AI Chatbot] Error with ${model}:`, error.message);

        // Network error or timeout - try next model
        if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.name === 'AbortError') {
            return callOpenRouter(messages, modelIndex + 1);
        }

        // For other errors, try next model too
        if (modelIndex < FREE_MODELS.length - 1) {
            return callOpenRouter(messages, modelIndex + 1);
        }

        throw error;
    }
}

/**
 * Main chat function
 */
async function chat(userMessage, crmData, conversationHistory = []) {
    // Build CRM context
    const crmContext = buildCRMContext(crmData);

    // Build messages array
    const messages = [
        {
            role: 'system',
            content: SYSTEM_PROMPT + '\n\n' + crmContext
        },
        ...conversationHistory.slice(-10), // Keep last 10 messages for context
        {
            role: 'user',
            content: userMessage
        }
    ];

    try {
        const result = await callOpenRouter(messages);
        return {
            success: true,
            message: result.content,
            model: result.model,
            usage: result.usage
        };
    } catch (error) {
        console.error('[AI Chatbot] Chat error:', error);
        return {
            success: false,
            message: `Mi dispiace, si è verificato un errore: ${error.message}`,
            error: error.message
        };
    }
}

/**
 * Get quick suggestions based on CRM data
 */
function getQuickSuggestions(crmData) {
    const suggestions = [];
    const { tasks, invoices, opportunities } = crmData;

    // Check overdue tasks
    const overdueTasks = (tasks || []).filter(t => {
        if (t.status === 'completed' || !t.dueDate) return false;
        return new Date(t.dueDate) < new Date();
    });
    if (overdueTasks.length > 0) {
        suggestions.push({
            type: 'warning',
            text: `Hai ${overdueTasks.length} task scaduti`,
            action: 'Mostra task scaduti'
        });
    }

    // Check overdue invoices
    const overdueInvoices = (invoices || []).filter(i => i.status === 'overdue');
    if (overdueInvoices.length > 0) {
        const total = overdueInvoices.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
        suggestions.push({
            type: 'danger',
            text: `${overdueInvoices.length} fatture scadute (€${total.toLocaleString('it-IT')})`,
            action: 'Mostra fatture scadute'
        });
    }

    // Check pipeline value
    const openOpps = (opportunities || []).filter(o => !['won', 'lost'].includes(o.stage));
    if (openOpps.length > 0) {
        const pipelineValue = openOpps.reduce((s, o) => s + (parseFloat(o.value) || 0), 0);
        suggestions.push({
            type: 'info',
            text: `Pipeline attiva: €${pipelineValue.toLocaleString('it-IT')}`,
            action: 'Analizza pipeline'
        });
    }

    // Forfettario check
    const currentYear = new Date().getFullYear();
    const paidThisYear = (invoices || []).filter(i => {
        if (i.status !== 'paid' || !i.paidDate) return false;
        return new Date(i.paidDate).getFullYear() === currentYear;
    });
    const yearTotal = paidThisYear.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
    const remaining = 85000 - yearTotal;

    if (remaining < 10000) {
        suggestions.push({
            type: 'warning',
            text: `Attenzione: solo €${remaining.toLocaleString('it-IT')} rimasti nel limite forfettario`,
            action: 'Analizza forfettario'
        });
    }

    return suggestions;
}

module.exports = {
    chat,
    getQuickSuggestions,
    buildCRMContext,
    FREE_MODELS
};
