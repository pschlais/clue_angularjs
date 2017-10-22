'use strict';

angular.module('guessEntry')
	.component('guessEntry', {
		templateUrl: 'guess-entry/guess-entry.template.html',
		controller: ['gameState', 
			function guessEntryController(gameState) {
				var self = this;

				//gameState service references
				self.hands = gameState.data.hands;
				self.solution = gameState.data.solution;

				//guess options (strings)
				self.personCardOptions = gameState.getCardNamesByType("person");
				self.weaponCardOptions = gameState.getCardNamesByType("weapon");
				self.roomCardOptions = gameState.getCardNamesByType("room");
				self.noShowPlayerOption = "no one";

				//guess attributes
				self.guessPerson = "";
				self.guessWeapon = "";
				self.guessRoom = "";
				self.guessPlayer = "";
				self.showPlayer = "";
				self.shownCard = "";

				//methods
				self.completeGuessCards = function() {
					//returns true if all of guessPerson, guessWeapon, and
					//guessRoom are filled in
					return self.guessPerson !== "" &&
						   self.guessWeapon !== "" &&
						   self.guessRoom !== "";
				}

				self.completeGuessPlayers = function() {
					//returns true if guessPlayer, showPlayer are filled in
					return self.guessPlayer !== "" &&
						   self.showPlayer !== "";
				}

				self.completeShownCard = function() {
					//returns true if shownCard is filled in
					return self.shownCard !== "";
				}

				self.guessShowPlayersDifferent = function() {
					//returns true if guessPlayer and showPlayer are not the same.
					return self.guessPlayer !== self.showPlayer;
				}

				// self.incompleteGuessCards = function() {
				// 	return !self.completeGuessCards();	
				// };

				self.mainPlayerGuessAndShow = function() {
					//returns true if the guessing player is "You" and someone
					return self.guessPlayer === "You" && 
					!(self.showPlayer === "" ||
					self.showPlayer === self.noShowPlayerOption);
				}

				self.shownCardOptions = function() {
					//returns a list of the possible cards shown from the guess.
					//Only applies if "You" guessed and were shown a card.
					return [self.guessPerson, self.guessWeapon, self.guessRoom];
				}

				self.validateAllInputs = function() {
					//returns true if the inputs provided are all valid and
					//ready to send to the gameState service for a new guess.
					if (!self.mainPlayerGuessAndShow()) {
						return self.completeGuessCards() &&
							   self.completeGuessPlayers() &&
							   self.guessShowPlayersDifferent();
					} else {
						//need to check shownCard input as well as all others
						return self.completeGuessCards() &&
							   self.completeGuessPlayers() &&
							   self.guessShowPlayersDifferent() &&
							   self.completeShownCard();
					}
				}

				self.addGuess = function() {
					//sends guess to gameState service for processing and clears
					//all inputs for a new guess.

					//send inputs to gameState service
					gameState.addGuess(self.guessPerson, self.guessWeapon,
									   self.guessRoom, self.guessPlayer,
									   self.showPlayer, self.shownCard,
									   self.noShowPlayerOption);
					//console.log('Guess sent');

					//clear entries
					self.guessPerson = "";
					self.guessWeapon = "";
					self.guessRoom = "";
					self.guessPlayer = "";
					self.showPlayer = "";
					self.shownCard = "";
				}
			}
		]
	});