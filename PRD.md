# Life Stone Indonesia ERP Admin - Product Requirements Document

Build a production-ready ERP Admin system for Life Stone Indonesia with hideable sidebar and standardized tabular lists across all modules.

**Experience Qualities**:
1. **Professional** - Clean, business-focused interface that conveys reliability and efficiency
2. **Intuitive** - Navigation and workflows should feel natural to users familiar with enterprise software
3. **Responsive** - Seamless experience across desktop, tablet, and mobile devices

**Complexity Level**: Complex Application (advanced functionality, accounts)
- Full ERP system with multiple interconnected modules, user management, role-based permissions, audit trails, and comprehensive data management across all business functions.

## Essential Features

### Hideable Sidebar Navigation
- **Functionality**: Three-state sidebar (expanded, collapsed, hidden) with persistent state
- **Purpose**: Maximize screen real estate while maintaining quick access to all modules
- **Trigger**: Hamburger menu, chevron controls, keyboard shortcuts (Ctrl/Cmd+B, [, ])
- **Progression**: Click hamburger → sidebar toggles between hidden/expanded → click chevron → toggles expanded/collapsed → keyboard shortcuts cycle states
- **Success criteria**: State persists across sessions, smooth 200ms transitions, mobile drawer behavior

### Standardized Tabular Lists
- **Functionality**: Consistent data table design across all modules with server-side pagination, sorting, filtering
- **Purpose**: Unified user experience and efficient data management across all business entities
- **Trigger**: Navigate to any module list page
- **Progression**: Load page → see header with title/actions → interact with search/filters → view paginated results → perform actions
- **Success criteria**: All lists match screenshot design, URL state persistence, Excel export/import functionality

### Modal Forms System
- **Functionality**: Right sheet for Create/Edit, centered dialog for View, all deep-linkable via URL
- **Purpose**: Consistent form experience without page navigation disruption
- **Trigger**: Click Create button, edit row, view row, or direct URL access
- **Progression**: Click action → modal opens → fill form → save → validation → success toast → list refresh → modal closes
- **Success criteria**: Deep linking works, form validation with Zod, proper error handling

### Master Data Management
- **Functionality**: Complete CRUD operations for all business entities (Items, Products, Customers, etc.)
- **Purpose**: Centralized management of all reference data used throughout the system
- **Trigger**: Navigate to Masters section, select entity
- **Progression**: Select entity → view list → create/edit/view records → manage relationships → export/import data
- **Success criteria**: All master entities functional, proper relationships, Excel operations

### Business Process Modules
- **Functionality**: Purchasing, Warehouse, Marketing, Logistics, Finance workflow management
- **Purpose**: Digital transformation of core business processes with approval workflows
- **Trigger**: User navigates to specific business module
- **Progression**: Access module → view relevant data → create transactions → follow approval workflow → complete process
- **Success criteria**: End-to-end workflows functional, proper status tracking, notifications

## Edge Case Handling
- **Empty States**: Show helpful guidance when no data exists with call-to-action buttons
- **Network Errors**: Retry mechanisms with user-friendly error messages and offline indicators
- **Permission Denied**: Clear messaging when user lacks access with contact information
- **Data Conflicts**: Optimistic locking with conflict resolution for concurrent edits
- **Large Datasets**: Virtual scrolling and pagination for performance with large result sets
- **Invalid URLs**: Graceful 404 handling with navigation suggestions back to valid routes

## Design Direction
The design should feel professional, clean, and efficient like modern enterprise software (think Notion, Linear, or modern SAP). Minimal interface that prioritizes content and functionality over decorative elements, with subtle shadows and gentle rounded corners that convey trustworthiness and attention to detail.

## Color Selection
Complementary (opposite colors) - Using blue and orange to create trust (blue) while maintaining energy and warmth (orange) for a balanced business application.

- **Primary Color**: Professional Blue (oklch(0.5 0.15 240)) - Conveys trust, stability, and professionalism essential for business software
- **Secondary Colors**: Light Gray (oklch(0.96 0.005 240)) for backgrounds, Medium Gray (oklch(0.7 0.01 240)) for borders
- **Accent Color**: Warm Orange (oklch(0.65 0.15 45)) - Call-to-action buttons and important status indicators to grab attention
- **Foreground/Background Pairings**: 
  - Background (White #FFFFFF): Dark Gray text (oklch(0.2 0.005 240)) - Ratio 15.8:1 ✓
  - Card (Light Gray oklch(0.98 0.005 240)): Dark Gray text (oklch(0.2 0.005 240)) - Ratio 14.2:1 ✓
  - Primary (Blue oklch(0.5 0.15 240)): White text (oklch(1 0 0)) - Ratio 8.2:1 ✓
  - Accent (Orange oklch(0.65 0.15 45)): White text (oklch(1 0 0)) - Ratio 4.8:1 ✓

## Font Selection
Clean, professional sans-serif typography that maintains readability across all screen sizes while conveying the modern, efficient nature of the ERP system. Inter font family for its excellent readability and professional appearance.

- **Typographic Hierarchy**: 
  - H1 (Page Titles): Inter Bold/32px/tight letter spacing
  - H2 (Section Headers): Inter Semibold/24px/normal spacing  
  - H3 (Card Titles): Inter Medium/18px/normal spacing
  - Body (Content): Inter Regular/14px/relaxed line height
  - Small (Meta info): Inter Regular/12px/normal spacing

## Animations
Subtle and purposeful animations that enhance usability without drawing attention to themselves - focusing on state transitions, loading feedback, and spatial relationships that help users understand the interface hierarchy and flow.

- **Purposeful Meaning**: Smooth sidebar transitions reinforce the spatial model, gentle hover states provide immediate feedback, and loading animations communicate system status
- **Hierarchy of Movement**: Sidebar state changes get 200ms transitions, button hover gets 150ms, modal open/close gets 300ms, table loading gets subtle shimmer effects

## Component Selection
- **Components**: Sidebar (custom), Table (shadcn Table + TanStack Table), Sheet (shadcn), Dialog (shadcn), Button (shadcn), Input (shadcn), Select (shadcn), Form components (react-hook-form + shadcn)
- **Customizations**: Custom sidebar component with three states, enhanced table with server-side features, custom header layout component
- **States**: Buttons have distinct hover/active/disabled states, inputs show focus/error/success states, tables show loading/empty/error states
- **Icon Selection**: Phosphor icons throughout for consistency - hamburger menu, chevrons, CRUD actions, business process indicators
- **Spacing**: Consistent 4px/8px/16px/24px/32px spacing scale, generous padding in cards (24px), tight spacing in tables (8px)
- **Mobile**: Sidebar becomes drawer on mobile, tables become horizontally scrollable cards, forms stack vertically with full-width inputs