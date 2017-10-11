'use strict';
//clue-classes.js must be loaded before this

angular.
	module('core.gameState').
		factory('gameState', [ //put DI's here if applicable
			function(){

				let allCardNames = ClueUtil.allCardNames();
				let cards = [new Card('Test', CardType.ROOM)]

				return {
					data: {
						cardNameList: allCardNames,
					},
					//service functions here
					/*
					changeFirstCard: function() {
							this.data.cards[0].name = this.data.cards[0].name + "a";
						}
					*/
				}; //return object
		}]);
