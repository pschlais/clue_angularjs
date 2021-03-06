'use strict';

angular.module('guessEntry')
	.component('guessEntry', {
		templateUrl: 'guess-entry/guess-entry.template.html',
		controller: ['gameState', 
			function guessEntryController(gameState) {
				var self = this;

				//View states (enum)
				self.GuessProgression = {GUESSING_PLAYER: 1,
										SHOWING_PLAYER: 2,
										SUSPECT: 3,
										WEAPON: 4,
										ROOM: 5,
										SHOWN_CARD: 6,
										GUESS_SUMMARY: 7
										};
				
				self.currentView = self.GuessProgression.GUESS_SUMMARY; //default

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


				//-------------------- METHODS -----------------------------------

				//------ display functions -------------------
				self.shownCardOptions = function() {
					//returns a list of the possible cards shown from the guess.
					//Only applies if "You" guessed and were shown a card.
					return [self.guessPerson, self.guessWeapon, self.guessRoom];
				};

				self.incrementView = function() {
					//Increments self.currentView, in order of self.GuessProgression
					if (self.currentView + 1 === self.GuessProgression.SHOWN_CARD
						&& self.guessPlayer !== self.hands[0].name) {
						//special case: if the guessing player is not the main player (hands[0], "You"),
						//				then skip the "Shown Card" input prompt
						self.currentView += 2;
					} else if (self.currentView + 1 === self.GuessProgression.SHOWN_CARD
						&& self.guessPlayer === self.hands[0].name
						&& self.showPlayer === self.noShowPlayerOption) {
						//special case: if the guessing player IS the main player (hands[0], "You")
						//				and no card is shown, then skip the "Shown Card" input prompt
						self.currentView += 2;
					} else {
						//increment view
						self.currentView++;
					}
				};

				self.decrementView = function() {
					//"Decrements" self.currentView, in ordre of self.GuessProgression
					if (self.currentView - 1 === self.GuessProgression.SHOWN_CARD
						&& self.guessPlayer !== self.hands[0].name) {
						//special case: if the guessing player is not the main player (hands[0], "You"),
						//				then skip the "Shown Card" input prompt
						self.currentView -= 2;
					} else {
						//increment view
						self.currentView--;
					}
				}

				self.startPrompts = function() {
					//resets self.currentView to the first prompt.
					self.currentView = self.GuessProgression.GUESSING_PLAYER;
				};


				//------ call to gameState service functions ---------------
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
				};

				self.verifyGuessIsValid = function() {
					/*verifies that the current guess inputs are logically valid given the 
						current game state. Assumes that all of the necessary inputs are filled
						in.
						
						Returns an array of strings of any warnings concerning the guess. An empty
						array is returned if the guess is valid.
					*/
					return gameState.verifyGuessIsValid(self.guessPerson, self.guessWeapon,
									   self.guessRoom, self.guessPlayer,
									   self.showPlayer, self.shownCard,
									   self.noShowPlayerOption);
				};

				//------ input validation functions ----------------------
				self.completeGuessCards = function() {
					//returns true if all of guessPerson, guessWeapon, and
					//guessRoom are filled in
					return self.guessPerson !== "" &&
						   self.guessWeapon !== "" &&
						   self.guessRoom !== "";
				};

				self.completeGuessPlayers = function() {
					//returns true if guessPlayer, showPlayer are filled in
					return self.guessPlayer !== "" &&
						   self.showPlayer !== "";
				};

				self.completeShownCard = function() {
					//returns true if shownCard is filled in
					return self.shownCard !== "";
				};

				self.guessShowPlayersDifferent = function() {
					//returns true if guessPlayer and showPlayer are not the same.
					return self.guessPlayer !== self.showPlayer;
				};

				self.mainPlayerGuessAndShow = function() {
					//returns true if the guessing player is "You" and someone shows a card
					return self.guessPlayer === "You" && 
					!(self.showPlayer === "" ||
					self.showPlayer === self.noShowPlayerOption);
				};

				self.basicRequirementsMet = function() {
					if (!self.mainPlayerGuessAndShow()) {
						//validate all fields are filled before checking validity of guess
						return self.completeGuessCards() && self.completeGuessPlayers() &&
							   self.guessShowPlayersDifferent();
					} else {
						//need to check shownCard input as well as all others
						return self.completeGuessCards() && self.completeGuessPlayers() &&
								self.guessShowPlayersDifferent() && self.completeShownCard();
					}
				};

				self.validateAllInputs = function() {
					//returns true if the inputs provided are all valid and
					//ready to send to the gameState service for a new guess.
					if (self.basicRequirementsMet()) {
						//only check if the guess is valid if the basic requirements are met
						return self.verifyGuessIsValid().length === 0;

					} else {//some inputs are not complete
						return false;
					}
					
				
				};
			}
		]
	});