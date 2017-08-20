'use strict';

angular.module('cardList')
	.component('cardList', {
		templateUrl: 'card-list/card-list.template.html',
		controller: ['GameState', 
			function CardListController(GameState) {
				var self = this;

				self.data = GameState.data;
				self.changeName = function() {
					GameState.changeFirstCard();
				};
			}
		]
	});