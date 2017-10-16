'use strict';
//clue-classes.js must be loaded before this

angular.
	module('core.gameState').
		factory('gameState', [ //put DI's here if applicable
			function(){

				let allCardNames = ClueUtil.allCardNames();
				let cards = ClueUtil.generateAllClueCards();
				let guesses = [];
				let hands = [];
				let solution;

				let _findCardObject = function(name) {
					//finds Card() based on name property
					let foundCard = null;
					cards.forEach(function(card){
						if (card.name === name) {
							foundCard = card;
							return;
						}
					});

					if (foundCard) {
						return foundCard;
					} else {
						//if no card is found, throw an error
						throw new Error("Card '" + name + "' was not found.");
					}
				};

				let setUpGame = function(mainPlayer, otherPlayers){
					/*Sets up Hand() objects based on inputs from
					  gameSetup component.

					  INPUTS:
					  	-mainPlayer: {name:string, cards:[string]}
					  	-otherPlayers: [{name:string, cardCount:int}]
					*/
					//----- Main Player Hand ------
					//get card objects in MP hand
					let MPcardObjects = [];
					mainPlayer.cards.forEach(function(cardName){
						MPcardObjects.push(_findCardObject(cardName));
					});
					//create hand, add to list
					let MPhand = new Hand(mainPlayer.name, MPcardObjects.length,
						cards, true, false, MPcardObjects);
					hands.push(MPhand);

					//----- Other Player Hands -----
					otherPlayers.forEach(function(player){
						//create object, add to list
						let playerHand = new Hand(player.name, player.cardCount,
										cards, false, false);
						hands.push(playerHand);
					});

					//----- Solution Hand ---------
					solution = new Solution(cards);
				};

				return {
					data: {
						cardNameList: allCardNames,
						guesses: guesses,
						hands: hands,
						solution: solution,
						cards: cards,
					},
					//service functions here
					setUpGame: setUpGame,

					/*
					changeFirstCard: function() {
							this.data.cards[0].name = this.data.cards[0].name + "a";
						}
					*/
				}; //return object
		}]);
