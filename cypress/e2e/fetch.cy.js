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

    cy.xpath("//div[@class='game-info']/ol/li").invoke('text').then((text) => {
      cy.wrap(text).as('balanceText');

      cy.get('@balanceText').then((balanceText) => {
        let remainingBars;

        if (balanceText.includes('>')) {
          cy.log('A > B, fake bar is in group B');
          remainingBars = ['coin_3', 'coin_4', 'coin_5'];
        } else if (balanceText.includes('<')) {
          cy.log('A < B, fake bar is in group A');
          remainingBars = ['coin_0', 'coin_1', 'coin_2'];
        } else if (balanceText.includes('=')) {
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

        cy.xpath("//div[@class='game-info']/ol/li").should('have.length', 2).last().invoke('text').then((secondText) => {
          cy.wrap(secondText).as('secondBalanceText');

          let fakeBar;

          cy.get('@secondBalanceText').then((secondBalanceText) => {
            if (secondBalanceText.includes('>')) {
              cy.log(`Fake bar is ${remainingBars[1]}`);
              fakeBar = remainingBars[1];
            } else if (secondBalanceText.includes('<')) {
              cy.log(`Fake bar is ${remainingBars[0]}`);
              fakeBar = remainingBars[0];
            } else if (secondBalanceText.includes('=')) {
              cy.log(`Fake bar is ${remainingBars[2]}`);
              fakeBar = remainingBars[2];
            } else {
              cy.log('Error: Second weighing was not completed.');
            }

            cy.get(`#${fakeBar}`).click();

            cy.on('window:alert', (str) => {
              expect(str).to.equal('Yay! You find it!');
            });

          });
        });
      });
    });
  });
});