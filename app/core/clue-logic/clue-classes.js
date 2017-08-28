
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

	// WRITE UNIT TESTS FIRST BEFORE IMPLEMENTING
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
			if (!this.checklist.has(card)) {
				throw new Error("Card input '" + card + "' is not a key in the checklist.");
			} else if (Object.values(CardHeld).indexOf(status) === -1) { 
				//supplied status is not a valid status (not a value in CardHeld object),
				//i.e. can't be accessed by any of the CardHeld named properties
				throw new Error("Status input '" + status + "' is not a valid status " +
					"for the checklist.");
			} else {
				//card and status inputs are valid
				this.checklist.set(card, status);
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
			let nChecklist = 0;
			let self = this;
			fullCardList.forEach(function(card) {
				if (self.checkCardStatus(card) === CardHeld.UNKNOWN) {
					nChecklist++;
					unknownCards.push(card);
				}
			});

			//get number of unknown cards from hand size and known cards (nHand)
			let nHand = this.handSize - this.countKnownCards();

			//if there are unknown cards and the counts are equal, add cards to hand 
			//and return affermative object.
			if (nHand > 0 && nChecklist === nHand) {
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


//-------------- IIFE MODULES ------------------------

var ClueUtil = (function (){

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

	return {
		generateAllClueCards: generateAllClueCards,
	}; //end return object
}()); //end ClueUtil