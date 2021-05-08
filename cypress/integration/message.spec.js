describe("Messages", function() {
    beforeEach(function() {
      cy.task("resetDb")
      cy.visit('/message')
    })
    xit('Check message correctly displayed', function(){
        cy.get('#tweet-text').type('test tweet')
        cy.get('#save').click()
        cy.url().should('contain', '/message')
        cy.get('#tweet-0').contains('test tweet')
    })
    xit('check message correctly deleted', function(){
        cy.get('#tweet-text').type('test tweet 2')
        cy.get('#save').click()
        cy.get('#tweet-0').contains('test tweet 2')
        cy.get('#tweet-0-delete').click()
        cy.get('#tweet-0').should('not.exist')
        cy.url().should('contain', '/message')
    })
    it('check edit works correctly', function(){
        cy.get('#tweet-text').type('test tweet 3')
        cy.get('#save').click()
        cy.get('#tweet-0').contains('test tweet 3')
        cy.get('#tweet-0-edit').click()
        cy.get('#edit-text').type('edited text')
        cy.get('#save').click()
        cy.get('#tweet-0').contains('edited text')

    })
})