/// <reference types="cypress" />

describe('Mobile Forms', () => {
  beforeEach(() => {
    // Set mobile viewport
    cy.viewport(375, 667)
    cy.visit('/masters/items')
  })

  it('should open create form in full-screen mode', () => {
    // Click FAB to create new item
    cy.get('[aria-label="Create Item"]').click()
    
    // Form should open full-screen
    cy.get('[data-testid="form-sheet"]')
      .should('be.visible')
      .should('have.css', 'width', '100vw')
      .should('have.css', 'height', '100vh')
    
    // Should have sticky header with title
    cy.get('[data-testid="form-header"]')
      .should('contain', 'Create Item')
      .should('have.class', 'sticky')
    
    // Should have close button
    cy.get('[aria-label="Close form"]').should('be.visible')
  })

  it('should show sticky header with safe area padding', () => {
    // Open form
    cy.get('[aria-label="Create Item"]').click()
    
    // Header should have safe area padding
    cy.get('[data-testid="form-header"]')
      .should('have.class', 'pt-safe')
    
    // Should show form title and description
    cy.get('[data-testid="form-header"]')
      .should('contain', 'Create Item')
      .should('contain', 'Add a new item to your inventory')
  })

  it('should show sticky footer with action buttons', () => {
    // Open form
    cy.get('[aria-label="Create Item"]').click()
    
    // Should have sticky footer with actions
    cy.get('[data-testid="form-footer"]')
      .should('be.visible')
      .should('have.class', 'sticky')
      .should('have.class', 'pb-safe')
    
    // Should have full-width buttons on mobile
    cy.get('[data-testid="form-footer"] button')
      .should('have.class', 'flex-1')
    
    // Should have Save and Cancel buttons
    cy.get('button').contains('Save').should('be.visible')
    cy.get('button').contains('Cancel').should('be.visible')
  })

  it('should have touch-friendly form inputs', () => {
    // Open form
    cy.get('[aria-label="Create Item"]').click()
    
    // Form inputs should have adequate touch targets
    cy.get('input, select, textarea, button').each($el => {
      cy.wrap($el).should('satisfy', el => {
        const rect = el.getBoundingClientRect()
        return rect.height >= 44 // Minimum touch target
      })
    })
  })

  it('should use appropriate input modes for mobile keyboards', () => {
    // Open form
    cy.get('[aria-label="Create Item"]').click()
    
    // Numeric inputs should have decimal inputmode
    cy.get('input[type="number"]')
      .should('have.attr', 'inputmode', 'decimal')
    
    // Phone inputs should have tel inputmode
    cy.get('input[type="tel"]')
      .should('have.attr', 'inputmode', 'tel')
    
    // Email inputs should have email inputmode
    cy.get('input[type="email"]')
      .should('have.attr', 'inputmode', 'email')
  })

  it('should support camera capture for image fields', () => {
    // Open form
    cy.get('[aria-label="Create Item"]').click()
    
    // Image upload should support camera capture
    cy.get('input[type="file"][accept*="image"]')
      .should('have.attr', 'capture')
  })

  it('should show form sections with tabs or accordion', () => {
    // Open form
    cy.get('[aria-label="Create Item"]').click()
    
    // Should have form sections
    cy.get('[data-testid="form-section"]').should('exist')
    
    // Should have navigation between sections
    cy.get('[role="tab"], [data-testid="accordion-trigger"]').should('exist')
  })

  it('should validate form and show errors inline', () => {
    // Open form
    cy.get('[aria-label="Create Item"]').click()
    
    // Try to save without required fields
    cy.get('button').contains('Save').click()
    
    // Should show validation errors
    cy.get('[data-testid="field-error"]').should('exist')
    cy.get('[role="alert"]').should('contain', 'This field is required')
    
    // Should focus first invalid field
    cy.get('input:invalid').first().should('be.focused')
  })

  it('should show confirmation when closing with unsaved changes', () => {
    // Open form
    cy.get('[aria-label="Create Item"]').click()
    
    // Make changes to form
    cy.get('input[type="text"]').first().type('Test Item')
    
    // Try to close form
    cy.get('[aria-label="Close form"]').click()
    
    // Should show confirmation dialog
    cy.on('window:confirm', (text) => {
      expect(text).to.contains('unsaved changes')
      return false // Cancel closing
    })
    
    // Form should still be open
    cy.get('[data-testid="form-sheet"]').should('be.visible')
  })

  it('should save form data and show success feedback', () => {
    // Open form
    cy.get('[aria-label="Create Item"]').click()
    
    // Fill required fields
    cy.get('input[name="name"]').type('Test Item')
    cy.get('input[name="description"]').type('Test Description')
    cy.get('input[name="quantity"]').type('100')
    cy.get('input[name="price"]').type('50000')
    
    // Save form
    cy.get('button').contains('Save').click()
    
    // Should show loading state
    cy.get('button').contains('Saving...').should('be.visible')
    
    // Should show success toast
    cy.get('[data-testid="toast"]')
      .should('contain', 'Item created successfully')
    
    // Should refetch list data
    cy.get('[data-testid="card-item"]').should('contain', 'Test Item')
  })

  it('should support Save & Close action', () => {
    // Open form
    cy.get('[aria-label="Create Item"]').click()
    
    // Fill form
    cy.get('input[name="name"]').type('Another Test Item')
    
    // Click Save & Close
    cy.get('button').contains('Save & Close').click()
    
    // Should save and close form
    cy.get('[data-testid="form-sheet"]').should('not.exist')
    
    // Should show success feedback
    cy.get('[data-testid="toast"]')
      .should('contain', 'Item created successfully')
  })

  it('should handle edit mode correctly', () => {
    // Click on existing item to edit
    cy.get('[data-testid="card-item"]').first()
      .find('[data-testid="card-actions"]').click()
    cy.get('[role="menuitem"]').contains('Edit').click()
    
    // Should open in edit mode
    cy.get('[data-testid="form-header"]')
      .should('contain', 'Edit Item')
    
    // Should have pre-filled values
    cy.get('input[name="name"]').should('not.have.value', '')
    
    // Should show status badge if applicable
    cy.get('[data-testid="status-badge"]').should('be.visible')
  })

  it('should handle view mode correctly', () => {
    // Click on existing item to view
    cy.get('[data-testid="card-item"]').first().click()
    
    // Should open in view mode
    cy.get('[data-testid="form-header"]')
      .should('contain', 'View Item')
    
    // All inputs should be disabled/readonly
    cy.get('input, select, textarea').should('be.disabled')
    
    // Should not show save buttons
    cy.get('button').contains('Save').should('not.exist')
    
    // Should have back button on mobile
    cy.get('[aria-label="Back"]').should('be.visible')
  })

  it('should maintain scroll position in long forms', () => {
    // Open form
    cy.get('[aria-label="Create Item"]').click()
    
    // Scroll down in form content
    cy.get('[data-testid="form-content"]').scrollTo('bottom')
    
    // Header and footer should remain sticky
    cy.get('[data-testid="form-header"]').should('be.visible')
    cy.get('[data-testid="form-footer"]').should('be.visible')
    
    // Content should be scrollable
    cy.get('[data-testid="form-content"]').should('be.visible')
  })

  it('should close form with back gesture', () => {
    // Open form
    cy.get('[aria-label="Create Item"]').click()
    
    // Simulate back navigation
    cy.go('back')
    
    // Form should close
    cy.get('[data-testid="form-sheet"]').should('not.exist')
  })

  it('should handle keyboard navigation properly', () => {
    // Open form
    cy.get('[aria-label="Create Item"]').click()
    
    // Tab through form elements
    cy.get('body').tab()
    cy.focused().should('match', 'input, select, textarea, button')
    
    // Should maintain focus order
    cy.focused().tab()
    cy.focused().should('match', 'input, select, textarea, button')
  })

  it('should support date picker on mobile', () => {
    // Open form
    cy.get('[aria-label="Create Item"]').click()
    
    // Date inputs should be native on mobile
    cy.get('input[type="date"]')
      .should('be.visible')
      .click()
    
    // Should open native date picker (can't fully test but ensure input is accessible)
    cy.get('input[type="date"]').should('be.focused')
  })
})