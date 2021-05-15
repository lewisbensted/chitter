describe("Login", function() {
    beforeEach(function() {
       cy.task('resetDb')
       cy.task('createUser')
       cy.visit('/login')
    })
    it('check passing test', function(){
       cy.get('#email').type('testuser1@test.com')
       cy.get('#password').type('testpassword1')
       cy.get('#submit').click()
       cy.get('#title').contains('Peep Timeline')
       cy.url().should('contain','/tweet')
    })
    it('check layout', function(){
      cy.get('#title').contains('Login')
      cy.get('#login')
      cy.get('#register')
    })
    it('check invalid password', function(){
      cy.get('#email').type('testuser2@test.com')
      cy.get('#password').type('testpassword1')
      cy.get('#submit').click()
      cy.get('#title').contains('Login')
      cy.get('#error').contains('Invalid email or password')
      cy.url().should('contain','/login')
   })
   it('check invalid password', function(){
      cy.get('#email').type('testuser1@test.com')
      cy.get('#password').type('testpassword2')
      cy.get('#submit').click()
      cy.get('#title').contains('Login')
      cy.get('#error').contains('Invalid email or password')
      cy.url().should('contain','/login')
   })
  
})