import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';
import GenericGrid from '../../common/GenericGrid';
import Coord from '../../common/Coord';
import {binaryStringToDecimal} from '../../common/Utils';

class Day20Solver extends Solver {
	private bitMap: Array<string> = [];
	private gridInput: Array<string> = [];

	public init(inputFile: string): void {
		const input = InputParser.readLinesInGroups(inputFile);

		if (input.length !== 2) {
			throw 'unexpected input';
		}

		this.bitMap = input[0][0].split('');
		this.gridInput = input[1];
	}

	protected solvePart1(): string {
		// 2 extra rows/cols around the input since we're stepping twice
		let grid = this.initGrid(2);

		this.sampleLog('before step\n', grid.toString());

		grid = this.step(grid, '.');
		this.sampleLog('after step 1\n', grid.toString());

		grid = this.step(grid, process.env.SAMPLE_FILE ? '.' : '#');
		this.sampleLog('after step 2\n', grid.toString());

		return `${grid.countOccurrences('#')}`;
	}

	protected solvePart2(): string {
		// 50 extra rows/cols around the input since we're stepping 50 times
		let grid = this.initGrid(50);

		this.sampleLog('before steps\n', grid.toString());

		let infiniteChar = '.';

		this.initProgress(50);
		for (let s = 1; s <= 50; s++) {
			grid = this.step(grid, infiniteChar);

			if (!process.env.SAMPLE_FILE) {
				infiniteChar = infiniteChar === '.' ? '#' : '.';
			}

			this.incrementProgress();
		}

		this.stopProgress();

		this.sampleLog('after steps\n', grid.toString());

		return `${grid.countOccurrences('#')}`;
	}

	private initGrid(padding: number): GenericGrid<string> {
		const gridWidth = this.gridInput[0].length + (padding*2);
		const gridHeight = this.gridInput.length + (padding*2);

		this.sampleLog('gridWidth', gridWidth);
		this.sampleLog('gridHeight', gridHeight);
		this.sampleLog('bitMap', this.bitMap);

		const grid = new GenericGrid<string>(
			gridWidth,
			gridHeight,
			() => '.',
			(a, b) => a.localeCompare(b),
			s => s,
		);
		for (let i = 0; i < this.gridInput.length; i++) {
			const line = this.gridInput[i];
			for (let j = 0; j < line.length; j++) {
				grid.set(j + padding, i + padding, line[j]);
			}
		}

		return grid;
	}

	private step(grid: GenericGrid<string>, infiniteChar: string): GenericGrid<string> {
		const newGrid = GenericGrid.copy<string>(grid);

		grid.forEachCoord(coord => {
			const bits = [
				this.getOrInfinite(grid, infiniteChar, coord.upLeft()),
				this.getOrInfinite(grid, infiniteChar, coord.up()),
				this.getOrInfinite(grid, infiniteChar, coord.upRight()),
				this.getOrInfinite(grid, infiniteChar, coord.left()),
				this.getOrInfinite(grid, infiniteChar, coord),
				this.getOrInfinite(grid, infiniteChar, coord.right()),
				this.getOrInfinite(grid, infiniteChar, coord.downLeft()),
				this.getOrInfinite(grid, infiniteChar, coord.down()),
				this.getOrInfinite(grid, infiniteChar, coord.downRight()),
			].map(s => s === '.' ? '0' : '1').join('');
			const decimal = binaryStringToDecimal(bits);
			const newChar = this.bitMap[decimal];

			// this.sampleLog('setting', bits, decimal, newChar);

			newGrid.setC(coord, newChar);
		});

		return newGrid;
	}

	private getOrInfinite(grid: GenericGrid<string>, infiniteChar: string, coord: Coord) {
		const char = grid.safeGet(coord);
		return char !== undefined ? char : infiniteChar;
	}
}

new Day20Solver().solveForArgs();