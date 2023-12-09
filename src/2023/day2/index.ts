import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';

interface Reveal {
	blue: number;
	red: number;
	green: number;
}

interface Game {
	id: number;
	reveals: Array<Reveal>;
}

class Day2Solver extends Solver {
	private input: Array<Game> = [];

	public init(inputFile: string): void {
		let lineNum = 1;
		this.input = InputParser.readLinesWithTransform<Game>(inputFile, line => {
			const reveals = line.substring(line.indexOf(':') + 2).split('; ');
			return {
				id: lineNum++,
				reveals: reveals.map(reveal => {
					const cubes = reveal.split(', ');
					let blue = 0, red = 0, green = 0;
					cubes.forEach(cube => {
						const count = parseInt(cube.split(' ')[0]);
						if (cube.endsWith('blue')) {
							blue += count;
						} else if (cube.endsWith('red')) {
							red += count;
						} else if (cube.endsWith('green')) {
							green += count;
						}
					});
					return { blue, red, green };
				}),
			};
		});
	}

	protected solvePart1(): string {
		let result = 0;
		this.input.forEach(game => {
			let ok = true;
			game.reveals.forEach(reveal => {
				if (reveal.red > 12 || reveal.green > 13 || reveal.blue > 14) {
					ok = false;
				}
			});
			if (ok) {
				result += game.id;
			}
		});
		return `${result}`;
	}

	protected solvePart2(): string {
		let result = 0;
		this.input.forEach(game => {
			let maxBlue = 0, maxRed = 0, maxGreen = 0;
			game.reveals.forEach(reveal => {
				maxBlue = Math.max(maxBlue, reveal.blue);
				maxRed = Math.max(maxRed, reveal.red);
				maxGreen = Math.max(maxGreen, reveal.green);
			});
			result += (maxBlue * maxRed * maxGreen);
		});
		return `${result}`;
	}
}

new Day2Solver().solveForArgs();