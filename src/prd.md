# Life Stone Indonesia - ERP Admin System

## Core Purpose & Success
- **Mission Statement**: A production-ready ERP administration system for Life Stone Indonesia providing comprehensive business management across all operational areas
- **Success Indicators**: Seamless navigation, efficient data management, complete business workflow coverage, and user satisfaction
- **Experience Qualities**: Professional, efficient, intuitive

## Project Classification & Approach
- **Complexity Level**: Complex Application (advanced functionality, multiple modules)
- **Primary User Activity**: Managing (data entry, workflow processing, reporting, administration)

## Thought Process for Feature Selection
- **Core Problem Analysis**: Need for centralized business management system covering masters data, purchasing, warehouse, marketing, logistics, finance, and reporting
- **User Context**: Daily business operations by different departments with role-based access
- **Critical Path**: Login → Navigate to module → Manage data → Process workflows → Generate reports
- **Key Moments**: Sidebar navigation, data tables interaction, form submissions, report generation

## Essential Features

### Navigation System
- **What it does**: 3-state hideable sidebar (expanded/collapsed/hidden) with persistent state
- **Why it matters**: Maximizes screen real estate while maintaining easy access to all modules
- **How we'll validate**: User can quickly navigate between modules, state persists across sessions

### Tabular Data Management
- **What it does**: Consistent table interface across all modules with filtering, sorting, pagination
- **Why it matters**: Uniform experience for data management across diverse business functions
- **How we'll validate**: All lists follow same interaction patterns and performance standards

### Modal Forms
- **What it does**: Pop-up forms for Create/Edit/View operations with deep linking
- **Why it matters**: Maintains context while allowing detailed data entry
- **How we'll validate**: Forms can be bookmarked, shared, and navigated via URL

## Design Direction

### Visual Tone & Identity
- **Emotional Response**: Professional confidence, operational efficiency, trustworthy reliability
- **Design Personality**: Clean, business-focused, modern enterprise
- **Visual Metaphors**: Structured organization, clear hierarchy, systematic workflow
- **Simplicity Spectrum**: Balanced interface - clean enough for efficiency, rich enough for comprehensive functionality

### Color Strategy
- **Color Scheme Type**: Professional blue-based with neutral grays
- **Primary Color**: Blue (oklch(0.5 0.15 240)) - conveys trust and professionalism
- **Secondary Colors**: Light grays for backgrounds and cards
- **Accent Color**: Warm orange (oklch(0.65 0.15 45)) - highlights important actions
- **Color Psychology**: Blue for stability and trust, orange for action and attention
- **Color Accessibility**: All combinations meet WCAG AA standards (4.5:1 contrast)
- **Foreground/Background Pairings**: 
  - background (white) + foreground (dark gray): High contrast for readability
  - card (light gray) + card-foreground (dark gray): Subtle separation
  - primary (blue) + primary-foreground (white): Clear call-to-action
  - secondary (light gray) + secondary-foreground (dark gray): Supporting actions
  - accent (orange) + accent-foreground (white): Important highlights
  - muted (light gray) + muted-foreground (medium gray): Subtle text

### Typography System
- **Font Pairing Strategy**: Single font family (Inter) with weight variations for hierarchy
- **Typographic Hierarchy**: Bold headings, medium subheadings, regular body text
- **Font Personality**: Clean, modern, highly legible in data-dense environments
- **Readability Focus**: Optimized line height and spacing for long-form data review
- **Typography Consistency**: Consistent scale and weights across all modules
- **Which fonts**: Inter (400, 500, 600, 700 weights)
- **Legibility Check**: Inter is specifically designed for UI legibility

### Visual Hierarchy & Layout
- **Attention Direction**: Sidebar → Header → Content → Actions → Details
- **White Space Philosophy**: Generous spacing around data tables, tight spacing within grouped elements
- **Grid System**: CSS Grid for main layout, Flexbox for component internal layout
- **Responsive Approach**: Mobile drawer for sidebar, responsive tables with horizontal scroll
- **Content Density**: High information density balanced with visual breathing room

### Animations
- **Purposeful Meaning**: Sidebar transitions communicate state changes, loading states show progress
- **Hierarchy of Movement**: Sidebar state changes (200ms), hover states (100ms), modal entrances (300ms)
- **Contextual Appropriateness**: Subtle, professional animations that enhance usability

### UI Elements & Component Selection
- **Component Usage**: shadcn/ui components for consistency - Button, Table, Dialog, Sheet, Input, Select
- **Component Customization**: Brand colors applied through CSS variables
- **Component States**: Clear hover, active, disabled, and loading states
- **Icon Selection**: Lucide React icons for semantic clarity and consistency
- **Component Hierarchy**: Primary buttons for main actions, secondary for supporting actions
- **Spacing System**: Tailwind's spacing scale (4, 6, 8, 12, 16, 24px)
- **Mobile Adaptation**: Drawer overlay for sidebar, responsive table containers

### Visual Consistency Framework
- **Design System Approach**: Component-based with consistent patterns across modules
- **Style Guide Elements**: Color palette, typography scale, spacing system, component library
- **Visual Rhythm**: Consistent table headers, button heights, form layouts
- **Brand Alignment**: Life Stone Indonesia branding with professional color scheme

### Accessibility & Readability
- **Contrast Goal**: WCAG AA compliance minimum, aim for AAA where possible
- **Keyboard Navigation**: Full keyboard support with logical tab order
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Focus Management**: Clear focus indicators and focus trapping in modals

## Implementation Considerations
- **Scalability Needs**: Modular architecture allows adding new business modules
- **Testing Focus**: E2E tests for critical navigation and data operations
- **Critical Questions**: Performance with large datasets, role-based permission integration

## Reflection
This ERP system uniquely serves Life Stone Indonesia's comprehensive business needs with a scalable, professional interface that can grow with the company while maintaining operational efficiency across all departments.