import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';
import GenericDag from '../../common/GenericDag';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const RedisSortedSet = require('redis-sorted-set');

class Day23Solver extends Solver {
	private input: Array<string> = [];
	private dag: GenericDag<string> = new GenericDag<string>();
	private initialValues: {[node: string]: string} = {};
	private solvedValues: {[node: string]: string} = {};
	private energyPerStep: Map<string, number> = new Map();

	// Part 2 wouldn't work if I had each room split into 4 spots, so try again with 1 room that has a string representing all spots
	private numSpotsPerRoom = 2;
	private useMultiSpotRooms = true;

	public init(inputFile: string): void {
		this.input = InputParser.readLines(inputFile);

		this.dag = new GenericDag<string>();

		/*
		#############
		#...........# <- H1/2/x/3/x/4/x/5x/6/7
		###B#C#B#D### <- RA1 RB1 RC1 RD1
		  #A#D#C#A#   <- RA2 RB2 RC2 RD2
		  #########

		Valid moves are room to hallway (top dots) excluding those directly outside a room, and vice versa. The
		arrangement of amphipods restricts some of these rules e.g.
		- can't move into a spot that's already taken
		- can't move into a room that isn't the right letter
		- can't move into the first spot in a room if the second spot is not taken
		- etc

		Arranging as a graph with the valid hallway spots and room spots, and the cost in squares between these spots.
		*/

		this.energyPerStep.set('A', 1);
		this.energyPerStep.set('B', 10);
		this.energyPerStep.set('C', 100);
		this.energyPerStep.set('D', 1000);
	}

	protected solvePart1(): string {
		this.numSpotsPerRoom = 2;

		if (!this.useMultiSpotRooms) {
			// works fine but checking if it's faster with multi-spot rooms
			// sample solution = 470 sec, ~357k attempts
			// full solution = 490 sec, ~400k attempts (solution=15516)
			this.addRoomLinks('A', 2);
			this.addRoomLinks('B', 2);
			this.addRoomLinks('C', 2);
			this.addRoomLinks('D', 2);

			// input is trimmed, so front part of room index will be different to back part of room index
			this.initialValues = {
				'RA1': this.input[2].charAt(3),
				'RA2': this.input[3].charAt(1),
				'RB1': this.input[2].charAt(5),
				'RB2': this.input[3].charAt(3),
				'RC1': this.input[2].charAt(7),
				'RC2': this.input[3].charAt(5),
				'RD1': this.input[2].charAt(9),
				'RD2': this.input[3].charAt(7),
			};

			this.solvedValues = {
				'RA1': 'A',
				'RA2': 'A',
				'RB1': 'B',
				'RB2': 'B',
				'RC1': 'C',
				'RC2': 'C',
				'RD1': 'D',
				'RD2': 'D',
			};

			this.sampleLog(this.dag.toString());

			// let result = this.recursivelyOrganise(this.initialValues, 0, new Set(), Number.MAX_SAFE_INTEGER);
			const result = this.organiseDijkstra();
			return `${result}`;
		} else {
			// sample solution = 14 sec, ~18k attempts
			// full solution = 6 sec, ~85k attempts (solution=15516)

			this.addRoomLinks('A', 1);
			this.addRoomLinks('B', 1);
			this.addRoomLinks('C', 1);
			this.addRoomLinks('D', 1);

			// input is trimmed, so front part of room index will be different to back part of room index
			this.initialValues = {
				'RA1': `${this.input[2].charAt(3)}${this.input[3].charAt(1)}`,
				'RB1': `${this.input[2].charAt(5)}${this.input[3].charAt(3)}`,
				'RC1': `${this.input[2].charAt(7)}${this.input[3].charAt(5)}`,
				'RD1': `${this.input[2].charAt(9)}${this.input[3].charAt(7)}`,
			};

			this.solvedValues = {
				'RA1': 'AA',
				'RB1': 'BB',
				'RC1': 'CC',
				'RD1': 'DD',
			};

			this.sampleLog(this.dag.toString());

			const result = this.organiseDijkstra();
			return `${result}`;
		}
	}

	protected solvePart2(): string {
		this.numSpotsPerRoom = 4;

		if (!this.useMultiSpotRooms) {
			// Doesn't work
			this.addRoomLinks('A', 4);
			this.addRoomLinks('B', 4);
			this.addRoomLinks('C', 4);
			this.addRoomLinks('D', 4);

			// input is trimmed, so front part of room index will be different to back part of room index
			this.initialValues = {
				'RA1': this.input[2].charAt(3),
				'RA2': 'D',
				'RA3': 'D',
				'RA4': this.input[3].charAt(1),
				'RB1': this.input[2].charAt(5),
				'RB2': 'C',
				'RB3': 'B',
				'RB4': this.input[3].charAt(3),
				'RC1': this.input[2].charAt(7),
				'RC2': 'B',
				'RC3': 'A',
				'RC4': this.input[3].charAt(5),
				'RD1': this.input[2].charAt(9),
				'RD2': 'A',
				'RD3': 'C',
				'RD4': this.input[3].charAt(7),
			};

			this.solvedValues = {
				'RA1': 'A',
				'RA2': 'A',
				'RA3': 'A',
				'RA4': 'A',
				'RB1': 'B',
				'RB2': 'B',
				'RB3': 'B',
				'RB4': 'B',
				'RC1': 'C',
				'RC2': 'C',
				'RC3': 'C',
				'RC4': 'C',
				'RD1': 'D',
				'RD2': 'D',
				'RD3': 'D',
				'RD4': 'D',
			};

			this.sampleLog(this.dag.toString());

			const result = this.organiseDijkstra();
			return `${result}`;
		} else {
			this.addRoomLinks('A', 1);
			this.addRoomLinks('B', 1);
			this.addRoomLinks('C', 1);
			this.addRoomLinks('D', 1);

			// input is trimmed, so front part of room index will be different to back part of room index
			this.initialValues = {
				'RA1': `${this.input[2].charAt(3)}DD${this.input[3].charAt(1)}`,
				'RB1': `${this.input[2].charAt(5)}CB${this.input[3].charAt(3)}`,
				'RC1': `${this.input[2].charAt(7)}BA${this.input[3].charAt(5)}`,
				'RD1': `${this.input[2].charAt(9)}AC${this.input[3].charAt(7)}`,
			};

			this.solvedValues = {
				'RA1': 'AAAA',
				'RB1': 'BBBB',
				'RC1': 'CCCC',
				'RD1': 'DDDD',
			};

			this.sampleLog(this.dag.toString());

			const result = this.organiseDijkstra();
			return `${result}`;
		}
	}

	private addRoomLinks(amphipod: string, numSpots: number): void {
		const distanceFromHallwayToOutsideRoom: {[key: string]: {[key: number]: number}} = {
			'A': { 1: 2, 2: 1, 3: 1, 4: 3, 5: 5, 6: 7, 7: 8 },
			'B': { 1: 4, 2: 3, 3: 1, 4: 1, 5: 3, 6: 5, 7: 6 },
			'C': { 1: 6, 2: 5, 3: 3, 4: 1, 5: 1, 6: 3, 7: 4 },
			'D': { 1: 8, 2: 7, 3: 5, 4: 3, 5: 1, 6: 1, 7: 2 },
		};

		for (let curSpot = 1; curSpot <= numSpots; curSpot++) {
			for (let curHallway = 1; curHallway <= 7; curHallway++) {
				if (!distanceFromHallwayToOutsideRoom[amphipod] || !distanceFromHallwayToOutsideRoom[amphipod][curHallway]) {
					throw 'invalid distance';
				}
				const cost = distanceFromHallwayToOutsideRoom[amphipod][curHallway] + curSpot;
				this.dag.addLink(`H${curHallway}`, `R${amphipod}${curSpot}`, true, cost);
			}
		}
	}

	private organiseDijkstra(): number {
		// Use a form of Dijkstra's algorithm to find the minimum cost to organise the amphipods

		// Use JSON version of map of nodes to the contained amphipod as the configuration key (keys are always sorted)
		const initialConfiguration = this.configurationToString(this.initialValues);
		const targetConfiguration = this.configurationToString(this.solvedValues);

		// Distances are the minimum cost to get to a specific configuration of amphipods
		const distances: Map<string, number> = new Map();
		distances.set(initialConfiguration, 0);

		// Unvisited set is the set of configurations that we have seen so far
		// eslint-disable-next-line
		const unvisitedSet: any = new RedisSortedSet();
		unvisitedSet.add(initialConfiguration, 0);

		const visitedSet: Set<string> = new Set();

		let currentStr = this.configurationToString(this.initialValues);

		// set progress to some large number just so we can see how quickly it is considering options
		this.initProgress(1000000);
		let currentAttempt = 0;

		for (;;) {
			if (currentAttempt % 1000 === 0) {
				this.sampleLog(`Attempt #${currentAttempt}`);
			}

			const currentCost = distances.get(currentStr);
			if (currentCost === undefined) {
				throw 'invalid configuration';
			}

			// If the current configuration is the target, we've found the minimum cost so we're done
			if (currentStr === targetConfiguration) {
				this.stopProgress();
				return currentCost;
			}


			const moveConfig3 = this.configurationToString({
				'RA1': 'BA',
				'RB1': 'D',
				'RC1': 'C',
				'RD1': 'DA',
				'H3': 'B',
				'H4': 'C',
			});
			if (currentStr === moveConfig3) {
				this.sampleLog('temp debug');
			}

			const current = this.stringToConfiguration(currentStr);
			const possibleMoves = this.calculatePossibleMoves(current);

			// From the current configuration, go through all valid moves for all amphipods
			for (const nodeKey of Object.keys(current)) {
				const nodeVal: string = current[nodeKey].charAt(0);
				const node = this.dag.getNode(nodeKey);
				const moves = possibleMoves.get(nodeKey);
				if (!node || !moves) {
					continue;
				}

				moves.forEach((moveCost, targetKey) => {
					this.debugMove(nodeVal, nodeKey, targetKey, current, moveCost);

					if (moveCost !== null) {
						// For each valid move, check to see if it's the best way to get to that configuration
						const costAfterMove = currentCost + moveCost;

						const newConfigString = this.makeMove(currentStr, nodeVal, nodeKey, targetKey);

						if (!visitedSet.has(newConfigString)) {
							const existingCost = distances.get(newConfigString);

							// If it is, update the cost and add to unvisited set if it's a new configuration
							if (existingCost === undefined || costAfterMove < existingCost) {
								distances.set(newConfigString, costAfterMove);
								unvisitedSet.add(newConfigString, costAfterMove);
							}
						}
					}
				});
			}

			// We've exhausted all options from the current configuration, so remove from unvisited set and find the
			// cheapest configuration out of the unvisited set
			unvisitedSet.rem(currentStr);
			visitedSet.add(currentStr);
			distances.delete(currentStr);
			currentStr = unvisitedSet.range(0, 0)[0];
			if (!currentStr) {
				throw 'invalid unvisited';
			}
			this.incrementProgress();
			currentAttempt++;
		}
	}

	private calculatePossibleMoves(values: {[node: string]: string}): Map<string, Map<string, number>> {
		const moves: Map<string, Map<string, number>> = new Map();

		// From the starting configuration, find all valid moves for the location of all amphipods
		for (const nodeKey of Object.keys(values)) {
			const spotMoves: Map<string, number> = new Map();

			const nodeVal: string = values[nodeKey].charAt(0);
			const node = this.dag.getNode(nodeKey);
			if (!node) {
				continue;
			}

			let hasMoves = false;
			for (const targetKey of node.forwardLinks.keys()) {
				const moveLink = node.forwardLinks.get(targetKey);
				if (!moveLink) {
					throw 'invalid link';
				}

				const moveCost = this.moveCost(nodeVal, nodeKey, targetKey, values, moveLink.cost);
				if (moveCost !== null) {
					spotMoves.set(targetKey, moveCost);
					hasMoves = true;
				}
			}

			if (hasMoves) {
				moves.set(nodeKey, spotMoves);
			}
		}

		return moves;
	}

	private makeMove(currentValuesStr: string, amphipod: string, fromNodeKey: string, toNodeKey: string): string {
		const newConfiguration = this.stringToConfiguration(currentValuesStr);

		if (!this.useMultiSpotRooms) {
			delete newConfiguration[fromNodeKey];
			newConfiguration[toNodeKey] = amphipod;
		} else {
			if (fromNodeKey.charAt(0) === 'R') {
				newConfiguration[fromNodeKey] = newConfiguration[fromNodeKey].substring(1);
			} else {
				delete newConfiguration[fromNodeKey];
			}

			if (toNodeKey.charAt(0) === 'R') {
				newConfiguration[toNodeKey] = `${amphipod}${newConfiguration[toNodeKey]}`;
			} else {
				newConfiguration[toNodeKey] = amphipod;
			}
		}

		return this.configurationToString(newConfiguration);
	}

	/* Didn't work (maybe just because the JSON conversion wasn't sorting by key?)
	// Recursively try each valid move and keep track of the cost of the path
	private recursivelyOrganise(values: {[node: string]: string}, startingCost: number, valuesSoFar: Set<string>, currentMinCost: number): number {
		if (valuesSoFar.size > 100) {
			this.sampleLog('Lots of steps');
		}

		if (this.areValuesOrganised(values)) {
			return startingCost;
		}

		let minCost = Number.MAX_SAFE_INTEGER;

		// Go through each current amphipod location
		for (const nodeKey of Object.keys(values)) {
			const nodeVal: string = values[nodeKey];
			const node = this.dag.getNode(nodeKey);
			if (node) {
				// Go through link from the amphipod's location
				for (const targetKey of node.forwardLinks.keys()) {
					const moveLink = node.forwardLinks.get(targetKey);
					if (!moveLink) {
						throw 'invalid link';
					}

					// Check the cost of the move, and if it's legal (not infinite), make the move and continue
					const moveCost = this.moveCost(nodeVal, nodeKey, targetKey, values, moveLink.cost);
					if (moveCost !== null) {
						const currentCost = startingCost + moveCost;
						if (currentCost < currentMinCost) {
							const newValues = JSON.parse(JSON.stringify(values));
							delete newValues[nodeKey];
							newValues[targetKey] = nodeVal;
							const valuesString = JSON.stringify(newValues);
							if (!valuesSoFar.has(valuesString)) {
								valuesSoFar.add(valuesString);
								const newCost = this.recursivelyOrganise(newValues, currentCost, valuesSoFar, minCost)
								valuesSoFar.delete(valuesString);

								// If that is less than the minimum, it becomes the new minimum
								minCost = Math.min(minCost, newCost);
							}
						}
					}
				}
			}
		}

		return minCost;
	}

	private areValuesOrganised(values: {[node: string]: string}): boolean {
		return values['RA1'] === 'A' && values['RA2'] === 'A' &&
			values['RB1'] === 'B' && values['RB2'] === 'B' &&
			values['RC1'] === 'C' && values['RC2'] === 'C' &&
			values['RD1'] === 'D' && values['RD2'] === 'D';
	}
	*/

	private moveCost(amphipod: string, fromNodeKey: string, toNodeKey: string, values: {[node: string]: string}, numSteps: number): number | null {
		const fromNodeType = fromNodeKey.charAt(0);
		const toNodeType = toNodeKey.charAt(0);

		// Can never move from hallway to hallway or from room to room
		if (fromNodeType === toNodeType) {
			return null;
		}

		const toNodeVal = values[toNodeKey];
		// Can never move into a spot that is already taken
		if (!this.useMultiSpotRooms) {
			if (toNodeVal) {
				return null;
			}
		} else {
			if (toNodeType === 'H') {
				if (toNodeVal) {
					return null;
				}
			} else {
				if (toNodeVal && toNodeVal.length >= 4) {
					return null;
				}
			}
		}

		// When moving from room to hallway
		if (fromNodeType === 'R') {
			// Can't move through any other amphipods
			if (!this.isPathClear(fromNodeKey, toNodeKey, values)) {
				return null;
			}

			// Can't move if already in the correct room and not blocking any other amphipods
			const inCorrectRoom = fromNodeKey.charAt(1) === amphipod;
			if (inCorrectRoom && !this.isBlockingOtherAmphipod(amphipod, fromNodeKey, values)) {
				return null;
			}
		}
		// When moving from hallway to room
		else {
			// Must move into the correct room
			if (toNodeKey.charAt(1) !== amphipod) {
				return null;
			}

			// Can't move through any other amphipods
			if (!this.isPathClear(fromNodeKey, toNodeKey, values)) {
				return null;
			}

			if (!this.useMultiSpotRooms) {
				// Must move into the furthest spot in the room
				if (toNodeKey.charAt(2) === '1' && !values[`R${amphipod}2`]) {
					return null;
				}
			}

			// Can't move into room if the wrong amphipod is already in the room
			if (!this.useMultiSpotRooms) {
				if (toNodeKey.charAt(2) === '1' && !!values[`R${amphipod}2`] && values[`R${amphipod}2`] !== amphipod) {
					return null;
				}
			} else {
				if (this.roomContainsOtherAmphipod(amphipod, toNodeVal)) {
					return null;
				}
			}
		}

		let extraSteps = 0;
		if (this.useMultiSpotRooms) {
			// Need to calculate extra steps required to move into or out of correct spot in room
			const movingIn = fromNodeKey.charAt(0) === 'H';
			const roomKey = movingIn ? toNodeKey : fromNodeKey;
			const numSpotsTaken = (values[roomKey] || '').length;
			if (movingIn) {
				// Moving in - no extra steps if it's already full except for 1 spot
				extraSteps = this.numSpotsPerRoom - numSpotsTaken - 1;
			} else {
				// Moving out - one extra step for each free spot
				extraSteps = this.numSpotsPerRoom - numSpotsTaken;
			}
		}

		// It's a valid move - cost is dependent on the length of the link and the colour of the amphipod
		const energyPerStep = this.energyPerStep.get(amphipod);
		if (!energyPerStep) {
			return null;
		} else {
			return (numSteps + extraSteps) * energyPerStep;
		}
	}

	private isBlockingOtherAmphipod(amphipod: string, curNodeKey: string, values: { [key: string]: string }): boolean {
		if (curNodeKey.charAt(0) !== 'R' || curNodeKey.charAt(1) !== amphipod) {
			throw 'invalid argument';
		}

		// An amphipod is allowed to move from a room to a hallway only if there is an amphipod of the wrong type
		// "behind" it in the room (so it's getting out of the way for that one to move)

		// works for a maximum of 4 spots
		if (!this.useMultiSpotRooms) {
			const curSpot = parseInt(curNodeKey.charAt(2));

			for (let spotToCheck = curSpot + 1; spotToCheck <= 4; spotToCheck++) {
				const key = `R${amphipod}${spotToCheck}`;
				if (values[key] !== amphipod) {
					return true;
				}
			}
			return false;
		} else {
			// we can assume that the amphipod we're moving is at the front of the room, otherwise we wouldn't be
			// checking this move. So we can just check to see if there are any amphiods other than the correct type in
			// this room.
			const roomContents = values[`R${amphipod}1`];
			return this.roomContainsOtherAmphipod(amphipod, roomContents);
		}
	}

	private roomContainsOtherAmphipod(targetAmphipod: string, roomContents: string): boolean {
		// could be sped up/precomputed/regex'd
		return roomContents.split('').some(ch => ch !== targetAmphipod);
	}

	private isPathClear(fromNodeKey: string, toNodeKey: string, values: {[node: string]: string}): boolean {
		if (!this.isPathThroughRoomIsClear(toNodeKey, values)) {
			return false;
		}

		if (!this.isPathThroughHallwayClear(fromNodeKey, toNodeKey, values)) {
			return false;
		}

		return true;
	}

	private isPathThroughRoomIsClear(toNodeKey: string, values: {[node: string]: string}): boolean {
		if (toNodeKey.charAt(0) !== 'R') {
			return true;
		}

		if (this.useMultiSpotRooms) {
			return true;
		}

		const targetSpot = parseInt(toNodeKey.charAt(2));
		if (isNaN(targetSpot)) {
			throw 'invalid arguments';
		}

		const amphipod = toNodeKey.charAt(1);

		for (let curSpot = 1; curSpot < targetSpot; curSpot++) {
			if (values[`R${amphipod}${curSpot}`]) {
				return false;
			}
		}

		return true;
	}

	private isPathThroughHallwayClear(fromNodeKey: string, toNodeKey: string, values: {[node: string]: string}): boolean {
		// Hallway spaces between the two nodes must be clear (assume from hallway to room or vice-versa otherwise it's
		// an invalid move)
		const hallwayNum = fromNodeKey.charAt(0) === 'H' ? fromNodeKey.charAt(1) : toNodeKey.charAt(1);
		const roomCode = fromNodeKey.charAt(0) === 'R' ? fromNodeKey.charAt(1) : toNodeKey.charAt(1);
		// this could be done a lot better
		/*
		H1 - H2 - H3 - H4 - H5 - H6 - H7
		       \ /  \ /  \ /  \ /
		        RA   RB   RC   RD
		*/
		switch (hallwayNum) {
		case '1': {
			switch (roomCode) {
			case 'A': return !values['H2'];
			case 'B': return !values['H2'] && !values['H3'];
			case 'C': return !values['H2'] && !values['H3'] && !values['H4'];
			case 'D': return !values['H2'] && !values['H3'] && !values['H4'] && !values['H5'];
			default: return false;
			}
		}
		case '2': {
			switch (roomCode) {
			case 'A': return true;
			case 'B': return !values['H3'];
			case 'C': return !values['H3'] && !values['H4'];
			case 'D': return !values['H3'] && !values['H4'] && !values['H5'];
			default: return false;
			}
		}
		case '3': {
			switch (roomCode) {
			case 'A': return true;
			case 'B': return true;
			case 'C': return !values['H4'];
			case 'D': return !values['H4'] && !values['H5'];
			default: return false;
			}
		}
		case '4': {
			switch (roomCode) {
			case 'A': return !values['H3'];
			case 'B': return true;
			case 'C': return true;
			case 'D': return !values['H5'];
			default: return false;
			}
		}
		case '5': {
			switch (roomCode) {
			case 'A': return !values['H3'] && !values['H4'];
			case 'B': return !values['H4'];
			case 'C': return true;
			case 'D': return true;
			default: return false;
			}
		}
		case '6': {
			switch (roomCode) {
			case 'A': return !values['H3'] && !values['H4'] && !values['H5'];
			case 'B': return !values['H4'] && !values['H5'];
			case 'C': return !values['H5'];
			case 'D': return true;
			default: return false;
			}
		}
		case '7': {
			switch (roomCode) {
			case 'A': return !values['H3'] && !values['H4'] && !values['H5'] && !values['H6'];
			case 'B': return !values['H4'] && !values['H5'] && !values['H6'];
			case 'C': return !values['H5'] && !values['H6'];
			case 'D': return !values['H6'];
			default: return false;
			}
		}
		default: return false;
		}
	}

	// works for part 1 only
	private debugMove(amphipod: string, startNode: string, endNode: string, configuration: { [key: string]: string }, moveCost: number | null): void {
		const logStr =`Moving ${amphipod} from ${startNode} to ${endNode}, move cost=${moveCost}, config=${this.configurationToString(configuration)}`;

		const currentConfigStr = this.configurationToString(configuration);

		const moveConfig1 = !this.useMultiSpotRooms
			? this.configurationToString({
				'RA1': 'B',
				'RA2': 'A',
				'RB1': 'C',
				'RB2': 'D',
				'RC1': 'B',
				'RC2': 'C',
				'RD1': 'D',
				'RD2': 'A',
			})
			: this.configurationToString({
				'RA1': 'BA',
				'RB1': 'CD',
				'RC1': 'BC',
				'RD1': 'DA',
			});
		if (currentConfigStr === moveConfig1) {
			if (amphipod === 'B' && startNode === 'RC1' && endNode === 'H3') {
				this.sampleLog(logStr);
			}
		}

		const moveConfig2 = !this.useMultiSpotRooms
			? this.configurationToString({
				'RA1': 'B',
				'RA2': 'A',
				'RB1': 'C',
				'RB2': 'D',
				'H3': 'B',
				'RC2': 'C',
				'RD1': 'D',
				'RD2': 'A',
			})
			: this.configurationToString({
				'RA1': 'BA',
				'RB1': 'CD',
				'RC1': 'C',
				'RD1': 'DA',
				'H3': 'B',
			});
		if (currentConfigStr === moveConfig2) {
			if (amphipod === 'C' && startNode === 'RB1' && endNode === 'H4') {
				this.sampleLog(logStr);
			}
		}

		const moveConfig3 = !this.useMultiSpotRooms
			? this.configurationToString({
				'RA1': 'B',
				'RA2': 'A',
				'H4': 'C',
				'RB2': 'D',
				'H3': 'B',
				'RC2': 'C',
				'RD1': 'D',
				'RD2': 'A',
			})
			: this.configurationToString({
				'RA1': 'BA',
				'RB1': 'D',
				'RC1': 'C',
				'RD1': 'DA',
				'H3': 'B',
				'H4': 'C',
			});
		if (currentConfigStr === moveConfig3) {
			if (amphipod === 'C' && startNode === 'H4' && endNode === 'RC1') {
				this.sampleLog(logStr);
			}
		}

		const moveConfig4 = !this.useMultiSpotRooms
			? this.configurationToString({
				'RA1': 'B',
				'RA2': 'A',
				'RC1': 'C',
				'RB2': 'D',
				'H3': 'B',
				'RC2': 'C',
				'RD1': 'D',
				'RD2': 'A',
			})
			: this.configurationToString({
				'RA1': 'BA',
				'RB1': 'D',
				'RC1': 'CC',
				'RD1': 'DA',
				'H3': 'B',
			});
		if (currentConfigStr === moveConfig4) {
			if (amphipod === 'D' && startNode === (!this.useMultiSpotRooms ? 'RB2' : 'RB1') && endNode === 'H4') {
				this.sampleLog(logStr);
			}
		}

		const moveConfig5 = !this.useMultiSpotRooms
			? this.configurationToString({
				'RA1': 'B',
				'RA2': 'A',
				'RC1': 'C',
				'H4': 'D',
				'H3': 'B',
				'RC2': 'C',
				'RD1': 'D',
				'RD2': 'A',
			})
			: this.configurationToString({
				'RA1': 'BA',
				'RB1': '',
				'RC1': 'CC',
				'RD1': 'DA',
				'H3': 'B',
				'H4': 'D',
			});
		if (currentConfigStr === moveConfig5) {
			if (amphipod === 'B' && startNode === 'H3' && endNode === (!this.useMultiSpotRooms ? 'RB2' : 'RB1')) {
				this.sampleLog(logStr);
			}
		}

		const moveConfig6 = !this.useMultiSpotRooms
			? this.configurationToString({
				'RA1': 'B',
				'RA2': 'A',
				'RC1': 'C',
				'H4': 'D',
				'RB2': 'B',
				'RC2': 'C',
				'RD1': 'D',
				'RD2': 'A',
			})
			: this.configurationToString({
				'RA1': 'BA',
				'RB1': 'B',
				'RC1': 'CC',
				'RD1': 'DA',
				'H4': 'D',
			});
		if (currentConfigStr === moveConfig6) {
			if (amphipod === 'B' && startNode === 'RA1' && endNode === 'H3') {
				this.sampleLog(logStr);
			}
		}

		const moveConfig7 = !this.useMultiSpotRooms
			? this.configurationToString({
				'H3': 'B',
				'RA2': 'A',
				'RC1': 'C',
				'H4': 'D',
				'RB2': 'B',
				'RC2': 'C',
				'RD1': 'D',
				'RD2': 'A',
			})
			: this.configurationToString({
				'RA1': 'A',
				'RB1': 'B',
				'RC1': 'CC',
				'RD1': 'DA',
				'H4': 'D',
				'H3': 'B',
			});
		if (currentConfigStr === moveConfig7) {
			if (amphipod === 'B' && startNode === 'H3' && endNode === 'RB1') {
				this.sampleLog(logStr);
			}
		}

		const moveConfig8 = !this.useMultiSpotRooms
			? this.configurationToString({
				'RB1': 'B',
				'RA2': 'A',
				'RC1': 'C',
				'H4': 'D',
				'RB2': 'B',
				'RC2': 'C',
				'RD1': 'D',
				'RD2': 'A',
			})
			: this.configurationToString({
				'RA1': 'A',
				'RB1': 'BB',
				'RC1': 'CC',
				'RD1': 'DA',
				'H4': 'D',
			});
		if (currentConfigStr === moveConfig8) {
			if (amphipod === 'D' && startNode === 'RD1' && endNode === 'H5') {
				this.sampleLog(logStr);
			}
		}

		const moveConfig9 = !this.useMultiSpotRooms
			? this.configurationToString({
				'RB1': 'B',
				'RA2': 'A',
				'RC1': 'C',
				'H4': 'D',
				'RB2': 'B',
				'RC2': 'C',
				'H5': 'D',
				'RD2': 'A',
			})
			: this.configurationToString({
				'RA1': 'A',
				'RB1': 'BB',
				'RC1': 'CC',
				'RD1': 'A',
				'H4': 'D',
				'H5': 'D',
			});
		if (currentConfigStr === moveConfig9) {
			if (amphipod === 'A' && startNode === (!this.useMultiSpotRooms ? 'RD2' : 'RD1') && endNode === 'H6') {
				this.sampleLog(logStr);
			}
		}

		const moveConfig10 = !this.useMultiSpotRooms
			? this.configurationToString({
				'RB1': 'B',
				'RA2': 'A',
				'RC1': 'C',
				'H4': 'D',
				'RB2': 'B',
				'RC2': 'C',
				'H5': 'D',
				'H6': 'A',
			})
			: this.configurationToString({
				'RA1': 'A',
				'RB1': 'BB',
				'RC1': 'CC',
				'RD1': '',
				'H4': 'D',
				'H5': 'D',
				'H6': 'A',
			});
		if (currentConfigStr === moveConfig10) {
			if (amphipod === 'D' && startNode === 'H5' && endNode === (!this.useMultiSpotRooms ? 'RD2' : 'RD1')) {
				this.sampleLog(logStr);
			}
		}

		const moveConfig11 = !this.useMultiSpotRooms
			? this.configurationToString({
				'RB1': 'B',
				'RA2': 'A',
				'RC1': 'C',
				'H4': 'D',
				'RB2': 'B',
				'RC2': 'C',
				'RD2': 'D',
				'H6': 'A',
			})
			: this.configurationToString({
				'RA1': 'A',
				'RB1': 'BB',
				'RC1': 'CC',
				'RD1': 'D',
				'H4': 'D',
				'H6': 'A',
			});
		if (currentConfigStr === moveConfig11) {
			if (amphipod === 'D' && startNode === 'H4' && endNode === 'RD1') {
				this.sampleLog(logStr);
			}
		}

		const moveConfig12 = !this.useMultiSpotRooms
			? this.configurationToString({
				'RB1': 'B',
				'RA2': 'A',
				'RC1': 'C',
				'RD1': 'D',
				'RB2': 'B',
				'RC2': 'C',
				'RD2': 'D',
				'H6': 'A',
			})
			: this.configurationToString({
				'RA1': 'A',
				'RB1': 'BB',
				'RC1': 'CC',
				'RD1': 'DD',
				'H6': 'A',
			});
		if (currentConfigStr === moveConfig12) {
			if (amphipod === 'A' && startNode === 'H6' && endNode === 'RA1') {
				this.sampleLog(logStr);
			}
		}
	}

	private configurationToString(configuration: { [key: string]: string }): string {
		const ordered = Object.keys(configuration).sort().reduce(
			(obj: { [key: string]: string } , key) => {
				obj[key] = configuration[key];
				return obj;
			},
			{}
		);

		return JSON.stringify(ordered);
	}

	private stringToConfiguration(str: string): { [key: string]: string } {
		return JSON.parse(str);
	}
}

new Day23Solver().solveForArgs();