/// <reference types="cypress" />

describe('Mobile List Controls', () => {
  beforeEach(() => {
    // Set mobile viewport
    cy.viewport(375, 667)
    cy.visit('/masters/items')
  })

  it('should show responsive list header on mobile', () => {
    // Header should be compact on mobile
    cy.get('h1').should('contain', 'Items')
    cy.get('h1').should('have.class', 'text-lg') // smaller text on mobile
    
    // Actions should be in dropdown menu
    cy.get('[aria-label="Actions menu"]').should('be.visible')
    cy.get('[aria-label="Actions menu"]').click()
    
    // Should show all actions in menu
    cy.get('[role="menuitem"]').should('contain', 'Create Item')
    cy.get('[role="menuitem"]').should('contain', 'Export')
    cy.get('[role="menuitem"]').should('contain', 'Import')
    cy.get('[role="menuitem"]').should('contain', 'Template')
    cy.get('[role="menuitem"]').should('contain', 'Filters')
    cy.get('[role="menuitem"]').should('contain', 'Columns')
  })

  it('should show FAB for create action', () => {
    // FAB should be visible at bottom right
    cy.get('[aria-label="Create Item"]')
      .should('be.visible')
      .should('have.class', 'fixed')
      .should('have.class', 'bottom-6')
      .should('have.class', 'right-6')
  })

  it('should expand search input to full width', () => {
    // Search input should be full width on mobile
    cy.get('input[placeholder="Search..."]')
      .should('be.visible')
      .should('have.class', 'flex-1')
  })

  it('should open filters in full-screen sheet', () => {
    // Open actions menu and click filters
    cy.get('[aria-label="Actions menu"]').click()
    cy.get('[role="menuitem"]').contains('Filters').click()
    
    // Filter sheet should open full screen
    cy.get('[data-testid="filter-sheet"]').should('be.visible')
    cy.get('[data-testid="filter-sheet"]').should('contain', 'Filter Items')
    
    // Should have filter options
    cy.get('select, input[type="date"], input[type="number"]').should('exist')
    
    // Should have apply/reset buttons
    cy.get('button').should('contain', 'Apply Filters')
    cy.get('button').should('contain', 'Reset')
    
    // Close filter sheet
    cy.get('button').contains('Cancel').click()
    cy.get('[data-testid="filter-sheet"]').should('not.exist')
  })

  it('should open columns in action sheet', () => {
    // Open actions menu and click columns
    cy.get('[aria-label="Actions menu"]').click()
    cy.get('[role="menuitem"]').contains('Columns').click()
    
    // Columns sheet should open from bottom
    cy.get('[data-testid="columns-sheet"]').should('be.visible')
    cy.get('[data-testid="columns-sheet"]').should('contain', 'Show/Hide Columns')
    
    // Should have column checkboxes
    cy.get('input[type="checkbox"]').should('exist')
    cy.get('label').should('contain', 'Name')
    cy.get('label').should('contain', 'Status')
    
    // Should have quick actions
    cy.get('button').should('contain', 'Show All')
    cy.get('button').should('contain', 'Restore Defaults')
    
    // Close columns sheet
    cy.get('button').contains('Done').click()
    cy.get('[data-testid="columns-sheet"]').should('not.exist')
  })

  it('should toggle between table and cards view', () => {
    // Should show view toggle buttons
    cy.get('[data-testid="view-toggle"]').should('be.visible')
    
    // Cards view should be active by default on mobile
    cy.get('[data-testid="view-toggle"] button[aria-pressed="true"]')
      .should('contain.text', 'Cards') // Grid icon
    
    // Switch to table view
    cy.get('[data-testid="view-toggle"] button').first().click()
    
    // Should show table view
    cy.get('[data-testid="table-view"]').should('be.visible')
    
    // Switch back to cards
    cy.get('[data-testid="view-toggle"] button').last().click()
    
    // Should show cards view
    cy.get('[data-testid="cards-view"]').should('be.visible')
  })

  it('should show cards with expandable content', () => {
    // Should show card items
    cy.get('[data-testid="card-item"]').should('exist')
    cy.get('[data-testid="card-item"]').first().should('contain', 'Sample Item')
    
    // Cards should have primary metrics visible
    cy.get('[data-testid="card-item"]').first().should('contain', 'Quantity')
    cy.get('[data-testid="card-item"]').first().should('contain', 'Value')
    
    // Click "Show More" button
    cy.get('[data-testid="card-item"]').first()
      .find('button').contains('Show More').click()
    
    // Should show additional content
    cy.get('[data-testid="card-item"]').first().should('contain', 'SKU')
    cy.get('[data-testid="card-item"]').first().should('contain', 'Supplier')
    
    // Click "Show Less" button
    cy.get('[data-testid="card-item"]').first()
      .find('button').contains('Show Less').click()
    
    // Additional content should be hidden
    cy.get('[data-testid="card-item"]').first().should('not.contain', 'SKU')
  })

  it('should support card selection with bulk actions', () => {
    // Should show bulk selection header
    cy.get('[data-testid="bulk-selection"]').should('contain', 'Select all')
    
    // Select first card
    cy.get('[data-testid="card-item"]').first()
      .find('input[type="checkbox"]').check()
    
    // Should update selection count
    cy.get('[data-testid="bulk-selection"]').should('contain', '1 selected')
    
    // Should show clear selection button
    cy.get('button').contains('Clear selection').should('be.visible')
    
    // Select all items
    cy.get('[data-testid="bulk-selection"] input[type="checkbox"]').check()
    
    // Should select all cards
    cy.get('[data-testid="bulk-selection"]').should('contain', '3 selected')
    
    // Clear selection
    cy.get('button').contains('Clear selection').click()
    
    // Selection should be cleared
    cy.get('[data-testid="bulk-selection"]').should('contain', 'Select all')
  })

  it('should show pagination at bottom', () => {
    // Footer should show entry count
    cy.get('[data-testid="list-footer"]')
      .should('contain', 'Showing')
      .should('contain', 'entries')
    
    // Should be responsive text size
    cy.get('[data-testid="list-footer"]')
      .should('have.class', 'text-xs')
  })

  it('should handle search functionality', () => {
    // Enter search term
    cy.get('input[placeholder="Search..."]').type('Sample Item 1')
    
    // Should filter results
    cy.get('[data-testid="card-item"]').should('have.length', 1)
    cy.get('[data-testid="card-item"]').should('contain', 'Sample Item 1')
    
    // Clear search
    cy.get('input[placeholder="Search..."]').clear()
    
    // Should show all results again
    cy.get('[data-testid="card-item"]').should('have.length.at.least', 1)
  })

  it('should open card actions menu', () => {
    // Click on card actions menu
    cy.get('[data-testid="card-item"]').first()
      .find('[data-testid="card-actions"]').click()
    
    // Should show action menu
    cy.get('[role="menuitem"]').should('contain', 'Edit')
    cy.get('[role="menuitem"]').should('contain', 'View Details')
    cy.get('[role="menuitem"]').should('contain', 'Delete')
    
    // Click outside to close
    cy.get('body').click(50, 50)
  })

  it('should handle empty state appropriately', () => {
    // Search for non-existent item
    cy.get('input[placeholder="Search..."]').type('Non-existent item')
    
    // Should show empty state
    cy.get('[data-testid="empty-state"]')
      .should('be.visible')
      .should('contain', 'No items found')
      .should('contain', 'No results found for "Non-existent item"')
  })
})