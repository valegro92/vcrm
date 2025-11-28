const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

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

  register: async (username, email, password, fullName) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, fullName })
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

  updateOpportunityStage: async (id, stage, probability) => {
    const response = await fetch(`${API_URL}/opportunities/${id}/stage`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ stage, probability })
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
  }
};

export default api;
