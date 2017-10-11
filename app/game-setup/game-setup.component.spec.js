//Tests gameSetup component 
describe('component "gameSetup"', function() {

	beforeEach(module('gameSetup'));

	describe('controller', function(){
		//block variables
		let ctrl;

		beforeEach(function() {
			//inject controller
			inject(function($componentController){
				ctrl = $componentController('gameSetup');
			});
		});

		describe("initializes with", function(){
			
			it("3 empty cards for the main player", function() {
				expect(ctrl.mainPlayer.cards.length).toBe(3);
				expect(ctrl.mainPlayer.cards[0]).toBe("");
				expect(ctrl.mainPlayer.cards[1]).toBe("");
				expect(ctrl.mainPlayer.cards[2]).toBe("");
			});

			it("2 other players", function() {
				expect(ctrl.otherPlayers.length).toBe(2);
			})
		});

		/*
		describe("method 'updateCardCount'", function() {
			//block variables
			let n_card_input;

			beforeEach(function(){
				//add 2 default cards to ctrl.mainPlayer.cards
				ctrl.mainPlayer.cards = ['Card1', 'Card2'];
			});

			it("does nothing when the card count doesn't change", function(){
				n_card_input = ctrl.mainPlayer.cards.length;
				//call function
				ctrl.updateCardCount(n_card_input);
				expect(ctrl.mainPlayer.cards.length).toBe(n_card_input);
			});

			it("reduces the card count for a lower input", function(){
				n_card_input = ctrl.mainPlayer.cards.length-1;
				//call function
				ctrl.updateCardCount(n_card_input);
				expect(ctrl.mainPlayer.cards.length).toBe(n_card_input);
			});

			it("increases the card count for a higher input", function(){
				n_card_input = ctrl.mainPlayer.cards.length+4;
				//call function
				ctrl.updateCardCount(n_card_input);
				//last item in array should be empty string
				expect(ctrl.mainPlayer.cards.length).toBe(n_card_input);
			});

			it("appends empty strings ('') to the end for a higher input", function(){
				n_card_input = ctrl.mainPlayer.cards.length+4;
				//call function
				ctrl.updateCardCount(n_card_input);
				//last item in array should be empty string
				expect(ctrl.mainPlayer.cards[n_card_input-1]).toBe('');
			});
		});
		*/

		describe("method 'addCard'", function() {

			describe("adds an empty card when cards.length < max_cards by", function(){
				//block variables
				let prev_card_count;

				beforeEach(function(){
					ctrl.mainPlayer.cards = ["Card"]
					 prev_card_count = ctrl.mainPlayer.cards.length;
					ctrl.addCard();
				});
				
				it("increasing the card count by 1", function(){
					expect(ctrl.mainPlayer.cards.length).toBe(prev_card_count + 1);
				});

				it("appending an empty card ('') to the end of the list", function(){
					expect(ctrl.mainPlayer.cards[ctrl.mainPlayer.cards.length-1]).toBe("");
				});
				
			});

			it("does not add a card when cards.length = max_cards", function(){
				//fill cards to the max
				for (let i = 0; i < ctrl.maxCards; i++) {
					ctrl.mainPlayer.cards.push("Card" + i);
				}
				let prev_card_count = ctrl.mainPlayer.cards.length;
				//attempt to add card
				ctrl.addCard();
				//assert length has not changed
				expect(ctrl.mainPlayer.cards.length).toBe(prev_card_count);
			});
		});

		describe("method 'getCardCount'", function(){
			
			beforeEach(function(){
				//set up other players: 2 with 6 cards each
				ctrl.otherPlayers = [{name: "Player0", cardCount: 6},
				 					 {name: "Player1", cardCount: 6}];
			});

			it("correctly returns 18 total cards across hands", function(){
				//6 cards in hand (values not important)
				ctrl.mainPlayer.cards = ["","","","","",""];
				expect(ctrl.getCardCount()).toBe(18);
			});

			it("correctly returns 16 total cards across hands", function(){
				//4 cards in hand, game is short by 2 (value not important)
				ctrl.mainPlayer.cards = ["","","",""];
				expect(ctrl.getCardCount()).toBe(16);
			});
		});

		describe("method 'removeCard'", function(){

			beforeEach(function(){
				let num_cards = 4;
				//initialize hand with 4 cards
				for (let i = 0; i < num_cards; i++) {
					ctrl.mainPlayer.cards.push("Card" + i);
				}
			});

			it("removes the correct card at a given index from mainPlayer.cards", function(){
				let index = 2;
				let prev_card_at_index = ctrl.mainPlayer.cards[index];
				//remove card
				ctrl.removeCard(index);
				//test to make sure card is removed
				expect(ctrl.mainPlayer.cards[index]).not.toBe(prev_card_at_index);
			});
		});

		describe("method 'removePlayer'", function(){

			beforeEach(function(){
				let num_other_players = 4;
				//initialize hand with 4 cards
				for (let i = 0; i < num_other_players; i++) {
					ctrl.addOtherPlayer();
				}
			});

			it("removes the correct card at a given index from mainPlayer.cards", function(){
				let index = 2;
				let prev_player_at_index = ctrl.otherPlayers[index];
				//remove card
				ctrl.removePlayer(index);
				//test to make sure card is removed
				expect(ctrl.otherPlayers[index]).not.toBe(prev_player_at_index);
			});
		});

		describe("method 'addOtherPlayer'", function(){
			//block variables
			let oldPlayerCount;

			beforeEach(function(){
				oldPlayerCount = ctrl.otherPlayers.length;
			});

			it("increases the other player count by one", function(){
				ctrl.addOtherPlayer();
				expect(ctrl.otherPlayers.length).toBe(oldPlayerCount+1);
			});

			describe("adds an empty player object to the list containing", function(){

				beforeEach(function(){
					ctrl.addOtherPlayer();
				});

				it("'name' property equal to an empty string", function(){
					expect(ctrl.otherPlayers[ctrl.otherPlayers.length-1].name).toBe('');
				});

				it("'cardCount' property equal to minCards", function(){
					expect(ctrl.otherPlayers[ctrl.otherPlayers.length-1].cardCount).toBe(ctrl.minCards);
				});
			});

			it("does not add additional player after the count reaches 5", function(){
				//maximum of 6 players in Clue (1 main player, 5 others)
				while (ctrl.otherPlayers.length < 5) {
					ctrl.addOtherPlayer();
				}
				//add another player (attempt to make it 6 other players)
				ctrl.addOtherPlayer();
				//assert count has not increased past 5
				expect(ctrl.otherPlayers.length).toBe(5);
			});
		});

		describe("method 'validateCardsFilled'", function(){

			it("returns true for no empty card inputs", function(){
				ctrl.mainPlayer.cards = ["Card1", "Card2", "Card3"];
				let val = ctrl.validateCardsFilled();
				expect(val).toBe(true);
			});

			it("returns false for one empty card input", function(){
				ctrl.mainPlayer.cards = ["Card1", "", "Card3"];
				let val = ctrl.validateCardsFilled();
				expect(val).toBe(false);
			});

			it("returns flase for multiple empty card input", function(){
				ctrl.mainPlayer.cards = ["Card1", "", ""];
				let val = ctrl.validateCardsFilled();
				expect(val).toBe(false);
			});
		});

		describe("method 'validatePlayersFilled'", function(){

			it("returns true for no empty card inputs", function(){
				ctrl.otherPlayers = [{name: "Player0", cardCount: 3},
									 {name: "Player1", cardCount: 3},
									 {name: "Player2", cardCount: 3}];
				let val = ctrl.validatePlayersFilled();
				expect(val).toBe(true);
			});

			it("returns false for one empty card input", function(){
				ctrl.otherPlayers = [{name: "Player0", cardCount: 3},
									 {name: "", cardCount: 3},
									 {name: "Player2", cardCount: 3}];
				let val = ctrl.validatePlayersFilled();
				expect(val).toBe(false);
			});

			it("returns flase for multiple empty card input", function(){
				ctrl.otherPlayers = [{name: "Player0", cardCount: 3},
									 {name: "", cardCount: 3},
									 {name: "", cardCount: 3}];
				let val = ctrl.validatePlayersFilled();
				expect(val).toBe(false);
			});
		});

		describe("method 'validateCardCount'", function(){
			
			beforeEach(function(){
				//set up other players: 2 with 6 cards each
				ctrl.otherPlayers = [{name: "Player0", cardCount: 6},
				 					 {name: "Player1", cardCount: 6}];
			});

			it("returns true for 18 total cards across hands", function(){
				//6 cards in hand (values not important)
				ctrl.mainPlayer.cards = ["","","","","",""];
				expect(ctrl.validateCardCount()).toBe(true);
			});

			it("returns false for <18 total cards across hands", function(){
				//4 cards in hand, game is short by 2 (value not important)
				ctrl.mainPlayer.cards = ["","","",""];
				expect(ctrl.validateCardCount()).toBe(false);
			});
		});

		describe("method 'validateCardsUnique'", function(){

			it("returns true for no repeat cards", function(){
				ctrl.mainPlayer.cards = ["Card1", "Card2", "Card3"];
				let val = ctrl.validateCardsUnique();
				expect(val).toBe(true);
			});

			it("returns false for repeat cards", function(){
				ctrl.mainPlayer.cards = ["Card1", "Card3", "Card3"];
				let val = ctrl.validateCardsUnique();
				expect(val).toBe(false);
			});
		});

		describe("method 'validatePlayersUnique'", function(){

			it("returns true for no repeat cards", function(){
				ctrl.otherPlayers = [{name: "Player0", cardCount: 3},
									 {name: "Player1", cardCount: 3},
									 {name: "Player2", cardCount: 3}];
				let val = ctrl.validatePlayersUnique();
				expect(val).toBe(true);
			});

			it("returns false for repeat cards", function(){
				ctrl.otherPlayers = [{name: "Player0", cardCount: 3},
									 {name: "Player2", cardCount: 3},
									 {name: "Player2", cardCount: 3}];
				let val = ctrl.validatePlayersUnique();
				expect(val).toBe(false);
			});
		});

	});
});