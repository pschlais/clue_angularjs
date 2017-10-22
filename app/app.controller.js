'use strict';

angular.module('clueApp')
	.controller('ClueAppController', ['$scope', 'gameState',
		function ClueAppController($scope, gameState) {
			$scope.flags = gameState.flags;

			$scope.gameInitialized = function() {
				return $scope.flags.gameInitialized;
			}
		}
	]);