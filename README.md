# Life Stone Indonesia ERP Admin

A comprehensive ERP administration system for Life Stone Indonesia, built with React, TypeScript, and GitHub Spark's KV store.

## Features

### ✅ Implemented
- **Hideable 3-State Sidebar**: Expanded, collapsed, and hidden states with persistence
- **Responsive Design**: Mobile-first with drawer navigation and full-screen forms
- **Database-Driven**: No mock data - all operations use GitHub Spark KV store
- **Master Data Management**: 
  - Categories (full CRUD)
  - Suppliers (full CRUD with contact management)
  - Products (full CRUD with pricing, dimensions, and product variants)
- **Advanced Table Features**: Server-side pagination, sorting, filtering, column management
- **Modal Forms**: URL-driven pop-ups with validation and real-time feedback
- **Lookup Selects**: Dynamic dropdowns populated from database
- **Audit Trails**: Automatic tracking of created/updated timestamps and users
- **Data Seeding**: Automatic population of reference data for development

### 🚧 In Progress
- Additional master data entities (Items, Warehouses, Vehicles, etc.)
- Import/Export functionality
- Purchasing module
- Warehouse management
- Marketing and sales modules
- Financial management
- Dashboard and reporting

## Architecture

### Frontend Stack
- **React 19** with TypeScript
- **React Router** for navigation
- **React Query** for server state management
- **React Hook Form** with Zod validation
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **TanStack Table** for data tables
- **Framer Motion** for animations

### Backend/Database
- **GitHub Spark KV Store** as primary database
- **Client-side data processing** with pagination, filtering, and sorting
- **Optimistic updates** with real-time feedback

### Mobile Responsiveness
- **Mobile-first design** with progressive enhancement
- **Touch-friendly interfaces** with proper hit targets
- **Drawer navigation** on mobile devices
- **Full-screen forms** on small screens
- **Cards view** as alternative to tables on mobile

## Sidebar States & Shortcuts

The sidebar supports three states:

1. **Expanded** (default): Shows icons and text labels
2. **Collapsed**: Shows only icons with tooltips
3. **Hidden**: Completely hidden, maximizing content area

### Keyboard Shortcuts
- `Ctrl/Cmd + B` - Cycle through sidebar states
- `[` - Collapse sidebar
- `]` - Expand sidebar

### Mobile Behavior
- Sidebar appears as a drawer overlay
- Hamburger menu toggles drawer
- Swipe gestures supported
- Focus trapping for accessibility

## Data Flow & API

### No-Mock Policy
All data operations use real API calls to GitHub Spark KV store:
- Lists are fetched with server-side pagination
- Create/Edit operations provide immediate feedback
- Delete operations use soft delete (isDeleted flag)
- All operations include audit logging

### API Structure
```typescript
// Standard REST endpoints for each entity
GET    /entity?page=&pageSize=&q=&sortBy=&sortDir=&filters={}
GET    /entity/:id
POST   /entity
PATCH  /entity/:id  
DELETE /entity/:id
```

### Entity Services
Each entity has a complete service layer with:
- Type-safe API operations
- Validation with Zod schemas
- React Query integration
- Error handling with field-level validation

## How to Add a New Entity

1. **Define the interface** in `src/lib/api/[module].ts`
2. **Create validation schema** using Zod
3. **Create entity service** using `createEntityService`
4. **Create React hooks** using `createEntityHooks`
5. **Define table columns** with responsive priorities
6. **Create form component** with proper validation
7. **Create page component** combining DataTable and CrudModal
8. **Add route** to AppRouter component

### Example Entity Creation

```typescript
// 1. Interface
interface MyEntity extends BaseEntity {
  name: string
  code: string
  isActive: boolean
}

// 2. Validation
const myEntitySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  isActive: z.boolean().default(true)
})

// 3. Service
const myEntityService = createEntityService<MyEntity>('my-entity', ['name', 'code'])

// 4. Hooks
const useMyEntityApi = () => createEntityHooks('my-entity', myEntityService)

// 5. Page component with table and forms
// (See existing pages for implementation examples)
```

## Environment Setup

### Development
```bash
npm install
npm run dev
```

### Build
```bash
npm run build
npm run preview
```

## Key Components

### DataTable
- Server-side pagination and sorting
- Column filtering and visibility
- Responsive design with card view fallback
- Row selection and bulk operations
- Real-time data updates

### CrudModal
- URL-driven modal state
- Full-screen on mobile, side sheet on desktop
- Form validation with real-time feedback
- Audit trail display for view mode
- Unsaved changes protection

### LookupSelect
- Dynamic population from database
- Debounced search functionality
- Caching with React Query
- Specialized variants for common entities

### ListChrome
- Consistent header layout across all lists
- Responsive action menus
- Search and filter controls
- Export/Import/Template buttons
- Mobile FAB for create actions

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── forms/           # Form-related components
│   ├── layout/          # Layout components
│   ├── sidebar/         # Sidebar components
│   ├── table/           # Table-related components
│   └── ui/              # shadcn/ui components
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and configurations
│   ├── api/             # API services and types
│   └── db/              # Database utilities
├── pages/               # Page components by module
│   ├── masters/         # Master data pages
│   ├── purchasing/      # Purchasing pages
│   └── ...              # Other modules
└── styles/              # Global styles
```

## Contributing

1. Follow the established patterns for new entities
2. Ensure mobile responsiveness
3. Include proper validation and error handling
4. Maintain type safety throughout
5. Test on multiple screen sizes
6. Update documentation for new features

## License

Proprietary - Life Stone Indonesia