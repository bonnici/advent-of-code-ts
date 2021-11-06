import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';

interface RosterDay {
	guard: number;
	minutesAsleep: Set<number>;
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
		const roster = this.buildRoster();

		// Find guard who slept the most
		const totalAsleep = new Map();
		for (const [key, value] of roster.days) {
			this.verboseLog(`Day ${key}: Guard=${value.guard}, Asleep minutes=${value.minutesAsleep.size}`);

			if (totalAsleep.has(value.guard)) {
				totalAsleep.set(value.guard, totalAsleep.get(value.guard) + value.minutesAsleep.size);
			} else {
				totalAsleep.set(value.guard, value.minutesAsleep.size);
			}
		}

		let maxAsleep = 0, guardMaxAsleep = 0;
		for (const [key, value] of totalAsleep) {
			if (value > maxAsleep) {
				maxAsleep = value;
				guardMaxAsleep = key;
			}
		}
		this.verboseLog( `Guard: ${guardMaxAsleep}, asleep: ${maxAsleep}`);

		// Find minute slept the most by that guard
		let maxTimesAsleep = 0, maxAsleepMinute = 0;
		for (let m = 0; m < 60; m++) {
			let curTimesAsleep = 0;
			for (const value of roster.days.values()) {
				if (value.guard === guardMaxAsleep) {
					if (value.minutesAsleep.has(m)) {
						curTimesAsleep++;
					}
				}
			}

			if (curTimesAsleep > maxTimesAsleep) {
				this.verboseLog( `Found new max time asleep: ${curTimesAsleep} at ${m}`);
				maxTimesAsleep = curTimesAsleep;
				maxAsleepMinute = m;
			}
		}

		return `${maxAsleepMinute * guardMaxAsleep}`;
	}

	protected solvePart2(): string {
		const roster = this.buildRoster();

		// Find guard that spend the most of the same minute asleep
		let maxTimesAsleep = 0, maxAsleepMinute = 0, maxAsleepGuard = 0;
		for (let m = 0; m < 60; m++) {
			const guardToMinutesSlept: Map<number, number> = new Map();
			for (const rosterDay of roster.days.values()) {
				if (rosterDay.minutesAsleep.has(m)) {
					if (guardToMinutesSlept.has(rosterDay.guard)) {
						const newTotal = (guardToMinutesSlept.get(rosterDay.guard) || 0) + 1;
						guardToMinutesSlept.set(rosterDay.guard, newTotal);
					} else {
						guardToMinutesSlept.set(rosterDay.guard, 1);
					}
				}
			}

			for (const [guard, minutesAsleep] of guardToMinutesSlept) {
				this.verboseLog( `At minute ${m}, guard ${guard} spend ${minutesAsleep} asleep`);
				if (minutesAsleep > maxTimesAsleep) {
					this.verboseLog( `Found new max times asleep: ${guard} at ${m} for ${minutesAsleep} minutes`);
					maxTimesAsleep = minutesAsleep;
					maxAsleepGuard = guard;
					maxAsleepMinute = m;
				}
			}
		}

		return `${maxAsleepGuard * maxAsleepMinute}`;
	}

	private buildRoster(): Roster {
		const roster: Roster = { days: new Map() };
		let curGuard = 0;
		let asleepTime = 0;

		this.input.forEach(line => {
			if (line.includes('begins shift')) {
				const matched = line.match(/Guard #(\d+) begins/);
				if (!matched) {
					this.verboseLog('Error matching guard');
					return;
				}

				curGuard = parseInt(matched[1]);
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
					roster.days.set(date, { guard: curGuard, minutesAsleep: new Set() });
				}
			} else if (line.includes('wakes up')) {
				const matched = line.match(/\[([\d-]+) \d\d:(\d\d)] wakes up/);
				if (!matched) {
					this.verboseLog('Error matching wakes up');
					return;
				}

				const date = matched[1];
				const wakesUpTime = parseInt(matched[2]);
				this.verboseLog('Found wakes up', date, wakesUpTime);

				const rosterDays = roster.days.get(date);
				if (!rosterDays) {
					this.verboseLog('Expected day to exist', date);
					return;
				}

				for (let m = asleepTime; m < wakesUpTime; m++) {
					rosterDays.minutesAsleep.add(m);
				}
			} else {
				this.verboseLog('Unexpected line');
			}
		});

		return roster;
	}
}

new Day4Solver().solveForArgs();
