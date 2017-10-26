'use strict';

angular.module('guessList')
	.component('guessList', {
		templateUrl: 'guess-list/guess-list.template.html',
		controller: ['gameState', 
			function guessListController(gameState) {
				let self = this;

				//gameState references
				self.guesses = gameState.data.guesses;
				self.hands = gameState.data.hands;
				//guess options (strings)
				self.personCardOptions = gameState.getCardNamesByType("person");
				self.weaponCardOptions = gameState.getCardNamesByType("weapon");
				self.roomCardOptions = gameState.getCardNamesByType("room");

				//properties
				self.guessFilter = {
					person: "!!",
					weapon: "!!",
					room: "!!",
					guessHand: "!!",
					showHand: "!!",
				};

				//functions
				self.translatePlayerName = function(hand) {
					/*Returns the string to print for a given Hand() object
						INPUTS:
							hand: Hand()
					*/
					if (hand !== null) {
						//print normally
						return hand.name;
					} else {
						//print applicable meaning of null
						return 'None';
					}
				};

				self.translateCardName = function(card) {
					/*Returns the string to print for a given Hand() object
						INPUTS:
							card: Card()
					*/
					if (card !== null) {
						//print normally
						return card.name;
					} else {
						//print applicable meaning of null
						return ' --- ';
					}
				}
			}
		]
	});