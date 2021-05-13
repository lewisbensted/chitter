describe("Register", function() {
    beforeEach(function() {
       cy.task('resetDb')
       cy.task('createUser')
       cy.visit('/login')
    })
    it('Check passing test', function(){
       cy.get('#email').type('seededtest@test.com')
       cy.get('#password').type('seededtestpassword')
       cy.get('#submit').click()
       cy.url().should('contain', '/tweet')
       cy.get('#email').should('not.exist')
    })
     it('Check invalid password', function(){
        cy.get('#email').type('seededtest@test.com')
        cy.get('#password').type('seededtestpasswor')
        cy.get('#submit').click()
        cy.url().should('contain', '/login')
        cy.get('#error').contains('Invalid username or password')
     })
     it('Check invalid username', function(){
        cy.get('#email').type('seededtes@test.com')
        cy.get('#password').type('seededtestpassword')
        cy.get('#submit').click()
        cy.url().should('contain', '/login')
        cy.get('#error').contains('Invalid username or password')
     })
})