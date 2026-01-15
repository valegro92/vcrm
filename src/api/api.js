// API URL - usa sempre /api (il proxy di React in sviluppo inoltrerà a localhost:8080)
const API_URL = process.env.REACT_APP_API_URL || '/api';

const getAuthToken = () => {
  return localStorage.getItem('token');
};

const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
};

const api = {
  // Auth
  login: async (username, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return handleResponse(response);
  },

  register: async ({ email, password, fullName, company }) => {
    // Use email as username for simplicity
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: email,
        email,
        password,
        fullName,
        company
      })
    });
    return handleResponse(response);
  },

  // Contacts
  getContacts: async () => {
    const response = await fetch(`${API_URL}/contacts`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },

  getContact: async (id) => {
    const response = await fetch(`${API_URL}/contacts/${id}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },

  createContact: async (contactData) => {
    const response = await fetch(`${API_URL}/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(contactData)
    });
    return handleResponse(response);
  },

  updateContact: async (id, contactData) => {
    const response = await fetch(`${API_URL}/contacts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(contactData)
    });
    return handleResponse(response);
  },

  deleteContact: async (id) => {
    const response = await fetch(`${API_URL}/contacts/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },

  // Opportunities
  getOpportunities: async (year) => {
    const url = year ? `${API_URL}/opportunities?year=${year}` : `${API_URL}/opportunities`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },

  getOpportunity: async (id) => {
    const response = await fetch(`${API_URL}/opportunities/${id}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },

  createOpportunity: async (opportunityData) => {
    const response = await fetch(`${API_URL}/opportunities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(opportunityData)
    });
    return handleResponse(response);
  },

  updateOpportunity: async (id, opportunityData) => {
    const response = await fetch(`${API_URL}/opportunities/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(opportunityData)
    });
    return handleResponse(response);
  },

  deleteOpportunity: async (id) => {
    const response = await fetch(`${API_URL}/opportunities/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },

  updateOpportunityStage: async (id, stage, probability, expectedInvoiceDate, expectedPaymentDate) => {
    const body = { stage, probability };
    if (expectedInvoiceDate) body.expectedInvoiceDate = expectedInvoiceDate;
    if (expectedPaymentDate) body.expectedPaymentDate = expectedPaymentDate;

    const response = await fetch(`${API_URL}/opportunities/${id}/stage`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(body)
    });
    return handleResponse(response);
  },

  updateProjectStatus: async (id, projectStatus) => {
    const response = await fetch(`${API_URL}/opportunities/${id}/project-status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ projectStatus })
    });
    return handleResponse(response);
  },

  // Tasks
  getTasks: async () => {
    const response = await fetch(`${API_URL}/tasks`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },

  getTask: async (id) => {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },

  createTask: async (taskData) => {
    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(taskData)
    });
    return handleResponse(response);
  },

  updateTask: async (id, taskData) => {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(taskData)
    });
    return handleResponse(response);
  },

  deleteTask: async (id) => {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },

  toggleTask: async (id) => {
    const response = await fetch(`${API_URL}/tasks/${id}/toggle`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },

  // User Profile
  updateProfile: async (profileData) => {
    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(profileData)
    });
    return handleResponse(response);
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await fetch(`${API_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    return handleResponse(response);
  },

  // Stats
  getStats: async () => {
    const response = await fetch(`${API_URL}/stats`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },

  // Export
  exportData: async (format = 'json') => {
    const response = await fetch(`${API_URL}/export?format=${format}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },

  // Search
  globalSearch: async (query) => {
    const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },

  // Notifications
  getNotifications: async () => {
    const response = await fetch(`${API_URL}/notifications`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },

  markNotificationRead: async (id) => {
    const response = await fetch(`${API_URL}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },

  markAllNotificationsRead: async () => {
    const response = await fetch(`${API_URL}/notifications/read-all`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },

  // Notes (per contatti/opportunità)
  getNotes: async (entityType, entityId) => {
    const response = await fetch(`${API_URL}/notes?entityType=${entityType}&entityId=${entityId}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },

  createNote: async (noteData) => {
    const response = await fetch(`${API_URL}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(noteData)
    });
    return handleResponse(response);
  },

  deleteNote: async (id) => {
    const response = await fetch(`${API_URL}/notes/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },

  // Invoices (Scadenziario Fatture)
  getInvoices: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.type) params.append('type', filters.type);
    if (filters.opportunityId) params.append('opportunityId', filters.opportunityId);
    const url = params.toString() ? `${API_URL}/invoices?${params}` : `${API_URL}/invoices`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },

  getInvoiceStats: async () => {
    const response = await fetch(`${API_URL}/invoices/stats`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },

  getInvoice: async (id) => {
    const response = await fetch(`${API_URL}/invoices/${id}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },

  createInvoice: async (invoiceData) => {
    const response = await fetch(`${API_URL}/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(invoiceData)
    });
    return handleResponse(response);
  },

  updateInvoice: async (id, invoiceData) => {
    const response = await fetch(`${API_URL}/invoices/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(invoiceData)
    });
    return handleResponse(response);
  },

  updateInvoiceStatus: async (id, status, issueDate = null, paidDate = null) => {
    const response = await fetch(`${API_URL}/invoices/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ status, issueDate, paidDate })
    });
    return handleResponse(response);
  },

  deleteInvoice: async (id) => {
    const response = await fetch(`${API_URL}/invoices/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },

  // Targets (Target mensili)
  getMonthlyTargets: async (year) => {
    const response = await fetch(`${API_URL}/targets/${year}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },

  getAnnualTotal: async (year) => {
    const response = await fetch(`${API_URL}/targets/${year}/total`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },

  saveMonthlyTarget: async (year, month, target) => {
    const response = await fetch(`${API_URL}/targets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ year, month, target })
    });
    return handleResponse(response);
  },

  saveAllTargets: async (year, targets) => {
    const response = await fetch(`${API_URL}/targets/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ year, targets })
    });
    return handleResponse(response);
  },

  deleteTargets: async (year) => {
    const response = await fetch(`${API_URL}/targets/${year}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },

  // AI Chatbot
  sendChatMessage: async (message, conversationHistory = []) => {
    const response = await fetch(`${API_URL}/chatbot/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ message, conversationHistory })
    });
    return handleResponse(response);
  },

  getChatSuggestions: async () => {
    const response = await fetch(`${API_URL}/chatbot/suggestions`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },

  sendQuickQuery: async (queryType) => {
    const response = await fetch(`${API_URL}/chatbot/quick-query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ queryType })
    });
    return handleResponse(response);
  },

  // UI Configuration (Schema-driven UI)
  getUIConfig: async () => {
    const response = await fetch(`${API_URL}/ui-config/me`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },

  getDefaultUIConfig: async () => {
    const response = await fetch(`${API_URL}/ui-config/default`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },

  saveUIConfig: async (config, name = 'default') => {
    const response = await fetch(`${API_URL}/ui-config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ config, name })
    });
    return handleResponse(response);
  },

  updateUITheme: async (theme) => {
    const response = await fetch(`${API_URL}/ui-config/theme`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ theme })
    });
    return handleResponse(response);
  },

  togglePageVisibility: async (pageId, visible) => {
    const response = await fetch(`${API_URL}/ui-config/pages/${pageId}/visibility`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ visible })
    });
    return handleResponse(response);
  },

  resetUIConfig: async () => {
    const response = await fetch(`${API_URL}/ui-config/reset`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },

  // AI Builder - Generate UI Config via natural language
  generateUIConfig: async (prompt, currentConfig) => {
    const response = await fetch(`${API_URL}/ui-config/ai-generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ prompt, currentConfig })
    });
    return handleResponse(response);
  }
};

export default api;
