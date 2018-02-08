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
			
			describe("under valid circumstances adds a card to hand causing", function() {
				let card, hand;

				beforeEach(function() {
					card = fullCardList[3];
					hand = new Hand(name, handSize, fullCardList);
					hand.addKnownCard(card);
				});
				
				it("hasCard() to return true", function() {
					expect(hand.hasCard(card)).toBe(true);
				});

				it("checklist to return CardHeld.YES", function() {
					expect(hand.checkCardStatus(card)).toBe(CardHeld.YES);
				});
				
				it("Card.parentHand to return the hand it was added to", function() {
					expect(card.parentHand).toBe(hand);
				});
				
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

		// ------ countUnknownCards()
		describe("method 'countUnknownCards'", function() {
			it("returns fullCardList.length for no known cards", function() {
				let hand = new Hand(name, handSize, fullCardList);

				expect(hand.countUnknownCards()).toBe(fullCardList.length);
			});

			it("returns the correct length for >0 known cards", function() {
				let card1 = fullCardList[3];
				let card2 = fullCardList[4];
				let knownCards = [card1, card2];
				let hand = new Hand(name, handSize, fullCardList, mainPlayer, solution, knownCards);

				expect(hand.countUnknownCards()).toBe(fullCardList.length - 2);
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
				let changedYes;
				changedYes = hand.updateChecklist(updateCard, CardHeld.YES);
				expect(hand.checkCardStatus(updateCard, CardHeld.YES)).toBe(CardHeld.YES);
				expect(changedYes).toBe(true);
				//CardHeld.NO
				let changedNo;
				changedNo = hand.updateChecklist(updateCard, CardHeld.NO);
				expect(hand.checkCardStatus(updateCard, CardHeld.NO)).toBe(CardHeld.NO);
				expect(changedNo).toBe(true);
				//CardHeld.UNKNOWN
				let changedUnknown;
				changedUnknown = hand.updateChecklist(updateCard, CardHeld.UNKNOWN);
				expect(hand.checkCardStatus(updateCard, CardHeld.UNKNOWN)).toBe(CardHeld.UNKNOWN);
				expect(changedUnknown).toBe(true);
				//Call again with no change in status - should return false
				changedUnknown = hand.updateChecklist(updateCard, CardHeld.UNKNOWN);
				expect(changedUnknown).toBe(false);
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

				it("adding the 2 unknown cards to the hand", function() {
					//card list is only 2 cards
					cardList = [card1, card2, card3, card4];
					//cards 1, 2 are known to be in hand
					knownCards = [card1, card2];
					//cards 3, 4 unknown in generated checklist
					hand = new Hand(name, testHandSize, cardList, mainPlayer, solution,
									knownCards);
					//deduce cards
					hand.deduceCardsByRemaining();

					//test
					expect(hand.hasCard(card3)).toBe(true);
					expect(hand.hasCard(card4)).toBe(true);
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

	describe('Solution', function() {

		describe("initializes correctly", function() {
			//describe block common variables
			let fullCardList, pCard1, pCard2, wCard1, wCard2, rCard1, rCard2;

			beforeEach(function() {
				pCard1 = new Card("Person1", CardType.PERSON);
				pCard2 = new Card("Person2", CardType.PERSON);
				wCard1 = new Card("Weapon1", CardType.WEAPON);
				wCard2 = new Card("Weapon2", CardType.WEAPON);
				rCard1 = new Card("Room1", CardType.ROOM);
				rCard2 = new Card("Room2", CardType.ROOM);
				fullCardList = [pCard1, pCard2, wCard1, wCard2, rCard1, rCard2];
			});

			it("with no solution cards for no known cards input", function() {
				let knownCards = [];
				let sol = new Solution(fullCardList, knownCards);

				expect(sol.countKnownCards()).toBe(0);
			});

			it("with the person solution set for person known card input", function() {
				let knownCards = [pCard1];
				let sol = new Solution(fullCardList, knownCards);

				expect(sol.person).toBe(pCard1);
			});

			it("with the weapon solution set for weapon known card input", function() {
				let knownCards = [wCard1];
				let sol = new Solution(fullCardList, knownCards);

				expect(sol.weapon).toBe(wCard1);
			});

			it("with the room solution set for room known card input", function() {
				let knownCards = [rCard1];
				let sol = new Solution(fullCardList, knownCards);

				expect(sol.room).toBe(rCard1);
			});

		});

		describe("method 'addKnownCard'", function() {
			//describe block common variables
			let fullCardList, pCard1, pCard2, wCard1, wCard2, rCard1, rCard2;

			beforeEach(function() {
				pCard1 = new Card("Person1", CardType.PERSON);
				pCard2 = new Card("Person2", CardType.PERSON);
				wCard1 = new Card("Weapon1", CardType.WEAPON);
				wCard2 = new Card("Weapon2", CardType.WEAPON);
				rCard1 = new Card("Room1", CardType.ROOM);
				rCard2 = new Card("Room2", CardType.ROOM);
				fullCardList = [pCard1, pCard2, wCard1, wCard2, rCard1, rCard2];
			});

			describe("for a CardType.PERSON input", function() {

				it("correctly adds input to .person when not already known", function() {
					//no known cards to start
					let knownCards = [];
					let personCard = pCard1;
					let sol = new Solution(fullCardList, knownCards);

					//add pCard1 as the known person solution
					sol.addKnownCard(personCard);
					//test
					expect(sol.person).toBe(personCard);
				});

				it("correctly sets solution person card in checklist to CardHeld.YES", function() {
					//no known cards to start
					let knownCards = [];
					let personCard = pCard1;
					let sol = new Solution(fullCardList, knownCards);

					//add pCard1 as the known person solution
					sol.addKnownCard(personCard);
					//test
					expect(sol.checkCardStatus(personCard)).toBe(CardHeld.YES);
				});

				it("correctly sets non-solution person cards in checklist to CardHeld.NO", function() {
					//no known cards to start
					let knownCards = [];
					let personCard = pCard1;
					let notPersonCard = pCard2;
					let sol = new Solution(fullCardList, knownCards);

					//add pCard1 as the known person solution
					sol.addKnownCard(personCard);
					//test
					expect(sol.checkCardStatus(notPersonCard)).toBe(CardHeld.NO);
				});

				it("does not change .person when it is already known", function() {
					//no known cards to start
					let personCard = pCard1;
					let knownCards = [personCard];
					let sol = new Solution(fullCardList, knownCards);

					//test
					expect(sol.person).toBe(personCard);
				});

			});

			describe("for a CardType.WEAPON input", function() {

				it("correctly adds input to .weapon when not already known", function() {
					//no known cards to start
					let knownCards = [];
					let weaponCard = wCard1;
					let sol = new Solution(fullCardList, knownCards);

					//add wCard1 as the known weapon solution
					sol.addKnownCard(weaponCard);
					//test
					expect(sol.weapon).toBe(weaponCard);
				});

				it("correctly sets solution weapon card in checklist to CardHeld.YES", function() {
					//no known cards to start
					let knownCards = [];
					let weaponCard = wCard1;
					let sol = new Solution(fullCardList, knownCards);

					//add wCard1 as the known weapon solution
					sol.addKnownCard(weaponCard);
					//test
					expect(sol.checkCardStatus(weaponCard)).toBe(CardHeld.YES);
				});

				it("correctly sets non-solution weapon cards in checklist to CardHeld.NO", function() {
					//no known cards to start
					let knownCards = [];
					let weaponCard = wCard1;
					let notWeaponCard = wCard2;
					let sol = new Solution(fullCardList, knownCards);

					//add wCard1 as the known weapon solution
					sol.addKnownCard(weaponCard);
					//test
					expect(sol.checkCardStatus(notWeaponCard)).toBe(CardHeld.NO);
				});

				it("does not change .weapon when it is already known", function() {
					//no known cards to start
					let weaponCard = wCard1;
					let knownCards = [weaponCard];
					let sol = new Solution(fullCardList, knownCards);

					//test
					expect(sol.weapon).toBe(weaponCard);
				});

			});

			describe("for a CardType.ROOM input", function() {

				it("correctly adds input to .room when not already known", function() {
					//no known cards to start
					let knownCards = [];
					let roomCard = rCard1;
					let sol = new Solution(fullCardList, knownCards);

					//add rCard1 as the known room solution
					sol.addKnownCard(roomCard);
					//test
					expect(sol.room).toBe(roomCard);
				});

				it("correctly sets solution room card in checklist to CardHeld.YES", function() {
					//no known cards to start
					let knownCards = [];
					let roomCard = rCard1;
					let sol = new Solution(fullCardList, knownCards);

					//add rCard1 as the known room solution
					sol.addKnownCard(roomCard);
					//test
					expect(sol.checkCardStatus(roomCard)).toBe(CardHeld.YES);
				});

				it("correctly sets non-solution room cards in checklist to CardHeld.NO", function() {
					//no known cards to start
					let knownCards = [];
					let roomCard = rCard1;
					let notRoomCard = rCard2;
					let sol = new Solution(fullCardList, knownCards);

					//add rCard1 as the known room solution
					sol.addKnownCard(roomCard);
					//test
					expect(sol.checkCardStatus(notRoomCard)).toBe(CardHeld.NO);
				});

				it("does not change .room when it is already known", function() {
					//no known cards to start
					let roomCard = rCard1;
					let knownCards = [roomCard];
					let sol = new Solution(fullCardList, knownCards);

					//test
					expect(sol.room).toBe(roomCard);
				});

			});

		});

		describe("method 'isPersonKnown'", function() {
			//describe block common variables
			let fullCardList, pCard, wCard, rCard;

			beforeEach(function() {
				pCard = new Card("Person1", CardType.PERSON);
				wCard = new Card("Weapon1", CardType.WEAPON);
				rCard = new Card("Room1", CardType.ROOM);
				fullCardList = [pCard, wCard, rCard];
			});

			it("returns true if the person solution is known", function() {
				knownCards = [pCard];
				sol = new Solution(fullCardList, knownCards);

				expect(sol.isPersonKnown()).toBe(true);
			});

			it("returns false if the person solution is not known", function() {
				knownCards = [];
				sol = new Solution(fullCardList, knownCards);

				expect(sol.isPersonKnown()).toBe(false);
			});

		});

		describe("method 'isWeaponKnown'", function() {
			//describe block common variables
			let fullCardList, pCard, wCard, rCard;

			beforeEach(function() {
				pCard = new Card("Person1", CardType.PERSON);
				wCard = new Card("Weapon1", CardType.WEAPON);
				rCard = new Card("Room1", CardType.ROOM);
				fullCardList = [pCard, wCard, rCard];
			});

			it("returns true if the weapon solution is known", function() {
				knownCards = [wCard];
				sol = new Solution(fullCardList, knownCards);

				expect(sol.isWeaponKnown()).toBe(true);
			});

			it("returns false if the weapon solution is not known", function() {
				knownCards = [];
				sol = new Solution(fullCardList, knownCards);

				expect(sol.isWeaponKnown()).toBe(false);
			});

		});

		describe("method 'isRoomKnown'", function() {
			//describe block common variables
			let fullCardList, pCard, wCard, rCard;

			beforeEach(function() {
				pCard = new Card("Person1", CardType.PERSON);
				wCard = new Card("Weapon1", CardType.WEAPON);
				rCard = new Card("Room1", CardType.ROOM);
				fullCardList = [pCard, wCard, rCard];
			});

			it("returns true if the room solution is known", function() {
				knownCards = [rCard];
				sol = new Solution(fullCardList, knownCards);

				expect(sol.isRoomKnown()).toBe(true);
			});

			it("returns false if the room solution is not known", function() {
				knownCards = [];
				sol = new Solution(fullCardList, knownCards);

				expect(sol.isRoomKnown()).toBe(false);
			});

		});

		describe("method 'isFullSolutionKnown'", function() {
			//describe block common variables
			let fullCardList, pCard, wCard, rCard;

			beforeEach(function() {
				pCard = new Card("Person1", CardType.PERSON);
				wCard = new Card("Weapon1", CardType.WEAPON);
				rCard = new Card("Room1", CardType.ROOM);
				fullCardList = [pCard, wCard, rCard];
			});

			it("returns true if the full solution is known", function() {
				knownCards = [pCard, wCard, rCard];
				sol = new Solution(fullCardList, knownCards);

				expect(sol.isFullSolutionKnown()).toBe(true);
			});

			it("returns false if the person solution is not known", function() {
				knownCards = [wCard, rCard];
				sol = new Solution(fullCardList, knownCards);

				expect(sol.isFullSolutionKnown()).toBe(false);
			});

			it("returns false if the weapon solution is not known", function() {
				knownCards = [pCard, rCard];
				sol = new Solution(fullCardList, knownCards);

				expect(sol.isFullSolutionKnown()).toBe(false);
			});

			it("returns false if the room solution is not known", function() {
				knownCards = [pCard, wCard];
				sol = new Solution(fullCardList, knownCards);

				expect(sol.isFullSolutionKnown()).toBe(false);
			});
		});

		describe("method 'deduceCardsByRemaining'", function() {
			//describe block common variables
			let fullCardList, pCards, wCards, rCards, knownCards;

			beforeEach(function() {
				//3 each of person, weapon, and room cards in play
				pCards = [new Card("Person0", CardType.PERSON),
							new Card("Person1", CardType.PERSON),
							new Card("Person2", CardType.PERSON)];
				wCards = [new Card("Weapon0", CardType.WEAPON),
							new Card("Weapon1", CardType.WEAPON),
							new Card("Weapon2", CardType.WEAPON)];
				rCards = [new Card("Room0", CardType.ROOM),
							new Card("Room1", CardType.ROOM),
							new Card("Room2", CardType.ROOM)];
				fullCardList = pCards.concat(wCards).concat(rCards);
				//no known solution cards
				knownCards = [];
			});

			it("deducts the correct person as the only unknown remaining person in play", function() {
				let sol = new Solution(fullCardList, knownCards);
				//set the status of two person cards to CardHeld.NO
				sol.updateChecklist(pCards[0], CardHeld.NO);
				sol.updateChecklist(pCards[1], CardHeld.NO);

				let dedInfo = sol.deduceCardsByRemaining();
				//check person solution pCards[2] has been deduced
				expect(sol.person).toBe(pCards[2]);
				expect(dedInfo.newInfo).toBe(true);
				expect(dedInfo.deducedCards.length).toBe(1);
				expect(dedInfo.deducedCards[0]).toBe(pCards[2]);
			});

			it("does not deduce a person solution when multiple are still unknown", function() {
				let sol = new Solution(fullCardList, knownCards);
				//set the status of one person card to CardHeld.NO
				sol.updateChecklist(pCards[0], CardHeld.NO);

				let dedInfo = sol.deduceCardsByRemaining();
				//check person solution pCards[2] has been deduced
				expect(sol.person).toBe(null);
				expect(dedInfo.newInfo).toBe(false);
			});

			it("deducts the correct weapon as the only unknown remaining weapon in play", function() {
				let sol = new Solution(fullCardList, knownCards);
				//set the status of two weapon cards to CardHeld.NO
				sol.updateChecklist(wCards[0], CardHeld.NO);
				sol.updateChecklist(wCards[1], CardHeld.NO);

				let dedInfo = sol.deduceCardsByRemaining();
				//check weapon solution wCards[2] has been deduced
				expect(sol.weapon).toBe(wCards[2]);
				expect(dedInfo.newInfo).toBe(true);
				expect(dedInfo.deducedCards.length).toBe(1);
				expect(dedInfo.deducedCards[0]).toBe(wCards[2]);
			});

			it("does not deduce a weapon solution when multiple are still unknown", function() {
				let sol = new Solution(fullCardList, knownCards);
				//set the status of one weapon card to CardHeld.NO
				sol.updateChecklist(wCards[0], CardHeld.NO);

				let dedInfo = sol.deduceCardsByRemaining();
				//check weapon solution wCards[2] has been deduced
				expect(sol.weapon).toBe(null);
				expect(dedInfo.newInfo).toBe(false);

			});

			it("deducts the correct room as the only unknown remaining room in play", function() {
				let sol = new Solution(fullCardList, knownCards);
				//set the status of two room cards to CardHeld.NO
				sol.updateChecklist(rCards[0], CardHeld.NO);
				sol.updateChecklist(rCards[1], CardHeld.NO);

				let dedInfo = sol.deduceCardsByRemaining();
				//check room solution rCards[2] has been deduced
				expect(sol.room).toBe(rCards[2]);
				expect(dedInfo.newInfo).toBe(true);
				expect(dedInfo.deducedCards.length).toBe(1);
				expect(dedInfo.deducedCards[0]).toBe(rCards[2]);
			});

			it("does not deduce a room solution when multiple are still unknown", function() {
				let sol = new Solution(fullCardList, knownCards);
				//set the status of one room card to CardHeld.NO
				sol.updateChecklist(rCards[0], CardHeld.NO);

				let dedInfo = sol.deduceCardsByRemaining();
				//check room solution rCards[2] has been deduced
				expect(sol.room).toBe(null);
				expect(dedInfo.newInfo).toBe(false);
			});

		});
	});

	describe("Player", function() {
		//block variables
		let gameCards, heldCards;

		beforeEach(function(){
			gameCards = ClueUtil._generateTestCards(3,3,3);
			heldCards = [gameCards.personCards[0], 
						 gameCards.weaponCards[0],
						 gameCards.roomCards[0]];
		});

		describe("initializes the main player correctly by", function(){
			let mainPlayer;

			beforeEach(function(){
				let mainPlayerFlag = true;
				let solutionFlag = false;
				mainPlayer = new Player("main", gameCards.allCards, mainPlayerFlag,
										solutionFlag, heldCards);
			});

			it("setting Player.hand to a Hand() object", function(){
				expect(mainPlayer.hand instanceof Hand).toBe(true);
			});

			it("Player.hand has all input cards known in checklist", function(){
				expect(mainPlayer.hand.countKnownCards()).toBe(heldCards.length);
			});

			it("Player.hand has all cards in checklist either 'YES' or 'NO'", function(){
				let YesNoCount = mainPlayer.hand.countKnownCards() + mainPlayer.hand.countNoCards();
				expect(YesNoCount).toBe(gameCards.allCards.length);
			});

		});

		describe("initializes the solution correctly by", function(){
			let solutionPlayer;

			beforeEach(function(){
				let mainPlayerFlag = false;
				let solutionFlag = true;
				solutionPlayer = new Player("main", gameCards.allCards, mainPlayerFlag,
										solutionFlag, heldCards);
			});

			it("setting Player.hand to a Solution() object", function(){
				expect(solutionPlayer.hand instanceof Solution).toBe(true);
			});

			it("Player.hand has no input cards known in checklist", function(){
				expect(solutionPlayer.hand.countKnownCards()).toBe(0);
			});

			it("Player.hand has all cards in checklist as 'UNKNOWN'", function(){
				expect(solutionPlayer.hand.countUnknownCards()).toBe(gameCards.allCards.length);
			});

		});

		describe("initializes another player correctly by", function(){
			let otherPlayer;

			beforeEach(function(){
				let mainPlayerFlag = false;
				let solutionFlag = false;
				otherPlayer = new Player("main", gameCards.allCards, mainPlayerFlag,
										solutionFlag, heldCards);
			});

			it("setting Player.hand to a Hand() object", function(){
				expect(otherPlayer.hand instanceof Hand).toBe(true);
			});

			it("Player.hand has no input cards known in checklist", function(){
				expect(otherPlayer.hand.countKnownCards()).toBe(0);
			});

			it("Player.hand has all cards in checklist as 'UNKNOWN'", function(){
				expect(otherPlayer.hand.countUnknownCards()).toBe(gameCards.allCards.length);
			});

		});

		describe("method 'hasCard'", function(){
			let otherPlayer;

			beforeEach(function(){
				let mainPlayerFlag = false;
				let solutionFlag = false;
				otherPlayer = new Player("main", gameCards.allCards, mainPlayerFlag,
										solutionFlag, heldCards);
			});

			it("returns true for a single Card() input in the player's hand", function(){
				let guessCard = otherPlayer.heldCards[0];
				expect(otherPlayer.hasCard(guessCard)).toBe(true);
			});

			it("returns true for a [Card()] input where the second card is in hand", function(){
				let guessCards = [gameCards.personCards[1],
								  otherPlayer.heldCards[0],
								  gameCards.roomCards[1]];
				expect(otherPlayer.hasCard(guessCards)).toBe(true);
			});

			it("returns false for a single Card() input not in the player's hand", function(){
				let guessCard = gameCards.personCards[1];
				expect(otherPlayer.hasCard(guessCard)).toBe(false);
			});

			it("returns false for a [Card()] input where no card is in hand", function(){
				let guessCards = [gameCards.personCards[1],
								  gameCards.weaponCards[1],
								  gameCards.roomCards[1]];
				expect(otherPlayer.hasCard(guessCards)).toBe(false);
			});
		});

		describe("method 'showCard'", function(){
			let otherPlayer;

			beforeEach(function(){
				let mainPlayerFlag = false;
				let solutionFlag = false;
				otherPlayer = new Player("main", gameCards.allCards, mainPlayerFlag,
										solutionFlag, heldCards);
			});

			it("returns the Card() in hand where the second card in input array is the only one held", function(){
				let guessCards = [gameCards.personCards[1],
								  otherPlayer.heldCards[0], //held card
								  gameCards.roomCards[1]];
				expect(otherPlayer.showCard(guessCards)).toBe(otherPlayer.heldCards[0]);
			});

			it("returns the first Card() in list held in hand when multiple cards in list are held", function(){
				let guessCards = [gameCards.personCards[1],
								  otherPlayer.heldCards[1], //held card
								  otherPlayer.heldCards[0]];//held card
				expect(otherPlayer.showCard(guessCards)).toBe(otherPlayer.heldCards[1]);
			});

			it("returns null for a [Card()] input where no card is in hand", function(){
				let guessCards = [gameCards.personCards[1],
								  gameCards.weaponCards[1],
								  gameCards.roomCards[1]];
				expect(otherPlayer.showCard(guessCards)).toBe(null);
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

		describe("method 'applyGuessToHands'", function() {
			//scenarios:
			//(1) Main player guesses
			//		(a) a player shows a card
			//			-the showing player has the card in hand
			//			-all in between players have all guess cards set to CardHeld.NO
			//			-the solution hand has the shown card set to CardHeld.NO
			//		(b) no player shows a card
			//			-all non-main players have all guess cards set to CardHeld.NO
			//(2) Other player guesses
			//		(a) a player shows a card
			//			-all in between players have all guess cards set to CardHeld.NO
			//		(b) no player shows a card
			//			-all non-guessing players have all guess cards set to CardHeld.NO
			
			//describe block variables
			let cards, handSize, mainPlayerCards;
			let hand0, hand1, hand2, hand3;
			let allHands;

			beforeEach(function() {
					//4 players (Player0 to Player3), Player0 is main player
					//12 cards, 3 each - player # and card # align (i.e. Player0 holds Person0, etc.)
					cards = ClueUtil._generateTestCards(4, 4, 4);
					handSize = 3;
					mainPlayerCards = [cards.personCards[0],
										cards.weaponCards[0],
										cards.roomCards[0]];
					//main hand
					hand0 = new Hand("Player0", handSize, cards.allCards, true, false, 
										mainPlayerCards);
					//other player hands
					hand1 = new Hand("Player1", handSize, cards.allCards, false, false);
					hand2 = new Hand("Player2", handSize, cards.allCards, false, false);
					hand3 = new Hand("Player3", handSize, cards.allCards, false, false);
					//solution
					sol = new Solution(cards.allCards);
					//list of hands in order of play
					allHands = [hand0, hand1, hand2, hand3];
				});

			//functionality test
			it("correctly wraps around the end of the Hand order when applying guesses", function() {
				//order of play is hand0 --> hand1 --> hand2 --> hand3
				//if hand3 guesses and hand2 shows, hand1 should have a guessed card
				//set at CardHeld.NO. This test is not checking hand0 since it is the main player, and
				//by default it is already set to CardHeld.NO because all cards in hand are known.
				//
				//hand2 cards (guessed):
				let pgc = cards.personCards[2];
				let wgc = cards.weaponCards[2];
				let rgc = cards.roomCards[2];
				//guess
				let guess = new Guess(pgc, wgc, rgc, hand3, hand2);

				//apply guess
				ClueUtil.applyGuessToHands(guess, allHands);

				//hand1 card status for pgc should be CardHeld.NO
				expect(hand1.checkCardStatus(pgc)).toBe(CardHeld.NO);
			});


			describe("for a main player guess", function() {

				describe("and a player shows a card", function() {
					//block variables
					let guess, shownCard;
					let pgc, wgc, rgc; //person guess card, weapon guess card, room guess card

					beforeEach(function() {
						shownCard = cards.personCards[3];
						pgc = cards.personCards[3];
						wgc = cards.weaponCards[3];
						rgc = cards.roomCards[3];
						//main player guesses, last player shows cards.personCards[3]
						guess = new Guess(pgc, wgc, rgc, hand0, hand3, shownCard); 
					});

					it("the shown card is added to the show-er's hand", function() {
						//apply guess to showing player
						ClueUtil.applyGuessToHands(guess, allHands, sol);

						//only check hasCard() for addKnownCard() call, other required
						//functionality of addKnownCard() unit tested with the Hand class
						expect(hand3.hasCard(shownCard)).toBe(true);
					});

					it("the show-er's non-shown cards in guess set did not change status", function() {
						//get show-er card status before applying guess
						let wgc_status = hand3.checkCardStatus(wgc);
						let rgc_status = hand3.checkCardStatus(rgc);

						//apply guess to showing player
						ClueUtil.applyGuessToHands(guess, allHands, sol);

						//hand3 checkCardStatus() for wgc, rgc are unchanged
						expect(hand3.checkCardStatus(wgc)).toBe(wgc_status);
						expect(hand3.checkCardStatus(rgc)).toBe(rgc_status);
					});

					it("all in between players have all guess cards set to CardHeld.NO", function() {
						//apply guess to showing player
						ClueUtil.applyGuessToHands(guess, allHands, sol);

						//hand1, hand2 checkCardStatus() for pgc, wgc, rgc are CardHeld.NO
						expect(hand1.checkCardStatus(pgc)).toBe(CardHeld.NO);
						expect(hand1.checkCardStatus(wgc)).toBe(CardHeld.NO);
						expect(hand1.checkCardStatus(rgc)).toBe(CardHeld.NO);
						expect(hand2.checkCardStatus(pgc)).toBe(CardHeld.NO);
						expect(hand2.checkCardStatus(wgc)).toBe(CardHeld.NO);
						expect(hand2.checkCardStatus(rgc)).toBe(CardHeld.NO);
					});

					it("the solution hand has the shown card set to CardHeld.NO", function() {
						//apply guess to showing player
						ClueUtil.applyGuessToHands(guess, allHands, sol);

						//solution hand checkCardStatus() for shownCard set to CardHeld.NO
						expect(sol.checkCardStatus(shownCard)).toBe(CardHeld.NO);
					});

				});

				describe("and no player shows a card", function() {

					//block variables
					let guess;
					let pgc, wgc, rgc; //person guess card, weapon guess card, room guess card

					beforeEach(function() {
						pgc = cards.personCards[0];
						wgc = cards.weaponCards[0];
						rgc = cards.roomCards[0];
						//main player guesses, no player shows because all are in main player's hand
						guess = new Guess(pgc, wgc, rgc, hand0, null); 
					});

					it("all non-main players have all guess cards set to CardHeld.NO", function() {
						//apply guess
						ClueUtil.applyGuessToHands(guess, allHands, sol);

						//hand1, hand2, hand3 checkCardStatus for pgc, wgc, rgc are CardHeld.NO
						expect(hand1.checkCardStatus(pgc)).toBe(CardHeld.NO);
						expect(hand1.checkCardStatus(wgc)).toBe(CardHeld.NO);
						expect(hand1.checkCardStatus(rgc)).toBe(CardHeld.NO);
						expect(hand2.checkCardStatus(pgc)).toBe(CardHeld.NO);
						expect(hand2.checkCardStatus(wgc)).toBe(CardHeld.NO);
						expect(hand2.checkCardStatus(rgc)).toBe(CardHeld.NO);
						expect(hand3.checkCardStatus(pgc)).toBe(CardHeld.NO);
						expect(hand3.checkCardStatus(wgc)).toBe(CardHeld.NO);
						expect(hand3.checkCardStatus(rgc)).toBe(CardHeld.NO);
					});

				});

			});

			describe("for an other-player guess", function() {

				describe("and a player shows a card", function() {

					//block variables
					let guess;
					let pgc, wgc, rgc; //person guess card, weapon guess card, room guess card

					beforeEach(function() {
						pgc = cards.personCards[3];
						wgc = cards.weaponCards[3];
						rgc = cards.roomCards[3];
						//2nd player guesses, last player shows 
						guess = new Guess(pgc, wgc, rgc, hand1, hand3); 
					});

					it("showing player has no change to guess card status in checklist", function() {
						//get status of cards in show-er's hand before applying the guess
						let pgc_status = hand3.checkCardStatus(pgc);
						let wgc_status = hand3.checkCardStatus(wgc);
						let rgc_status = hand3.checkCardStatus(rgc);

						//apply guess
						ClueUtil.applyGuessToHands(guess, allHands, sol);

						//confirm status did not change
						expect(hand3.checkCardStatus(pgc)).toBe(pgc_status);
						expect(hand3.checkCardStatus(wgc)).toBe(wgc_status);
						expect(hand3.checkCardStatus(rgc)).toBe(rgc_status);
					});

					it("all in between players have all guess cards set to CardHeld.NO", function() {
						//apply guess
						ClueUtil.applyGuessToHands(guess, allHands, sol);

						//hand2 pgc, wgc, rgc card status CardHeld.NO
						expect(hand2.checkCardStatus(pgc)).toBe(CardHeld.NO);
						expect(hand2.checkCardStatus(wgc)).toBe(CardHeld.NO);
						expect(hand2.checkCardStatus(rgc)).toBe(CardHeld.NO);
					});

				});

				describe("and no player shows a card", function() {

					//block variables
					let guess;
					let pgc, wgc, rgc; //person guess card, weapon guess card, room guess card

					beforeEach(function() {
						pgc = cards.personCards[3];
						wgc = cards.weaponCards[3];
						rgc = cards.roomCards[3];
						//2nd player guesses, no player shows
						guess = new Guess(pgc, wgc, rgc, hand1, null); 
					});

					it("all non-guessing players have all guess cards set to CardHeld.NO", function() {
						//apply guess
						ClueUtil.applyGuessToHands(guess, allHands, sol);

						//hand2, hand3, hand0 have pgc, wgc, rgc card status CardHeld.NO
						expect(hand2.checkCardStatus(pgc)).toBe(CardHeld.NO);
						expect(hand2.checkCardStatus(wgc)).toBe(CardHeld.NO);
						expect(hand2.checkCardStatus(rgc)).toBe(CardHeld.NO);
						expect(hand3.checkCardStatus(pgc)).toBe(CardHeld.NO);
						expect(hand3.checkCardStatus(wgc)).toBe(CardHeld.NO);
						expect(hand3.checkCardStatus(rgc)).toBe(CardHeld.NO);
						expect(hand0.checkCardStatus(pgc)).toBe(CardHeld.NO);
						expect(hand0.checkCardStatus(wgc)).toBe(CardHeld.NO);
						expect(hand0.checkCardStatus(rgc)).toBe(CardHeld.NO);
					});

				});

			});
		});
		
		describe("method 'newKnownCardUpdate'", function() {

			let cards, card0, card1, handSize, hands, hand1, hand2, sol;
			
			beforeEach(function() {
				//only need 2 cards for test. Set hand sizes to 2 to make hand size
				//not a factor when adding cards.
				cards = ClueUtil._generateTestCards(1, 1, 1);
				card0 = cards.allCards[0];
				card1 = cards.allCards[1];
				//hands
				let handSize = 2;
				hand1 = new Hand("Hand1", handSize, cards.allCards, false, false);
				hand2 = new Hand("Hand2", handSize, cards.allCards, false, false);
				hands = [hand1, hand2];
				//solution
				sol = new Solution(cards.allCards);
			});

			it("does nothing for an empty array knownCards input", function() {
				ClueUtil.newKnownCardUpdate(hands, sol, []);

				expect(hand1.checkCardStatus(cards.allCards[0])).toBe(CardHeld.UNKNOWN);
				expect(hand1.checkCardStatus(cards.allCards[1])).toBe(CardHeld.UNKNOWN);
				expect(hand1.checkCardStatus(cards.allCards[2])).toBe(CardHeld.UNKNOWN);
				expect(hand2.checkCardStatus(cards.allCards[0])).toBe(CardHeld.UNKNOWN);
				expect(hand2.checkCardStatus(cards.allCards[1])).toBe(CardHeld.UNKNOWN);
				expect(hand2.checkCardStatus(cards.allCards[2])).toBe(CardHeld.UNKNOWN);
				expect(sol.checkCardStatus(cards.allCards[0])).toBe(CardHeld.UNKNOWN);
				expect(sol.checkCardStatus(cards.allCards[1])).toBe(CardHeld.UNKNOWN);
				expect(sol.checkCardStatus(cards.allCards[2])).toBe(CardHeld.UNKNOWN);

			});

			describe("updates all players not holding the card to CardHeld.NO", function() {

				it("for a single Card() input", function() {
					//add card0 to hand1
					hand1.addKnownCard(card0);
					//new info on known card, call function
					ClueUtil.newKnownCardUpdate(hands, sol, card0);

					//check result: hand2 checklist has card0 as CardHeld.NO
					expect(hand2.checkCardStatus(card0)).toBe(CardHeld.NO);
					expect(sol.checkCardStatus(card0)).toBe(CardHeld.NO);
				});

				it("for an array [Card()] input", function() {
					//add card0, card1 to hand1
					hand1.addKnownCard(card0);
					hand1.addKnownCard(card1);
					//new info on 2 known cards, call function
					ClueUtil.newKnownCardUpdate(hands, sol, [card0, card1]);

					//check result: hand2 checklist has card0, card1 as CardHeld.NO
					expect(hand2.checkCardStatus(card0)).toBe(CardHeld.NO);
					expect(hand2.checkCardStatus(card1)).toBe(CardHeld.NO);
					expect(sol.checkCardStatus(card0)).toBe(CardHeld.NO);
					expect(sol.checkCardStatus(card1)).toBe(CardHeld.NO);
				});

			});
		});

		describe("method 'deduceCardSingleGuess' for guess with", function() {

			let gameCards, hand0, hand1, hand2, sol, allHands;

			beforeEach(function() {
				//set up common variables to all method tests:
				// (1) 3 players, 1 solution, 3 cards each (1 person, 1 weapon, 1 room)
				gameCards = ClueUtil._generateTestCards(4,4,4);
				//hands (hand0 main player)
				let hand0cards = [gameCards.personCards[0], gameCards.weaponCards[0],
								  gameCards.roomCards[0]];
				hand0 = new Hand("hand0", 3, gameCards.allCards, true, false, hand0cards);
				hand1 = new Hand("hand1", 3, gameCards.allCards, false, false);
				hand2 = new Hand("hand2", 3, gameCards.allCards, false, false);
				allHands = [hand0, hand1, hand2];
				//solution
				sol = new Solution(gameCards.allCards);

			});			

			describe("enough info to deduce a card assuming", function(){
				//block variables
				let unknownCard;

				beforeEach(function(){
					//guess by hand1, shown by hand2.
					//
					//unknownCard (card that happens to be in hand2's hand)
					unknownCard = gameCards.personCards[2];

				});

				describe("1 unknown card, 2 are known in non-showing hand", function(){
					//hand1 guesses, hand2 shows.
					//Guesses two cards known to be in hand1.
					let guess, personGuess, weaponGuess, roomGuess, newInfo;
					
					beforeEach(function() {
						personGuess = unknownCard;
						weaponGuess = gameCards.weaponCards[1];
						roomGuess = gameCards.roomCards[1];
						//weapon and room guess known to be in hand1's hand
						hand1.addKnownCard(weaponGuess);
						hand1.addKnownCard(roomGuess);
						ClueUtil.newKnownCardUpdate(allHands, sol, [weaponGuess, roomGuess]);
						//set up guess
						guess = new Guess(personGuess, weaponGuess, roomGuess, hand1, hand2);
						//apply guess
						newInfo = ClueUtil.deduceCardSingleGuess(guess, allHands, sol);
					});

					it("places the unknown card into the showing player's hand", function(){
						expect(hand2.hasCard(unknownCard)).toBe(true);
					});

					it("sets all other hands and solution status to 'NO' for the unknown card", function(){
						expect(hand0.checkCardStatus(unknownCard)).toBe(CardHeld.NO);
						expect(hand1.checkCardStatus(unknownCard)).toBe(CardHeld.NO);
						expect(sol.checkCardStatus(unknownCard)).toBe(CardHeld.NO);
					});

					it("indicates that new information has been found", function() {
						expect(newInfo).toBe(true);
					});
				});

				describe("1 unknown card, 2 cards are 'No' in showing hand", function() {
					//hand1 guesses, hand2 shows.
					//Guesses two cards known not to be in hand2.
					let guess, personGuess, weaponGuess, roomGuess, newInfo;
					
					beforeEach(function() {
						personGuess = unknownCard;
						weaponGuess = gameCards.weaponCards[1];
						roomGuess = gameCards.roomCards[1];
						//weapon and room guess known not to be in hand2's hand
						hand2.updateChecklist(weaponGuess, CardHeld.NO);
						hand2.updateChecklist(roomGuess, CardHeld.NO);
						//set up guess
						guess = new Guess(personGuess, weaponGuess, roomGuess, hand1, hand2);
						//apply guess
						newInfo = ClueUtil.deduceCardSingleGuess(guess, allHands, sol);
					});

					it("places the unknown card into the showing player's hand", function(){
						expect(hand2.hasCard(unknownCard)).toBe(true);
					});

					it("sets all other hands and solution status to 'NO' for the unknown card", function(){
						expect(hand0.checkCardStatus(unknownCard)).toBe(CardHeld.NO);
						expect(hand1.checkCardStatus(unknownCard)).toBe(CardHeld.NO);
						expect(sol.checkCardStatus(unknownCard)).toBe(CardHeld.NO);
					});

					it("indicates that new information has been found", function() {
						expect(newInfo).toBe(true);
					});
				});

				describe("1 unknown card, 1 known in non-showing hand, 1 previous 'No' in showing hand", function() {
					//hand1 guesses, hand2 shows.
					//Guesses one card known to be in hand1, 1 known not to be in hand2.
					let guess, personGuess, weaponGuess, roomGuess, newInfo;
					
					beforeEach(function() {
						personGuess = unknownCard;
						weaponGuess = gameCards.weaponCards[1];
						roomGuess = gameCards.roomCards[1];
						//weapon known in hand1, room guess known not to be in hand2's hand
						hand1.addKnownCard(weaponGuess);
						hand2.updateChecklist(roomGuess, CardHeld.NO);
						ClueUtil.newKnownCardUpdate(allHands, sol, weaponGuess);
						//set up guess
						guess = new Guess(personGuess, weaponGuess, roomGuess, hand1, hand2);
						//apply guess
						newInfo = ClueUtil.deduceCardSingleGuess(guess, allHands, sol);
					});

					it("places the unknown card into the showing player's hand", function(){
						expect(hand2.hasCard(unknownCard)).toBe(true);
					});

					it("sets all other hands and solution status to 'NO' for the unknown card", function(){
						expect(hand0.checkCardStatus(unknownCard)).toBe(CardHeld.NO);
						expect(hand1.checkCardStatus(unknownCard)).toBe(CardHeld.NO);
						expect(sol.checkCardStatus(unknownCard)).toBe(CardHeld.NO);
					});

					it("indicates that new information has been found", function() {
						expect(newInfo).toBe(true);
					});
				});

				describe("1 unknown card, 2 are known in player's hands, no one shows", function(){
					//hand1 guesses, no one shows.
					//Guesses two cards known to be in hand1.
					//THIS FUNCTION SHOULD DO NOTHING: deductions to solution are only
					//done in ClueUtil.deduceCardByNos().
					let guess, personGuess, weaponGuess, roomGuess, newInfo;
					
					beforeEach(function() {
						personGuess = unknownCard;
						weaponGuess = gameCards.weaponCards[1];
						roomGuess = gameCards.roomCards[1];
						//weapon and room guess known to be in hand1's hand
						hand1.addKnownCard(weaponGuess);
						hand1.addKnownCard(roomGuess);
						ClueUtil.newKnownCardUpdate(allHands, sol, [weaponGuess, roomGuess]);
						//set up guess
						guess = new Guess(personGuess, weaponGuess, roomGuess, hand1, null);
						//apply guess
						newInfo = ClueUtil.deduceCardSingleGuess(guess, allHands, sol);
					});

					it("and indicates that no new information has been found", function() {
						expect(newInfo).toBe(false);
					});
				});

			});

			describe("enough info to deduce the remaining possible cards in a hand from", function(){

				describe("only 1 remaining unknown card in show-er's hand", function(){
					//hand1 guesses, hand2 shows.
					//Guesses one card known to be in hand1, 2 are unknown.
					//hand2 only has 1 remaining unknown card in hand.
					//--Even if the specific card can't be deduced, the fact that hand2 showed
					//a card means that all other cards not part of the guess cannot be in
					//hand2.
					let guess, personGuess, weaponGuess, roomGuess, newInfo;
					
					beforeEach(function() {
						personGuess = gameCards.personCards[1];
						weaponGuess = gameCards.weaponCards[1];
						roomGuess = gameCards.roomCards[1];
						//weapon known in hand1, person + room guesses unknown
						//2 of 3 cards in hand2 are known
						hand1.addKnownCard(weaponGuess);
						hand2.addKnownCard(gameCards.personCards[2]);
						hand2.addKnownCard(gameCards.weaponCards[2]);
						ClueUtil.newKnownCardUpdate(allHands, sol,
							[weaponGuess, gameCards.personCards[2], gameCards.weaponCards[2]]);
						//set up guess
						guess = new Guess(personGuess, weaponGuess, roomGuess, hand1, hand2);
						//apply guess
						newInfo = ClueUtil.deduceCardSingleGuess(guess, allHands, sol);
					});

					it("means that the remaining card must be one in the guess", function(){
						//the weapon card is known. The only two possible cards left for the
						//showing player must be the person and room guess.
						expect(hand2.countUnknownCards()).toBe(2);
						expect(hand2.checkCardStatus(personGuess)).toBe(CardHeld.UNKNOWN);
						expect(hand2.checkCardStatus(roomGuess)).toBe(CardHeld.UNKNOWN);
					});

					it("indicates that new information has been found", function() {
						expect(newInfo).toBe(true);
					});
				});

			});

			describe("NOT enough info to deduce a card assuming", function(){

				describe("card(s) already known to be in show-er's hand", function(){
					//hand1 guesses, hand2 shows.
					//one card of guess already known in hand2.
					let guess, personGuess, weaponGuess, roomGuess, newInfo;
					
					beforeEach(function() {
						personGuess = gameCards.personCards[1];
						weaponGuess = gameCards.weaponCards[1];
						roomGuess = gameCards.roomCards[1];
						//weapon known to be in hand2
						hand2.addKnownCard(weaponGuess);
						ClueUtil.newKnownCardUpdate(allHands, sol, weaponGuess);
						//set up guess
						guess = new Guess(personGuess, weaponGuess, roomGuess, hand1, hand2);
						//apply guess
						newInfo = ClueUtil.deduceCardSingleGuess(guess, allHands, sol);
					});

					it("does not deduce any new cards held by the showing player", function(){
						//personGuess, roomGuess still should be CardHeld.UNKNOWN
						expect(hand2.checkCardStatus(personGuess)).toBe(CardHeld.UNKNOWN);
						expect(hand2.checkCardStatus(roomGuess)).toBe(CardHeld.UNKNOWN);
					});
					
					it("indicates that no new information has been found", function() {
						expect(newInfo).toBe(false);
					});
				});

				describe("2 unknown cards, 1 are known in non-showing hand", function(){
					//hand1 guesses, hand2 shows.
					//one card of guess already known in hand1.
					let guess, personGuess, weaponGuess, roomGuess, newInfo;
					
					beforeEach(function() {
						personGuess = gameCards.personCards[1];
						weaponGuess = gameCards.weaponCards[1];
						roomGuess = gameCards.roomCards[1];
						//weapon known to be in hand1
						hand1.addKnownCard(weaponGuess);
						ClueUtil.newKnownCardUpdate(allHands, sol, weaponGuess);
						//set up guess
						guess = new Guess(personGuess, weaponGuess, roomGuess, hand1, hand2);
						//apply guess
						newInfo = ClueUtil.deduceCardSingleGuess(guess, allHands, sol);
					});

					it("does not deduce any new cards held by the showing player", function(){
						//person, room still should be CardHeld.UNKNOWN.
						//weapon is known in hand1 and should be CardHeld.NO
						expect(hand2.checkCardStatus(personGuess)).toBe(CardHeld.UNKNOWN);
						expect(hand2.checkCardStatus(weaponGuess)).toBe(CardHeld.NO);
						expect(hand2.checkCardStatus(roomGuess)).toBe(CardHeld.UNKNOWN);
					});

					it("indicates that no new information has been found", function() {
						expect(newInfo).toBe(false);
					});
				});

				describe("2 unknown cards, 1 card is 'NO' in showing hand", function(){
					//hand1 guesses, hand2 shows.
					//one card of guess already known not to be in hand2.
					let guess, personGuess, weaponGuess, roomGuess, newInfo;
					
					beforeEach(function() {
						personGuess = gameCards.personCards[1];
						weaponGuess = gameCards.weaponCards[1];
						roomGuess = gameCards.roomCards[1];
						//weapon known to not be in hand2
						hand2.updateChecklist(weaponGuess, CardHeld.NO);
						//set up guess
						guess = new Guess(personGuess, weaponGuess, roomGuess, hand1, hand2);
						//apply guess
						newInfo = ClueUtil.deduceCardSingleGuess(guess, allHands, sol);
					});

					it("does not deduce any new cards held by the showing player", function(){
						//person, room still should be CardHeld.UNKNOWN.
						expect(hand2.checkCardStatus(personGuess)).toBe(CardHeld.UNKNOWN);
						expect(hand2.checkCardStatus(roomGuess)).toBe(CardHeld.UNKNOWN);
					});

					it("indicates that no new information has been found", function() {
						expect(newInfo).toBe(false);
					});
				});

			});
		});
		
		describe("method 'deduceCardByNos'", function() {
			//block variables
			let gameCards, hand0, hand1, allHands, sol, newInfo;

			beforeEach(function() {
				//2 hands, 1 solution. 3 cards per hand, 3 each of person/weapon/room
				gameCards = ClueUtil._generateTestCards(3,3,3);
				//hands and solution
				hand0 = new Hand("hand0", 3, gameCards.allCards, false, false);
				hand1 = new Hand("hand1", 3, gameCards.allCards, false, false);
				sol = new Solution(gameCards.allCards);
				allHands = [hand0, hand1];
			});

			it("deduces the solution card when all players do not have the card", function() {
				//hand0, hand1 do not have solution card
				let solCard = gameCards.personCards[0];
				hand0.updateChecklist(solCard, CardHeld.NO);
				hand1.updateChecklist(solCard, CardHeld.NO);
				//call deduce card function
				newInfo = ClueUtil.deduceCardByNos(allHands, sol, solCard);
				//test assertions
				expect(sol.isPersonKnown()).toBe(true);
				expect(sol.isWeaponKnown()).toBe(false);
				expect(sol.isRoomKnown()).toBe(false);
				expect(newInfo).toBe(true);
			});

			it("does not deduce a solution card when the status for one player is unknown", function() {
				//hand0 does not have solution card, hand1 unknown
				let solCard = gameCards.personCards[0];
				hand0.updateChecklist(solCard, CardHeld.NO);
				//call deduce card function
				newInfo = ClueUtil.deduceCardByNos(allHands, sol, solCard);
				//test assertions
				expect(sol.isPersonKnown()).toBe(false);
				expect(sol.isWeaponKnown()).toBe(false);
				expect(sol.isRoomKnown()).toBe(false);
				expect(newInfo).toBe(false);
			});
		});

		describe("method 'processGuesses'", function(){
			//block variables
			let player0, player1, player2, allPlayers;
			let gameCards;
			let allHands, solHand;
			let solPerson, solWeapon, solRoom;
			let player0cards, player1cards, player2cards, solutioncards;

			beforeEach(function(){
				/*set up game state:
					-3 players
					-3 cards per player: 1/1/1 person/weapon/room each, index same as player number
					-player0 is main player
					-solution is last card of each type in list (index 3)
				*/
				//generate cards
				gameCards = ClueUtil._generateTestCards(4,4,4);

				//generate players
				player0cards = [gameCards.personCards[0],
									gameCards.weaponCards[0],
									gameCards.roomCards[0]];
				player0 = new Player("Player0", gameCards.allCards, true, false, player0cards);

				player1cards = [gameCards.personCards[1],
									gameCards.weaponCards[1],
									gameCards.roomCards[1]];
				player1 = new Player("Player1", gameCards.allCards, false, false, player1cards);

				player2cards = [gameCards.personCards[2],
									gameCards.weaponCards[2],
									gameCards.roomCards[2]];
				player2 = new Player("Player2", gameCards.allCards, false, false, player2cards);

				allPlayers = [player0, player1, player2];

				//generate solution
				solPerson = gameCards.personCards[3];
				solWeapon = gameCards.weaponCards[3];
				solRoom = gameCards.roomCards[3];
				solutioncards = [solPerson, solWeapon, solRoom];
				playerSol = new Player("Solution", gameCards.allCards, false, true, solutioncards);
				
				//store hands of players
				allHands = [player0.hand, player1.hand, player2.hand];
				solHand = playerSol.hand;

				//apply main player known cards to other players
				ClueUtil.newKnownCardUpdate(allHands, solHand, player0.heldCards);
			});

			describe("deduces the solution directly", function(){

				describe("for a main-player single guess of the solution by", function(){
					//block variables
					let guesses;

					beforeEach(function(){
						//only one guess: all are in solution
						guesses = [];
						guesses.push(ClueUtil._simulateGuess(player0, solPerson, solWeapon,
												solRoom, allPlayers));

						//apply No's from all guesses
						guesses.forEach(function(guess){
							ClueUtil.applyGuessToHands(guess, allHands, solHand);
						});

						//process guesses
						ClueUtil.processGuesses(allHands, solHand, guesses, gameCards.allCards);
					});

					it("identifying the full solution", function(){
						expect(solHand.isFullSolutionKnown()).toBe(true);
					});

					it("identifying the correct person card", function(){
						expect(solHand.person).toBe(solPerson);
					});

					it("identifying the correct weapon card", function(){
						expect(solHand.weapon).toBe(solWeapon);
					});

					it("identifying the correct room card", function(){
						expect(solHand.room).toBe(solRoom);
					});

					it("identifying no cards are known in player1's hand", function(){
						expect(player1.hand.countKnownCards()).toBe(0);
					});

					it("identifying the cards known not to be in player1's hand", function(){
						//solution cards, cards held by main player are known not to be in player1 hand
						expect(player1.hand.checkCardStatus(solPerson)).toBe(CardHeld.NO);
						expect(player1.hand.checkCardStatus(solWeapon)).toBe(CardHeld.NO);
						expect(player1.hand.checkCardStatus(solRoom)).toBe(CardHeld.NO);
						expect(player1.hand.checkCardStatus(player0cards[0])).toBe(CardHeld.NO);
						expect(player1.hand.checkCardStatus(player0cards[1])).toBe(CardHeld.NO);
						expect(player1.hand.checkCardStatus(player0cards[2])).toBe(CardHeld.NO);
					});

					it("identifying no cards are known in player2's hand", function(){
						expect(player2.hand.countKnownCards()).toBe(0);
					});

					it("identifying the cards known not to be in player2's hand", function(){
						//solution cards, cards held by main player are known not to be in player2 hand
						expect(player2.hand.checkCardStatus(solPerson)).toBe(CardHeld.NO);
						expect(player2.hand.checkCardStatus(solWeapon)).toBe(CardHeld.NO);
						expect(player2.hand.checkCardStatus(solRoom)).toBe(CardHeld.NO);
						expect(player2.hand.checkCardStatus(player0cards[0])).toBe(CardHeld.NO);
						expect(player2.hand.checkCardStatus(player0cards[1])).toBe(CardHeld.NO);
						expect(player2.hand.checkCardStatus(player0cards[2])).toBe(CardHeld.NO);
					});
				});

				describe("for main-player individual guesses of the solution cards by", function(){
					//block variables
					let guesses;

					beforeEach(function(){
						//only one guess: all are in solution
						guesses = [];
						guesses.push(ClueUtil._simulateGuess(player0, solPerson, player0cards[1],
												player0cards[2], allPlayers));
						guesses.push(ClueUtil._simulateGuess(player0, player0cards[0], solWeapon,
												player0cards[2], allPlayers));
						guesses.push(ClueUtil._simulateGuess(player0, player0cards[0], player0cards[1],
												solRoom, allPlayers));

						//apply No's from all guesses
						guesses.forEach(function(guess){
							ClueUtil.applyGuessToHands(guess, allHands, solHand);
						});

						//process guesses
						ClueUtil.processGuesses(allHands, solHand, guesses, gameCards.allCards);
					});

					it("identifying the full solution", function(){
						expect(solHand.isFullSolutionKnown()).toBe(true);
					});

					it("identifying the correct person card", function(){
						expect(solHand.person).toBe(solPerson);
					});

					it("identifying the correct weapon card", function(){
						expect(solHand.weapon).toBe(solWeapon);
					});

					it("identifying the correct room card", function(){
						expect(solHand.room).toBe(solRoom);
					});

					it("identifying no cards are known in player1's hand", function(){
						expect(player1.hand.countKnownCards()).toBe(0);
					});

					it("identifying the cards known not to be in player1's hand", function(){
						//solution cards, cards held by main player are known not to be in player1 hand
						expect(player1.hand.checkCardStatus(solPerson)).toBe(CardHeld.NO);
						expect(player1.hand.checkCardStatus(solWeapon)).toBe(CardHeld.NO);
						expect(player1.hand.checkCardStatus(solRoom)).toBe(CardHeld.NO);
						expect(player1.hand.checkCardStatus(player0cards[0])).toBe(CardHeld.NO);
						expect(player1.hand.checkCardStatus(player0cards[1])).toBe(CardHeld.NO);
						expect(player1.hand.checkCardStatus(player0cards[2])).toBe(CardHeld.NO);
					});

					it("identifying no cards are known in player2's hand", function(){
						expect(player2.hand.countKnownCards()).toBe(0);
					});

					it("identifying the cards known not to be in player2's hand", function(){
						//solution cards, cards held by main player are known not to be in player2 hand
						expect(player2.hand.checkCardStatus(solPerson)).toBe(CardHeld.NO);
						expect(player2.hand.checkCardStatus(solWeapon)).toBe(CardHeld.NO);
						expect(player2.hand.checkCardStatus(solRoom)).toBe(CardHeld.NO);
						expect(player2.hand.checkCardStatus(player0cards[0])).toBe(CardHeld.NO);
						expect(player2.hand.checkCardStatus(player0cards[1])).toBe(CardHeld.NO);
						expect(player2.hand.checkCardStatus(player0cards[2])).toBe(CardHeld.NO);
					});
				});

				describe("for main-player individual guesses of all non-solution cards by", function(){
					//block variables
					let guesses;

					beforeEach(function(){
						//only one guess: all are in solution
						guesses = [];
						//isolate player1 cards
						guesses.push(ClueUtil._simulateGuess(player0, 
							gameCards.personCards[1], gameCards.weaponCards[0], gameCards.roomCards[0], allPlayers));
						guesses.push(ClueUtil._simulateGuess(player0, 
							gameCards.personCards[0], gameCards.weaponCards[1], gameCards.roomCards[0], allPlayers));
						guesses.push(ClueUtil._simulateGuess(player0, 
							gameCards.personCards[0], gameCards.weaponCards[0], gameCards.roomCards[1], allPlayers));

						//isolate player2 cards
						guesses.push(ClueUtil._simulateGuess(player0, 
							gameCards.personCards[2], gameCards.weaponCards[0], gameCards.roomCards[0], allPlayers));
						guesses.push(ClueUtil._simulateGuess(player0, 
							gameCards.personCards[0], gameCards.weaponCards[2], gameCards.roomCards[0], allPlayers));
						guesses.push(ClueUtil._simulateGuess(player0, 
							gameCards.personCards[0], gameCards.weaponCards[0], gameCards.roomCards[2], allPlayers));

						//apply No's from all guesses
						guesses.forEach(function(guess){
							ClueUtil.applyGuessToHands(guess, allHands, solHand);
						});

						//process guesses
						ClueUtil.processGuesses(allHands, solHand, guesses, gameCards.allCards);
					});

					it("identifying the full solution", function(){
						expect(solHand.isFullSolutionKnown()).toBe(true);
					});

					it("identifying the correct person card", function(){
						expect(solHand.person).toBe(solPerson);
					});

					it("identifying the correct weapon card", function(){
						expect(solHand.weapon).toBe(solWeapon);
					});

					it("identifying the correct room card", function(){
						expect(solHand.room).toBe(solRoom);
					});

					it("identifying 3 cards are known in player1's hand, none are unknown", function(){
						expect(player1.hand.countKnownCards()).toBe(3);
						expect(player1.hand.countUnknownCards()).toBe(0);
					});

					it("identifying the cards to be in player1's hand", function(){
						expect(player1.hand.hasCard(gameCards.personCards[1])).toBe(true);
						expect(player1.hand.hasCard(gameCards.weaponCards[1])).toBe(true);
						expect(player1.hand.hasCard(gameCards.roomCards[1])).toBe(true);
					});

					it("identifying 3 cards are known in player2's hand, none are unknown", function(){
						expect(player1.hand.countKnownCards()).toBe(3);
						expect(player1.hand.countUnknownCards()).toBe(0);
					});

					it("identifying the cards to be in player2's hand", function(){
						expect(player2.hand.hasCard(gameCards.personCards[2])).toBe(true);
						expect(player2.hand.hasCard(gameCards.weaponCards[2])).toBe(true);
						expect(player2.hand.hasCard(gameCards.roomCards[2])).toBe(true);
					});
				});
			});

			describe("deduces the solution indirectly", function(){
					
				describe("for another player isolating a different player's cards by", function(){
					//block variables
					let guesses;

					beforeEach(function(){
						/*Cards that were shown from another player's guess are deduced
							based on saying 'no' to main player's guess.

							Player order: Player0 (main) --> Player1 --> Player2
							Guess order:
								(1) Player2, isolate person from player1 --> player1 shows
								(2) Player2, isolate weapon from player1 --> player1 shows
								(3) Player2, isolate room from player1 --> player1 shows
								(4) Player0, isolate person from player2 --> player2 shows
								(5) Player2, isolate weapon from player2 --> player2 shows
								(6) Player2, isolate room from player2 --> player2 shows

							At this point, the contents of Player2's hand can be determined
							based on Player1's guesses, and therefore the solution, since
							all 3 cards in all 3 hands are known.
						*/

						guesses = [];
						//player2 guesses to isolate player1 cards
						guesses.push(ClueUtil._simulateGuess(player2, 
							gameCards.personCards[1], gameCards.weaponCards[2], gameCards.roomCards[2], allPlayers));
						guesses.push(ClueUtil._simulateGuess(player2, 
							gameCards.personCards[2], gameCards.weaponCards[1], gameCards.roomCards[2], allPlayers));
						guesses.push(ClueUtil._simulateGuess(player2, 
							gameCards.personCards[2], gameCards.weaponCards[2], gameCards.roomCards[1], allPlayers));

						//player0 (main) guesses to isolate player2 cards
						guesses.push(ClueUtil._simulateGuess(player0, 
							gameCards.personCards[2], gameCards.weaponCards[0], gameCards.roomCards[0], allPlayers));
						guesses.push(ClueUtil._simulateGuess(player0, 
							gameCards.personCards[0], gameCards.weaponCards[2], gameCards.roomCards[0], allPlayers));
						guesses.push(ClueUtil._simulateGuess(player0, 
							gameCards.personCards[0], gameCards.weaponCards[0], gameCards.roomCards[2], allPlayers));

						//apply No's from all guesses
						guesses.forEach(function(guess){
							ClueUtil.applyGuessToHands(guess, allHands, solHand);
						});

						//process guesses
						ClueUtil.processGuesses(allHands, solHand, guesses, gameCards.allCards);
					});

					it("identifying the full solution", function(){
						expect(solHand.isFullSolutionKnown()).toBe(true);
					});

					it("identifying the correct person card", function(){
						expect(solHand.person).toBe(solPerson);
					});

					it("identifying the correct weapon card", function(){
						expect(solHand.weapon).toBe(solWeapon);
					});

					it("identifying the correct room card", function(){
						expect(solHand.room).toBe(solRoom);
					});

					it("identifying 3 cards are known in player1's hand, none are unknown", function(){
						expect(player1.hand.countKnownCards()).toBe(3);
						expect(player1.hand.countUnknownCards()).toBe(0);
					});

					it("identifying the cards to be in player1's hand", function(){
						expect(player1.hand.hasCard(gameCards.personCards[1])).toBe(true);
						expect(player1.hand.hasCard(gameCards.weaponCards[1])).toBe(true);
						expect(player1.hand.hasCard(gameCards.roomCards[1])).toBe(true);
					});

					it("identifying 3 cards are known in player2's hand, none are unknown", function(){
						expect(player1.hand.countKnownCards()).toBe(3);
						expect(player1.hand.countUnknownCards()).toBe(0);
					});

					it("identifying the cards to be in player2's hand", function(){
						expect(player2.hand.hasCard(gameCards.personCards[2])).toBe(true);
						expect(player2.hand.hasCard(gameCards.weaponCards[2])).toBe(true);
						expect(player2.hand.hasCard(gameCards.roomCards[2])).toBe(true);
					});
				});

				describe("for other players isolating the solution cards by", function(){
					//block variables
					let guesses;

					beforeEach(function(){
						/*Guesses exposing solution cards from other player guesses are deduced
							based on saying 'no' to main player's guess.

							Player order: Player0 (main) --> Player1 --> Player2
							Guess order:
								(1) Player2, isolate person solution
								(2) Player1, isolate weapon and room solution
								(3) Player0 (main), determines Player2 had room in guess
								(4) Player0 (main), determines Player2 had weapon in guess
								(5) Player0 (main), determines Player1 does not have weapon or room
									by asking for weapon + room solution, but player2's person card
									is shown

							At this point, the solution is known. All cards in all hands should be known because:
							(1) 3 solution cards known
							(2) 3 main player cards are known
							(3) 3 player2 cards have been shown directly to main player
							(4) No player1 cards were shown, but only 3 remaining cards are unknown
								in the game, so they must all be in player1's hand.
						*/

						guesses = [];
						//(1) player2 guesses to isolate person solution
						guesses.push(ClueUtil._simulateGuess(player2, 
							solPerson, gameCards.weaponCards[2], gameCards.roomCards[2], allPlayers));
						//(2) player1 guesses to isolate weapon, room solutions
						guesses.push(ClueUtil._simulateGuess(player1, 
							gameCards.personCards[1], solWeapon, solRoom, allPlayers));
						//(3) player0 (main) guesses to determine player2 had room
						guesses.push(ClueUtil._simulateGuess(player0, 
							gameCards.personCards[0], gameCards.weaponCards[0], gameCards.roomCards[2], allPlayers));
						//(4) player0 (main) guesses to determine player2 had weapon
						guesses.push(ClueUtil._simulateGuess(player0, 
							gameCards.personCards[0], gameCards.weaponCards[2], gameCards.roomCards[0], allPlayers));
						//(5) player0 (main) guesses to determine player1 does not have weapon/room solutions,
						//	  player2 shows person card
						guesses.push(ClueUtil._simulateGuess(player0, 
							gameCards.personCards[2], solWeapon, solRoom, allPlayers));

						//apply No's from all guesses
						guesses.forEach(function(guess){
							ClueUtil.applyGuessToHands(guess, allHands, solHand);
						});

						//process guesses
						ClueUtil.processGuesses(allHands, solHand, guesses, gameCards.allCards);
					});

					it("identifying the full solution", function(){
						expect(solHand.isFullSolutionKnown()).toBe(true);
					});

					it("identifying the correct person card", function(){
						expect(solHand.person).toBe(solPerson);
					});

					it("identifying the correct weapon card", function(){
						expect(solHand.weapon).toBe(solWeapon);
					});

					it("identifying the correct room card", function(){
						expect(solHand.room).toBe(solRoom);
					});

					it("identifying all 3 cards are known in player1's hand, 0 are unknown", function(){
						expect(player1.hand.countKnownCards()).toBe(3);
						expect(player1.hand.countUnknownCards()).toBe(0);
					});

					it("identifying the 3 cards in player1's hand", function(){
						expect(player1.hand.hasCard(gameCards.personCards[1])).toBe(true);
						expect(player1.hand.hasCard(gameCards.weaponCards[1])).toBe(true);
						expect(player1.hand.hasCard(gameCards.roomCards[1])).toBe(true);
					});

					it("identifying all 3 cards are known in player2's hand, 0 are unknown", function(){
						expect(player2.hand.countKnownCards()).toBe(3);
						expect(player2.hand.countUnknownCards()).toBe(0);
					});

					it("identifying the 3 cards in player2's hand", function(){
						expect(player2.hand.hasCard(gameCards.personCards[2])).toBe(true);
						expect(player2.hand.hasCard(gameCards.weaponCards[2])).toBe(true);
						expect(player2.hand.hasCard(gameCards.roomCards[2])).toBe(true);
					});
				});
					
			});
		});

		describe("method 'verifyValidGuess'", function() {
			//block variables
			let player0, player1, player2, allPlayers;
			let gameCards;
			let allHands, solHand;
			let solPerson, solWeapon, solRoom;
			let player0cards, player1cards, player2cards, solutioncards;

			beforeEach(function(){
				/*set up game state:
					-3 players
					-3 cards per player: 1/1/1 person/weapon/room each, index same as player number
					-player0 is main player
					-solution is last card of each type in list (index 3)
				*/
				//generate cards
				gameCards = ClueUtil._generateTestCards(4,4,4);

				//generate players
				player0cards = [gameCards.personCards[0],
									gameCards.weaponCards[0],
									gameCards.roomCards[0]];
				player0 = new Player("Player0", gameCards.allCards, true, false, player0cards);

				player1cards = [gameCards.personCards[1],
									gameCards.weaponCards[1],
									gameCards.roomCards[1]];
				player1 = new Player("Player1", gameCards.allCards, false, false, player1cards);

				player2cards = [gameCards.personCards[2],
									gameCards.weaponCards[2],
									gameCards.roomCards[2]];
				player2 = new Player("Player2", gameCards.allCards, false, false, player2cards);

				allPlayers = [player0, player1, player2];

				//generate solution
				solPerson = gameCards.personCards[3];
				solWeapon = gameCards.weaponCards[3];
				solRoom = gameCards.roomCards[3];
				solutioncards = [solPerson, solWeapon, solRoom];
				playerSol = new Player("Solution", gameCards.allCards, false, true, solutioncards);
				
				//store hands of players
				allHands = [player0.hand, player1.hand, player2.hand];
				solHand = playerSol.hand;

				//apply main player known cards to other players
				ClueUtil.newKnownCardUpdate(allHands, solHand, player0.heldCards);

				//assume player1 weapon card and player2 room card has already been discovered
				let guess1 = ClueUtil._simulateGuess(player0, gameCards.personCards[0], 
						gameCards.weaponCards[1], gameCards.roomCards[0], allPlayers);
				let guess2 = ClueUtil._simulateGuess(player0, gameCards.personCards[0], 
						gameCards.weaponCards[0], gameCards.roomCards[2], allPlayers);

				ClueUtil.applyGuessToHands(guess1, allHands, solHand);
				ClueUtil.applyGuessToHands(guess2, allHands, solHand);
				ClueUtil.processGuesses(allHands, solHand, [guess1, guess2], gameCards.allCards);

			});

			describe("for a valid guess", function() {

				describe("by the main player", function() {
					//block variables
					let mainPlayerGuess;
					let personCard, weaponCard, roomCard;
					let verifyGuessObj;	
					
					beforeEach(function() {
						//main player guess
						let mainPlayerGuess = ClueUtil._simulateGuess(player0, gameCards.personCards[0],
								gameCards.weaponCards[2], gameCards.roomCards[0], allPlayers);

						//validate the guess
						verifyGuessObj = ClueUtil.verifyValidGuess(mainPlayerGuess, allHands, solHand);
					});

					it("flags the guess as valid", function() {
						expect(verifyGuessObj.validGuess).toBe(true);
					});

					it("does not return any 'invalid components'", function() {
						expect(verifyGuessObj.invalidComponents.length).toBe(0);
					});

				});

				describe("by another player", function() {
					//block variables
					let otherPlayerGuess;
					let personCard, weaponCard, roomCard;
					let verifyGuessObj;	

					beforeEach(function() {
						//player 2 guess, player 1 shows
						otherPlayerGuess = ClueUtil._simulateGuess(player2, gameCards.personCards[2],
								gameCards.weaponCards[2], gameCards.roomCards[1], allPlayers);

						//validate the guess
						verifyGuessObj = ClueUtil.verifyValidGuess(otherPlayerGuess, allHands, solHand);
					});

					it("flags the guess as valid", function() {
						expect(verifyGuessObj.validGuess).toBe(true);
					});

					it("does not return any 'invalid components'", function() {
						expect(verifyGuessObj.invalidComponents.length).toBe(0);
					});

				});

			});

			describe("for a known invalid guess", function() {
				
				describe("by the main player", function() {

					describe("where a 'pass' player is known to have a card", function() {
						//block variables
						let personCard, weaponCard, roomCard;
						let invalidGuess;
						let verifyGuessObj;

						beforeEach(function() {
							//set invalid guess: guess weapon in player1's hand, but say player2 shows
							personCard = gameCards.personCards[0];
							weaponCard = gameCards.weaponCards[1];
							roomCard = gameCards.roomCards[2];
							invalidGuess = new Guess(personCard, weaponCard, roomCard, 
												player0.hand, player2.hand);
							//validate the guess
							verifyGuessObj = ClueUtil.verifyValidGuess(invalidGuess, allHands, solHand);
						});
						
						it("flags the guess as invalid", function() {
							expect(verifyGuessObj.validGuess).toBe(false);
						});

						it("returns the correct invalid guess codes", function() {
							//1 problem with guess
							expect(verifyGuessObj.invalidComponents.length).toBe(1);
							//problem is that a "pass" player has one of the cards in the guess
							expect(verifyGuessObj.invalidComponents[0].code).toBe(BadGuessCode.PASS_PLAYER_HAS_CARD);
						});

						it("returns the correct invalid components of the guess", function() {
							let comp = verifyGuessObj.invalidComponents[0];
							//1 card
							expect(comp.cards.length).toBe(1);
							//weapon in player1's hand
							expect(comp.cards[0]).toBe(weaponCard);
						});
					});

					describe("where the 'show' player does not have any cards", function() {

						describe("and they are all held by other players", function() {
							//block variables
							let personCard, weaponCard, roomCard;
							let invalidGuess;
							let verifyGuessObj;

							beforeEach(function() {
								//add 2 more guesses to round out player2's hand: person and weapon
								let guess1 = ClueUtil._simulateGuess(player0, gameCards.personCards[2], 
										gameCards.weaponCards[0], gameCards.roomCards[0], allPlayers);
								let guess2 = ClueUtil._simulateGuess(player0, gameCards.personCards[0], 
										gameCards.weaponCards[2], gameCards.roomCards[0], allPlayers);

								ClueUtil.applyGuessToHands(guess1, allHands, solHand);
								ClueUtil.applyGuessToHands(guess2, allHands, solHand);
								ClueUtil.processGuesses(allHands, solHand, [guess1, guess2], gameCards.allCards);

								//set invalid guess: main player guess, player1 shows, but all cards are in player2 hand
								personCard = gameCards.personCards[2];
								weaponCard = gameCards.weaponCards[2];
								roomCard = gameCards.roomCards[2];
								invalidGuess = new Guess(personCard, weaponCard, roomCard, 
													player0.hand, player1.hand);
								//validate the guess
								verifyGuessObj = ClueUtil.verifyValidGuess(invalidGuess, allHands, solHand);
							});

							it("flags the guess as invalid", function(){
								expect(verifyGuessObj.validGuess).toBe(false);
							});

							it("returns the correct invalid guess codes", function() {
								//1 problem with guess
								expect(verifyGuessObj.invalidComponents.length).toBe(1);
								//problem is that a "pass" player has one of the cards in the guess
								expect(verifyGuessObj.invalidComponents[0].code).toBe(BadGuessCode.NO_POSSIBLE_CARDS_IN_HAND);
							});

							it("returns the correct invalid components of the guess", function() {
								let comp = verifyGuessObj.invalidComponents[0];
								//3 cards
								expect(comp.cards.length).toBe(3);
								//all cards should be in the returned invalidComponent array
								expect(comp.cards.indexOf(personCard)).toBeGreaterThan(-1);
								expect(comp.cards.indexOf(weaponCard)).toBeGreaterThan(-1);
								expect(comp.cards.indexOf(roomCard)).toBeGreaterThan(-1);
							});
						});

						describe("and they are all held by the main player", function() {

							//block variables
							let personCard, weaponCard, roomCard;
							let invalidGuess;
							let verifyGuessObj;

							beforeEach(function() {
								//set invalid guess: main player guess, player1 shows, but all cards are in player0 hand
								personCard = gameCards.personCards[0];
								weaponCard = gameCards.weaponCards[0];
								roomCard = gameCards.roomCards[0];
								invalidGuess = new Guess(personCard, weaponCard, roomCard, 
													player0.hand, player1.hand);
								//validate the guess
								verifyGuessObj = ClueUtil.verifyValidGuess(invalidGuess, allHands, solHand);
							});

							it("flags the guess as invalid", function(){
								expect(verifyGuessObj.validGuess).toBe(false);
							});

							it("returns the correct invalid guess codes", function() {
								//1 problem with guess
								expect(verifyGuessObj.invalidComponents.length).toBe(1);
								//problem is that a "pass" player has one of the cards in the guess
								expect(verifyGuessObj.invalidComponents[0].code).toBe(BadGuessCode.NO_POSSIBLE_CARDS_IN_HAND);
							});

							it("returns the correct invalid components of the guess", function() {
								let comp = verifyGuessObj.invalidComponents[0];
								//3 cards
								expect(comp.cards.length).toBe(3);
								//all cards should be in the returned invalidComponent array
								expect(comp.cards.indexOf(personCard)).toBeGreaterThan(-1);
								expect(comp.cards.indexOf(weaponCard)).toBeGreaterThan(-1);
								expect(comp.cards.indexOf(roomCard)).toBeGreaterThan(-1);
							});
						});
					});

					describe("where the shown card is known not to be in the showing player's hand", function() {
						//block variables
						let personCard, weaponCard, roomCard;
						let invalidGuess;
						let verifyGuessObj;

						beforeEach(function() {
							//set invalid guess: guess weapon in player1's hand, but say person is shown (known in main hand)
							personCard = gameCards.personCards[0];
							weaponCard = gameCards.weaponCards[1];
							roomCard = gameCards.roomCards[2];
							invalidGuess = new Guess(personCard, weaponCard, roomCard, 
												player0.hand, player1.hand, personCard);
							//validate the guess
							verifyGuessObj = ClueUtil.verifyValidGuess(invalidGuess, allHands, solHand);
						});
						
						it("flags the guess as invalid", function(){
							expect(verifyGuessObj.validGuess).toBe(false);
						});

						it("returns the correct invalid guess codes", function() {
							//1 problem with guess
							expect(verifyGuessObj.invalidComponents.length).toBe(1);
							//problem code is correct
							expect(verifyGuessObj.invalidComponents[0].code).toBe(BadGuessCode.PLAYER_CANT_SHOW_THAT_CARD);
						});

						it("returns the correct invalid components of the guess", function() {
							let comp = verifyGuessObj.invalidComponents[0];
							//1 card
							expect(comp.cards.length).toBe(1);
							//all cards should be in the returned invalidComponent array
							expect(comp.cards[0]).toBe(personCard);
						});
					});
				});

				describe("by another player", function() {

					describe("where a 'pass' player is known to have a card", function() {
						//block variables
						let personCard, weaponCard, roomCard;
						let invalidGuess;
						let verifyGuessObj;

						beforeEach(function() {
							//set invalid guess: player2 guess, main player does not show the person card,
							// says player1 shows
							personCard = gameCards.personCards[0];
							weaponCard = gameCards.weaponCards[1];
							roomCard = gameCards.roomCards[2];
							invalidGuess = new Guess(personCard, weaponCard, roomCard, 
												player2.hand, player1.hand);
							//validate the guess
							verifyGuessObj = ClueUtil.verifyValidGuess(invalidGuess, allHands, solHand);
						});

						it("flags the guess as invalid", function() {
							expect(verifyGuessObj.validGuess).toBe(false);
						});

						it("returns the correct invalid guess codes", function() {
							//1 problem with guess
							expect(verifyGuessObj.invalidComponents.length).toBe(1);
							//problem is that a "pass" player has one of the cards in the guess
							expect(verifyGuessObj.invalidComponents[0].code).toBe(BadGuessCode.PASS_PLAYER_HAS_CARD);
						});

						it("returns the correct invalid components of the guess", function() {
							let comp = verifyGuessObj.invalidComponents[0];
							//1 card
							expect(comp.cards.length).toBe(1);
							//weapon in player1's hand
							expect(comp.cards[0]).toBe(personCard);
						});
					});

					describe("where the 'show' player does not have any cards", function() {

						describe("and they are all held by another player", function() {
							//block variables
							let personCard, weaponCard, roomCard;
							let invalidGuess;
							let verifyGuessObj;

							beforeEach(function() {
								//add 2 more guesses to round out player1's hand: person and room
								let guess1 = ClueUtil._simulateGuess(player0, gameCards.personCards[1], 
										gameCards.weaponCards[0], gameCards.roomCards[0], allPlayers);
								let guess2 = ClueUtil._simulateGuess(player0, gameCards.personCards[0], 
										gameCards.weaponCards[0], gameCards.roomCards[1], allPlayers);

								ClueUtil.applyGuessToHands(guess1, allHands, solHand);
								ClueUtil.applyGuessToHands(guess2, allHands, solHand);
								ClueUtil.processGuesses(allHands, solHand, [guess1, guess2], gameCards.allCards);

								//set invalid guess: player1 guess all cards in own hand, says player2 shows
								personCard = gameCards.personCards[1];
								weaponCard = gameCards.weaponCards[1];
								roomCard = gameCards.roomCards[1];
								invalidGuess = new Guess(personCard, weaponCard, roomCard, 
													player1.hand, player2.hand);
								//validate the guess
								verifyGuessObj = ClueUtil.verifyValidGuess(invalidGuess, allHands, solHand);
							});

							it("flags the guess as invalid", function(){
								expect(verifyGuessObj.validGuess).toBe(false);
							});

							it("returns the correct invalid guess codes", function() {
								//1 problem with guess
								expect(verifyGuessObj.invalidComponents.length).toBe(1);
								//problem is that a "pass" player has one of the cards in the guess
								expect(verifyGuessObj.invalidComponents[0].code).toBe(BadGuessCode.NO_POSSIBLE_CARDS_IN_HAND);
							});

							it("returns the correct invalid components of the guess", function() {
								let comp = verifyGuessObj.invalidComponents[0];
								//3 cards
								expect(comp.cards.length).toBe(3);
								//weapon in player1's hand
								expect(comp.cards.indexOf(personCard)).toBeGreaterThan(-1);
								expect(comp.cards.indexOf(weaponCard)).toBeGreaterThan(-1);
								expect(comp.cards.indexOf(roomCard)).toBeGreaterThan(-1);
							});
						});

						describe("and they are all held by the main player", function() {
							//block variables
							let personCard, weaponCard, roomCard;
							let invalidGuess;
							let verifyGuessObj;

							beforeEach(function() {
								//add 2 more guesses to round out player1's hand: person and room
								let guess1 = ClueUtil._simulateGuess(player0, gameCards.personCards[1], 
										gameCards.weaponCards[0], gameCards.roomCards[0], allPlayers);
								let guess2 = ClueUtil._simulateGuess(player0, gameCards.personCards[0], 
										gameCards.weaponCards[0], gameCards.roomCards[1], allPlayers);

								ClueUtil.applyGuessToHands(guess1, allHands, solHand);
								ClueUtil.applyGuessToHands(guess2, allHands, solHand);
								ClueUtil.processGuesses(allHands, solHand, [guess1, guess2], gameCards.allCards);

								//set invalid guess: player1 guess all cards in main player hand, says player2 shows
								personCard = gameCards.personCards[0];
								weaponCard = gameCards.weaponCards[0];
								roomCard = gameCards.roomCards[0];
								invalidGuess = new Guess(personCard, weaponCard, roomCard, 
													player1.hand, player2.hand);
								//validate the guess
								verifyGuessObj = ClueUtil.verifyValidGuess(invalidGuess, allHands, solHand);
							});

							it("flags the guess as invalid", function(){
								expect(verifyGuessObj.validGuess).toBe(false);
							});

							it("returns the correct invalid guess codes", function() {
								//1 problem with guess
								expect(verifyGuessObj.invalidComponents.length).toBe(1);
								//problem is that a "pass" player has one of the cards in the guess
								expect(verifyGuessObj.invalidComponents[0].code).toBe(BadGuessCode.NO_POSSIBLE_CARDS_IN_HAND);
							});

							it("returns the correct invalid components of the guess", function() {
								let comp = verifyGuessObj.invalidComponents[0];
								//3 cards
								expect(comp.cards.length).toBe(3);
								//weapon in player1's hand
								expect(comp.cards.indexOf(personCard)).toBeGreaterThan(-1);
								expect(comp.cards.indexOf(weaponCard)).toBeGreaterThan(-1);
								expect(comp.cards.indexOf(roomCard)).toBeGreaterThan(-1);
							});
						});
					});
				});

				
			});
		});

		describe("method 'generateGuessWarnings'", function() {
			//block variables
			let player0, player1, player2, allPlayers;
			let gameCards;
			let allHands, solHand;
			let solPerson, solWeapon, solRoom;
			let player0cards, player1cards, player2cards, solutioncards;

			beforeEach(function(){
				/*set up game state:
					-3 players
					-3 cards per player: 1/1/1 person/weapon/room each, index same as player number
					-player0 is main player
					-solution is last card of each type in list (index 3)
				*/
				//generate cards
				gameCards = ClueUtil._generateTestCards(4,4,4);

				//generate players
				player0cards = [gameCards.personCards[0],
									gameCards.weaponCards[0],
									gameCards.roomCards[0]];
				player0 = new Player("Player0", gameCards.allCards, true, false, player0cards);

				player1cards = [gameCards.personCards[1],
									gameCards.weaponCards[1],
									gameCards.roomCards[1]];
				player1 = new Player("Player1", gameCards.allCards, false, false, player1cards);

				player2cards = [gameCards.personCards[2],
									gameCards.weaponCards[2],
									gameCards.roomCards[2]];
				player2 = new Player("Player2", gameCards.allCards, false, false, player2cards);

				allPlayers = [player0, player1, player2];

				//generate solution
				solPerson = gameCards.personCards[3];
				solWeapon = gameCards.weaponCards[3];
				solRoom = gameCards.roomCards[3];
				solutioncards = [solPerson, solWeapon, solRoom];
				playerSol = new Player("Solution", gameCards.allCards, false, true, solutioncards);
				
				//store hands of players
				allHands = [player0.hand, player1.hand, player2.hand];
				solHand = playerSol.hand;

				//apply main player known cards to other players
				ClueUtil.newKnownCardUpdate(allHands, solHand, player0.heldCards);

				//assume player1 weapon card and player2 room card has already been discovered
				let guess1 = ClueUtil._simulateGuess(player0, gameCards.personCards[0], 
						gameCards.weaponCards[1], gameCards.roomCards[0], allPlayers);
				let guess2 = ClueUtil._simulateGuess(player0, gameCards.personCards[0], 
						gameCards.weaponCards[0], gameCards.roomCards[2], allPlayers);

				ClueUtil.applyGuessToHands(guess1, allHands, solHand);
				ClueUtil.applyGuessToHands(guess2, allHands, solHand);
				ClueUtil.processGuesses(allHands, solHand, [guess1, guess2], gameCards.allCards);

			});


			describe("generates no warnings when the guess is valid by", function() {
				//block variables
				let mainPlayerGuess;
				let verifyGuessObject;
				let warningStrings;

				beforeEach(function() {
					//main player guess- person[0] & weapon[0] (in hand), room[2] shown by player2
					mainPlayerGuess = ClueUtil._simulateGuess(player0, gameCards.personCards[0], 
						gameCards.weaponCards[0], gameCards.roomCards[2], allPlayers);

					//verify guess
					verifyGuessObject = ClueUtil.verifyValidGuess(mainPlayerGuess, allHands, solHand);
					//translate warnings (none in this case)
					warningStrings = ClueUtil.generateGuessWarnings(verifyGuessObject);
				});

				it("returning an empty array", function() {
					expect(warningStrings.length).toBe(0);
				});
			});

			describe("generates the correct number of warnings when", function() {

				describe("a 'pass' player has a card by", function() {
					//block variables
					let mainPlayerGuess;
					let verifyGuessObject;
					let warningStrings;

					beforeEach(function() {
						//main player guess- person[2] (unknown), weapon[1] (player1), room[0] (player0)
						//--invalid component: guess says player2 showed (player1 has weapon)
						mainPlayerGuess = new Guess(gameCards.personCards[2], gameCards.weaponCards[1], 
							gameCards.roomCards[0], player0.hand, player2.hand);

						//verify guess
						verifyGuessObject = ClueUtil.verifyValidGuess(mainPlayerGuess, allHands, solHand);
						//translate warnings (none in this case)
						warningStrings = ClueUtil.generateGuessWarnings(verifyGuessObject);
					});

					it("returning an array with 1 string", function(){
						expect(warningStrings.length).toBe(1);
					});
				});

				describe("all guess cards are known not to be in the showing players hand by", function() {
					//block variables
					let mainPlayerGuess;
					let verifyGuessObject;
					let warningStrings;

					beforeEach(function() {
						//main player guess- person[0], weapon[0], room[2]
						//--invalid component: guess says player1 showed (player1 doesn't have any of these cards)
						mainPlayerGuess = new Guess(gameCards.personCards[0], gameCards.weaponCards[0], 
							gameCards.roomCards[2], player0.hand, player1.hand);

						//verify guess
						verifyGuessObject = ClueUtil.verifyValidGuess(mainPlayerGuess, allHands, solHand);
						//translate warnings (none in this case)
						warningStrings = ClueUtil.generateGuessWarnings(verifyGuessObject);
					});

					it("returning an array with 3 strings", function(){
						expect(warningStrings.length).toBe(3);
					});
				});

				describe("the card shown during a main-player guess isn't possible by" ,function() {
					//block variables
					let mainPlayerGuess;
					let verifyGuessObject;
					let warningStrings;

					beforeEach(function() {
						//main player guess- person[0] (unknown), weapon[1] (player1), room[2] (player0)
						//--invalid component: guess says player1 showed room[2] (held by player2)
						mainPlayerGuess = new Guess(gameCards.personCards[0], gameCards.weaponCards[1], 
							gameCards.roomCards[2], player0.hand, player1.hand, gameCards.roomCards[2]);

						//verify guess
						verifyGuessObject = ClueUtil.verifyValidGuess(mainPlayerGuess, allHands, solHand);
						//translate warnings (none in this case)
						warningStrings = ClueUtil.generateGuessWarnings(verifyGuessObject);
					});

					it("returning an array with 1 string", function() {
						expect(warningStrings.length).toBe(1);
					});
				});

			});
		});

		//test support functions
		describe("method '_simulateGuess'", function(){
			//block variables
			let player0, player1, player2, allPlayers;
			let gameCards;

			beforeEach(function(){
				//3 players. Each has 3 cards: 1 person, 1 weapon, 1 room.
				//Player0 is the main player.
				//Index of the card type held in gameCards.(xxx)Cards is the same as the player number.
				gameCards = ClueUtil._generateTestCards(4,4,4);

				//generate players
				let player0cards = [gameCards.personCards[0],
									gameCards.weaponCards[0],
									gameCards.roomCards[0]];
				player0 = new Player("Player0", gameCards.allCards, true, false, player0cards);

				let player1cards = [gameCards.personCards[1],
									gameCards.weaponCards[1],
									gameCards.roomCards[1]];
				player1 = new Player("Player1", gameCards.allCards, false, false, player1cards);

				let player2cards = [gameCards.personCards[2],
									gameCards.weaponCards[2],
									gameCards.roomCards[2]];
				player2 = new Player("Player2", gameCards.allCards, false, false, player2cards);

				allPlayers = [player0, player1, player2];
			});

			it("assigns guess cards + hand correctly", function(){
				//simulate random guess. Showing logic does not matter for this test.
				let guessPlayer = player0;
				let personGuess = gameCards.personCards[2];
				let weaponGuess = gameCards.weaponCards[2];
				let roomGuess = gameCards.roomCards[2];

				let guessObj = ClueUtil._simulateGuess(guessPlayer, personGuess, weaponGuess,
													roomGuess, allPlayers);

				//.person, .weapon, .room should be set to guess cards
				expect(guessObj.person).toBe(personGuess);
				expect(guessObj.weapon).toBe(weaponGuess);
				expect(guessObj.room).toBe(roomGuess);
				expect(guessObj.guessHand).toBe(guessPlayer.hand);
			});

			describe("for a main player guess", function(){
				//block variables
				let guessPlayer;

				beforeEach(function(){
					guessPlayer = player0;
				});

				describe("when a different player can show a card", function(){
					//block variables
					let personGuess, weaponGuess, roomGuess, guessObj;

					beforeEach(function(){
						//weapon, room card is held by player2. Weapon card should be shown.
						personGuess = gameCards.personCards[0];
						weaponGuess = gameCards.weaponCards[2];
						roomGuess = gameCards.roomCards[2];
						//execute guess
						guessObj = ClueUtil._simulateGuess(guessPlayer, personGuess, 
											weaponGuess, roomGuess, allPlayers);
					});

					it("assigns the 'showHand' to the showing player's hand", function(){
						expect(guessObj.showHand).toBe(player2.hand);
					});

					it("assigns the 'showCard' to the shown card", function(){
						expect(guessObj.shownCard).toBe(weaponGuess);
					});
				});

				describe("when no other player can show a card", function(){
					//block variables
					let personGuess, weaponGuess, roomGuess, guessObj;

					beforeEach(function(){
						//person card held by guesser. Other two cards are in solution.
						personGuess = gameCards.personCards[0];
						weaponGuess = gameCards.weaponCards[3];
						roomGuess = gameCards.roomCards[3];
						//execute guess
						guessObj = ClueUtil._simulateGuess(guessPlayer, personGuess, 
											weaponGuess, roomGuess, allPlayers);
					});

					it("assigns the 'showHand' to null", function(){
						expect(guessObj.showHand).toBe(null);
					});

					it("assigns the 'shownCard' to null", function(){
						expect(guessObj.shownCard).toBe(null);
					});
				});
			});

			describe("for another player guess", function(){
				//block variables
				let guessPlayer;

				beforeEach(function(){
					guessPlayer = player2;
				});
				
				describe("when a different player can show a card", function(){
					//block variables
					let personGuess, weaponGuess, roomGuess, guessObj;

					beforeEach(function(){
						//weapon, room card is held by player1. Weapon card should be shown.
						personGuess = gameCards.personCards[2];
						weaponGuess = gameCards.weaponCards[1];
						roomGuess = gameCards.roomCards[1];
						//execute guess
						guessObj = ClueUtil._simulateGuess(guessPlayer, personGuess, 
											weaponGuess, roomGuess, allPlayers);
					});

					it("assigns the 'showHand' to the showing player's hand", function(){
						expect(guessObj.showHand).toBe(player1.hand);
					});

					it("assigns the 'shownCard' to null", function(){
						expect(guessObj.shownCard).toBe(null);
					});
				});

				describe("when no other player can show a card", function(){
					//block variables
					let personGuess, weaponGuess, roomGuess, guessObj;

					beforeEach(function(){
						//weapon held by guessing player. person, room in solution.
						personGuess = gameCards.personCards[3];
						weaponGuess = gameCards.weaponCards[2];
						roomGuess = gameCards.roomCards[3];
						//execute guess
						guessObj = ClueUtil._simulateGuess(guessPlayer, personGuess, 
											weaponGuess, roomGuess, allPlayers);
					});

					it("assigns the 'showHand' to null", function(){
						expect(guessObj.showHand).toBe(null);
					});

					it("assigns the 'shownCard' to null", function(){
						expect(guessObj.shownCard).toBe(null);
					});
				});
			});
		});
	});
});