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
	private numberOfPathsByValveCount = new Map<number, number>();

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
	}

	protected solvePart1(): string {
		const combinations = factorial(this.interestingValves.size - 1);
		this.initProgress(combinations);

		this.sampleLog(`Searching through ${combinations} combinations`);
		
		// assume we never want to open valve AA
		this.interestingValves.delete('AA');
		const curPath = ['AA'];
		const bestPressure = this.considerPaths(curPath, this.interestingValves, 0, 30);
		this.stopProgress();
		return `${bestPressure}`;
	}

	private considerPaths(
		pathSoFar: Array<string>, 
		valvesToOpen: Set<string>, 
		minutesSoFar: number, 
		maxTime: number, 
		pathCostMap?: Map<string, number>,
		minValvesPerPath?: number,
		maxValvesPerPath?: number,
	): number {
		if (minutesSoFar > maxTime) {
			throw 'invalid minutesSoFar';
		}

		const valvesOpenedOnPath = pathSoFar.length - 1;
		const count = this.numberOfPathsByValveCount.get(valvesOpenedOnPath);
		if (count) {
			this.numberOfPathsByValveCount.set(valvesOpenedOnPath, count + 1);
		} else {
			this.numberOfPathsByValveCount.set(valvesOpenedOnPath, 1);
		}

		let bestPressure = this.calculatePath(pathSoFar, maxTime);
		if (pathCostMap && minValvesPerPath && maxValvesPerPath) {
			if (valvesOpenedOnPath >= minValvesPerPath && valvesOpenedOnPath <= maxValvesPerPath) {
				// For part 2 we're only interested in the best path for each combination of valves - it doesn't matter which order they are visited in
				const key = pathSoFar.slice(1).sort((a, b) => a.localeCompare(b)).join('_');
				const existing = pathCostMap.get(key);
				if (existing) {
					if (bestPressure > existing) {
						pathCostMap.set(key, bestPressure);
						this.sampleLog(`Pressure released from path ${pathSoFar.join(', ')} (${key}): ${bestPressure} is better than current best ${existing}`);
					} else {
						this.sampleLog(`Pressure released from path ${pathSoFar.join(', ')} (${key}): ${bestPressure} is not better than current best ${existing}`);
					}
				} else {
					pathCostMap.set(key, bestPressure);
					this.sampleLog(`Storing pressure released from path ${pathSoFar.join(', ')} (${key}): ${bestPressure}`);
				}
			}
		}

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
				const newPressure = this.considerPaths(pathSoFar, valvesToOpen, newMinute, maxTime, pathCostMap, minValvesPerPath, maxValvesPerPath);
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
		const valvesToOpen = this.interestingValves.size - 1;
		const minValvesPerPath = 2;
		const maxValvesPerPath = valvesToOpen - 2;

		// Build a map of the total pressure released by the opening of minValvesPerPath to maxValvesPerPath valves.
		console.log(`Building map of the cost of all paths that open between ${minValvesPerPath} and ${maxValvesPerPath} valves`);
		
		const distinctPaths = factorial(valvesToOpen);
		this.initProgress(distinctPaths);

		// Assume we never want to open valve AA
		this.interestingValves.delete('AA');
		const curPath = ['AA'];
		const pathCosts = new Map<string, number>();
		const bestSinglePathPressure = this.considerPaths(curPath, this.interestingValves, 0, 26, pathCosts, minValvesPerPath, maxValvesPerPath);
		this.stopProgress();

		// Now that we have a list of the best paths for each combination of valves between minValvesPerPath to maxValvesPerPath,
		// loop through them and check the total pressure, which will be the pressure relieved by that path (me), plus the pressure 
		// relieved by best path that covers the rest of the valves (elephant's path).
		const pathCombos = pathCosts.size * pathCosts.size;
		console.log(`Going through ${pathCombos} paths combinations`);
		this.initProgress(pathCombos);
		let bestCombinedPressure = 0;
		pathCosts.forEach((myPressure: number, myKey: string) => {
			const myPathValves = new Set(myKey.split('_'));

			if (myPressure + bestSinglePathPressure <= bestCombinedPressure) {
				this.sampleLog(`Pressure relieved by my path ${myKey} ${myPressure} plus best single path pressure ${bestSinglePathPressure} is worse than current best combined ${bestCombinedPressure}, ignoring this path completely`);
				this.incrementProgress(pathCosts.size);
			} else {
				// The elephant doesn't have time to turn all remaining valves (see numberOfPathsByValveCount). Go through all path costs
				// that cover the remaining valves, and get the best pressure from those
				pathCosts.forEach((elephantPressure: number, elephantKey: string) => {
					const elephantPathValves = new Set(elephantKey.split('_'));
					const valvesInBothPaths = [...myPathValves].filter(x => elephantPathValves.has(x));
					if (valvesInBothPaths.length > 0) {
						this.sampleLog(`My path ${myKey} and elephant's path ${elephantKey} contain the same valve, ignoring`);
					} else {
						const combinedPressure = myPressure + elephantPressure;
						if (combinedPressure > bestCombinedPressure) {
							this.sampleLog(`Pressure relieved by my path ${myKey} and elephant's path ${elephantKey} ${combinedPressure} is better than current best ${bestCombinedPressure}`);
							bestCombinedPressure = combinedPressure;
						} else {
							this.sampleLog(`Pressure relieved by my path ${myKey} and elephant's path ${elephantKey} ${combinedPressure} is not better than current best ${bestCombinedPressure}`);
						}
					}
					this.incrementProgress();
				});
			}
		});
		this.stopProgress();

		return `${bestCombinedPressure}`;
	}
}

new Day16Solver().solveForArgs();