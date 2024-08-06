/**
 * Algorithm: 
 * 1. Divide the 9 gold bars into 3 groups of 3 (A, B, C)
 * 2. Weigh the first two groups 
 *    - if A = B, the fake bar is in group C
 *    - if A < B, the fake bar is in group A
 *    - if A > B, the fake bar is in group B
 * 3. Once you know which group contains the fake bar, weight the first two bars from the group
 *    - if barA = barB, the fake bar is barC
 *    - if barA < barB, the fake bar is barA
 *    - if barA > barB, the fake bar is barB
 */

describe('Find the fake gold bar using the UI scale', () => {

  //Helpers 
    
  const getBalanceText = () => { //Extracting the result of the weighings 
    return cy.xpath("//div[@class='result']/button").invoke('text');
  };


  it('should find the fake gold bar efficiently using the UI', () => {

    cy.visit('http://sdetchallenge.fetch.com/')

    // First weighing: Determining which group has the fake bar
    cy.get('#left_0').type('0');
    cy.get('#left_1').type('1');
    cy.get('#left_2').type('2');
    cy.get('#right_0').type('3');
    cy.get('#right_1').type('4');
    cy.get('#right_2').type('5');
    cy.get('#weigh').click();

    cy.xpath("//div[@class='game-info']/ol/li").should('have.length', 1).then(() => {
      getBalanceText().then((firstWeighResult) => {
        let remainingBars;

        if (firstWeighResult.includes('>')) {
          cy.log('A > B, fake bar is in group B');
          remainingBars = ['coin_3', 'coin_4', 'coin_5'];
        } else if (firstWeighResult.includes('<')) {
          cy.log('A < B, fake bar is in group A');
          remainingBars = ['coin_0', 'coin_1', 'coin_2'];
        } else if (firstWeighResult.includes('=')) {
          cy.log('A = B, fake bar is in group C');
          remainingBars = ['coin_6', 'coin_7', 'coin_8'];
        } else {
          cy.log('Error: Weighing was not completed.');
          return;
        }

        // Second weighing: Weigh the first two bars of the remaining group
        cy.get('#left_0').clear().type(remainingBars[0]);
        cy.get('#left_1').clear();
        cy.get('#left_2').clear();
        cy.get('#right_0').clear().type(remainingBars[1]);
        cy.get('#right_1').clear();
        cy.get('#right_2').clear();
        cy.get('#weigh').click();

        cy.xpath("//div[@class='game-info']/ol/li").should('have.length', 2).invoke('text').then((weighingText) => {
          getBalanceText().then((secondWeighResult) => {

          let fakeBar;
            if (secondWeighResult.includes('>')) {
              cy.log(`Fake bar is ${remainingBars[1]}`);
              fakeBar = remainingBars[1];
            } else if (secondWeighResult.includes('<')) {
              cy.log(`Fake bar is ${remainingBars[0]}`);
              fakeBar = remainingBars[0];
            } else if (secondWeighResult.includes('=')) {
              cy.log(`Fake bar is ${remainingBars[2]}`);
              fakeBar = remainingBars[2];
            } else {
              cy.log('Error: Second weighing was not completed.');
            }

             // Attach the alert listener before the click
             cy.window().then((win) => {
              cy.stub(win, 'alert').as('alert');
            });

            // Click the fake bar
            cy.get(`#${fakeBar}`).click();

            // Assert on the alert text and log the required data
            cy.get('@alert').should('have.been.calledWith', 'Yay! You find it!');
            
            // Log the number of weighings and the weighing texts
            cy.xpath("//div[@class='game-info']/ol/li").invoke('text').then((weighingText) => {
              cy.log(`Number of weighings: 2`);
              cy.log(`List of weighings: ${weighingText}`);
            });
          });
        });
      });
    });
  });
});