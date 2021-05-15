describe("Homepage", function() {
   beforeEach(function() {
       cy.visit('/')
   })
   it('Check login button', function(){
       cy.contains('Welcome to Chitter')
       cy.get('#login')
       cy.get('#register')
   })
    it('Check register button', function(){
       cy.get('#register').click()
       cy.url().should('contain', '/register')
       cy.get('#username')
   })  
    it('Check login button', function(){
      cy.get('#login').click()
      cy.url().should('contain', '/login')
      cy.get('#email')
   }) 
})