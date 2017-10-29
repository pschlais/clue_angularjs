'use strict';

angular.module('gameMatrix')
	.component('gameMatrix', {
		templateUrl: 'game-matrix/game-matrix.template.html',
		controller: ['gameState', 
			function gameMatrixController(gameState) {
				var self = this;

				//references to service objects
				self.hands = gameState.data.hands;
				self.solution = gameState.data.solution;
				self.cards = gameState.data.cards;


				//methods
				self.translateCardStatus = function(cardHeld){
					//translates integer to English string based
					//on CardHeld enum in clue-classes.js
					if (cardHeld === CardHeld.YES) {
						return "O";
					} else if (cardHeld === CardHeld.NO) {
						return "X";
					} else if (cardHeld === CardHeld.UNKNOWN) {
						return "";
					} else {
						return "ERROR: input of " + cardHeld;
					}
				};

				self.confirmedCard = function(hand, card) {
					//returns true if the hand has the card
					return hand.hasCard(card);
				}

				self.eliminatedCard = function(hand, card) {
					return hand.checkCardStatus(card) === CardHeld.NO;
				}

				self.unknownCard = function(hand, card) {
					return hand.checkCardStatus(card) === CardHeld.UNKNOWN;
				}

				self.notSolutionCard = function(card) {
					return self.solution.checkCardStatus(card) === CardHeld.NO;
				}

				self.personCards = function() {
					//returns list of person cards
					let plist = [];
					self.cards.forEach(function(card) {
						if (card.cardType === CardType.PERSON) {
							plist.push(card);
						}
					});

					return plist;
				}

				self.weaponCards = function() {
					//returns list of weapon cards
					let wlist = [];
					self.cards.forEach(function(card) {
						if (card.cardType === CardType.WEAPON) {
							wlist.push(card);
						}
					});

					return wlist;
				}

				self.roomCards = function() {
					//returns list of room cards
					let rlist = [];
					self.cards.forEach(function(card) {
						if (card.cardType === CardType.ROOM) {
							rlist.push(card);
						}
					});

					return rlist;
				}

			}
		]
	});