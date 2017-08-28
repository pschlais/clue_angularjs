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

