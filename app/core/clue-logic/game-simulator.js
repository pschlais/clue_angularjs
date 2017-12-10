const GameState = {
	SUCCESS: 0,
	MAX_TURNS_REACHED: 1,
	SOLUTION_PERSON_WRONG: 2,
	SOLUTION_WEAPON_WRONG: 3,
	SOLUTION_ROOM_WRONG: 4,
};

const MAX_GUESSES = 500;
const N_PLAYERS = 5;

/* ---------- UTILITY FUNCTIONS --------------- */

function shuffle(array) {
	let currentIndex = array.length;
	let tempVal;
	let randomIndex;

	//While there remain elements to shuffle...
	while (0 !== currentIndex) {
		//Pick a remaining element
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		//Swap it with the current element
		tempVal = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = tempVal;
	}

	return array;
}

/* ---------- SIMULATION FUNCTIONS ------------- */

let simulateGame = function() {
	/* Simulates a full game of Clue based on the number of players provided.
		Includes setup and game execution.
		Returns the state of a game in an object.

		INPUTS: 
			n_players: int
			max_guesses: int

		OUTPUT:
			{
				result: GameState
				n_guesses: int
				data: {
					players: [Player()]
					solution: Player()
					cards: [Card()]
					guesses: [Guess()]
					}
			}
	*/

	/* ---------------- GAME SETUP ------------------- */

	//initialize output object
	let returnObj = {};

	//generate cards
	let gameCards = ClueUtil.generateAllClueCards();

	//shuffle cards
	shuffle(gameCards);

	//select the solution cards (first of type encountered in shuffled list)
	let personSol, weaponSol, roomSol;
	[CardType.PERSON, CardType.WEAPON, CardType.ROOM].forEach(function(ctype) {
		for(let i = 0; i < gameCards.length; i++) {
			if (gameCards[i].cardType === ctype) {
				//found the first card of the given type. Record it and break loop.
				if (ctype === CardType.PERSON) {
					personSol = gameCards[i];
					break;
				} else if (ctype === CardType.WEAPON) {
					weaponSol = gameCards[i];
					break;
				} else if (ctype === CardType.ROOM) {
					roomSol = gameCards[i];
					break;
				}
			}
		}
	});

	let solutionCards = [personSol, weaponSol, roomSol];

	//allocate the remaining cards to the players
	let playerCards = [];
	for (let i = 0; i < N_PLAYERS; i++) {
		//initialize empty array for each player's allocated cards
		playerCards.push([]);
	}

	let i_card = 0; //dealt card counter
	for (let i = 0; i < gameCards.length; i++){
		//Deal the cards until all are gone: ex. if 3 players --> 1,2,3,1,2,3,...
		//get current card
		let currentCard = gameCards[i];
		//if current card not part of the solution, give it to a player. Else skip.
		if (solutionCards.indexOf(currentCard) === -1) {
			playerCards[i_card % N_PLAYERS].push(currentCard);
			//increment dealt card counter
			i_card++;
		}
	}

	//generate players
	players = [];
	for (let i = 0; i < N_PLAYERS; i++) {
		if (i === 0) {
			//main player
			players.push(new Player("MP", gameCards, true, false, playerCards[i]));
		} else {
			//other players
			players.push(new Player("" + i, gameCards, false, false, playerCards[i]));
		}
	}

	//generate solution
	playerSol = new Player("Solution", gameCards, false, true, solutionCards);
	
	//store hands of players
	let allHands = [];
	for (let i = 0; i < players.length; i++) {
		allHands.push(players[i].hand);
	}
	solHand = playerSol.hand;

	//container for guesses
	let guesses = [];
	
	/* ------- START SIMULATION ----------------------- */

	//apply main player known cards to other players
	ClueUtil.newKnownCardUpdate(allHands, solHand, playerCards[0]);

	//loop through random guesses
	for (let i = 0; i < MAX_GUESSES; i++) {
		//make a random guess
		let r_guess = ClueUtil._generateRandomGuess(players, gameCards);
		
		//apply guess
		ClueUtil.applyGuessToHands(r_guess, allHands, solHand);

		//process all guesses
		guesses.push(r_guess);
		ClueUtil.processGuesses(allHands, solHand, guesses, gameCards);

		//check if solution has been found
		if (solHand.isFullSolutionKnown()) {
			//save game state data for return object
			returnObj.n_guesses = guesses.length;
			returnObj.data = {};
			returnObj.data.players = players;
			returnObj.data.solution = playerSol;
			returnObj.data.guesses = guesses;
			returnObj.data.cards = gameCards;

			//check if person solution is correct
			if (!playerSol.hasCard(solHand.person)) {
				returnObj.result = GameState.SOLUTION_PERSON_WRONG;
			} else if (!playerSol.hasCard(solHand.weapon)) {
				returnObj.result = GameState.SOLUTION_WEAPON_WRONG;
			} else if (!playerSol.hasCard(solHand.room)) {
				returnObj.result = GameState.SOLUTION_ROOM_WRONG;
			} else { //all are correct
				returnObj.result = GameState.SUCCESS;
			}

			//return object
			return returnObj;
		}

	} //end random guess loop

	//if this part of the program is reached, no solution has been found. Return current state.
	returnObj.n_guesses = guesses.length;
	returnObj.data = {};
	returnObj.data.players = players;
	returnObj.data.solution = playerSol;
	returnObj.data.guesses = guesses;
	returnObj.data.cards = gameCards;
	returnObj.result = GameState.MAX_TURNS_REACHED;

	return returnObj;
};

let generateRandomGameReport = function(n_games) {
	/* Runs simulateGame() n_games times. Prints summary results to the screen
		and returns all games that weren't successful as an array.
	*/

	//set up state counter map
	let stateCounter = new Map();
	for (let propName in GameState) {
		stateCounter.set(GameState[propName], 0);
	}
	//initialize failed game array
	let failedGames = [];

	//simulate games
	for (let i = 0; i < n_games; i++) {
		//simulate game
		let currentGameData = simulateGame();
		let result = currentGameData.result;
		//process results - increment counter and save game data if failed
		stateCounter.set(result, stateCounter.get(result) + 1);
		if (result !== GameState.SUCCESS) {
			//save failed game data
			failedGames.push(currentGameData);
		}
	} //end simulation loop

	//print results
	console.log('---- SIMULATION RESULTS FOR ' + n_games + ' GAMES: -----------');
	console.log();
	for (let propName in GameState) {
		console.log(propName + ':  ' + stateCounter.get(GameState[propName]));
	}

	//return failed game data
	return failedGames;
}