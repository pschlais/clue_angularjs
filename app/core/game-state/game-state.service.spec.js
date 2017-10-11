'use strict';

// Service tests
describe('gameState service',function(){
	let gameState;

	//load module
	beforeEach(module('core.gameState'));

	//instantiate service prior to each test
	beforeEach(function(){
		inject(function($injector){
			gameState = $injector.get('gameState');
		});
	});

	/*
	it('TEMP TEST: data.test should be a Card object with name "Test", type "CardType.ROOM"', function(){
		let testCard = gameState.data.cards[0];
		expect(testCard.name).toBe('Test');
		expect(testCard.cardType).toBe(CardType.ROOM);
		expect(testCard.parentHand).toBe(null);
	});
	*/
});

