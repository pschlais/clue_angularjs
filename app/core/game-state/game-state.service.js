'use strict';
//clue-classes.js must be loaded before this

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
