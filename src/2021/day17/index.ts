import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';
import Coord from '../../common/Coord';

class Day17Solver extends Solver {
	private minX = 0;
	private maxX = 0;
	private minY = 0;
	private maxY = 0;

	private pos = new Coord(0, 0);
	private velocity = new Coord(0, 0);

	public init(inputFile: string): void {
		const input = InputParser.readLines(inputFile)[0];
		const matched = input.match(/target area: x=([-\d]+)..([-\d]+), y=([-\d]+)..([-\d]+)/);
		if (!matched || matched.length !== 5) {
			throw 'invalid line';
		}

		this.minX = parseInt(matched[1]);
		this.maxX = parseInt(matched[2]);
		this.minY = parseInt(matched[3]);
		this.maxY = parseInt(matched[4]);
	}

	protected solvePart1(): string {
		this.sampleLog('Input', this.minX, this.maxX, this.minY, this.maxY);

		let bestMax = 0;

		for (let x = 1; x <= this.maxX; x++) {
			for (let y = 1; y < this.minY * -1; y++) {
				const max = this.fire(new Coord(x, y));
				this.sampleLog(`Max for ${x},${y} is ${max}`);
				if (max !== null) {
					bestMax = Math.max(bestMax, max);
				}
			}
		}

		return `${bestMax}`;
	}

	protected solvePart2(): string {
		let hits = 0;

		for (let x = 1; x <= this.maxX; x++) {
			for (let y = this.minY; y < this.minY * -1; y++) {
				const max = this.fire(new Coord(x, y));
				this.sampleLog(`Max for ${x},${y} is ${max}`);
				if (max !== null) {
					hits += 1;
				}
			}
		}

		return `${hits}`;
	}

	private step(): void {
		this.pos.x += this.velocity.x;
		this.pos.y += this.velocity.y;

		if (this.velocity.x > 0) {
			this.velocity.x -= 1;
		} else if (this.velocity.x < 0) {
			this.velocity.x += 1;
		}

		this.velocity.y -= 1;

		// this.sampleLog('Pos & velocity after step', this.pos.toString(), this.velocity.toString());
	}

	private fire(velocity: Coord): number | null {
		let highest = 0;
		this.pos = new Coord(0, 0);
		this.velocity = velocity;
		// this.sampleLog('Starting pos & velocity', this.pos.toString(), this.velocity.toString());

		while (this.pos.x <= this.maxX && this.pos.y >= this.minY) {
			this.step();

			highest = Math.max(this.pos.y, highest);

			if (this.pos.x >= this.minX && this.pos.x <= this.maxX && this.pos.y >= this.minY && this.pos.y <= this.maxY) {
				this.sampleLog('Position is inside target', this.pos.toString());
				return highest;
			}
		}

		return null;
	}
}

new Day17Solver().solveForArgs();