'use strict';

angular.module('playerStatus')
	.component('playerStatus', {
		templateUrl: 'player-status/player-status.template.html',
		controller: ['gameState', 
			function playerStatusController(gameState) {
				var self = this;

				//references to service objects
				self.hands = gameState.data.hands;
				self.solution = gameState.data.solution;
				self.cards = gameState.data.cards;


				//methods
				self.translateCardStatus = function(cardHeld){
					//translates integer to English string based
					//on CardHeld enum in clue-classes.js
					if (cardHeld === CardHeld.YES) {
						return "Yes";
					} else if (cardHeld === CardHeld.NO) {
						return "No";
					} else if (cardHeld === CardHeld.UNKNOWN) {
						return "Unknown";
					} else {
						return "ERROR: input of " + cardHeld;
					}
				};

			}
		]
	});