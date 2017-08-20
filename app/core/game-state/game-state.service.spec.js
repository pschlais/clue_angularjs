'use strict';

// Service tests
describe('GameState service',function(){
	let GameState;

	//load module
	beforeEach(module('core.gameState'));

	//instantiate service prior to each test
	beforeEach(inject(function(_GameState_){
		GameState = _GameState_;
	}));
/*
	it('TEMP TEST: data.test should be a Card object with name "Test", type "CardType.ROOM"', function(){
		let testCard = GameState.data.test;
		expect(testCard.name).toBe('Test');
		expect(testCard.cardType).toBe(CardType.ROOM);
		expect(testCard.parentHand).toBe(null);
	})
*/
});

//--------- CLASS TESTS -----------------------
describe('Class', function(){

	describe('Card', function(){
		let name;
		let cardType;
		let parentHand;

		//constructor variables
		beforeEach(function() {
			name = 'CardTest';
			cardType = CardType.WEAPON;
			parentHand = {} // TODO: update when Hand() class created
		});

/*
		//test initialization
		it('initializes successfully with name, cardType parameters only', function(){
			let card = new Card(name, cardType);
			expect(card.name).toBe(name);
			expect(card.cardType).toBe(cardType);
			expect(card.parentHand).toBe(null);
		});

		it('initializes successfully with name, cardType, holder parameters', function(){
			let card = new Card(name, cardType, holder);
			expect(card.name).toBe(name);
			expect(card.cardType).toBe(cardType);
			expect(card.parentHand).toBe(parentHand);
		});
*/

	});

	describe('Hand', function() {
		//constructor variables (constructor(name, handSize, fullCardList, mainPlayer=false,
		//						             solution=false, knownCards=[], checklist=null))
		let name;
		let handSize;
		let fullCardList;
		let knownCards;
		let mainPlayer;
		let solution;

		beforeEach(function() {
			name = 'HandTest';
			handSize = 4;
			fullCardList = []; // PLACEHOLDER
			knownCards = [];
			mainPlayer = false;
			solution = false;
		});

		//non-trivial initialization tests
		it('initializes with a new checklist for no "checklist" input', function() {
			let hand = new Hand(name, handSize, fullCardList);
			expect(hand.checklist).toEqual(jasmine.any(Map));
		});
		// TODO: create tests for complete initialized checklist for no input
		it('throws a TypeError if the "checklist" input is not a Map() object', function() {
			let badInput = 5; //not a Map()
			expect(function(){new Hand(name, handSize, fullCardList, mainPlayer, 
				solution, knownCards, badInput)})
					.toThrowError(TypeError);
		});

		//TODO: make tests for complete & non-complete checklist inputs
		//it('does not throw an error if the "checklist" input provided is complete', function() {fail();});

		//TODO: make tests for knownCard input permutations
	});
});