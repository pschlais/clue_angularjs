
//------------ ENUMS --------------------------------------
const CardType = {
	PERSON: 1,
	WEAPON: 2,
	ROOM: 3
};

const CardHeld = {
	YES: 1,
	NO: 2,
	UNKNOWN: 3
};


//------------ CLASSES -----------------------------------

class Card {
	/* Class for an individual card (e.g. Mr. Green, Candlestick, etc.)
	ATTRIBUTES:
		name: 		string [REQUIRED] (e.g. 'Mr. Green')
		cardType: CardType enum [REQUIRED] (e.g. CardType.PERSON)
		holder: 	Hand object [OPTIONAL]. Set to null if unknown. Value set by
										'assignHolder' method
	*/
	constructor(name, cardType, parentHand=null) {
		this.name = name;
		this.cardType = cardType;
		this.parentHand = parentHand;
	}

	assignHolder(holder) {
		if (holder instanceof Hand) {
			this.parentHand = holder;
		} else {
			throw new TypeError('Expected input of type Hand, recieved input of type "' + typeof(holder) + '"');
		}
	}

	isHolderKnown() {
		return Boolean(this.parentHand); //null is falsy
	}
}

class Hand {
	/* Class for a collection of cards (Card() objects). This could be a player or the solution hidden cards.
	ATTRIBUTES:
		name:  			string [REQUIRED]. ID for object.
		handSize: 	int [REQUIRED]. Number of total cards dealt at start of game. Not changed after assignment.
		fullCardList: [Card()] [REQUIRED]. Array of all Clue cards in the game, in Card() object format.
		mainPlayer: bool [OPTIONAL]. True if this is the player with the known full hand.
		solution: 	bool [OPTIONAL]. True if this is the 3-card solution
		checklist:  Map(Card()-->CardHeld enum) [OPTIONAL]. Initialized by internal method if not provided.
													Holds the deduction information deduced about the hand by the main player.
		knownCards: [Card()] [OPTIONAL]. List of cards known to be in the hand.
		*/
		constructor(name, handSize, fullCardList, mainPlayer=false,
								solution=false, knownCards=[], checklist=null) {
			this.name = name;
			this.handSize = handSize;
			this.mainPlayer = mainPlayer;
			this.solution = solution;
			this.knownCards = []; // here for readability only. Value set in code below.
			this.checklist = new Map(); //here for readability only. Value set in code below.

			//set up checklist: initialize if not provided, check input type is correct, validate that the
			//checklist is complete and sufficient (if externally provided)
			if (checklist===null) {
				this._initializeChecklist(fullCardList);
			} else if (!(checklist instanceof Map)) {
				throw new TypeError("Checklist input is not null or Map(), provided '" + typeof(checklist) +"'");
			} else {
				this._validateInputChecklist(checklist, fullCardList);
				//only reaches this point if the input is valid (function throws Error otherwise)
				this.checklist = checklist;
			}


			//set the known cards (if provided) and pass info to Card() objects on who holds the card
			let knownCardsList = [];

			if (knownCards !== null && !(knownCards instanceof Card || knownCards instanceof Array)) {
				//if knownCards is provided as an input, it must either be a Card() or Array instance.
				throw new TypeError("knownCards input is not null, Card(), or [Card()]. Provided '" + typeof(knownCards) + "'.");
			} else {
				if (knownCards === null) {
					knownCardsList = [];
				} else if (knownCards instanceof Card) {
					//if only a single card is provided not in an array, make it an array.
					knownCardsList = [knownCards];
				} else {
					knownCardsList = knownCards;
				}

				//add cards in knownCardsList to this.knownCards (plus attach Hand() reference to each card)
				const self = this;
				knownCardsList.forEach(function(card) {
					self.addKnownCard(card);
				});
			} // end if
		
		} //end constructor

		addKnownCard(card) {
			//Adds a Card() to the knownCards array and invokes Card.assignHolder(). Meant to be
			//used once the provided card has confirmed/deduced to be within this hand.
			if (!this.hasCard(card) && this.countKnownCards() < this.handSize) {
				//add card to known cards list
				this.knownCards.push(card);
				//assign hand as the parent hand of the card object
				card.assignHolder(this);
				//update the checklist
				this.updateChecklist(card, CardHeld.YES);
			}
			
		}

		allChecklistCards() {
			//returns an array of the full card list, via extracting all keys
			//from the checklist Map() object. This is a convenience function
			//to help with less parameter passes in external utility functions.
			//
			// INPUTS: none
			// OUTPUT: [Card()], full card list
			let cardList = [];
			this.checklist.forEach(function(value, key) {
				cardList.push(key);
			});
			return cardList;
		}
		
		checkCardStatus(card) {
			//returns CardHeld value in this.checklist Map() object. Throws error if 
			//the input is not in the map.
			if (this.checklist.has(card)) {
				return this.checklist.get(card);
			} else {
				throw new Error("Input '" + card + "' is not a key in the checklist.");
			}
		}

		countKnownCards() {
			//Counts the number of cards confirmed to be within this hand.
			return this.knownCards.length;
		}

		countNoCards() {
			//Counts the number of cards in the checklist with CardHeld.NO
			let noCount = 0;
			this.checklist.forEach(function(status, card) {
				if (status === CardHeld.NO) {
					noCount++;
				}
			});
			return noCount;
		}

		countUnknownCards() {
			//counts the number of cards in the checklist with CardHeld.UNKNOWN
			let unknownCount = 0;
			this.checklist.forEach(function(status, card) {
				if (status === CardHeld.UNKNOWN) {
					unknownCount++;
				}
			});
			return unknownCount;
		}

		hasCard(card) {
			//Tests to see if the provided Card() is in the knownCards list. Returns true or false.
			if (!(card instanceof Card)) {
				throw new TypeError("hasCard() expected input of type Card; input is of type '"
					+ typeof(card) + "'");
			} else {
				return (this.knownCards.indexOf(card) >= 0)
			}
		}

		updateChecklist(card, status) {
			//updates the checklist map for the given card to the new CardHeld status. Throws an 
			//error if the supplied card is not in the map.
			//Returns "true" if the change is new info.
			if (!this.checklist.has(card)) {
				throw new Error("Card input '" + card + "' is not a key in the checklist.");
			} else if (Object.values(CardHeld).indexOf(status) === -1) { 
				//supplied status is not a valid status (not a value in CardHeld object),
				//i.e. can't be accessed by any of the CardHeld named properties
				throw new Error("Status input '" + status + "' is not a valid status " +
					"for the checklist.");
			} else {
				//card and status inputs are valid
				let oldStatus = this.checkCardStatus(card); 
				this.checklist.set(card, status);
				//return true if the status has changed
				return (oldStatus !== status);
			}
		}

		deduceCardsByRemaining() {
			//deduces cards in hand by checking if the remaining number of 'open' slots
			//in hand are equal to the number of unknown cards in the checklist. If so,
			//this must mean that the unknown cards are held by the player.
			//  INPUTS: none
			//  OUTPUT: object {newInfo: true/false (were cards deduced?
			//                  deducedCards: [Card()] of deduced cards. returns empty array if none found.
			//                  }

			//get number of unknown cards from checklist (nChecklist)
			let fullCardList = this.allChecklistCards();
			let unknownCards = [];
			let nChecklist = this.countUnknownCards();
			//if no cards are listed as Unknown, the full hand is known. Need to go through
			//remainder of function since no new deductions can be made.
			if (nChecklist === 0) {
				return {newInfo: false,
						deducedCards: []};
			}
			
			//get list of all cards listed as unknown
			let self = this;
			fullCardList.forEach(function(card) {
				if (self.checkCardStatus(card) === CardHeld.UNKNOWN) {
					unknownCards.push(card);
				}
			});

			//get number of unknown cards from hand size and known cards (nHand)
			let nHand = this.handSize - this.countKnownCards();

			//If all cards in hand are known, the still-unknown cards can't be in the hand.
			//This should NOT be entered if there are no unknown cards, since there is no
			//new info to produce (hand is fully defined).
			if (nHand === 0 && unknownCards.length > 0) {
				unknownCards.forEach(function(card) {
					self.updateChecklist(card, CardHeld.NO);
				});
				//return new info found, but the location of cards weren't deduced
				return {newInfo: true,
						deducedCards: []};
			}
			//if there are unknown cards and the counts are equal, add cards to hand 
			//and return affermative object.
			else if (nHand > 0 && nChecklist === nHand) {
				unknownCards.forEach(function(card) {
					self.addKnownCard(card);
				})
				return {newInfo: true,
						deducedCards: unknownCards};
			} else {
				//no new info has been deduced by hand size to checklist comparison
				return {newInfo: false,
						deducedCards: []};
			}
		}
		
		_initializeChecklist(fullCardList) {
			//initializes this.checklist to a Map(Card --> CardType)
			var self = this;
			fullCardList.forEach(function(card) {
				if (self.mainPlayer) {
					//main player: all cards are known either "yes" or "no".
					//Set to "NO" initially because known cards are added at the end of
					//the constructor.
					self.checklist.set(card, CardHeld.NO);
				} else {
					//all other players: all cards in hand unknown
					self.checklist.set(card, CardHeld.UNKNOWN);
				}

			});
		}

		printHandStatus() {
			//prints the status of the hand to the console
			console.log(`--- Hand "{this.name}" ---`);
			console.log(`HAND SIZE:    {this.handSize}`);
			console.log(`KNOWN CARDS:  {this.countKnownCards()}`);
			this.knownCards.forEach(function(card) {console.log(`--{card.name}`)});
			console.log('');
			//ADD CHECKLIST
		}

		_validateInputChecklist(inputChecklist, fullCardList) {
			//validates the user input checklist is valid:
			// (1) input checklist is the correct length
			// (2) All keys are a Card
			// (3) All values are in the CardHeld listing (.YES, .NO, .UNKNOWN)
			//
			// Checks list is consistent with full card list by:
			// (4) All keys are in the fullCardList input

			//(1) input checklist length is the same as the full card list
			if (inputChecklist.size !== fullCardList.length) {
				throw new Error("Input checklist of size " + inputChecklist.size +
					", expected size of " + fullCardList.length);
			}

			inputChecklist.forEach(function(value, key) {
				//(2) All keys are a Card, else throw error
				if (!(key instanceof Card)) {
					throw new Error("Input checklist key '" + key + "' is not " +
						"a Card() object.");
				} 
				//(3) All values are in the CardHeld listing (numbers corresponding to
				//    .YES, .NO, .UNKNOWN)
				if (Object.values(CardHeld).indexOf(value) === -1) {
					throw new Error("Input checklist key '" + key + "' has an invalid " +
						"value pair of '" + value + "', expected a CardHeld property.");
				}
				//(4) All keys are in the fullCardsList array input
				if (fullCardList.indexOf(key) === -1) {
					throw new Error("Input checklist key '" + key.name +"' is not " +
						"in the supplied fullCardList input.");
				}
			});
		}
}

class Solution extends Hand {
	//Specific instance of Hand with 3 cards, and dedicated properties for each of the 
	//solution cards.
	constructor(fullCardList, knownCards=[]) {
		let cardCount = 3;
		let mainPlayer = false;
		let solution = true;
		//Hand() constructor
		super("Solution", 3, fullCardList, mainPlayer, solution, knownCards);
		//Solution() specific properties - solution cards (initialize to unknown/null)
		//
		//NOTE: this.addKnownCard() is called in the super() constructor. However, there is no
		//guarantee that three known cards were input, and if not, .person/.weapon/.room will
		//not be initialized. To solve this, all three properties will be set to null and
		//this.addKnownCard() will be called again on the knownCards input array.
		this.person = null;
		this.weapon = null;
		this.room = null;

		self = this;

		//call this.addKnownCard for each known card input in array
		knownCards.forEach(function(card) {
			self.addKnownCard(card);
		});

	}

	addKnownCard(card) {
		//only calls Hand().addKnownCard() if the corresponding card type solution is not
		//already set
		self = this;

		//PERSON known card
		if (card.cardType === CardType.PERSON && this.person === null) {
			//set solution card
			this.person = card;
			//add card to knownCards list
			super.addKnownCard(card);
			//set all other person cards in checklist to CardHeld.NO, since card is the solution
			this.checklist.forEach(function(status, checklistCard) {
				if (checklistCard.cardType === CardType.PERSON && checklistCard !== card) {
					self.updateChecklist(checklistCard, CardHeld.NO);
				}
			});

		//WEAPON known card
		} else if (card.cardType === CardType.WEAPON && this.weapon === null) {
			//set solution card
			this.weapon = card;
			//add card to knownCards list
			super.addKnownCard(card);
			//set all other weapon cards in checklist to CardHeld.NO, since card is the solution
			this.checklist.forEach(function(status, checklistCard) {
				if (checklistCard.cardType === CardType.WEAPON && checklistCard !== card) {
					self.updateChecklist(checklistCard, CardHeld.NO);
				}
			});
		
		//ROOM known card
		} else if (card.cardType === CardType.ROOM && this.room === null) {
			//set solution card
			this.room = card;
			//add card to knownCards list
			super.addKnownCard(card);
			//set all other room cards in checklist to CardHeld.NO, since card is the solution
			this.checklist.forEach(function(status, checklistCard) {
				if (checklistCard.cardType === CardType.ROOM && checklistCard !== card) {
					self.updateChecklist(checklistCard, CardHeld.NO);
				}
			});
		}
	}

	isPersonKnown() {
		return (this.person !== null);
	}

	isWeaponKnown() {
		return (this.weapon !== null);
	}

	isRoomKnown() {
		return (this.room !== null);
	}

	isFullSolutionKnown() {
		return (this.isPersonKnown() && this.isWeaponKnown() && this.isRoomKnown());
	}

	_countCardType(cardType) {
		//returns the number of a given type of cards within the checklist, regardless of status
		//INPUT: CardType object (CardType.PERSON, .WEAPON, or .ROOM)
		//OUTPUT: int
		let count = 0;
		let self = this;
		this.checklist.forEach(function(status, card) {
			if (card.cardType === cardType) {
				count++;
			}
		});
		return count;
	}

	_countCardTypeWithStatus(cardType, cardStatus) {
		//returns the number of a given type of cards within the checklist, with the given status
		//INPUT: cardType:    CardType object (CardType.PERSON, .WEAPON, or .ROOM)
		//		 cardStatus:  CardHeld object (CardHeld.YES, .NO, .UNKNOWN)
		//OUTPUT: int
		let count = 0;
		let self = this;
		this.checklist.forEach(function(status, card) {
			if (card.cardType === cardType && self.checkCardStatus(card) === cardStatus) {
				count++;
			}
		});
		return count;
	}

	deduceCardsByRemaining() {
		//overrides implementation inherited with Hand class, since the solution deduction
		//is more narrow by only comparing cards within a card type (e.g. weapon, etc.)
		// INPUT: none
		// OUTPUT: none (modifies object properties)

		let cardTypes = [CardType.PERSON, CardType.WEAPON, CardType.ROOM];
		let self = this;
		let deducedCards = [];

		//loop through the three card types
		cardTypes.forEach(function(cardType) {
			//if current card type has only 1 unknown card in checklist, that is the
			//solution for that card type. Otherwise, do nothing (no deduction can be made).
			if (self._countCardTypeWithStatus(cardType, CardHeld.UNKNOWN) === 1) {
				//get Card object with CardHeld.UNKNOWN status
				let solCard;
				self.checklist.forEach(function(status, card) {
					if (card.cardType === cardType && self.checkCardStatus(card) === CardHeld.UNKNOWN) {
						//set solCard to current card (only will assign once based on
						//conditional enveloping this forEach loop)
						solCard = card;
					}
				});
				//add card to Solution "hand", deduced cards
				self.addKnownCard(solCard);
				deducedCards.push(solCard);
			}

		});

		//return object with deduced cards, if applicable
		return {newInfo: (deducedCards.length > 0),
				deducedCards: deducedCards};
		

	}
}

class Guess {
	//Class for a guess. Contains data for the suspects called (person, weapon, room),
	//who called, and who showed.
	//ATTRIBUTES:
	//	person: Card() object [REQUIRED]
	//	weapon: Card() object [REQUIRED]
	//	card: Card() object [REQUIRED]
	//	guessHand: Hand() object [REQUIRED]
	//	showHand: Hand() object, or null if nobody showed a card [OPTIONAL]
	//	shownCard: Card() object or null [OPTIONAL]. Used if the guessHand is the
	//				main player and the showing player directly shows the main player
	//				a card.
	constructor(person, weapon, room, guessHand, showHand=null, shownCard=null) {
		this.person = person;
		this.weapon = weapon;
		this.room = room;
		this.guessHand = guessHand;
		this.showHand = showHand;
		this.shownCard = shownCard;
	}
}

class Player {
	/* Object to act as a player, either main player or others. Contains a Hand and
		has methods to do actions during a turn. The object contains the truly held
		cards in this.heldCards; this.hand contains the typical Hand() object as
		seen by the main player (i.e. the checklist of what is known to be in hand).

	ATTRIBUTES:
		name: string
		heldCards: [Card()]
		hand: Hand()
		isMainPlayer: boolean (default=false)
		isSolution: boolean (default=false)
	CONSTRUCTOR INPUTS:
		name: string [REQUIRED]
		fullCardList: [Card()], all cards in the game [REQUIRED]
		isMainPlayer: boolean (default=false)
		isSolution: boolean (default=false)
		heldCards: [Card()] [REQUIRED]
	*/
	constructor(name, fullCardList, mainPlayer=false, solution=false, heldCards) {
		this.name = name;
		this.heldCards = heldCards;
		this.isMainPlayer = mainPlayer;
		this.isSolution = solution;
		//set this.hand
		if (this.isSolution) {
			this.hand = new Solution(fullCardList, []);
		} else if (this.isMainPlayer) {
			this.hand = new Hand(name, heldCards.length, fullCardList, true, false, heldCards);
		} else {
			this.hand = new Hand(name, heldCards.length, fullCardList, false, false);
		}
	}

	hasCard(cards) {
		//Returns true if the provided card(s) are in self.heldCards, false otherwise.
		//Input 'cards' is a single Card() or array of Card().
		if (cards instanceof Card) {
			//returns true if "cards" (singular card) is in heldCards
			return (this.heldCards.indexOf(cards) !== -1);
		} else {
			for(let i = 0; i < cards.length; i++) {
				//if a card is in heldCards, return true
				if (this.heldCards.indexOf(cards[i]) !== -1) {
					return true;
				}
			}
			//if this point is reached, no input card was found in heldCards. return false.
			return false;
		}
	}

	showCard(cardListToShow) {
		/*Returns a Card() if the player holds one of the cards in the input list. Otherwise,
		//returns null. Current implementation returns the first positive result in the
		//input card list order.
		//  INPUT:
		//		-cardListToShow: [Card()]
		//	OUTPUT:
		//		-Card() if found, or null if no card found.
		*/
		//loop through cards
		for (let i = 0; i < cardListToShow.length; i++) {
			if (this.hasCard(cardListToShow[i])) {
				//found a card in hand, return it
				return cardListToShow[i];
			}
		}
		//if this point is reached, no supplied card is in heldCards
		return null;
	}
}

//-------------- IIFE MODULES ------------------------

var ClueUtil = (function() {

	//public functions
	let allCardNames = function(){
		//returns an array of strings containing the names of all cards.
		return [
			"Col. Mustard",
			"Miss Scarlet",
			"Mr. Green",
			"Mrs. Peacock",
			"Mrs. White",
			"Prof. Plum",

			"Candlestick",
			"Knife",
			"Lead Pipe",
			"Revolver",
			"Rope",
			"Wrench",
			
			"Ballroom",
			"Billiard Room",
			"Conservatory",
			"Dining Room",
			"Hall",
			"Kitchen",
			"Library",
			"Lounge",
			"Study",
			];
	};

	let applyGuessToHands = function(guess, hands, solution) {
		//Applies the results of a guess to all applicable players. This includes
		//the players who said "No" to the guess before a player showed a card.
		//This method updates the Hand checklists only. This method DOES NOT
		//deduce a card indirectly based on who said "No".
		//-If a card is shown to the main player, it is recorded specifically and
		//newKnownCardUpdate() is called to remove potential card from other players +
		//solution. 
		//
		//INPUTS:
		//	-guess --> Guess()
		//	-hands --> [Hand()], in the order of play
		//  -solution --> Solution()
		//
		//scenarios:
		//(1) Main player guesses
		//		(a) a player shows a card
		//			-the showing player has the card in hand
		//			-all in between players have all guess cards set to CardHeld.NO
		//		(b) no player shows a card
		//			-all non-main players have all guess cards set to CardHeld.NO
		//(2) Other player guesses
		//		(a) a player shows a card
		//			-all in between players have all guess cards set to CardHeld.NO
		//		(b) no player shows a card
		//			-all non-guessing players have all guess cards set to CardHeld.NO

		//first hand to process is after the guessing hand
		let i_start = hands.indexOf(guess.guessHand) + 1;

		//apply CardHeld.NO to hands between show-er and guesser that didn't show or guess.
		// i_start % hands.length causes the array to loop back to the beginning if the
		// end is reached, preventing an out-of-bounds error.
		while (hands[i_start % hands.length] !== guess.guessHand &&
				hands[i_start % hands.length] !== guess.showHand) {
			let currentHand = hands[i_start % hands.length];
			
			currentHand.updateChecklist(guess.person, CardHeld.NO);
			currentHand.updateChecklist(guess.weapon, CardHeld.NO);
			currentHand.updateChecklist(guess.room, CardHeld.NO);

			//increment counter
			i_start++;
		}

		// add known card to the showing hand if it was a direct show to the main player
		if (guess.guessHand.mainPlayer) {
			if(guess.shownCard !== null) {
				//add card to showing hand
				guess.showHand.addKnownCard(guess.shownCard);
				//remove shownCard as possible card for other players and solution
				newKnownCardUpdate(hands, solution, guess.shownCard);
			}
		} else { //guess made by non-main player

		}
	};

	let generateAllClueCards = function() {
		//returns list of all cards in Clue, as Card() objects
		let cardList = [];
		let cardMap = new Map([
			
			["Col. Mustard", CardType.PERSON],
			["Miss Scarlet", CardType.PERSON],
			["Mr. Green", CardType.PERSON],
			["Mrs. Peacock", CardType.PERSON],
			["Mrs. White", CardType.PERSON],
			["Prof. Plum", CardType.PERSON],

			["Candlestick", CardType.WEAPON],
			["Revolver", CardType.WEAPON],
			["Rope", CardType.WEAPON],
			["Wrench", CardType.WEAPON],
			["Lead Pipe", CardType.WEAPON],
			["Knife", CardType.WEAPON],

			["Study", CardType.ROOM],
			["Library", CardType.ROOM],
			["Conservatory", CardType.ROOM],
			["Hall", CardType.ROOM],
			["Kitchen", CardType.ROOM],
			["Ballroom", CardType.ROOM],
			["Dining Room", CardType.ROOM],
			["Lounge", CardType.ROOM],
			["Billiard Room", CardType.ROOM],

			]);

		//instantiate Card objects
		cardMap.forEach(function(value, key) {
			cardList.push(new Card(key, value))
		});

		return cardList;
	};

	let newKnownCardUpdate = function(hands, solution, knownCard) {
		//applies CardHeld.NO to non-parent hands for each card in knownCard.
		//INPUTS:
		//	-hands --> [Hand()], all hands
		//	-solution --> Solution() object
		//  -knownCard --> Card() or [Card()], single or list of cards where holder is newly known

		//do nothing for an empty input (null or [])
		if (knownCard === null || (knownCard instanceof Array && knownCard.length === 0)) {
			return;
		}

		//put together hands and solution into one array
		let handsPlusSol = hands.concat(solution);

		//find input type of knownCard
		let knownCardList;
		if (knownCard instanceof Card) {
			//put in array if a single card input
			knownCardList = [knownCard];
		} else {
			//already in array (NO ERROR CHECKING CURRENTLY FOR ALTERNATE TYPES)
			knownCardList = knownCard;
		}

		//loop through knownCardList, apply CardHeld.NO to all hands not holding the card
		knownCardList.forEach(function(card) {
			//loop through all hands
			handsPlusSol.forEach(function(hand) {
				//if hand does not have card, update checklist for card to CardHeld.NO
				if (!hand.hasCard(card)) {
					hand.updateChecklist(card, CardHeld.NO);
				}
			});
		});
	};

	let deduceCardSingleGuess = function(guess, allHands, solution) {
		//Deduces a card holder based on the known status of other cards in a single guess.
		//If a card is determined to be in a player's hand, the following methods are called:
		// 1) .addKnownCard(newCard) for holding player
		// 2) ClueUtil.newKnownCardUpdate
		//
		//INPUTS:
		//	-guess: Guess() object
		//	-allHands: [Hand()] containing all hands, order unimportant
		//  -solution: Solution()
		//
		//NOTE: This function DOES NOT deduce solution cards. deduceCardsByNos() contains
		//		that functionality. It only deduces the location of cards in players' hands.
		
		//guess cards
		let guessCardsToClassify = [guess.person, guess.weapon, guess.room];
		let guessCardsToLoop = guessCardsToClassify.slice(); //create shallow copy, not alias

		//alias for common check (was the showing hand a Hand(), i.e. not null?)
		let showHandNotNull = guess.showHand !== null;

		//count number of cards in guess where holder is known and not the showing player
		let n_known_shower = 0;
		guessCardsToLoop.forEach(function(card){
			
			if(showHandNotNull && guess.showHand.hasCard(card)){
				//increment counter, remove current card from list of cards to classify
				n_known_shower++;
				guessCardsToClassify.splice(guessCardsToClassify.indexOf(card),1);
			}
		});

		//count number of cards in guess where holder is known and not the showing player
		guessCardsToLoop = guessCardsToClassify.slice(); //reset loop with remaining cards
		let n_known_others = 0;
		guessCardsToLoop.forEach(function(card){
			if(card.isHolderKnown() && card.parentHand !== guess.showHand) {
				//increment counter, remove current card from list of cards to classify
				n_known_others++;
				guessCardsToClassify.splice(guessCardsToClassify.indexOf(card),1);
			}
		});

		//count number of cards known not to be in showing player's hand
		guessCardsToLoop = guessCardsToClassify.slice(); //reset loop with remaining cards
		let n_knownNo = 0;
		guessCardsToLoop.forEach(function(card){
			if(showHandNotNull && guess.showHand.checkCardStatus(card) === CardHeld.NO) {
				//increment counter, remove current card from list of cards to classify
				n_knownNo++;
				guessCardsToClassify.splice(guessCardsToClassify.indexOf(card),1);
			}
		});

		// --- FAILURE CASE 1: If any guess card is in the showing player's hand, there can be
		// 						no new info deduced.
		if (n_known_shower > 0) {
			//do nothing
			return false;
		}
		// --- SUCESS CASE 1: 2 cards are known to be in non-showing players' hands. Remaining
		//				 card can be deduced to be in the showing player's hand.
		else if (n_known_others === 2) {
			//unknown card is in the hand.
			let deducedCard;
			if (!guess.person.isHolderKnown()) {
				deducedCard = guess.person;
			} else if (!guess.weapon.isHolderKnown()) {
				deducedCard = guess.weapon;
			} else if (!guess.room.isHolderKnown()) {
				deducedCard = guess.room;
			} else {
				throw new Error("Error in ClueUtil.deduceCardSingleGuess for 2 known cards, " +
					"none of guessCard.isHolderKnown() for person, weapon, or room returned " +
					"'false'.");
			}
			//apply new knowledge - to hand if someone shows
			if (showHandNotNull) {
				guess.showHand.addKnownCard(deducedCard);
				newKnownCardUpdate(allHands, solution, deducedCard);
				//return successful deduction flag
				return true;
			} else {
				//no deductions to make **IN THIS FUNCTION** for no player showing a card
				return false;
			}
			
		}
		// --- SUCESS CASE 2: 2 cards are known not to be in the showing player. Remaining card can
		//				be deduced to be in the showing player's hand.
		else if (n_knownNo === 2) {
			//unknown card is in the hand
			let deducedCard;
			if (guess.showHand.checkCardStatus(guess.person) === CardHeld.UNKNOWN) {
				deducedCard = guess.person;
			} else if (guess.showHand.checkCardStatus(guess.weapon) === CardHeld.UNKNOWN) {
				deducedCard = guess.weapon;
			} else if (guess.showHand.checkCardStatus(guess.room) === CardHeld.UNKNOWN) {
				deducedCard = guess.room;
			} else {
				throw new Error("Error in ClueUtil.deduceCardSingleGuess for 2 known no's, " +
					"none of showHand.checkCardStatus() for person, weapon, or room returned " +
					"'CardHeld.UNKNOWN'.");
			}
			//apply new knowledge - to hand if someone shows
			if (showHandNotNull) {
				guess.showHand.addKnownCard(deducedCard);
				newKnownCardUpdate(allHands, solution, deducedCard);
				//return successful deduction flag
				return true;
			} else {
				//no deductions to make **IN THIS FUNCTION** for no player showing a card
				return false;
			}
		}
		// --- SUCCESS CASE 3: 1 card known not to be in showing player's hand, 1 card known to be in
		//				another player's hand. Remaining card can be deduced to be in the 
		//				showing player's hand.
		else if (n_known_others === 1 && n_knownNo === 1) {
			//unknown card is in the hand
			let deducedCard;
			if (guess.showHand.checkCardStatus(guess.person) === CardHeld.UNKNOWN &&
				!guess.person.isHolderKnown()) {
				deducedCard = guess.person;
			} else if (guess.showHand.checkCardStatus(guess.weapon) === CardHeld.UNKNOWN &&
				!guess.weapon.isHolderKnown()) {
				deducedCard = guess.weapon;
			} else if (guess.showHand.checkCardStatus(guess.room) === CardHeld.UNKNOWN && 
				!guess.room.isHolderKnown()) { 
				deducedCard = guess.room;
			} else {
				throw new Error("Error in ClueUtil.deduceCardSingleGuess for 1 known card + 1 known NO, " +
					"none of the person, weapon, or room guess cards were both not held by a hand " +
					"and had a status of 'CardHeld.UNKNOWN' for the showing player's hand.");
			}
			//apply new knowledge - to hand if someone shows
			if (showHandNotNull) {
				guess.showHand.addKnownCard(deducedCard);
				newKnownCardUpdate(allHands, solution, deducedCard);
				//return successful deduction flag
				return true;
			} else {
				//no deductions to make **IN THIS FUNCTION** for no player showing a card
				return false;
			}
		}
		// SPECIAL CASE 1: Showing player only has 1 remaining unknown card.
		//				   This means the remaining card must be in the guess. Set all
		//				   other cards to CardHeld.NO.
		else if (showHandNotNull && 
				 guess.showHand.handSize - guess.showHand.countKnownCards() === 1) {
			let guessCards = [guess.person, guess.weapon, guess.room];
			//loop over all game cards, track if update was made
			let newInfo = false;
			//apply to correct hand: solution
			guess.showHand.allChecklistCards().forEach(function(card){
				//only apply CardHeld.NO for cards not in guessCards
				if (guessCards.indexOf(card) === -1) {
					//new info after short-circuit "||", updateChecklist needs to be called
					//every time.
					newInfo = guess.showHand.updateChecklist(card, CardHeld.NO) || newInfo;
				}
			});
			//return if new info was produced
			return newInfo;
		} else {
			// --- ALL OTHER CASES: not enough info to deduce a new known card.
			return false;
		}
	};

	let deduceCardByNos = function(allHands, solution, cardsToCheck) {
		//If all other hands (players + solution) are known not to have a card, it must be in
		//the remaining player's hand. This function checks the supplied card(s) for this scenario
		//and adds a deduced card to that player's hand if possible.
		//	INPUTS: 
		//		-allHands: [Hand()]
		//		-solution: Solution()
		//		-cardsToCheck: Card() or [Card()]
		
		//Put solution into same array as allHands
		let allHandsPlusSol = allHands.concat(solution);
		//Make cardsToCheck an array if it is only a Card() input
		let cards;
		if (cardsToCheck instanceof Card) {
			cards = [cardsToCheck];
		} else { //array
			cards = cardsToCheck;
		}

		//loop through cards
		let handNos, handUnknowns; //arrays to hold which are 'NO' or 'UNKNOWN' for a card
		let newInfo = false; //flag if a card has been deduced or not
		cards.forEach(function(card) {
			//reset arrays
			handNos = [];
			handUnknowns = [];
			//loop over hands
			allHandsPlusSol.forEach(function(hand) {
				if(hand.checkCardStatus(card) === CardHeld.NO) {
					handNos.push(hand);
				} else if (hand.checkCardStatus(card) === CardHeld.UNKNOWN) {
					handUnknowns.push(hand);
				}
			});

			//if only one hand is unknown and all others are no, the card must be in 
			//the only unknown player's hand. Return true that a new card has been deduced.
			if (handUnknowns.length === 1 && 
				(handUnknowns.length + handNos.length) === allHandsPlusSol.length) {
				handUnknowns[0].addKnownCard(card);
				//set newInfo flag to true
				newInfo = true;
			}
		});
		//return new info flag
		return newInfo;
	};

	let processGuesses = function(allHands, solution, guessList, allCards) {
		/*Processes list of guesses and current game state to determine applicable 
			deductions. Assumes "applyGuessToHands" has already been called for all guesses.

			Checks the following:
			(1) deduceSingleCardGuess(), for each Guess() in guessList
			(2) deduceCardByNos(), for each Card() in allCards for each Hand() and Solution()
			(3) Hand.deduceCardsByRemaining() for each Hand() and applying newKnownCardUpdate()
				for any returned cards
			
			-If any of these actions return a value of True, a new deduction has been made,
			so the process must be run again with the new information to see if a it produces
			another deduction. Only exits when a full cycle produces no new deductions.
		*/

		let loop_max = 100; //impose hard limit to prevent unintentional infinite loop
		let i_loop = 0;
		let newInfo = true; //overall "new info" flag for loop
		let allHandsWSol = allHands.concat(solution);

		while (newInfo) { //do loop if new info was deduced in previous loop
			// (1) deduceCardSingleGuess
			let newInfo_sc = false;
			guessList.forEach(function(guess){
				let newInfo_guess = deduceCardSingleGuess(guess, allHands, solution);
				//keep tabs if any single guess has new info
				newInfo_sc = newInfo_sc || newInfo_guess;
			});

			// (2) deduceCardByNos for every card
			let newInfo_byNo = deduceCardByNos(allHands, solution, allCards);

			// (3) Hand.deduceCardsByRemaining() + newKnownCardUpdate()
			let newInfo_byRem = false;
			allHandsWSol.forEach(function(hand){
				let dedInfo = hand.deduceCardsByRemaining();
				//apply info based on deduction, if possible
				newKnownCardUpdate(allHands, solution, dedInfo.deducedCards);
				newInfo_byRem = newInfo_byRem || dedInfo.newInfo;
			});

			//determine if a deduction has been made (go through loop again)
			newInfo = newInfo_sc || newInfo_byNo || newInfo_byRem;

			//increment loop counter
			i_loop++;

			//break out of loop if max reached
			if (i_loop >= loop_max) {
				throw new Error("Reached max loop counter of " + loop_max + "in ClueUtil.processGuesses().");
			}
		}

		//return loop count
		return i_loop;
	};

	// ----- TO BE IMPLEMENTED: -------------------------------

	//private functions

	//test functions
	let _generateTestCards = function(pcards, wcards, rcards) {
		// Returns an object with a set of cards for controlled test purposes only.
		// All cards follow the naming convention with "Card Type" + "i", with i starting at 0
		// (e.g. "Person1", "Weapon0", "Room3")
		// INPUTS:
		//	pcards (int) -- number of person cards to generate
		//  wcards (int) -- number of weapon cards to generate
		//	rcards (int) -- number of room cards to generate
		// OUTPUT: single object with properties of:
		//	personCards ([Card]) -- array of person cards
		//  weaponCards ([Card]) -- array of weapon cards
		//  roomCards ([Card]) -- array of room cards
		//	allCards ([Card]) -- array of all generated cards
		let personCards = [];
		let weaponCards = [];
		let roomCards = [];
		let allCards = [];

		//generate person cards
		for (let i = 0; i < pcards; i++) {
			personCards.push(new Card("Person" + i, CardType.PERSON));
		}
		//generate weapon cards
		for (let j = 0; j < wcards; j++) {
			weaponCards.push(new Card("Weapon" + j, CardType.WEAPON));
		}
		//generate room cards
		for (let k = 0; k < rcards; k++) {
			roomCards.push(new Card("Room" + k, CardType.ROOM));
		}

		//combine all arrays into a full card list
		allCards = [].concat(personCards)
					 .concat(weaponCards)
					 .concat(roomCards);

		//generate return object
		return {
			personCards: personCards,
			weaponCards: weaponCards,
			roomCards: roomCards,
			allCards: allCards
		};
	};

	let _simulateGuess = function(guessPlayer, personGuess, weaponGuess, roomGuess, allPlayers) {
		//For a set of players, returns a Guess() object based on how the guess would play out.
		//Loops through the players in order, stopping when a player is able to show a card.
		//INPUTS:
		//	-guessPlayer: Player()
		//	-personGuess: Card()
		//  -weaponGuess: Card()
		//	-roomGuess:   Card()
		//	-allPlayers:  [Player()], in order of play
		//OUTPUT:
		//	-Guess() object with the information of the simulated turn

		//consolidate guess cards
		let guessCards = [personGuess, weaponGuess, roomGuess];

		//first hand to process is after the guessing hand
		let i_start = allPlayers.indexOf(guessPlayer) + 1;

		//loop through the player list to see who is the first able to show a card.
		let showPlayer = null;
		let showHand = null;
		let showCard = null;

		while (allPlayers[i_start % allPlayers.length] !== guessPlayer) {
			let currentPlayer = allPlayers[i_start % allPlayers.length];
			
			if (currentPlayer.hasCard(guessCards)) {
				//found player that has a card. Save data and exit loop.
				showPlayer = currentPlayer;
				showHand = currentPlayer.hand;
				showCard = currentPlayer.showCard(guessCards);
				break;
			}

			//increment counter
			i_start++;
		}

		//construct guess
		let guessObj;

		if (guessPlayer.isMainPlayer) {
			//also include shown card
			guessObj = new Guess(personGuess, weaponGuess, roomGuess, guessPlayer.hand,
								 showHand, showCard);
		} else {
			//shown card is not seen by the main player when guess is from another player
			guessObj = new Guess(personGuess, weaponGuess, roomGuess, guessPlayer.hand,
								 showHand, null);
		}
		
		//return Guess()
		return guessObj;
	};


	//module return object
	return {
		//module functions
		allCardNames: allCardNames,
		applyGuessToHands: applyGuessToHands,
		generateAllClueCards: generateAllClueCards,
		newKnownCardUpdate: newKnownCardUpdate,
		deduceCardSingleGuess: deduceCardSingleGuess,
		deduceCardByNos: deduceCardByNos,
		processGuesses: processGuesses,

		//test functions
		_generateTestCards: _generateTestCards,
		_simulateGuess: _simulateGuess

	}; //end return object
}()); //end ClueUtil