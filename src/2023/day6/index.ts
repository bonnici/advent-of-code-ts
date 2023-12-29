import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';

class Race {
	constructor(public index: number, public time: number, public record: number) {}

	public waysToWinBruteForce(): number {
		let result = 0;
		for (let holdLength = 0; holdLength < this.time; holdLength++) {
			if (this.calculateDistance(holdLength) > this.record) {
				result++;
			}
		}
		return result;
	}
	
	public calculateDistance(holdLength: number): number {
		const speed = holdLength;
		const remainingTime = this.time - holdLength;
		if (remainingTime > 0) {
			return speed * remainingTime;
		}
		return 0;
	}

	public toString(): string {
		return `${this.index}: ${this.time}ms ${this.record}mm`;
	}
}

class Day6Solver extends Solver {
	private input: Array<string> = [];

	public init(inputFile: string): void {
		this.input = InputParser.readLines(inputFile);
	}

	protected solvePart1(): string {
		const times = this.input[0].split(':')[1].split(' ').filter(x => x.trim() != '').map(x => parseInt(x.trim()));
		const distances = this.input[1].split(':')[1].split(' ').filter(x => x.trim() != '').map(x => parseInt(x.trim()));

		const races: Array<Race> = [];
		for (let i = 0; i < times.length; i++) {
			races.push(new Race(i, times[i], distances[i]));
		}

		this.sampleLog(races.map(r => r.toString()).join('\n'));

		const ways: Array<number> = races.map(race => race.waysToWinBruteForce());
		this.sampleLog(`Ways to win: ${ways.join(', ')}`);

		let result = ways.pop() as number;
		while (ways.length > 0) {
			result *= ways.pop() as number;
		}
		return `${result}`;
	}

	protected solvePart2(): string {
		const time = parseInt(this.input[0].split(':')[1].replace(/\s/g, ''));
		const distance = parseInt(this.input[1].split(':')[1].replace(/\s/g, ''));
		const race = new Race(0, time, distance);
		this.sampleLog(`race: ${race}`);

		// Find the minimum holding time to beat the distance
		let searchStart = 0, searchEnd = time;
		while (searchStart < searchEnd) {
			this.sampleLog(`searching between hold times ${searchStart}-${searchEnd}`);
			const curSearch = Math.floor((searchEnd - searchStart) / 2) + searchStart;
			const curDistance = race.calculateDistance(curSearch);
			this.sampleLog(`hold time of ${curSearch} has distance of ${curDistance}, which is ${curDistance <= distance ? 'NOT ' : ''}a win`);
			if (curDistance > distance) {
				searchEnd = curSearch;
			} else {
				searchStart = curSearch + 1;
			}
		}
		const minHoldTime = searchStart;
		this.sampleLog(`minimum hold time to win is: ${minHoldTime}`);
		

		// Find the maximum holding time to beat the distance
		searchStart = 0, searchEnd = time;
		while (searchStart < searchEnd) {
			this.sampleLog(`searching between hold times ${searchStart}-${searchEnd}`);
			const curSearch = Math.floor((searchEnd - searchStart) / 2) + searchStart;
			const curDistance = race.calculateDistance(curSearch);
			this.sampleLog(`hold time of ${curSearch} has distance of ${curDistance}, which is ${curDistance <= distance ? 'NOT ' : ''}a win`);
			if (curDistance > distance) {
				searchStart = curSearch + 1;
			} else {
				searchEnd = curSearch;
			}
		}
		const maxHoldTime = searchEnd;
		this.sampleLog(`maximum hold time to win is: ${maxHoldTime}`);

		return `${maxHoldTime - minHoldTime}`;
	}
}

new Day6Solver().solveForArgs();