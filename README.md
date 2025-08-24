# Life Stone Indonesia ERP Admin

A comprehensive ERP administration system for Life Stone Indonesia, featuring a hideable sidebar navigation and standardized tabular data management across all business modules.

## Features

### 🎛️ Hideable Sidebar Navigation
- **Three States**: Expanded (264px), Collapsed (72px), Hidden (0px)
- **Persistent State**: Automatically saves sidebar state and width to localStorage
- **Mobile Responsive**: Transforms into a drawer on mobile devices
- **Keyboard Shortcuts**: Full keyboard navigation support
- **Smooth Transitions**: 200ms animated transitions between states

### 📊 Standardized Tabular Lists
- **Consistent Design**: All modules use the same tabular chrome
- **Server-side Features**: Pagination, sorting, filtering, search
- **Bulk Operations**: Row selection with bulk actions
- **Excel Integration**: Export, Import, Template download
- **Loading States**: Skeleton rows and progress indicators
- **Error Handling**: Inline error messages with retry functionality

### 🔄 Business Modules
Complete module coverage for:
- **Masters**: Items, Products, Customers, Suppliers, etc. (23 modules)
- **Purchasing**: Request, Orders, Invoices
- **Warehouse**: SKU Management, Inventory, Movement
- **Marketing**: Cold Calls, Offerings, Sales Orders
- **Logistics**: Delivery Orders, Tracking, Returns
- **Finance**: Invoices, Payments, Accounting
- **Dashboards**: Reports, Approvals, Analytics
- **Settings**: Users, Roles, Configuration
- **Security**: Guest Logs, Item Tracking
- **Driver**: Mobile-friendly delivery interface

## Sidebar States & Shortcuts

### States
1. **Expanded** (264px): Full sidebar with text labels and icons
2. **Collapsed** (72px): Icons only with tooltips on hover
3. **Hidden** (0px): Completely hidden with "Show sidebar" pill

### Controls
- **Hamburger Menu**: Toggles between hidden ↔ expanded (mobile: opens drawer)
- **Chevron Button**: Toggles between expanded ↔ collapsed
- **"Show Sidebar" Pill**: Appears when hidden, clicking restores to expanded

### Keyboard Shortcuts
- **Ctrl/Cmd + B**: Cycle through all three states
- **[ (left bracket)**: Collapse sidebar
- **] (right bracket)**: Expand sidebar

*Note: Bracket shortcuts are disabled when typing in input fields*

### Persistence
- Sidebar state stored in `localStorage` as `ls.sidebar.state`
- Sidebar width stored in `localStorage` as `ls.sidebar.width`
- Settings persist across browser sessions

## List Template Contract

### Header Structure
```typescript
interface ListHeader {
  title: string           // Main page title
  subtitle?: string       // Optional description
  actions: {
    export: () => void    // Export to Excel
    import: () => void    // Import from Excel  
    template: () => void  // Download template
    create: () => void    // Create new entity
  }
}
```

### Controls
- **Global Search**: Live search across all visible columns
- **Filters Button**: Opens filter panel for advanced filtering
- **Columns Button**: Show/hide specific columns

### Table Features
- **Row Selection**: Checkbox selection with "select all"
- **Column Sorting**: Click headers to sort (visual indicators)
- **Sticky Header**: Header stays visible during scroll
- **Responsive**: Horizontal scroll on mobile

### Footer
- **Entry Count**: "Showing X to Y of N entries"
- **Pagination**: Previous/Next with numbered pages

### URL State Management
All list state is stored in URL parameters:
- `page`: Current page number
- `pageSize`: Items per page
- `q`: Search query
- `sortBy`: Sort column
- `sortDir`: Sort direction (asc/desc)
- `filters`: JSON object of active filters
- `columns`: Visible column configuration

## How to Add a Module

### 1. Create the Data Interface
```typescript
// src/types/your-module.ts
interface YourEntity {
  id: string
  name: string
  status: 'active' | 'inactive'
  createdAt: string
  // ... other fields
}
```

### 2. Create the Page Component
```typescript
// src/components/your-module-page.tsx
import { DataTable } from '@/components/data-table'
import { useKV } from '@github/spark/hooks'

export function YourModulePage() {
  const [data, setData] = useKV('your-module', [])
  
  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    // ... other columns
  ]

  return (
    <div className="p-6">
      <DataTable
        title="Your Module"
        subtitle="Manage your data"
        data={data}
        columns={columns}
        onCreateClick={() => console.log('Create')}
        // ... other handlers
      />
    </div>
  )
}
```

### 3. Add to Navigation
Add your route to the `navigation` array in `src/components/sidebar.tsx`:

```typescript
{
  label: 'Your Section',
  href: '/your-section',
  children: [
    { 
      label: 'Your Module', 
      href: '/your-section/your-module', 
      icon: List 
    }
  ]
}
```

### 4. Add to Router
Add the route handler in `src/components/app-router.tsx`:

```typescript
if (currentPath === '/your-section/your-module') {
  return <YourModulePage />
}
```

### 5. Add Seed Data (Optional)
```typescript
// In your component or separate seed file
import { seed_kv_store_tool } from '@github/spark/hooks'

const sampleData = [
  { id: '1', name: 'Sample Item', status: 'active', createdAt: '2024-01-01' }
]

// Set initial data
seed_kv_store_tool.set('your-module', sampleData)
```

## Development

### Running the Application
```bash
npm install
npm run dev
```

### Building for Production
```bash
npm run build
```

### Project Structure
```
src/
├── components/
│   ├── ui/              # shadcn components
│   ├── sidebar.tsx      # Main navigation
│   ├── data-table.tsx   # Reusable table component
│   ├── header.tsx       # Page header
│   └── ...
├── hooks/
│   ├── use-sidebar.ts   # Sidebar state management
│   ├── use-router.ts    # Simple routing
│   └── ...
├── lib/
│   └── utils.ts         # Utilities
└── App.tsx              # Main application
```

### Technology Stack
- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Icons**: Phosphor Icons
- **State**: React hooks + localStorage persistence
- **Tables**: Custom implementation with sorting/filtering
- **Forms**: React Hook Form + Zod validation
- **Notifications**: Sonner toasts

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License
Proprietary - Life Stone Indonesia