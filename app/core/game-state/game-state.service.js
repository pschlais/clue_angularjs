'use strict';

angular.
	module('core.gameState').
		factory('GameState', [ //put DI's here if applicable
			function(){

				return {
					data: {
						cards: [new Card('Test', CardType.ROOM)],
					},
					//functions here
					changeFirstCard: function() {
							this.data.cards[0].name = this.data.cards[0].name + "a";
						}
				}; //return object
		}]);

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

	/*//getters
	get name() {
		return this._name;
	}

	get cardType() {
		return this._cardType;
	}

	get holder() {
		return this._hand;
	}
*/

/*
	// WRITE UNIT TESTS FIRST BEFORE IMPLEMENTING
	assignHolder(holder) {
		if (holder instanceof Hand) {
			this._hand = holder;
		} else {
			throw new TypeError('Expected input of type Hand, recieved input of type "' + typeof(holder) + '"');
		}
	}

	isHolderKnown() {
		return Boolean(this._hand) //null is falsy
	}
*/

}

class Hand {
	/* Class for a collection of cards (Card() objects). This could be a player or the solution hidden cards.
	ATTRIBUTES:
		name:  			string [REQUIRED]. ID for object.
		handSize: 	int [REQUIRED]. Number of total cards dealt at start of game. Not changed after assignment.
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

			//set up checklist: initialize if not provided, check input type is correct, validate that the
			//checklist is complete and sufficient (if externally provided)
			if (checklist===null) {
				//this.initializeChecklist();
				this.checklist = new Map();
			} else if (!(checklist instanceof Map)) {
				throw new TypeError("Checklist input is not null or Map(), provided '" + typeof(checklist) +"'");
			} else {
				//this._validateInputChecklist(checklist)
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
					//self.addKnownCard(card);
				});
			} // end if
		
		} //end constructor

}