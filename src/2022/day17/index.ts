import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';
import { rotatingIncrement } from '../../common/Utils';

class RockChamber {
	public levels;
	public landedShapes = 0;
	public maxLandedHeight = 0;
	public curShape: Shape | null = null;
	public curShapeIndex = 0;
	public trimmedFloors = 0;

	constructor(private height: number) {
		this.levels = new Uint8Array(height);
	}

	public addShape(shape: Shape): void {
		if (this.maxLandedHeight - this.trimmedFloors + 3 + 4 >= this.height) {
			throw 'not enough levels';
		}
		if (this.curShape) {
			throw 'curShape already exists';
		}

		this.curShape = shape;
		this.curShapeIndex = this.maxLandedHeight - this.trimmedFloors + 3;
	}

	public pushByJet(isLeft: boolean): boolean {
		if (!this.curShape) {
			throw 'expected a curShape';
		}

		const wasPushed = this.curShape.pushByJet(isLeft);
		if (wasPushed && this.isShapeColliding()) {
			this.curShape.pushByJet(!isLeft); // revert
			return false;
		}
		return wasPushed;
	}

	public fallDown(): boolean {
		if (!this.curShape) {
			throw 'expected a curShape';
		}

		this.curShapeIndex--;
		if (this.curShapeIndex < 0 || this.isShapeColliding()) {
			this.curShapeIndex++;
			this.landShape();
			return false;
		} else {
			return true;
		}
	}

	public print(printFn?: (str: string) => void): void {
		if (!printFn) {
			return;
		}

		const levelsWithCurShape = new Uint8Array(this.levels);

		if (this.curShape) {
			for (let i = 0; i < this.curShape.levels.length; i++) {
				levelsWithCurShape[this.curShapeIndex + i] |= this.curShape.levels[i];
			}
		}
		
		let shouldOutput = false;
		for (let i = levelsWithCurShape.length - 1; i >= 0; i--) {
			const level = levelsWithCurShape[i];

			if (level > 0) {
				shouldOutput = true;
			}

			if (shouldOutput) {
				const binary = (level >>> 0).toString(2);
				printFn(`${'0'.repeat(7 - binary.length)}${binary}`);
			}
		}
	}

	private isShapeColliding(): boolean {
		if (!this.curShape) {
			throw 'expected a curShape';
		}
		
		for (let i = 0; i < this.curShape.levels.length; i++) {
			if ((this.levels[this.curShapeIndex + i] & this.curShape.levels[i]) > 0) {
				return true;
			}
		}

		return false;
	}

	private landShape(): void {
		if (!this.curShape) {
			throw 'expected a curShape';
		}

		for (let i = 0; i <= this.curShape.levels.length; i++) {
			this.levels[this.curShapeIndex + i] |= this.curShape.levels[i];
		}

		const landedHeight = this.curShapeIndex + this.curShape.levels.length + this.trimmedFloors;
		this.maxLandedHeight = Math.max(this.maxLandedHeight, landedHeight);
		this.landedShapes++;
		const newFloorCheckEnd = this.curShapeIndex + this.curShape.levels.length;
		this.curShape = null;

		// see if there is a new floor anywhere which means we can delete everything under it
		let floorsToTrim = 0;
		for (let i = this.curShapeIndex; i < newFloorCheckEnd; i++) {
			if (this.levels[i] === 0b01111111) {
				floorsToTrim = i;
			}
		}
		
		if (floorsToTrim > 0) {
			const newLevels = new Uint8Array(this.height);
			newLevels.set(this.levels.slice(floorsToTrim));
			this.levels = newLevels;
			this.trimmedFloors += floorsToTrim;
		}
	}
}

abstract class Shape {
	public levels = new Uint8Array(1);

	public pushByJet(isLeft: boolean): boolean {
		// Only 7 spots, so ignore leftmost bit
		const mask = isLeft ? 0b01000000 : 0b00000001;
		for (let i = 0; i < this.levels.length; i++) {
			if ((mask & this.levels[i]) > 0) {
				return false;
			}
		}

		for (let i = 0; i < this.levels.length; i++) {
			if (isLeft) {
				this.levels[i] <<= 1;
			} else {
				this.levels[i] >>= 1;
			}
		}

		return true;
	}
}

// Each rock appears with its left edge is two units away from the left wall, but we're ignoring the leftmost bit

class HorizontalLine extends Shape {
	constructor() {
		super();
		this.levels = new Uint8Array(1);
		this.levels[0] = 0b00011110;
	}
}

class Cross extends Shape {
	constructor() {
		super();
		this.levels = new Uint8Array(3);
		this.levels[2] = 0b00001000;
		this.levels[1] = 0b00011100;
		this.levels[0] = 0b00001000;
	}
}

class BackwardsL extends Shape {
	constructor() {
		super();
		this.levels = new Uint8Array(3);
		this.levels[2] = 0b00000100;
		this.levels[1] = 0b00000100;
		this.levels[0] = 0b00011100;
	}
}

class VerticalLine extends Shape {
	constructor() {
		super();
		this.levels = new Uint8Array(4);
		this.levels[3] = 0b00010000;
		this.levels[2] = 0b00010000;
		this.levels[1] = 0b00010000;
		this.levels[0] = 0b00010000;
	}
}

class Box extends Shape {
	constructor() {
		super();
		this.levels = new Uint8Array(2);
		this.levels[1] = 0b00011000;
		this.levels[0] = 0b00011000;
	}
}

class ShapeFactory {
	private builders: Array<() => Shape> = [
		() => new HorizontalLine(),
		() => new Cross(),
		() => new BackwardsL(),
		() => new VerticalLine(),
		() => new Box(),
	];
	private builderIndex = 0;

	public build(): Shape {
		const built = this.builders[this.builderIndex]();
		this.builderIndex = rotatingIncrement(this.builderIndex, this.builders.length);
		return built;
	}
}

class Day17Solver extends Solver {
	// boolean array, true is left, false is right
	private jets: Array<boolean> = [];
	private curJetIndex = 0;
	private factory = new ShapeFactory();

	public init(inputFile: string): void {
		this.jets = InputParser.readString(inputFile).split('').map(ch => ch === '<');
	}

	protected solvePart1(): string {
		// Go with worst case height of num rocks * max height of rock
		return this.solve(2022 * 4, 2022);
	}

	private solve(chamberHeight: number, numRocks: number): string {
		// Go with worst case height of num rocks * max height of rock
		const chamber = new RockChamber(chamberHeight);

		this.initProgress(numRocks);

		while (chamber.landedShapes < numRocks) {
			const newShape = this.factory.build();
			chamber.addShape(newShape);

			//this.sampleLog(`Added new shape: ${newShape.constructor.name}`);
			//chamber.print(process.env.SAMPLE_FILE ? this.sampleLog : undefined);

			let shouldContinue = true;
			while (shouldContinue) {
				const isLeft = this.jets[this.curJetIndex];
				this.curJetIndex = rotatingIncrement(this.curJetIndex, this.jets.length);
				/*const wasPushed =*/ chamber.pushByJet(isLeft);
				shouldContinue = chamber.fallDown();

				//this.sampleLog(`${wasPushed ? 'Pushed' : 'Could not be pushed'} to the ${isLeft ? 'left' : 'right'} and ${shouldContinue ? 'fell down' : 'could not fall down'}`);
				//chamber.print(process.env.SAMPLE_FILE ? this.sampleLog : undefined);
			}
			
			//this.sampleLog(`After ${newShape.constructor.name} has come to a rest`);
			//chamber.print(process.env.SAMPLE_FILE ? this.sampleLog : undefined);

			this.incrementProgress();
			if (chamber.landedShapes % 100000000 === 0) {
				this.sampleLog(`${chamber.landedShapes} shapes have landed`);
			}
		}

		this.stopProgress();
		
		//console.log('Final tower');
		//chamber.print(console.log);

		//const tetrisCount = chamber.levels.reduce((acc, cur) => cur === 0b01111111 ? acc + 1 : acc, 0);
		//console.log(`\n\n${tetrisCount} full floors found\n\n`);

		return `${chamber.maxLandedHeight}`;
	}

	protected solvePart2(): string {
		// Go with some height and increase if an error is thrown
		// this doesn't work - runs way too slowly
		return this.solve(1000000000, 1000000000000);
	}
}

new Day17Solver().solveForArgs();