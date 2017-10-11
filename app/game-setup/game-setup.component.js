'use strict';

angular.module('gameSetup')
	.component('gameSetup', {
		templateUrl: 'game-setup/game-setup.template.html',
		controller: ['gameState', 
			function gameSetupController(gameState) {
				var self = this;

				//properties
				self.minCards = 3; //6 total players
				self.maxCards = 6; //3 total players
				self.totalCardsInHands = 18; //18 cards in hands, 3 in solution
				self.minOtherPlayers = 2;
				self.maxOtherPlayers = 5;

				self.mainPlayer = {name: "You", cards: ["", "", ""]};
				// self.mainPlayer = {name: "You", cardCount: 1, cards: ["", "", ""]};
				self.otherPlayers = [{name: "Player1", cardCount: self.minCards},
									 {name: "Player2", cardCount: self.minCards}];
				self.allCards = gameState.data.cardNameList;

				//methods
				
				/*
				self.updateCardCount = function(n_cards) {
					//updates the number of cards allocated to the main player
					let cardList = self.mainPlayer.cards;

					if (n_cards < cardList.length) {
						//remove extraneous cards from end of list
						cardList.splice(n_cards, cardList.length);
					} else if (n_cards > cardList.length) {
						//add empty cards ('') to the end of the list
						let n_cardsToAdd = n_cards - cardList.length;
						for (let i = 0; i < n_cardsToAdd; i++){
							cardList.push('');
						}
					}
				};
				*/

				self.addCard = function() {
					//adds one empty card ("") to the mainPlayer.cards list
					if (self.mainPlayer.cards.length < self.maxCards) {
						self.mainPlayer.cards.push("");
					}
				}

				self.addOtherPlayer = function() {
					//adds empty object to end of self.otherPlayers list.
					let max_other_players_count = 5;

					if (self.otherPlayers.length < max_other_players_count) {
						//add additional player if limit has not been reached
						self.otherPlayers.push({
							name: '',
							cardCount: self.minCards
						});
					}
				};

				self.getCardCount = function() {
					//counts the number of cards held by hands currently input
					let total = 0;
					//add main player cards
					total += self.mainPlayer.cards.length;
					//add other player cards
					self.otherPlayers.forEach(function(player) {
						total += player.cardCount;
					});
					//test card count
					return total;
				}

				self.removeCard = function(index) {
					//removes the card from mainPlayer.cards at the input index
					self.mainPlayer.cards.splice(index, 1);
				}

				self.removePlayer = function(index) {
					//removes the card from mainPlayer.cards at the input index
					self.otherPlayers.splice(index, 1);
				}

				self.mainPlayerCardsAtMax = function(){
					//tests if main player hand cannot grow larger
					return (self.mainPlayer.cards.length === self.maxCards);
				}

				self.otherPlayerCountAtMax = function(){
					//tests if other player count cannot grow larger
					return (self.otherPlayers.length === self.maxOtherPlayers);
				}

				self.validateCardCount = function(){
					//validates that there are 18 cards accounted for in 
					//player hands.

					//test card count
					return (self.getCardCount() === self.totalCardsInHands);
				}

				self.validateCardsFilled = function() {
					//validates that all of mainPlayer.cards are not ""
					return (self.mainPlayer.cards.indexOf("") === -1);
				}

				self.validatePlayersFilled = function() {
					//validates that all of mainPlayer.cards are not ""
					for (let i = 0; i < self.otherPlayers.length; i++) {
						if (self.otherPlayers[i].name === "") {
							return false;
						}
					}
					//no empty player names found
					return true;
				}

				self.validateCardsUnique = function() {
					//validates that all cards in mainPlayer.cards are unique

					if (self.mainPlayer.cards.length === 1) {
						//must be unique
						return true;
					} else {
						//loop through cards (all but last)
						for (let i = 0; i < self.mainPlayer.cards.length-1; i++) {
							//get current element
							let card = self.mainPlayer.cards[i];
							//check all elements after current index
							if (self.mainPlayer.cards.slice(i+1).indexOf(card) !== -1) {
								//found card duplicate. return false.
								return false;
							}
						}
						//if the loop completes, no duplicates found
						return true;
					}
				}

				self.validatePlayersUnique = function() {
					//validates that there are no duplicates in self.otherPlayers.name

					let playerNames = [];
					//loop through players
					for (let i = 0; i < self.otherPlayers.length; i++) {
						//get current element
						let playerName = self.otherPlayers[i].name;
						//check all elements after current index
						if (playerNames.indexOf(playerName) !== -1) {
							//found player name duplicate. return false.
							return false;
						} else {
							//add name to list of unique player names to check against
							playerNames.push(playerName);
						}
					}
					//if the loop completes, no duplicates found
					return true;
				}

				self.allInputsValidated = function(){
					//combines all input validation checks into one boolean.
					return self.validateCardCount() &&
						   self.validateCardsFilled() &&
						   self.validateCardsUnique() &&
						   self.validatePlayersFilled() &&
						   self.validatePlayersUnique();
				}

			}
		]
	});