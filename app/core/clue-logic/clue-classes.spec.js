//--------- CLASS TESTS -----------------------
describe('Class', function(){

	describe('Card', function(){
		let name, cardType, parentHand;

		//constructor variables
		beforeEach(function() {
			name = 'CardTest';
			cardType = CardType.WEAPON;
			parentHand = new Hand('TestHand', 5, []);
		});

		//methods ----------------------------------
		
		// ------ assignHolder()
		describe("method 'assignHolder'", function() {
			it("correctly assigns a Hand() object to parentHand property",
				function() {
					let card = new Card(name, cardType);
					card.assignHolder(parentHand);
					
					expect(card.parentHand).toBe(parentHand);
				});

			it("throws a TypeError for a non-Hand() input", function() {
				let card = new Card(name, cardType);
				let badInput = 5; //non-Hand() object
				
				expect(function(){card.assignHolder(badInput)}).toThrowError(TypeError);
			});
		
		});

		// ------ isHolderKnown()
		describe("method 'isHolderKnown'", function() {
			it("returns 'true' for an assigned parentHand property", function() {
				let card = new Card(name, cardType, parentHand);
				
				expect(card.isHolderKnown()).toBe(true);
			});

			it("returns 'false' for no assigned parentHand property", function() {
				let card = new Card(name, cardType);
				
				expect(card.isHolderKnown()).toBe(false);
			});
		});

	});

	describe('Hand', function() {
		//constructor variables (constructor(name, handSize, fullCardList, mainPlayer=false,
		//						             solution=false, knownCards=[], checklist=null))
		let name, handSize, fullCardList, mainPlayer, solution, knownCards, checklist;

		beforeEach(function() {
			name = 'HandTest';
			handSize = 4;
			fullCardList = ClueUtil.generateAllClueCards(); //new set of Card() objects (i.e. parentHand set to null)
			mainPlayer = false;
			solution = false;
			knownCards = [];
			//checklist placeholder
		});

		//non-trivial initialization tests ------------------
		it('initializes with a new checklist Map() for no "checklist" input', function() {
			let hand = new Hand(name, handSize, fullCardList);
			
			expect(hand.checklist).toEqual(jasmine.any(Map));
		});

		//--- tests for complete & non-complete checklist inputs
		it("initializes a Map(Card-->CardHeld.UNKNOWN) for null checklist input, not main player", 
			function() {
				let hand = new Hand(name, handSize, fullCardList);
				//all cards accounted for (length correct), all values set to CardHeld.UNKNOWN
				expect(hand.checklist.size).toBe(21); //21 (6 person, 6 weapon, 9 rooms)
				fullCardList.forEach(function(card) {
					expect(hand.checkCardStatus(card)).toBe(CardHeld.UNKNOWN);
				});
		});

		it("initializes a Map(Card-->CardHeld.NO or YES) for null checklist input, main player", 
			function() {
				let mainPlayer = true;
				//set known cards
				knownCards.push(fullCardList[3]);
				knownCards.push(fullCardList[6]);
				handSize = knownCards.length;

				let hand = new Hand(name, handSize, fullCardList, mainPlayer, solution,
									knownCards);
				
				//all cards accounted for (length correct), all values set to CardHeld.YES or .NO
				//depending on what's in hand
				expect(hand.checklist.size).toBe(21); //21 (6 person, 6 weapon, 9 rooms)
				fullCardList.forEach(function(card) {
					if(hand.hasCard(card)) {
						expect(hand.checkCardStatus(card)).toBe(CardHeld.YES);
					} else {
						expect(hand.checkCardStatus(card)).toBe(CardHeld.NO);
					}
				});
		});

		it('initializes the "checklist" correctly for a valid Map() input', function() {
			let goodChecklist = new Map();
			//initialize checklist
			fullCardList.forEach(function(card){
				goodChecklist.set(card, CardHeld.UNKNOWN);
			});

			//create hand
			let hand = new Hand(name, handSize, fullCardList, mainPlayer,
								solution, knownCards, goodChecklist);
			//expect checklist to be set
			expect(hand.checklist).toBe(goodChecklist);
		});

		describe('throws an Error', function() {

			beforeEach(function() {
				//create a copy of the full card list array to manipulate
				let editedCardList = ClueUtil.generateAllClueCards();
			});

			it('(TypeError) if the "checklist" input is not a Map() object', function() {
				let badInput = 5; //not a Map()
				
				expect(function(){new Hand(name, handSize, fullCardList, mainPlayer, 
											solution, knownCards, badInput)})
						.toThrowError(TypeError);
			});

			it('if the "checklist" input contains the wrong amount of cards', function() {
				let partialChecklist = new Map();
				//populate input checklist with 10 cards missing
				for (let i = 0; i < fullCardList.length - 10; i++) {
					partialChecklist.set(fullCardList[i], CardHeld.UNKNOWN);
				}

				expect(function(){
					new Hand(name, handSize, fullCardList, mainPlayer, solution,
									knownCards, partialChecklist);
				}).toThrowError();
			});

			it('if the "checklist" input has a non-Card key', function() {
				let badChecklist = new Map();
				let badKey = 5;
				//populate input checklist with all but 1 card, add bad key
				for (let i = 0; i < fullCardList.length-1; i++) {
					badChecklist.set(fullCardList[i], CardHeld.UNKNOWN);
				}
				badChecklist.set(badKey, CardHeld.UNKNOWN);

				expect(function(){
					new Hand(name, handSize, fullCardList, mainPlayer, solution,
									knownCards, badChecklist);
				}).toThrowError();
			});
			
			it('if the "checklist" input contains a non-CardHeld value', function() {
				let badChecklist = new Map();
				let badVal = 'bad value';
				//populate input checklist with all but 1 card, add bad value in Map
				for (let i = 0; i < fullCardList.length-1; i++) {
					badChecklist.set(fullCardList[i], CardHeld.UNKNOWN);
				}
				badChecklist.set(fullCardList[fullCardList.length - 1], badVal);

				expect(function(){
					new Hand(name, handSize, fullCardList, mainPlayer, solution,
									knownCards, badChecklist);
				}).toThrowError();
			});

			it('if the "checklist" input has a Card not in the full list', function() {
				//this test plus the length check ensures that the map keys
				//are all cards in the full card list are accounted for in the mapping.
				let badChecklist = new Map();
				let oddCard = new Card("Bad Card", CardType.WEAPON);

				//populate input checklist with all but 1 card, add odd card as key
				for (let i = 0; i < fullCardList.length-1; i++) {
					badChecklist.set(fullCardList[i], CardHeld.UNKNOWN);
				}
				badChecklist.set(oddCard, CardHeld.UNKNOWN);

				expect(function(){
					new Hand(name, handSize, fullCardList, mainPlayer, solution,
									knownCards, badChecklist);
				}).toThrowError();
			});

		});


		// ------ tests for knownCard input permutations
		it("sets the 'knownCards' array to [] if no input (or null) is supplied", function(){
			let hand = new Hand(name, handSize, fullCardList);
			
			//length of 0 and of type 'Array'
			expect(hand.knownCards.length).toBe(0);
			expect(hand.knownCards).toEqual(jasmine.any(Array));
		});

		it("sets the 'knownCards' array to one card if a Card() input is supplied", function() {
			let card = fullCardList[0];
			let hand = new Hand(name, handSize, fullCardList, mainPlayer, solution, card);
			
			//length of 1, of type 'Array', card found at index of zero
			expect(hand.knownCards.length).toBe(1);
			expect(hand.knownCards).toEqual(jasmine.any(Array));
			expect(hand.knownCards[0]).toBe(card);
		});

		it("sets the 'knownCards' array to the [Card()] input", function() {
			let card1 = fullCardList[1];
			let card2 = fullCardList[2];
			let knownCards = [card1, card2];
			let hand = new Hand(name, handSize, fullCardList, mainPlayer, solution, knownCards);
			
			//length of 2, of type 'Array', card1 found at index 0, card2 found at index 1
			expect(hand.knownCards.length).toBe(2);
			expect(hand.knownCards).toEqual(jasmine.any(Array));
			expect(hand.knownCards[0]).toBe(card1);
			expect(hand.knownCards[1]).toBe(card2);
		});

		it("throws a TypeError if the 'knownCards' input is not of type Card() or Array", function() {
			let badInput = 5; //not an Array or Card()
			
			expect(function(){
				new Hand(name, handSize, fullCardList, mainPlayer, solution, badInput)
			}).toThrowError(TypeError);
		});

		//methods -----------------------------------------
		
		// ------ addKnownCard()
		describe("method 'addKnownCard'", function() {
			it("adds a card to hand under valid circumstances", function() {
				let card = fullCardList[3];
				let hand = new Hand(name, handSize, fullCardList);
				hand.addKnownCard(card);

				//hand has card, card returns hand as its parent, checklist returns CardHeld.YES
				expect(hand.hasCard(card)).toBe(true);
				expect(hand.checkCardStatus(card)).toBe(CardHeld.YES);
				expect(card.parentHand).toBe(hand);
			});

			it("does not do anything when a known card attempts to be added again", function() {
				let card = fullCardList[2];
				let hand = new Hand(name, handSize, fullCardList);
				// add card twice-- first one works, second one should do nothing
				hand.addKnownCard(card);
				hand.addKnownCard(card);

				//hand has 1 card, card returns hand as its parent
				expect(hand.countKnownCards()).toBe(1);
				expect(card.parentHand).toBe(hand);

				});

			it("does not do anything when all cards in hand are already known", function() {
				handSize = 2;
				let card1 = fullCardList[0];
				let card2 = fullCardList[1];
				let newCard = fullCardList[2];
				let knownCards = [card1, card2];
				let hand = new Hand(name, handSize, fullCardList, mainPlayer, solution, knownCards);

				hand.addKnownCard(newCard);

				//card count should be capacity, new card not in hand, new card parent is not set
				expect(hand.countKnownCards()).toBe(handSize);
				expect(hand.hasCard(newCard)).toBe(false);
				expect(newCard.parentHand).toBe(null);
			});
		});

		// ------ allChecklistCards()
		describe("method 'allChecklistCards'", function() {
			//describe block variables
			let hand, cardList;
			
			beforeEach(function() {
				//generate hand object
				cardList = [new Card("Card1", CardType.PERSON),
								new Card("Card2", CardType.WEAPON)];
				hand = new Hand(name, handSize, cardList);
			});

			it("returns an array object", function() {
				expect(hand.allChecklistCards() instanceof Array).toBe(true);
			});

			it("returns array contents of Card() objects", function() {
				expect(hand.allChecklistCards()[0]).toBe(cardList[0]);
			});

			it("returns an array object with the same length as the full card list", function() {
				expect(hand.allChecklistCards().length).toBe(cardList.length);
			});
		});

		// ------ checkCardStatus()
		describe("method 'checkCardStatus'", function() {
			it("returns the appropriate CardHeld status for an input card", function() {
				let knownCard = fullCardList[0];
				let notHoldingCard = fullCardList[1];
				let unknownCard = fullCardList[2];
				let hand = new Hand(name, handSize, fullCardList);
				hand.addKnownCard(knownCard);
				hand.checklist.set(notHoldingCard, CardHeld.NO);

				expect(hand.checkCardStatus(knownCard)).toBe(CardHeld.YES);
				expect(hand.checkCardStatus(notHoldingCard)).toBe(CardHeld.NO);
				expect(hand.checkCardStatus(unknownCard)).toBe(CardHeld.UNKNOWN);

			});

			it("throws an error for any input (Card() or otherwise) that isn't a key " +
				"in the checklist", function() {
				let hand = new Hand(name, handSize, fullCardList);
				let badInput = 5;

				expect(function(){hand.checkCardStatus(badInput)}).toThrowError();
			});
		});

		// ------ countKnownCards()
		describe("method 'countKnownCards'", function() {
			it("returns 0 for no known cards", function() {
				let hand = new Hand(name, handSize, fullCardList);

				expect(hand.countKnownCards()).toBe(0);
			});

			it("returns the correct length for >0 known cards", function() {
				let card1 = fullCardList[3];
				let card2 = fullCardList[4];
				let knownCards = [card1, card2];
				let hand = new Hand(name, handSize, fullCardList, mainPlayer, solution, knownCards);

				expect(hand.countKnownCards()).toBe(2);
			});
		});
		
		// ------ hasCard()
		describe("method 'hasCard'", function() {
			it("returns true for a card known to be in hand", function() {
				let knownCard = fullCardList[1];
				let hand = new Hand(name, handSize, fullCardList, mainPlayer, solution, knownCard);
				
				expect(hand.hasCard(knownCard)).toBe(true);
			});

			it("returns false for a card not known to be in hand", function() {
				let testCard = fullCardList[0];
				let hand = new Hand(name, handSize, fullCardList);
				
				expect(hand.hasCard(testCard)).toBe(false);
			});

			it("throws an error for a non-Card() type input", function() {
				let badInput = 5;
				let hand = new Hand(name, handSize, fullCardList);

				expect(function(){hand.hasCard(badInput)}).toThrowError(TypeError);
			});
		});
			
		// ------ updateChecklist()
		describe("method 'updateChecklist'", function() {
			it("updates the CardHeld status for a valid card and CardHeld input", function() {
				let hand = new Hand(name, handSize, fullCardList);
				let updateCard = fullCardList[2];

				//CardHeld.YES
				hand.updateChecklist(updateCard, CardHeld.YES);
				expect(hand.checkCardStatus(updateCard, CardHeld.YES)).toBe(CardHeld.YES);
				//CardHeld.NO
				hand.updateChecklist(updateCard, CardHeld.NO);
				expect(hand.checkCardStatus(updateCard, CardHeld.NO)).toBe(CardHeld.NO);
				//CardHeld.UNKNOWN
				hand.updateChecklist(updateCard, CardHeld.UNKNOWN);
				expect(hand.checkCardStatus(updateCard, CardHeld.UNKNOWN)).toBe(CardHeld.UNKNOWN);
			});

			it("throws an error for a non-valid card input", function() {
				let hand = new Hand(name, handSize, fullCardList);
				let badInput = 'bad input';
				let validCardHeld = CardHeld.YES;

				expect(function(){hand.updateChecklist(badInput, validCardHeld)}).toThrowError();
			});

			it("throws an error for a non-valid CardHeld status input", function() {
				let hand = new Hand(name, handSize, fullCardList);
				let validCard = fullCardList[0];
				let badInputType = 'bad input';
				let badCardHeld = 1000;

				//bad type
				expect(function(){hand.updateChecklist(validCard, badInputType)}).toThrowError();
				//bad value that isn't in CardHeld object
				expect(function(){hand.updateChecklist(validCard, badCardHeld)}).toThrowError();
			});
		});

		// ------ deduceCardsByRemaining()
		describe("method 'deduceCardsByRemaining'", function() {

			

			describe("correctly deduces 2 open hand spots are the 2 remaining unknown checklist " +
				"cards are in hand by", function() {
				
				let testHandSize, card1, card2, cardList;

				beforeEach(function() {
					testHandSize = 4;
					card1 = new Card("Card1", CardType.WEAPON);
					card2 = new Card("Card2", CardType.PERSON);
					card3 = new Card("Card3", CardType.PERSON);
					card4 = new Card("Card4", CardType.ROOM);
					cardChecklist = new Map();
				});

				it("returning an object with obj.newInfo = true", function() {
					//card list is only 4 cards
					cardList = [card1, card2, card3, card4];
					//cards 1, 2 are known to be in hand
					knownCards = [card1, card2];
					//cards 3, 4 unknown in generated checklist
					hand = new Hand(name, testHandSize, cardList, mainPlayer, solution,
									knownCards);

					//test
					expect(hand.deduceCardsByRemaining().newInfo).toBe(true);
				});

				it("returning an object with obj.deducedCards of length 2", function() {
					//card list is only 2 cards
					cardList = [card1, card2, card3, card4];
					//cards 1, 2 are known to be in hand
					knownCards = [card1, card2];
					//cards 3, 4 unknown in generated checklist
					hand = new Hand(name, testHandSize, cardList, mainPlayer, solution,
									knownCards);

					//test
					expect(hand.deduceCardsByRemaining().deducedCards.length).toBe(2);
				});

				it("returning an object with obj.deducedCards with a correct Card reference", function() {
					//card list is only 2 cards
					cardList = [card1, card2, card3, card4];
					//cards 1, 2 are known to be in hand
					knownCards = [card1, card2];
					//cards 3, 4 unknown in generated checklist
					hand = new Hand(name, testHandSize, cardList, mainPlayer, solution,
									knownCards);

					//test
					expect(hand.deduceCardsByRemaining().deducedCards[0]).toBe(card3);
				});

			});

			describe("correctly does nothing for 2 open hand spots with 3 remaining unknown " +
				"checklist cards by", function() {
				
				let testHandSize, card1, card2, cardList;

				beforeEach(function() {
					testHandSize = 3;
					card1 = new Card("Card1", CardType.WEAPON);
					card2 = new Card("Card2", CardType.PERSON);
					card3 = new Card("Card3", CardType.PERSON);
					card4 = new Card("Card4", CardType.ROOM);
				});

				it("returning an object with obj.newInfo = false", function() {
					//card list is only 4 cards
					cardList = [card1, card2, card3, card4];
					//card 1 is known to be in hand
					knownCards = [card1];
					//cards 2, 3, 4 unknown in generated checklist
					hand = new Hand(name, testHandSize, cardList, mainPlayer, solution,
									knownCards);

					//test
					expect(hand.deduceCardsByRemaining().newInfo).toBe(false);
				});

				it("returning an object with obj.deducedCards of length 0", function() {
					//card list is only 4 cards
					cardList = [card1, card2, card3, card4];
					//card 1 is known to be in hand
					knownCards = [card1];
					//cards 2, 3, 4 unknown in generated checklist
					hand = new Hand(name, testHandSize, cardList, mainPlayer, solution,
									knownCards);

					//test
					expect(hand.deduceCardsByRemaining().deducedCards.length).toBe(0);
				});

			});

		}); 

	});

});

// ----------- IIFE MODULES --------------------------
describe('IIFE Module', function() {

	//------ ClueUtil module
	describe('ClueUtil', function() {

		describe("method 'generateAllClueCards'", function() {
			it("generates the correct set of object references", function() {
				let deck = ClueUtil.generateAllClueCards();

				//length is correct (21), each member is a Card() object
				expect(deck.length).toBe(21);
				deck.forEach(function(card) {
					expect(card).toEqual(jasmine.any(Card));
				});
			});
		});
		
	});
});