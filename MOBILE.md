# Mobile-Responsive ERP Admin Guide

## Overview

The Life Stone Indonesia ERP Admin is fully responsive and optimized for mobile devices, tablets, and desktop computers. This guide covers the mobile-specific features and behaviors.

## Responsive Breakpoints

- **Mobile**: < 1024px (lg breakpoint)
- **Tablet**: 768px - 1023px (md to lg)
- **Desktop**: ≥ 1024px (lg+)

## Sidebar Behavior

### Desktop (≥1024px)
- **3 States**: Expanded (264px), Collapsed (72px), Hidden (0px)
- **Persistence**: State and width saved to localStorage
- **Controls**: Hamburger, Chevron, Kebab menu
- **Keyboard Shortcuts**: 
  - `Ctrl/Cmd+B`: Cycle through states
  - `[`: Collapse
  - `]`: Expand

### Mobile (<1024px)
- **Drawer Mode**: Sidebar opens as overlay drawer from left
- **Default State**: Hidden, opened via hamburger menu
- **Touch Gestures**: Swipe left to close (≥30% threshold)
- **Focus Management**: Focus trapped in drawer when open
- **Body Scroll**: Locked when drawer is open
- **Safe Areas**: Respects iOS safe area insets

## List Views

### Responsive Header
- **Mobile**: Compact title, actions in dropdown menu
- **Desktop**: Full header with action buttons inline
- **FAB**: Floating action button for "Create" on mobile (bottom-right)

### Search & Controls
- **Search**: Full-width on mobile, constrained on desktop
- **Filters**: Full-screen sheet on mobile, dropdown on desktop
- **Columns**: Bottom action sheet on mobile, dropdown on desktop

### Data Display
- **Table/Cards Toggle**: Available on all screens
- **Auto-Switch**: Defaults to cards view on very small screens (<640px)
- **Column Priority**: 
  - Priority 1 (Essential): Always visible
  - Priority 2 (Important): Hidden on small screens
  - Priority 3 (Optional): Hidden on small/medium screens

### Card View Features
- **Expandable Content**: "Show More/Less" for additional data
- **Touch Targets**: Minimum 44px touch targets
- **Bulk Selection**: Header with select all/clear actions
- **Actions Menu**: Per-card dropdown for item actions

## Forms

### Mobile Form Behavior
- **Full-Screen**: Forms open full-screen on mobile instead of modal
- **Sticky Header**: Title, status badge, close button
- **Sticky Footer**: Action buttons (Save, Save & Close, Cancel)
- **Safe Areas**: Proper padding for iOS notch/home indicator

### Input Enhancements
- **Input Modes**: Appropriate keyboard types (decimal, tel, email)
- **Touch Targets**: Minimum 44px for all interactive elements
- **Camera Capture**: Image inputs support camera capture
- **Date/Time**: Native mobile pickers

### Form Sections
- **Responsive Layout**: Tabs or accordion for form sections
- **Validation**: Inline errors with focus management
- **Auto-scroll**: Scroll to first invalid field on submit

## Performance Optimizations

### Mobile-Specific
- **Momentum Scrolling**: `-webkit-overflow-scrolling: touch`
- **Reduced Motion**: Respects `prefers-reduced-motion`
- **Lazy Loading**: Images load lazily
- **Virtualization**: Long lists (>100 items) use virtual scrolling

### Touch Interactions
- **Active States**: Visual feedback for touch interactions
- **Gesture Support**: Swipe gestures where appropriate
- **Debounced Resize**: Optimized ResizeObserver usage

## CSS Utilities

### Safe Area Support
```css
.pt-safe { padding-top: env(safe-area-inset-top); }
.pb-safe { padding-bottom: env(safe-area-inset-bottom); }
.pl-safe { padding-left: env(safe-area-inset-left); }
.pr-safe { padding-right: env(safe-area-inset-right); }
.p-safe { /* All safe area padding */ }
```

### Touch-Friendly Classes
```css
.touch-target { min-height: 44px; min-width: 44px; }
.momentum-scroll { -webkit-overflow-scrolling: touch; }
.no-scroll { overflow: hidden; position: fixed; width: 100%; }
```

## Component Usage

### ListChrome Component
```tsx
<ListChrome
  title="Items"
  subtitle="Inventory Management"
  viewMode={viewMode}
  onViewModeChange={setViewMode}
  showViewToggle={true}
  showCreate={true}
  // Mobile: FAB + dropdown menu
  // Desktop: Inline action buttons
>
  {viewMode === 'cards' ? (
    <CardList items={items} />
  ) : (
    <TableView items={items} />
  )}
</ListChrome>
```

### FormSheet Component
```tsx
<FormSheet
  open={open}
  onOpenChange={setOpen}
  title="Create Item"
  mode="create"
  onSave={handleSave}
  onSaveAndClose={handleSaveAndClose}
  // Mobile: Full-screen with sticky header/footer
  // Desktop: Modal dialog
>
  <FormContent />
</FormSheet>
```

### CardList Component
```tsx
<CardList
  items={items}
  selectedItems={selectedItems}
  onSelectionChange={setSelectedItems}
  onItemClick={handleItemClick}
  // Responsive card grid with expandable content
/>
```

## Testing

### E2E Tests
- `cypress/e2e/mobile/sidebar-drawer.cy.ts`: Drawer functionality
- `cypress/e2e/mobile/list-controls.cy.ts`: List responsiveness
- `cypress/e2e/mobile/forms.cy.ts`: Form mobile behavior

### Manual Testing Checklist
- [ ] iPhone/Android: Drawer opens/closes with gestures
- [ ] iPad: Layout adapts to tablet size
- [ ] Landscape/Portrait: No layout breaks
- [ ] Safe areas: Content not obscured by notch/home indicator
- [ ] Touch targets: All interactive elements ≥44px
- [ ] Keyboard: Numeric keypad for number inputs
- [ ] Camera: Image capture works on supported devices

## Accessibility

### Mobile Accessibility
- **Focus Management**: Proper focus order and trapping
- **Touch Targets**: Minimum size compliance
- **Screen Reader**: ARIA labels and descriptions
- **High Contrast**: Maintains contrast ratios
- **Reduced Motion**: Respects user preferences

### Keyboard Navigation
- **Tab Order**: Logical focus sequence
- **Escape Key**: Closes modals/drawers
- **Arrow Keys**: Navigation where appropriate
- **Enter/Space**: Activates buttons

## Browser Support

### Mobile Browsers
- **iOS Safari**: 14+ (iOS 14+)
- **Chrome Mobile**: Latest 2 versions
- **Samsung Internet**: Latest version
- **Firefox Mobile**: Latest version

### PWA Ready
- **Manifest**: Basic PWA manifest included
- **Service Worker**: Ready for implementation
- **Install Prompt**: Can be enabled for mobile app-like experience

## Best Practices

### Mobile UX Guidelines
1. **Touch First**: Design for touch interaction primarily
2. **One-Handed Use**: Important actions within thumb reach
3. **Progressive Disclosure**: Show essential info first
4. **Consistent Navigation**: Familiar mobile patterns
5. **Performance**: Optimize for slower mobile networks

### Implementation Notes
- Use `useIsMobile()` hook for conditional rendering
- Test on real devices, not just browser dev tools
- Consider offline functionality for field use
- Implement pull-to-refresh for data updates
- Use native mobile UI patterns when possible

## Troubleshooting

### Common Issues
1. **Viewport Meta Tag**: Ensure proper scaling
2. **Touch Events**: Use touch events for gestures
3. **iOS Bounce**: Disable where inappropriate
4. **Android Back**: Handle back button navigation
5. **Landscape Mode**: Test rotation handling

### Performance Tips
- Minimize JavaScript on mobile
- Use CSS transforms for animations
- Optimize images for different densities
- Implement lazy loading for off-screen content
- Use efficient list virtualization for large datasets