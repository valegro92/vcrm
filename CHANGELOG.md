# Changelog

All notable changes to VAIB will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2024-01-15

### Added
- **AI Builder** - Personalizza l'interfaccia con linguaggio naturale
- **AI Chatbot** - Interroga i tuoi dati con domande naturali
- **Schema-Driven UI** - Configurazione UI per-user persistente
- **Expanded UI Config Schema v2.0**
  - Dashboard layout customization
  - Table column visibility
  - Navigation menu customization
  - Font size and density options
- **Quick Actions** - Suggerimenti rapidi nel AI Builder
- **Reset to Defaults** - Ripristina configurazione originale

### Changed
- Moved AI Builder from floating button to Settings tab
- Improved OpenRouter integration with 10 free model fallbacks
- Better error handling in AI responses
- Cleaner Settings UI design

### Fixed
- API key exposure in git history (rotated)
- Z-index conflicts with bottom navigation

## [1.5.0] - 2024-01-10

### Added
- Projects module with Kanban board
- Invoices management with status tracking
- Forfettario limit tracker (€85,000)
- Calendar view for tasks

### Changed
- Migrated from SQLite to PostgreSQL
- Improved mobile responsiveness

## [1.0.0] - 2024-01-01

### Added
- Initial release
- Dashboard with KPIs
- Pipeline Kanban view
- Contacts management
- Opportunities CRUD
- Tasks management
- User authentication (JWT)
- Dark/Light theme toggle

---

[2.0.0]: https://github.com/valegro92/vcrm/compare/v1.5.0...v2.0.0
[1.5.0]: https://github.com/valegro92/vcrm/compare/v1.0.0...v1.5.0
[1.0.0]: https://github.com/valegro92/vcrm/releases/tag/v1.0.0
