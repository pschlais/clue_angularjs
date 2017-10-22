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
				let solution = new Solution(cards);
				let flags = {gameInitialized: false};

				//private functions
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

				let _findHandObject = function(name) {
					//finds Hand() based on name property
					let foundHand = null;
					
					//if empty string is input, return null
					if (name === "") {
						return foundHand;
					} else {
						//find Hand() with input name in hands array
						hands.forEach(function(hand){
							if (hand.name === name) {
								foundHand = hand;
								return;
							}
						});

						if (foundHand) {
							return foundHand;
						} else {
							//if no hand is found, throw an error
							throw new Error("Hand '" + name + "' was not found.");
						}
					}	
				};

				//public functions
				let addGuess = function(pcard, wcard, rcard, guessPlayer,
				showPlayer, shownCard, noShowPlayerOption) {
					/*Parses the guess inputs into "Clue" objects, then applies that
					  guess to determine if new cards can be deduced based on the
					  new information.

					INPUTS:
						pcard: 			string, name of person card
						wcard: 			string, name of weapon card
						rcard: 			string, name of room card
						guessPlayer: 	string, name of guessing player
						showPlayer:     string, name of showing player
						shownCard:  	string, name of shown card (only used if main
												player guesses)
						noShowPlayerOption: string, value to signify no player showed
													a card for this guess
					*/

					//correlate input strings to objects
					let personCard = _findCardObject(pcard);
					let weaponCard = _findCardObject(wcard);
					let roomCard = _findCardObject(rcard);
					let guessHand = _findHandObject(guessPlayer);
					
					let showHand;
					if (showPlayer === noShowPlayerOption) {
						showHand = null;
					} else {
						showHand = _findHandObject(showPlayer);
					}

					let shownCardObj;
					if (guessHand.mainPlayer && showHand !== null) {
						shownCardObj = _findCardObject(shownCard);
					} else {
						//input is not valid for non-main player guesses
						shownCardObj = null;
					}

					//create the guess object
					let guess = new Guess(personCard, weaponCard, roomCard,
										guessHand, showHand, shownCardObj);
					
					//add object to the list of guesses
					guesses.push(guess);

					//deduce new information based on guess
					ClueUtil.applyGuessToHands(guess, hands, solution);
					ClueUtil.processGuesses(hands, solution, guesses, cards);
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

					//----- Solution Hand --------- (already initialized)

					//--- Apply main player known card knowledge to other hands
					ClueUtil.newKnownCardUpdate(hands, solution, MPcardObjects);

					//set flag that game has been initialized
					flags.gameInitialized = true;
				};

				let getCardNamesByType = function(cardType) {
					//returns list of strings for all cards of given type.
					//Valid inputs are "person", "weapon", and "room".
					let cardNames = [];
					let cardTypeEnum;
					switch (cardType) {
						case "person":
							cardTypeEnum = CardType.PERSON;
							break;
						case "weapon":
							cardTypeEnum = CardType.WEAPON;
							break;
						case "room":
							cardTypeEnum = CardType.ROOM;
							break;
						default:
							throw new Error("Invalid card type input in 'getCardNamesByType()'" +
								" with input of '" + cardType + "'");
					}

					cards.forEach(function(card){
						if (card.cardType === cardTypeEnum) {
							cardNames.push(card.name);
						}
					});

					return cardNames;
				};


				//return factory object
				return {
					data: {
						cardNameList: allCardNames,
						guesses: guesses,
						hands: hands,
						solution: solution,
						cards: cards,
					},
					//state flags
					flags: flags,

					//service functions here
					addGuess: addGuess,
					setUpGame: setUpGame,
					getCardNamesByType: getCardNamesByType,

				}; 
			}
		]);
