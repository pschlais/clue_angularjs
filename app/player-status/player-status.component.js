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

				self.solutionDisplay = function(cardType){
					//returns the string to display for the solution person.
					//INPUTS:
					//	-cardType: "person", "reapon", "room" only valid inputs
					switch (cardType) {
						case "person":
							if (self.solution.isPersonKnown()) {
								return self.solution.person.name;
							} else {
								return "Unknown";
							}
							break;

						case "weapon":
							if (self.solution.isWeaponKnown()) {
								return self.solution.weapon.name;
							} else {
								return "Unknown";
							}
							break;

						case "room":
							if (self.solution.isRoomKnown()) {
								return self.solution.room.name;
							} else {
								return "Unknown";
							}
							break;

						default:
							return "Unknown input: '" + cardType + "'";
							break;
					}
					
				}

			}
		]
	});