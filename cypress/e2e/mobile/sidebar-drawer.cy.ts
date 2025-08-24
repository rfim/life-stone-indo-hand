/// <reference types="cypress" />

describe('Mobile Sidebar Drawer', () => {
  beforeEach(() => {
    // Set mobile viewport
    cy.viewport(375, 667)
    cy.visit('/')
  })

  it('should open and close the mobile drawer', () => {
    // Drawer should be closed initially
    cy.get('[data-testid="mobile-drawer"]').should('not.exist')
    
    // Click hamburger menu to open drawer
    cy.get('[aria-label="Toggle sidebar"]').click()
    
    // Drawer should be visible
    cy.get('[data-testid="mobile-drawer"]').should('be.visible')
    cy.get('[data-testid="mobile-drawer"]').should('contain', 'Life Stone Indonesia')
    
    // Close drawer by clicking close button
    cy.get('[aria-label="Close sidebar"]').click()
    
    // Drawer should be hidden
    cy.get('[data-testid="mobile-drawer"]').should('not.exist')
  })

  it('should close drawer when clicking on overlay', () => {
    // Open drawer
    cy.get('[aria-label="Toggle sidebar"]').click()
    cy.get('[data-testid="mobile-drawer"]').should('be.visible')
    
    // Click on overlay (outside drawer)
    cy.get('body').click(50, 50)
    
    // Drawer should close
    cy.get('[data-testid="mobile-drawer"]').should('not.exist')
  })

  it('should navigate to different pages and close drawer', () => {
    // Open drawer
    cy.get('[aria-label="Toggle sidebar"]').click()
    
    // Expand Masters group if collapsed
    cy.get('[data-testid="mobile-drawer"]')
      .contains('Masters')
      .click()
    
    // Click on Items
    cy.get('[data-testid="mobile-drawer"]')
      .contains('Items')
      .click()
    
    // Should navigate to items page and close drawer
    cy.url().should('include', '/masters/items')
    cy.get('[data-testid="mobile-drawer"]').should('not.exist')
    
    // Header should show app title on mobile
    cy.get('header').should('contain', 'Life Stone')
  })

  it('should maintain focus trap inside drawer', () => {
    // Open drawer
    cy.get('[aria-label="Toggle sidebar"]').click()
    
    // Focus should be on close button
    cy.get('[aria-label="Close sidebar"]').should('be.focused')
    
    // Tab through drawer elements
    cy.focused().tab()
    cy.focused().should('contain', 'Masters')
    
    // Tab backwards should go to last focusable element
    cy.focused().tab({ shift: true })
    cy.focused().should('have.attr', 'aria-label', 'Close sidebar')
  })

  it('should close drawer on Escape key', () => {
    // Open drawer
    cy.get('[aria-label="Toggle sidebar"]').click()
    cy.get('[data-testid="mobile-drawer"]').should('be.visible')
    
    // Press Escape
    cy.get('body').type('{esc}')
    
    // Drawer should close
    cy.get('[data-testid="mobile-drawer"]').should('not.exist')
  })

  it('should support swipe gesture to close', () => {
    // Open drawer
    cy.get('[aria-label="Toggle sidebar"]').click()
    cy.get('[data-testid="mobile-drawer"]').should('be.visible')
    
    // Simulate swipe left gesture on drawer
    cy.get('[data-testid="mobile-drawer"]')
      .trigger('touchstart', { touches: [{ clientX: 200, clientY: 300 }] })
      .trigger('touchmove', { touches: [{ clientX: 100, clientY: 300 }] })
      .trigger('touchend')
    
    // Drawer should close after swipe
    cy.get('[data-testid="mobile-drawer"]').should('not.exist')
  })

  it('should lock body scroll when drawer is open', () => {
    // Open drawer
    cy.get('[aria-label="Toggle sidebar"]').click()
    
    // Body should have overflow hidden
    cy.get('body').should('have.css', 'overflow', 'hidden')
    cy.get('body').should('have.css', 'position', 'fixed')
    
    // Close drawer
    cy.get('[aria-label="Close sidebar"]').click()
    
    // Body scroll should be restored
    cy.get('body').should('not.have.css', 'overflow', 'hidden')
    cy.get('body').should('not.have.css', 'position', 'fixed')
  })

  it('should persist group collapse state', () => {
    // Open drawer
    cy.get('[aria-label="Toggle sidebar"]').click()
    
    // Collapse Masters group
    cy.get('[data-testid="mobile-drawer"]')
      .contains('Masters')
      .click()
    
    // Masters items should be hidden
    cy.get('[data-testid="mobile-drawer"]')
      .contains('Items')
      .should('not.be.visible')
    
    // Close and reopen drawer
    cy.get('[aria-label="Close sidebar"]').click()
    cy.get('[aria-label="Toggle sidebar"]').click()
    
    // Masters group should still be collapsed
    cy.get('[data-testid="mobile-drawer"]')
      .contains('Items')
      .should('not.be.visible')
  })
})