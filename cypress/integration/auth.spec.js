describe("Authenticators", function() {
    it('auth 1', function() {
       cy.visit('/tweet/1/edit')
       cy.get('#title').contains('Peep Timeline')
       cy.url().should('not.contain', '/1/edit')
    })
    xit('auth 2', function() {
        cy.visit('/tweet/1/reply')
        cy.get('#title').contains('peep timeline')
        cy.url().should('not.contain', '/1/reply')
    })
    xit('auth 3', function() {
        cy.visit('/tweet/1/reply/1/edit')
        cy.get('#title').contains('peep timeline')
        cy.url().should('not.contain', '/1/reply/1/edit')
    })  
})