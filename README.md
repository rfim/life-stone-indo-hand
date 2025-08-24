# Life Stone Indonesia - ERP Admin System

A comprehensive ERP administration system for Life Stone Indonesia with a production-ready, 3-state hideable sidebar and complete navigation structure.

## Sidebar States & Shortcuts

### Three Sidebar States

1. **Expanded** (default): Full sidebar with text labels and icons (264px width)
2. **Collapsed**: Icons only with tooltips (72px width)
3. **Hidden**: Completely hidden (0px width)

### Keyboard Shortcuts

- **Ctrl/Cmd + B**: Cycle through states (expanded → collapsed → hidden → expanded)
- **[**: Collapse sidebar (when not hidden)
- **]**: Expand sidebar (when not hidden)

### Controls

- **Hamburger button**: Toggle between hidden ↔ expanded (desktop), open mobile drawer
- **Chevron button**: Toggle between expanded ↔ collapsed (when visible)
- **Kebab menu (⋮)**: Additional options including "Hide sidebar"
- **Show sidebar pill**: Appears when hidden, click to expand

### Persistence

All sidebar state is automatically saved to localStorage:
- `ls.sidebar.state`: Current state ("expanded", "collapsed", "hidden")
- `ls.sidebar.width`: Custom width (220px - 320px, default 264px)
- `ls.sidebar.group.<GroupName>`: Per-group collapse state (true/false)

State syncs across browser tabs and persists between sessions.

### Mobile Behavior

On screens < 1024px:
- Sidebar becomes a drawer overlay
- Hamburger button opens/closes drawer
- Includes focus trap and ESC key support
- Body scroll is locked when drawer is open

## List Template Contract

Every list page follows a consistent structure:

### Header Section
- **Left**: Page icon + title + subtitle
- **Right**: Action buttons (Export, Import, Template, +Create)

### Controls Section
- **Left**: Search input with icon
- **Right**: Filters and Columns buttons

### Table Section
- Consistent card container with rounded borders
- Sticky header for long lists
- Server-side pagination, sorting, and filtering
- Column show/hide functionality
- Row selection with checkboxes
- Loading states with skeleton rows
- Error handling with retry button

### Footer Section
- "Showing X to Y of N entries" text

### URL State Management
All list state is preserved in URL parameters:
- `page`: Current page number
- `pageSize`: Items per page
- `q`: Search query
- `sortBy`: Sort column
- `sortDir`: Sort direction ("asc" or "desc")
- `filters`: JSON object of active filters
- `columns`: Array of visible column IDs

### Event Handling
Lists automatically remeasure when sidebar state changes via `sidebar:changed` event.

## How to Add a Module

### 1. Add to Navigation Config

Edit `src/lib/nav-config.ts` and add your new module to the appropriate group:

```typescript
{
  group: "Your Group",
  children: [
    { label: "Your Module", path: "/your-group/your-module", icon: YourIcon }
  ]
}
```

### 2. Component Structure

The route will automatically be created and use the `ListPage` component template. For custom pages, create:

```typescript
// src/components/pages/your-module-page.tsx
import { ListPage } from '@/components/list-page'

export function YourModulePage() {
  return <ListPage path="/your-group/your-module" />
}
```

### 3. Custom List Components

For specialized list behavior, extend the `ListPage` component:

```typescript
import { ListPage } from '@/components/list-page'

export function CustomListPage({ path }: { path: string }) {
  // Custom logic here
  
  return (
    <ListPage 
      path={path}
      customActions={<YourCustomActions />}
      customFilters={<YourCustomFilters />}
    />
  )
}
```

### 4. Icons

Choose appropriate icons from `lucide-react` that match the semantic meaning of your module:

- `Package`: Items, products
- `Users`: Customers, suppliers, employees
- `Truck`: Vehicles, delivery
- `Receipt`: Invoices, orders
- `BarChart`: Reports, analytics
- `Cog`: Settings, configuration

## Architecture

### State Management
- Sidebar state: Custom hook (`useSidebarState`)
- Global state: React Query for server state
- Local state: React useState for UI state
- Persistence: localStorage for user preferences

### Routing
- React Router v6 with declarative routes
- Deep linking support for modals and filters
- Automatic route generation from navigation config

### Styling
- Tailwind CSS with custom design system
- CSS variables for theming
- shadcn/ui component library
- Responsive design with mobile-first approach

### Events
- Custom events for cross-component communication
- `sidebar:changed`: Fired when sidebar state changes
- ResizeObserver for table remeasurement

## Development

### Project Structure
```
src/
├── components/
│   ├── layout/           # Layout components
│   ├── sidebar/          # Sidebar components  
│   ├── ui/              # shadcn/ui components
│   └── list-page.tsx    # Reusable list template
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and configs
│   ├── nav-config.ts    # Navigation structure
│   └── utils.ts         # Helper functions
└── App.tsx             # Main application
```

### Key Components
- `AppLayout`: CSS Grid layout with sidebar variable
- `Sidebar`: Main navigation with 3-state behavior
- `Header`: Top bar with sidebar controls
- `ListPage`: Reusable list page template
- `AppRouter`: Route generation and management

### Performance Considerations
- Lazy loading for large data sets
- Virtual scrolling for tables with 1000+ rows
- Debounced search inputs
- Optimistic updates for common actions
- ResizeObserver for efficient table remeasurement

## Testing

### E2E Tests
Key scenarios covered:
- Sidebar state transitions
- Keyboard shortcuts
- Mobile drawer behavior
- State persistence across page refreshes
- Navigation between modules
- Table interactions

### Running Tests
```bash
npm run test:e2e
```

## Deployment

### Build
```bash
npm run build
```

### Environment Variables
- `VITE_API_BASE_URL`: Backend API base URL
- `VITE_APP_NAME`: Application name override

The system is designed to be production-ready with proper error boundaries, loading states, and accessibility support.