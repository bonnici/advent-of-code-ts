import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';

interface RosterDay {
	guard: string;
	minutesAsleep: number;
}

interface Roster {
	days: Map<string, RosterDay>;
}

class Day4Solver extends Solver {
	private input: Array<string> = [];

	public init(inputFile: string): void {
		this.input = InputParser.readLines(inputFile);
		this.input = this.input.sort();
	}

	protected solvePart1(): string {
		const roster: Roster = { days: new Map() };
		let curGuard = '';
		let asleepTime = 0;

		this.input.forEach(line => {
			if (line.includes('begins shift')) {
				const matched = line.match(/Guard #(\d+) begins/);
				if (!matched) {
					this.verboseLog('Error matching guard');
					return;
				}

				curGuard = matched[1];
				this.verboseLog('Found guard', curGuard);
			} else if (line.includes('falls asleep')) {
				const matched = line.match(/\[([\d-]+) \d\d:(\d\d)] falls asleep/);
				if (!matched) {
					this.verboseLog('Error matching asleep');
					return;
				}

				const date = matched[1];
				const minutes = parseInt(matched[2]);
				this.verboseLog('Found asleep', date, minutes);
				asleepTime = minutes;

				if (!roster.days.has(date)) {
					roster.days.set(date, { guard: curGuard, minutesAsleep: 0 });
				}
			} else if (line.includes('wakes up')) {
				const matched = line.match(/\[([\d-]+) \d\d:(\d\d)] wakes up/);
				if (!matched) {
					this.verboseLog('Error matching wakes up');
					return;
				}

				const date = matched[1];
				const minutes = parseInt(matched[2]);
				this.verboseLog('Found wakes up', date, minutes);
				const timeAsleep = minutes - asleepTime;

				const rosterDays = roster.days.get(date);
				if (!rosterDays) {
					this.verboseLog('Expected day to exist', date);
					return;
				}

				rosterDays.minutesAsleep += timeAsleep;
			} else {
				this.verboseLog('Unexpected line');
			}
		});

		const totalAsleep = new Map();
		for (const [key, value] of roster.days) {
			this.verboseLog(`Day ${key}: Guard=${value.guard}, Asleep=${value.minutesAsleep}`);

			if (totalAsleep.has(value.guard)) {
				totalAsleep.set(value.guard, totalAsleep.get(value.guard) + value.minutesAsleep);
			} else {
				totalAsleep.set(value.guard, value.minutesAsleep);
			}
		}

		let maxAsleep = 0, guardMaxAsleep = null;
		for (const [key, value] of totalAsleep) {
			if (value > maxAsleep) {
				maxAsleep = value;
				guardMaxAsleep = key;
			}
		}

		return `Guard: ${guardMaxAsleep}, asleep: ${maxAsleep}`;
	}

	protected solvePart2(): string {
		return 'todo';
	}
}

new Day4Solver().solveForArgs();
