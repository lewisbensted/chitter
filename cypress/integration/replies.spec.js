describe("Replies", function() {
    beforeEach(function() {
       cy.task("resetDb")
       cy.task("createTweet")
       cy.visit('/tweet')
    })
    it('check replies displayed', function(){
       cy.get('#tweet-0').contains('seeded test tweet')  
       cy.get('#tweet-0-reply-0').contains('seeded test reply')
       cy.get('#tweet-0-reply-0-timestamp').contains('10:40 12-10-1995')
    })
    it('check new reply can be added', function(){
       cy.get('#tweet-0-reply').click()
       cy.url().should('contain', '/reply')
       cy.get('#reply-text').type('test reply 1')
       cy.get('#save').click()
       cy.get('#tweet-0-reply-1').contains('test reply 1')
    })
})