'use strict';

angular.module('cardList')
	.component('cardList', {
		templateUrl: 'card-list/card-list.template.html',
		controller: ['gameState', 
			function cardListController(gameState) {
				var self = this;

				self.data = gameState.data;
				self.changeName = function() {
					gameState.changeFirstCard();
				};
			}
		]
	});