import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';
import GenericDag from '../../common/GenericDag';
import { factorial } from '../../common/Utils';

// Valve AA has flow rate=0; tunnels lead to valves DD, II, BB
const inputRe = /Valve ([A-Z]+) has flow rate=(\d+); tunnel(s?) lead(s?) to valve(s?) ([A-Z ,]+)/;

interface Valve {
	label: string,
	flow: number,
	open: boolean,
}

class Day16Solver extends Solver {
	private dag = new GenericDag<string>();
	private valves = new Map<string, Valve>();
	private interestingValves = new Set<string>();
	private shortestPaths = new Map<string, Map<string, number>>();

	public init(inputFile: string): void {
		const lines = InputParser.readLines(inputFile);
		for (const line of lines) {
			const match = line.match(inputRe) || [];
			const label = match[1];
			const flow = parseInt(match[2]);
			const links = match[match.length - 1].split(', ');

			if (flow > 0 || label === 'AA') {
				this.interestingValves.add(label);
			}

			this.sampleLog(`Valve ${label} has flow rate=${flow}; tunnels lead to valves ${links.join(', ')}`);

			for (const link of links) {
				this.dag.addLink(label, link);
				this.valves.set(label, { label, flow, open: false });
			}
		}

		this.sampleLog(this.dag.toGraphString());
		this.sampleLog(this.valves);
	}

	protected solvePart1(): string {
		const combinations = factorial(this.interestingValves.size - 1);
		this.initProgress(1 + combinations);

		// figure out shortest paths between each non-zero valve as well as valve AA
		for (const start of this.interestingValves.values()) {
			this.shortestPaths.set(start, new Map());
			for (const end of this.interestingValves.values()) {
				if (start !== end) {
					const shortestPath = this.dag.shortestPath(start, end);
					this.sampleLog(`Shortest path between ${start} and ${end} is ${shortestPath}`);
					this.shortestPaths.get(start)?.set(end, shortestPath);
				}
			}
		}
		this.incrementProgress();

		this.sampleLog(`Searching through ${combinations} combinations`);
		
		// assume we never want to open valve AA
		this.interestingValves.delete('AA');
		const curPath = ['AA'];
		const bestPressure = this.considerPaths(curPath, this.interestingValves, 0, 30);
		this.stopProgress();
		return `${bestPressure}`;
	}

	private considerPaths(pathSoFar: Array<string>, valvesToOpen: Set<string>, minutesSoFar: number, maxTime: number): number {
		if (minutesSoFar > maxTime) {
			throw 'invalid minutesSoFar';
		}

		let bestPressure = this.calculatePath(pathSoFar, maxTime);
		const lastValve = pathSoFar[pathSoFar.length - 1];

		const valvesToVisit = [...valvesToOpen.values()];
		for (const nextValve of valvesToVisit) {
			const travelTime = this.shortestPaths.get(lastValve)?.get(nextValve);
			if (travelTime === undefined) {
				throw 'invalid travelTime';
			}

			const newMinute = minutesSoFar + travelTime + 1;
			if (newMinute > maxTime) {
				// Path would take too long to traverse - no point in continuing with the check
				const skippedCombinations = factorial(valvesToVisit.length - 1);
				this.sampleLog(`Path ${pathSoFar.join(', ')}, ${nextValve} would take too long (${newMinute} minutes), skipping ${skippedCombinations} combinations`);
				this.incrementProgress(skippedCombinations);
			} else {
				// Path is traversable - remove from interesting valves and continue
				pathSoFar.push(nextValve);
				valvesToOpen.delete(nextValve);
				const newPressure = this.considerPaths(pathSoFar, valvesToOpen, newMinute, maxTime);
				valvesToOpen.add(nextValve);
				pathSoFar.pop();
				bestPressure = Math.max(bestPressure, newPressure);
			}
		}

		return bestPressure;
	}

	private calculatePath(path: Array<string>, maxTime: number): number {
		let pressureReleased = 0;
		let curRate = 0;
		let curMinute = 1;
		for (let i = 1; i < path.length; i++) {
			if (curMinute > maxTime) {
				throw 'invalid path';
			}

			const from = path[i - 1];
			const to = path[i];
			const cost = this.shortestPaths.get(from)?.get(to);
			if (cost === undefined) {
				throw 'invalid cost';
			}

			const flow =  this.valves.get(to)?.flow;
			if (flow === undefined) {
				throw 'invalid flow';
			}
			
			pressureReleased += (cost + 1) * curRate;
			curRate += flow;
			curMinute += cost + 1;			
		}

		const extraTime = maxTime - curMinute + 1;
		pressureReleased += extraTime * curRate;

		this.sampleLog(`Pressure released using path: ${path.join(', ')}: ${pressureReleased}`);
		this.incrementProgress();

		return pressureReleased;
	}

	protected solvePart2(): string {
		return `${'todo'}`;
	}
}

new Day16Solver().solveForArgs();