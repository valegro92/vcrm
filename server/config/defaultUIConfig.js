/**
 * Default UI Configuration for vCRM
 * This represents the current UI structure
 * Version 1.0 - Base configuration
 */

const DEFAULT_UI_CONFIG = {
  version: "2.0",

  theme: {
    mode: "light",
    primaryColor: "#6366f1",
    accentColor: "#8b5cf6",
    borderRadius: "medium",      // none, small, medium, large
    density: "normal",            // compact, normal, comfortable
    fontSize: "medium",           // small, medium, large
    fontFamily: "system"          // system, inter, roboto
  },

  navigation: {
    position: "sidebar",          // sidebar, top
    collapsed: false,
    showLabels: true,
    showIcons: true,
    visibleItems: ["dashboard", "pipeline", "contacts", "opportunities", "projects", "tasks", "invoices", "calendar", "settings"]
  },

  homePage: "dashboard",

  dashboard: {
    layout: "default",            // default, compact, minimal
    visibleCards: ["kpi", "forfettario", "activities", "pipeline-mini"],
    cardOrder: ["kpi", "forfettario", "activities", "pipeline-mini"],
    kpiCards: ["revenue", "pipeline", "contacts", "tasks"]
  },

  tables: {
    contacts: {
      visibleColumns: ["name", "company", "email", "phone", "type", "value"],
      sortBy: "name",
      sortOrder: "asc"
    },
    opportunities: {
      visibleColumns: ["title", "company", "value", "stage", "probability", "closeDate"],
      sortBy: "value",
      sortOrder: "desc"
    },
    tasks: {
      visibleColumns: ["title", "dueDate", "priority", "status", "contact"],
      sortBy: "dueDate",
      sortOrder: "asc"
    },
    invoices: {
      visibleColumns: ["number", "client", "amount", "status", "dueDate"],
      sortBy: "dueDate",
      sortOrder: "desc"
    }
  },

  quickActions: {
    enabled: true,
    items: ["add-contact", "add-task", "add-opportunity"]
  },
  
  pages: {
    dashboard: {
      id: "dashboard",
      name: "Dashboard",
      icon: "LayoutDashboard",
      visible: true,
      order: 1,
      sections: [
        { id: "kpi-row", type: "stats-row", visible: true, order: 1, config: { stats: ["revenue", "pipeline", "contacts", "tasks"] } },
        { id: "forfettario-tracker", type: "progress-card", title: "Stato Forfettario", visible: true, order: 2, config: { showLimit: true, limit: 85000 } },
        { id: "recent-activities", type: "list", title: "Attivita Recenti", visible: true, order: 3, dataSource: "tasks", config: { limit: 5, filter: "upcoming" } }
      ]
    },
    pipeline: {
      id: "pipeline",
      name: "Pipeline",
      icon: "TrendingUp",
      visible: true,
      order: 2,
      sections: [
        { id: "pipeline-kanban", type: "kanban", visible: true, order: 1, dataSource: "opportunities", config: { stages: ["Lead", "Contatto", "Proposta", "Negoziazione", "Vinto", "Perso"], showValue: true } }
      ]
    },
    contacts: {
      id: "contacts",
      name: "Contatti",
      icon: "Users",
      visible: true,
      order: 3,
      sections: [
        { id: "contacts-kpi", type: "stats-row", visible: true, order: 1, config: { stats: ["total", "clients", "prospects", "value"] } },
        { id: "contacts-grid", type: "card-grid", visible: true, order: 2, dataSource: "contacts", config: { showAvatar: true, showValue: true } }
      ]
    },
    opportunities: {
      id: "opportunities",
      name: "Opportunita",
      icon: "Briefcase",
      visible: true,
      order: 4,
      sections: [
        { id: "opportunities-table", type: "table", visible: true, order: 1, dataSource: "opportunities", config: { columns: ["title", "company", "value", "stage", "probability", "closeDate"] } }
      ]
    },
    projects: {
      id: "projects",
      name: "Progetti",
      icon: "FolderKanban",
      visible: true,
      order: 5,
      sections: [
        { id: "projects-kanban", type: "kanban", visible: true, order: 1, dataSource: "projects", config: { stages: ["in_lavorazione", "in_revisione", "consegnato", "chiuso"] } }
      ]
    },
    tasks: {
      id: "tasks",
      name: "Attivita",
      icon: "CheckSquare",
      visible: true,
      order: 6,
      sections: [
        { id: "tasks-list", type: "task-list", visible: true, order: 1, dataSource: "tasks", config: { groupBy: "status", showPriority: true } }
      ]
    },
    invoices: {
      id: "invoices",
      name: "Fatture",
      icon: "Receipt",
      visible: true,
      order: 7,
      sections: [
        { id: "invoices-kanban", type: "kanban", visible: true, order: 1, dataSource: "invoices", config: { stages: ["da_emettere", "emessa", "inviata", "pagata"] } }
      ]
    },
    calendar: {
      id: "calendar",
      name: "Calendario",
      icon: "Calendar",
      visible: true,
      order: 8,
      sections: [
        { id: "calendar-view", type: "calendar", visible: true, order: 1, dataSource: "tasks", config: { defaultView: "month" } }
      ]
    },
    settings: {
      id: "settings",
      name: "Impostazioni",
      icon: "Settings",
      visible: true,
      order: 99,
      sections: []
    }
  },
  
  globalSettings: {
    dateFormat: "DD/MM/YYYY",
    currency: "EUR",
    language: "it",
    forfettarioLimit: 85000,
    showAIChat: true
  }
};

module.exports = { DEFAULT_UI_CONFIG };
