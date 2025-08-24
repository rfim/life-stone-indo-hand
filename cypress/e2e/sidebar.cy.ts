/**
 * E2E tests for sidebar functionality
 * Tests the 3-state hideable sidebar behavior, persistence, and keyboard shortcuts
 */

describe('Sidebar', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    cy.clearLocalStorage()
    cy.visit('/')
  })

  describe('Sidebar States', () => {
    it('should start in expanded state by default', () => {
      cy.get('[aria-label="Primary navigation"]').should('be.visible')
      cy.get('[aria-label="Primary navigation"]').should('have.class', 'w-[var(--sidebar-width,264px)]')
    })

    it('should collapse when chevron button is clicked', () => {
      // Click chevron to collapse
      cy.get('button').contains('svg').click() // Chevron button
      cy.get('[aria-label="Primary navigation"]').should('have.class', 'w-[72px]')
      
      // Verify localStorage
      cy.window().then((win) => {
        expect(win.localStorage.getItem('ls.sidebar.state')).to.equal('collapsed')
      })
    })

    it('should hide when hamburger is clicked twice', () => {
      // First click - should hide (desktop behavior)
      cy.get('button[aria-label="Toggle sidebar"]').click()
      cy.get('[aria-label="Primary navigation"]').should('not.exist')
      
      // Should show "Show sidebar" pill
      cy.contains('Show sidebar').should('be.visible')
      
      // Verify localStorage
      cy.window().then((win) => {
        expect(win.localStorage.getItem('ls.sidebar.state')).to.equal('hidden')
      })
    })

    it('should show sidebar when "Show sidebar" pill is clicked', () => {
      // Hide sidebar first
      cy.get('button[aria-label="Toggle sidebar"]').click()
      cy.get('[aria-label="Primary navigation"]').should('not.exist')
      
      // Click show sidebar pill
      cy.contains('Show sidebar').click()
      cy.get('[aria-label="Primary navigation"]').should('be.visible')
      
      // Verify localStorage
      cy.window().then((win) => {
        expect(win.localStorage.getItem('ls.sidebar.state')).to.equal('expanded')
      })
    })
  })

  describe('Keyboard Shortcuts', () => {
    it('should cycle states with Ctrl+B', () => {
      // Initial state: expanded
      cy.get('[aria-label="Primary navigation"]').should('be.visible')
      
      // Ctrl+B -> collapsed
      cy.get('body').type('{ctrl+b}')
      cy.get('[aria-label="Primary navigation"]').should('have.class', 'w-[72px]')
      
      // Ctrl+B -> hidden
      cy.get('body').type('{ctrl+b}')
      cy.get('[aria-label="Primary navigation"]').should('not.exist')
      
      // Ctrl+B -> expanded
      cy.get('body').type('{ctrl+b}')
      cy.get('[aria-label="Primary navigation"]').should('be.visible')
      cy.get('[aria-label="Primary navigation"]').should('have.class', 'w-[var(--sidebar-width,264px)]')
    })

    it('should collapse with [ key', () => {
      cy.get('body').type('[')
      cy.get('[aria-label="Primary navigation"]').should('have.class', 'w-[72px]')
    })

    it('should expand with ] key', () => {
      // Collapse first
      cy.get('body').type('[')
      cy.get('[aria-label="Primary navigation"]').should('have.class', 'w-[72px]')
      
      // Expand with ]
      cy.get('body').type(']')
      cy.get('[aria-label="Primary navigation"]').should('have.class', 'w-[var(--sidebar-width,264px)]')
    })

    it('should not trigger shortcuts when typing in input fields', () => {
      // Focus on search input
      cy.get('input[placeholder="Search..."]').click().type('[test]')
      
      // Sidebar should remain expanded
      cy.get('[aria-label="Primary navigation"]').should('be.visible')
      cy.get('[aria-label="Primary navigation"]').should('have.class', 'w-[var(--sidebar-width,264px)]')
      
      // Input should contain the typed text
      cy.get('input[placeholder="Search..."]').should('have.value', '[test]')
    })
  })

  describe('Navigation', () => {
    it('should navigate to different modules', () => {
      // Test Masters navigation
      cy.contains('Items').click()
      cy.url().should('include', '/masters/items')
      cy.contains('Items Management').should('be.visible')
      
      // Test Purchasing navigation
      cy.contains('Purchase Request').click()
      cy.url().should('include', '/purchasing/purchase-requests')
      cy.contains('Purchase Request Management').should('be.visible')
    })

    it('should highlight active navigation item', () => {
      cy.contains('Items').click()
      cy.contains('Items').parent().should('have.class', 'bg-accent')
    })
  })

  describe('Group Collapse', () => {
    it('should collapse and expand navigation groups', () => {
      // Click Masters group header to collapse
      cy.contains('Masters').click()
      cy.contains('Items').should('not.be.visible')
      
      // Verify localStorage
      cy.window().then((win) => {
        expect(win.localStorage.getItem('ls.sidebar.group.Masters')).to.equal('true')
      })
      
      // Click again to expand
      cy.contains('Masters').click()
      cy.contains('Items').should('be.visible')
      
      // Verify localStorage
      cy.window().then((win) => {
        expect(win.localStorage.getItem('ls.sidebar.group.Masters')).to.equal('false')
      })
    })
  })

  describe('Persistence', () => {
    it('should persist sidebar state across page refreshes', () => {
      // Collapse sidebar
      cy.get('body').type('[')
      cy.get('[aria-label="Primary navigation"]').should('have.class', 'w-[72px]')
      
      // Refresh page
      cy.reload()
      
      // Should maintain collapsed state
      cy.get('[aria-label="Primary navigation"]').should('have.class', 'w-[72px]')
    })

    it('should persist group collapse state', () => {
      // Collapse Masters group
      cy.contains('Masters').click()
      cy.contains('Items').should('not.be.visible')
      
      // Refresh page
      cy.reload()
      
      // Masters should remain collapsed
      cy.contains('Items').should('not.be.visible')
    })
  })

  describe('Mobile Behavior', () => {
    beforeEach(() => {
      // Set mobile viewport
      cy.viewport(800, 600)
    })

    it('should show drawer overlay on mobile', () => {
      cy.get('button[aria-label="Toggle sidebar"]').click()
      cy.get('.fixed.inset-0.z-50').should('be.visible') // Overlay
      cy.get('.fixed.left-0.top-0').should('be.visible') // Drawer
    })

    it('should close drawer when overlay is clicked', () => {
      cy.get('button[aria-label="Toggle sidebar"]').click()
      cy.get('.fixed.inset-0.z-50').click()
      cy.get('.fixed.inset-0.z-50').should('not.exist')
    })

    it('should close drawer with ESC key', () => {
      cy.get('button[aria-label="Toggle sidebar"]').click()
      cy.get('body').type('{esc}')
      cy.get('.fixed.inset-0.z-50').should('not.exist')
    })
  })

  describe('Tooltips in Collapsed Mode', () => {
    it('should show tooltips for navigation items when collapsed', () => {
      // Collapse sidebar
      cy.get('body').type('[')
      cy.get('[aria-label="Primary navigation"]').should('have.class', 'w-[72px]')
      
      // Hover over a navigation item
      cy.get('[aria-label="Primary navigation"] a').first().trigger('mouseover')
      
      // Should show tooltip
      cy.get('[role="tooltip"]').should('be.visible')
    })
  })

  describe('CSS Variables', () => {
    it('should update CSS variables when sidebar state changes', () => {
      // Check initial CSS variable
      cy.window().then((win) => {
        const style = win.getComputedStyle(win.document.documentElement)
        const sidebarWidth = style.getPropertyValue('--sidebar-width')
        expect(sidebarWidth.trim()).to.equal('264px')
      })
      
      // Collapse sidebar
      cy.get('body').type('[')
      
      // Check updated CSS variable
      cy.window().then((win) => {
        const style = win.getComputedStyle(win.document.documentElement)
        const sidebarWidth = style.getPropertyValue('--sidebar-width')
        expect(sidebarWidth.trim()).to.equal('72px')
      })
    })
  })

  describe('Events', () => {
    it('should fire sidebar:changed event when state changes', () => {
      let eventFired = false
      
      cy.window().then((win) => {
        win.addEventListener('sidebar:changed', () => {
          eventFired = true
        })
      })
      
      // Change sidebar state
      cy.get('body').type('[')
      
      cy.window().then(() => {
        expect(eventFired).to.be.true
      })
    })
  })
})