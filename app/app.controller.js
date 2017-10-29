'use strict';

angular.module('clueApp')
	.controller('ClueAppController', ['$scope', 'gameState',
		function ClueAppController($scope, gameState) {
			$scope.flags = gameState.flags;
			$scope.page = {
				ADDGUESS: 0,
				GUESSES: 1,
				HANDS: 2,
				MATRIX: 3
			};
			//
			$scope.currentPage = 0;

			$scope.gameInitialized = function() {
				return $scope.flags.gameInitialized;
			}

			$scope.changePage = function(pageFlag) {
				//updates scope.currentPage to new page
				$scope.currentPage = pageFlag;
			}
		}
	]);