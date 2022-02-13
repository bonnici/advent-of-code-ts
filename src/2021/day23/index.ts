import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';
import GenericDag from '../../common/GenericDag';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const RedisSortedSet = require('redis-sorted-set');

class Day23Solver extends Solver {
	private dag: GenericDag<string> = new GenericDag<string>();
	private initialValues: {[node: string]: string} = {};
	private solvedValues: {[node: string]: string} = {};
	private energyPerStep: Map<string, number> = new Map();

	public init(inputFile: string): void {
		const input = InputParser.readLines(inputFile);

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

		this.dag.addLink('H1', 'RA1', true, 3);
		this.dag.addLink('H2', 'RA1', true, 2);
		this.dag.addLink('H3', 'RA1', true, 2);
		this.dag.addLink('H4', 'RA1', true, 4);
		this.dag.addLink('H5', 'RA1', true, 6);
		this.dag.addLink('H6', 'RA1', true, 8);
		this.dag.addLink('H7', 'RA1', true, 9);
		this.dag.addLink('H1', 'RA2', true, 4);
		this.dag.addLink('H2', 'RA2', true, 3);
		this.dag.addLink('H3', 'RA2', true, 3);
		this.dag.addLink('H4', 'RA2', true, 5);
		this.dag.addLink('H5', 'RA2', true, 7);
		this.dag.addLink('H6', 'RA2', true, 9);
		this.dag.addLink('H7', 'RA2', true, 10);

		this.dag.addLink('H1', 'RB1', true, 5);
		this.dag.addLink('H2', 'RB1', true, 4);
		this.dag.addLink('H3', 'RB1', true, 2);
		this.dag.addLink('H4', 'RB1', true, 2);
		this.dag.addLink('H5', 'RB1', true, 4);
		this.dag.addLink('H6', 'RB1', true, 6);
		this.dag.addLink('H7', 'RB1', true, 7);
		this.dag.addLink('H1', 'RB2', true, 6);
		this.dag.addLink('H2', 'RB2', true, 5);
		this.dag.addLink('H3', 'RB2', true, 3);
		this.dag.addLink('H4', 'RB2', true, 3);
		this.dag.addLink('H5', 'RB2', true, 5);
		this.dag.addLink('H6', 'RB2', true, 7);
		this.dag.addLink('H7', 'RB2', true, 8);

		this.dag.addLink('H1', 'RC1', true, 7);
		this.dag.addLink('H2', 'RC1', true, 6);
		this.dag.addLink('H3', 'RC1', true, 4);
		this.dag.addLink('H4', 'RC1', true, 2);
		this.dag.addLink('H5', 'RC1', true, 2);
		this.dag.addLink('H6', 'RC1', true, 4);
		this.dag.addLink('H7', 'RC1', true, 5);
		this.dag.addLink('H1', 'RC2', true, 8);
		this.dag.addLink('H2', 'RC2', true, 7);
		this.dag.addLink('H3', 'RC2', true, 5);
		this.dag.addLink('H4', 'RC2', true, 3);
		this.dag.addLink('H5', 'RC2', true, 3);
		this.dag.addLink('H6', 'RC2', true, 5);
		this.dag.addLink('H7', 'RC2', true, 6);

		this.dag.addLink('H1', 'RD1', true, 9);
		this.dag.addLink('H2', 'RD1', true, 8);
		this.dag.addLink('H3', 'RD1', true, 6);
		this.dag.addLink('H4', 'RD1', true, 4);
		this.dag.addLink('H5', 'RD1', true, 2);
		this.dag.addLink('H6', 'RD1', true, 2);
		this.dag.addLink('H7', 'RD1', true, 3);
		this.dag.addLink('H1', 'RD2', true, 10);
		this.dag.addLink('H2', 'RD2', true, 9);
		this.dag.addLink('H3', 'RD2', true, 7);
		this.dag.addLink('H4', 'RD2', true, 5);
		this.dag.addLink('H5', 'RD2', true, 3);
		this.dag.addLink('H6', 'RD2', true, 3);
		this.dag.addLink('H7', 'RD2', true, 4);

		// input is trimmed, so front part of room index will be different to back part of room index
		this.initialValues = {
			'RA1': input[2].charAt(3),
			'RA2': input[3].charAt(1),
			'RB1': input[2].charAt(5),
			'RB2': input[3].charAt(3),
			'RC1': input[2].charAt(7),
			'RC2': input[3].charAt(5),
			'RD1': input[2].charAt(9),
			'RD2': input[3].charAt(7),
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

		this.energyPerStep.set('A', 1);
		this.energyPerStep.set('B', 10);
		this.energyPerStep.set('C', 100);
		this.energyPerStep.set('D', 1000);
	}

	protected solvePart1(): string {
		this.sampleLog(this.dag.toString());

		// let result = this.recursivelyOrganise(this.initialValues, 0, new Set(), Number.MAX_SAFE_INTEGER);
		const result = this.organiseDijkstra();
		return `${result}`;
	}

	protected solvePart2(): string {
		return `${'todo'}`;
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

		let current = this.initialValues;
		let currentStr = this.configurationToString(current);

		// set progress to some large number just so we can see how quickly it is considering options
		this.initProgress(100000);

		for (;;) {
			const currentCost = distances.get(currentStr);
			if (currentCost === undefined) {
				throw 'invalid configuration';
			}

			// If the current configuration is the target, we've found the minimum cost so we're done
			if (currentStr === targetConfiguration) {
				this.stopProgress();
				return currentCost;
			}

			// From the current configuration, find all valid moves for all amphipods
			for (const nodeKey of Object.keys(current)) {
				const nodeVal: string = current[nodeKey];
				const node = this.dag.getNode(nodeKey);
				if (!node) {
					continue;
				}

				for (const targetKey of node.forwardLinks.keys()) {
					const moveLink = node.forwardLinks.get(targetKey);
					if (!moveLink) {
						throw 'invalid link';
					}

					const moveCost = this.moveCost(nodeVal, nodeKey, targetKey, current, moveLink.cost);

					this.debugMove(nodeVal, nodeKey, targetKey, current, moveLink.cost, moveCost);

					if (moveCost === null) {
						continue;
					}

					// For each valid move, check to see if it's the best way to get to that configuration
					const costAfterMove = currentCost + moveCost;

					const newConfiguration = this.stringToConfiguration(currentStr);
					delete newConfiguration[nodeKey];
					newConfiguration[targetKey] = nodeVal;
					const newConfigString = this.configurationToString(newConfiguration);

					if (visitedSet.has(newConfigString)) {
						continue;
					}

					const existingCost = distances.get(newConfigString);

					// If it is, update the cost and add to unvisited set if it's a new configuration
					if (existingCost === undefined || costAfterMove < existingCost) {
						distances.set(newConfigString, costAfterMove);
						unvisitedSet.add(newConfigString, costAfterMove);
					}
				}
			}

			// We've exhausted all options from the current configuration, so remove from unvisited set and find the
			// cheapest configuration out of the unvisited set
			unvisitedSet.rem(currentStr);
			visitedSet.add(currentStr);
			currentStr = unvisitedSet.range(0, 0)[0];
			if (!currentStr) {
				throw 'invalid unvisited';
			}
			current = this.stringToConfiguration(currentStr);
			this.incrementProgress();
		}
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
		// Can never move from hallway to hallway or from room to room
		if (fromNodeKey.charAt(0) === toNodeKey.charAt(0)) {
			return null;
		}

		// Can never move into a spot that is already taken
		if (values[toNodeKey]) {
			return null;
		}

		// When moving from room to hallway
		if (fromNodeKey.charAt(0) === 'R') {
			// Can't move if already in the correct room and not blocking any other amphipods
			const inCorrectRoom = fromNodeKey.charAt(1) === amphipod;
			const atFrontEnd = fromNodeKey.charAt(2) === '1';
			const atBackEnd = fromNodeKey.charAt(2) === '2';
			const backEndIsTaken = !!values[`R${amphipod}2`];
			const backEndIsTakenByCorrectAmphipod = values[`R${amphipod}2`] === amphipod;
			if (inCorrectRoom && atBackEnd) {
				return null;
			}
			if (inCorrectRoom && atFrontEnd && backEndIsTaken && backEndIsTakenByCorrectAmphipod) {
				return null;
			}

			// Can't move through any other amphipods
			if (!this.isPathClear(fromNodeKey, toNodeKey, values)) {
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

			// Must move into the furthest spot in the room
			if (toNodeKey.charAt(2) === '1' && !values[`R${amphipod}2`]) {
				return null;
			}

			// Can't move into room if the wrong amphipod is already in the room
			if (toNodeKey.charAt(2) === '1' && !!values[`R${amphipod}2`] && values[`R${amphipod}2`] !== amphipod) {
				return null;
			}
		}

		// It's a valid move - cost is dependent on the length of the link and the colour of the amphipod
		const energyPerStep = this.energyPerStep.get(amphipod);
		if (!energyPerStep) {
			return null;
		} else {
			return numSteps * energyPerStep;
		}
	}

	private isPathClear(fromNodeKey: string, toNodeKey: string, values: {[node: string]: string}): boolean {
		// If from or two the back end of a room, the front end must be clear
		if (fromNodeKey.charAt(0) === 'R' && fromNodeKey.charAt(2) === '2') {
			const frontEndSpot = `R${fromNodeKey.charAt(1)}1`;
			if (values[frontEndSpot]) {
				return false;
			}
		}
		if (toNodeKey.charAt(0) === 'R' && toNodeKey.charAt(2) === '2') {
			const frontEndSpot = `R${fromNodeKey.charAt(1)}1`;
			if (values[frontEndSpot]) {
				return false;
			}
		}

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

	private debugMove(amphipod: string, startNode: string, endNode: string, configuration: { [key: string]: string }, linkCost: number, moveCost: number | null): void {
		const logStr =`Moving ${amphipod} from ${startNode} to ${endNode}, move cost=${moveCost}, config=${this.configurationToString(configuration)}`;

		const currentConfigStr = this.configurationToString(configuration);

		const moveConfig1 = this.configurationToString({
			'RA1': 'B',
			'RA2': 'A',
			'RB1': 'C',
			'RB2': 'D',
			'RC1': 'B',
			'RC2': 'C',
			'RD1': 'D',
			'RD2': 'A',
		});
		if (currentConfigStr === moveConfig1) {
			if (amphipod === 'B' && startNode === 'RC1' && endNode === 'H3') {
				this.sampleLog(logStr);
			}
		}

		const moveConfig2 = this.configurationToString({
			'RA1': 'B',
			'RA2': 'A',
			'RB1': 'C',
			'RB2': 'D',
			'H3': 'B',
			'RC2': 'C',
			'RD1': 'D',
			'RD2': 'A',
		});
		if (currentConfigStr === moveConfig2) {
			if (amphipod === 'C' && startNode === 'RB1' && endNode === 'H4') {
				this.sampleLog(logStr);
			}
		}

		const moveConfig3 = this.configurationToString({
			'RA1': 'B',
			'RA2': 'A',
			'H4': 'C',
			'RB2': 'D',
			'H3': 'B',
			'RC2': 'C',
			'RD1': 'D',
			'RD2': 'A',
		});
		if (currentConfigStr === moveConfig3) {
			if (amphipod === 'C' && startNode === 'H4' && endNode === 'RC1') {
				this.sampleLog(logStr);
			}
		}

		const moveConfig4 = this.configurationToString({
			'RA1': 'B',
			'RA2': 'A',
			'RC1': 'C',
			'RB2': 'D',
			'H3': 'B',
			'RC2': 'C',
			'RD1': 'D',
			'RD2': 'A',
		});
		if (currentConfigStr === moveConfig4) {
			if (amphipod === 'D' && startNode === 'RB2' && endNode === 'H4') {
				this.sampleLog(logStr);
			}
		}

		const moveConfig5 = this.configurationToString({
			'RA1': 'B',
			'RA2': 'A',
			'RC1': 'C',
			'H4': 'D',
			'H3': 'B',
			'RC2': 'C',
			'RD1': 'D',
			'RD2': 'A',
		});
		if (currentConfigStr === moveConfig5) {
			if (amphipod === 'B' && startNode === 'H3' && endNode === 'RB2') {
				this.sampleLog(logStr);
			}
		}

		const moveConfig6 = this.configurationToString({
			'RA1': 'B',
			'RA2': 'A',
			'RC1': 'C',
			'H4': 'D',
			'RB2': 'B',
			'RC2': 'C',
			'RD1': 'D',
			'RD2': 'A',
		});
		if (currentConfigStr === moveConfig6) {
			if (amphipod === 'B' && startNode === 'RA1' && endNode === 'H3') {
				this.sampleLog(logStr);
			}
		}

		const moveConfig7 = this.configurationToString({
			'H3': 'B',
			'RA2': 'A',
			'RC1': 'C',
			'H4': 'D',
			'RB2': 'B',
			'RC2': 'C',
			'RD1': 'D',
			'RD2': 'A',
		});
		if (currentConfigStr === moveConfig7) {
			if (amphipod === 'B' && startNode === 'H3' && endNode === 'RB1') {
				this.sampleLog(logStr);
			}
		}

		const moveConfig8 = this.configurationToString({
			'RB1': 'B',
			'RA2': 'A',
			'RC1': 'C',
			'H4': 'D',
			'RB2': 'B',
			'RC2': 'C',
			'RD1': 'D',
			'RD2': 'A',
		});
		if (currentConfigStr === moveConfig8) {
			if (amphipod === 'D' && startNode === 'RD1' && endNode === 'H5') {
				const moveCost = this.moveCost(amphipod, startNode, endNode, configuration, linkCost);
				this.sampleLog(logStr); // here
			}
		}

		const moveConfig9 = this.configurationToString({
			'RB1': 'B',
			'RA2': 'A',
			'RC1': 'C',
			'H4': 'D',
			'RB2': 'B',
			'RC2': 'C',
			'H5': 'D',
			'RD2': 'A',
		});
		if (currentConfigStr === moveConfig9) {
			if (amphipod === 'A' && startNode === 'RD2' && endNode === 'H6') {
				this.sampleLog(logStr);
			}
		}

		const moveConfig10 = this.configurationToString({
			'RB1': 'B',
			'RA2': 'A',
			'RC1': 'C',
			'H4': 'D',
			'RB2': 'B',
			'RC2': 'C',
			'H5': 'D',
			'H6': 'A',
		});
		if (currentConfigStr === moveConfig10) {
			if (amphipod === 'D' && startNode === 'H5' && endNode === 'RD2') {
				this.sampleLog(logStr);
			}
		}

		const moveConfig11 = this.configurationToString({
			'RB1': 'B',
			'RA2': 'A',
			'RC1': 'C',
			'H4': 'D',
			'RB2': 'B',
			'RC2': 'C',
			'RD2': 'D',
			'H6': 'A',
		});
		if (currentConfigStr === moveConfig11) {
			if (amphipod === 'D' && startNode === 'H4' && endNode === 'RD1') {
				this.sampleLog(logStr);
			}
		}

		const moveConfig12 = this.configurationToString({
			'RB1': 'B',
			'RA2': 'A',
			'RC1': 'C',
			'RD1': 'D',
			'RB2': 'B',
			'RC2': 'C',
			'RD2': 'D',
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