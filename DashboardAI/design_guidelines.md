# Zap Scale - Design Guidelines (Developer Data Tool Edition)

## Design Approach
**System**: Modern Developer Tool Pattern drawing from Retool, Observable, Hex, and Vercel Analytics
**Rationale**: Developer-focused data tool requiring clear component hierarchy, drag-and-drop functionality, live data visualization, and AI-assisted dashboard building

## Typography System
**Primary Font**: Inter (Google Fonts)
**Secondary Font**: JetBrains Mono (code snippets, data fields, SQL queries)

**Hierarchy**:
- Page Headlines: 28px/600 (Inter)
- Section Titles: 20px/600
- Component Labels: 16px/500
- Body Text: 14px/400
- Code/Data: 14px/400 (JetBrains Mono)
- Metrics Display: 36px/700 (JetBrains Mono)
- Small Labels: 12px/500

## Layout & Spacing System
**Tailwind Units**: 2, 4, 6, 8, 12, 16, 24

**Core Structure**:
- Collapsible Sidebar: 280px expanded (w-70), 64px collapsed, transitions smoothly
- Canvas Area: Full remaining width, min-height screen, background grid pattern (#1A1A1A with #252525 grid)
- Component Inspector: Right panel 320px when component selected, backdrop-blur overlay
- Top Toolbar: h-16 with breadcrumbs, AI assistant toggle, preview mode, publish button

## Component Library

### Main Navigation Sidebar
Dark sidebar (#0D0D0D) with collapsed/expanded states. Logo at top, navigation sections: Dashboards, Components, Data Sources, AI Assistant, Templates, Settings. Each item with Heroicons (outline style), purple indicator (#8B5CF6) for active state with subtle glow. Workspace switcher at bottom with avatar, workspace name, and plan badge.

### Canvas Builder Interface
Central drag-and-drop canvas with snap-to-grid (8px intervals). Background grid pattern visible (#252525 dots on #1A1A1A). Component palette sidebar: Chart components (Line, Bar, Pie, Area, Scatter), Data components (Table, KPI Card, Metric, List), Input components (Filter, Date Picker, Dropdown), Layout components (Container, Tabs, Accordion). Each palette item shows preview thumbnail and name. Dragging creates ghost outline with purple border.

### AI Assistant Panel
Floating panel (top-right) with chat interface. Toggle button in toolbar shows AI sparkle icon. Panel has gradient border (purple to blue), dark background (#1F1F1F), rounded-2xl. Chat messages in bubbles: user messages right-aligned (#2A2A2A), AI responses left-aligned with code blocks syntax highlighted. Quick actions: "Generate chart from data", "Suggest dashboard layout", "Write SQL query", "Explain metric". Input at bottom with send button and attachment for data upload.

### Component Inspector (Right Panel)
Slides in from right when component selected. Dark background (#1A1A1A), sections with collapsible headers: Data Source (dropdown to select connected API/database), Display Settings (tabs for styling, behavior, filters), Advanced Options (custom code, transformations). Each section uses accordion pattern. Live preview of changes. Apply/Cancel buttons at bottom.

### Dashboard Gallery
Grid layout (grid-cols-1 md:grid-cols-2 lg:grid-cols-3) showing dashboard templates and user dashboards. Each card: thumbnail preview (16:9 ratio), title, description, metadata (last updated, views), hover reveals "Use Template" or "Edit" button with backdrop-blur overlay. Filter tabs above: All, Analytics, Sales, Engineering, Custom. Search bar with AI-powered suggestions.

### Data Source Manager
Modal-style interface for connecting data sources. Left sidebar lists source types with icons (PostgreSQL, MySQL, REST API, GraphQL, CSV Upload, Google Sheets, Snowflake). Right panel shows connection form: credentials fields, test connection button, saved connections list. Each saved connection card shows status indicator (green dot for connected, red for error), edit/delete actions. Recent queries section below.

### Chart Components
Unified chart wrapper supporting multiple types. Configuration panel includes: Chart Type selector (visual icons), Data Mapping (X-axis, Y-axis dropdowns with auto-detect), Styling (color picker with preset palettes: purple/green/blue gradients), Axes & Labels, Legend Position. Charts use dark theme: background #1F1F1F, grid lines #2A2A2A, tooltips with backdrop-blur, purple (#8B5CF6) as primary data color, green (#10B981) for comparisons, blue (#3B82F6) for secondary metrics.

### KPI/Metric Cards
Compact stat displays in grid layouts. Structure: large number (JetBrains Mono, 36px), label below (14px), trend indicator (arrow icon + percentage in green/red), sparkline chart (optional, subtle purple gradient). Background #1F1F1F, border #2A2A2A, rounded-xl, p-6. Hover state lifts with shadow.

### Data Tables
Advanced table component with: column configuration (show/hide, reorder, resize), sorting (multi-column), filtering (per-column with dropdown), pagination, row selection (checkboxes), export actions (CSV, JSON). Header row sticky with dark background (#0D0D0D), rows alternate (#1A1A1A/#1F1F1F), cell padding px-4 py-3. Status cells use badge components, numeric cells right-aligned with JetBrains Mono.

### Filter Controls
Horizontal filter bar above dashboards: Date Range Picker (calendar dropdown with presets: Today, Last 7 days, Last 30 days, Custom), Dropdown Filters (multi-select with checkboxes), Search Input (icon-left, auto-suggest), Reset Filters button (ghost style). Applies filters globally to all connected components, shows active filter count badge.

### Template Cards
Feature-rich cards in gallery: large preview image (gradient backgrounds: purple-to-blue for Analytics, green-to-teal for Sales, orange-to-red for Engineering), category badge (top-left corner), title (20px/600), description (2 lines truncated), metadata row (creator avatar, date, view count with icons). "Preview" and "Use This" buttons on hover overlay with backdrop-blur.

### Code Editor Panel
Monaco editor integration for custom transformations. Dark theme (VS Code Dark+), syntax highlighting for JavaScript/SQL/Python. Toolbar: language selector, format code button, AI assist button ("Explain this code", "Optimize query"). Line numbers, minimap on right, error/warning indicators in gutter. Tabs for multiple files/queries.

### Top Toolbar
Fixed header (h-16, background #0D0D0D, border-b #2A2A2A): Breadcrumb navigation (Home > Dashboards > Sales Overview), center-aligned canvas controls (zoom in/out, fit to screen, grid toggle), right-aligned actions (AI Assistant toggle with badge for new suggestions, Preview mode switch, Share button, Publish button in green #10B981).

### Publish/Share Modal
Center modal with dark background (#1F1F1F), rounded-2xl, max-w-2xl. Tabs: Share Settings (public link toggle, password protection, expiry date), Embed Code (copyable iframe code with syntax highlighting), Export Options (PDF, PNG, interactive HTML). Preview thumbnail on right side. Copy link button with success toast feedback.

## Visual Effects
**Grid Pattern**: Canvas background uses subtle dot grid (#252525 on #1A1A1A), 8px spacing
**Component Borders**: Selected components show purple border (2px, #8B5CF6) with corner handles
**Drag States**: Ghost outline (dashed purple border) during drag, snap guides appear (solid purple lines)
**Hover Elevation**: Cards lift with shadow (0 8px 16px rgba(0,0,0,0.4))
**Backdrop Blur**: Overlays and floating panels use backdrop-blur-md for depth
**Transitions**: 200ms ease for panel slides, 150ms for hover states
**Focus Rings**: Purple ring (ring-2 ring-purple-500) on all interactive elements

## Chart Specifications
Use Recharts library for all visualizations. Color system: Primary gradient (purple #8B5CF6 to #A78BFA), Success gradient (green #10B981 to #34D399), Warning gradient (orange #F97316 to #FB923C), Info gradient (blue #3B82F6 to #60A5FA). Charts feature: dark grid (#2A2A2A), axis labels (#9CA3AF), tooltips with dark background (#1F1F1F) and backdrop-blur, smooth animations (400ms ease-out), responsive sizing.

## AI Features Integration
AI sparkle icon (Heroicons) throughout interface indicates AI-assisted features. Chat interface uses message bubbles with typing indicators (three animated dots). Code suggestions appear inline with purple highlight, accept/reject buttons. Generated dashboards show "AI Generated" badge. Query suggestions appear as floating chips below SQL editor. Natural language input fields have purple gradient border glow on focus.

## Images
**Template Previews**: Each template card requires 16:9 preview image showing sample dashboard with realistic data visualizations
**Empty States**: Illustrations for "No dashboards yet" (developer working on screen), "No data sources" (database connection icon), "AI waiting" (robot assistant)
**Hero Section**: Landing page hero shows animated dashboard builder interface preview with gradient background (purple-to-blue)

## Accessibility
All interactive canvas elements have keyboard navigation (Tab to move, Space to select, Arrow keys to reposition). Drag-and-drop includes keyboard alternative (select + arrow keys). Color-blind safe palette for charts (use patterns in addition to colors). Focus indicators (2px purple ring) on all controls. Screen reader announcements for AI responses and data updates. Minimum contrast 4.5:1 for all text (#F9FAFB primary, #D1D5DB secondary, #9CA3AF tertiary).