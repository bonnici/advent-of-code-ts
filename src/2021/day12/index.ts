import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';
import GenericDag from '../../common/GenericDag';

// start-A
const inputRe = /([a-zA-Z]+)-([a-zA-Z]+)/;

class Day12Solver extends Solver {
	private dag: GenericDag<string> = new GenericDag<string>();

	public init(inputFile: string): void {
		const input = InputParser.readLines(inputFile);

		for (const line of input) {
			const matched = line.match(inputRe);
			if (!matched) {
				throw 'unexpected line';
			}
			const from = matched[1];
			const to = matched[2];

			this.sampleLog(`Line: ${from} to ${to}`);

			this.dag.addLink(from, to);
		}

		this.sampleLog(`DAG: ${this.dag.toGraphString()}`);
	}

	protected solvePart1(): string {
		const startNode = this.dag.getNode('start');
		if (startNode === null) {
			throw 'no start node';
		}

		const numPaths = this.countPathsToEnd('start', [], {});

		return `${numPaths}`;
	}

	protected solvePart2(): string {
		const startNode = this.dag.getNode('start');
		if (startNode === null) {
			throw 'no start node';
		}

		const numPaths = this.countPathsToEnd('start', [], {}, true);

		return `${numPaths}`;
	}

	private countPathsToEnd(currentNodeName: string, pathSoFar: string[], numVisits: { [nodeName: string]: number }, part2Rules = false) {
		let numPaths = 0;

		// If we've reached the end, that's one path
		if (currentNodeName === 'end') {
			this.sampleLog(`Found path to end: ${pathSoFar.join(',')},end`);
			return 1;
		}

		// If we're visiting a small cave we've already visited, terminate the path
		const isSmallCave = currentNodeName === currentNodeName.toLowerCase();
		if (isSmallCave) {
			if (!part2Rules) {
				if ((numVisits[currentNodeName] || 0) > 0) {
					return 0;
				}
			} else {
				const visits = (numVisits[currentNodeName] || 0);
				if (visits > 1) {
					return 0;
				}

				if (visits === 1) {
					// can visit a single small cave twice
					for (const key of Object.keys(numVisits)) {
						if (key === key.toLowerCase() && numVisits[key] > 1) {
							// already done our single second visit
							return 0;
						}
					}
				}
			}
		}

		const currentNode = this.dag.getNode(currentNodeName);
		if (!currentNode) {
			throw 'unexpected node';
		}
		for (const next of currentNode.allLinkNames()) {
			// can never visit start more than once
			if (next === 'start') {
				continue;
			}

			// inefficient to keep making copies of the path array & visits map but shouldn't matter for now
			const newVisits = { ...numVisits };
			newVisits[currentNodeName] = (newVisits[currentNodeName] || 0) + 1;
			numPaths += this.countPathsToEnd(next, [...pathSoFar, currentNodeName], newVisits, part2Rules);
		}

		return numPaths;
	}
}

new Day12Solver().solveForArgs();
