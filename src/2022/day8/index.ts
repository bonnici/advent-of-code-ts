import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';
import GenericGrid from '../../common/GenericGrid';
import Coord from '../../common/Coord';

class Day8Solver extends Solver {
	private input: Array<string> = [];
	private treeGrid = GenericGrid.buildIntsFromStringList(['1']);
	private visibleTrees = new Set<string>();

	public init(inputFile: string): void {
		this.input = InputParser.readLines(inputFile);
		this.treeGrid = GenericGrid.buildIntsFromStringList(this.input);
	}

	private checkVisible(col: number, row: number, minVisibleHeight: number, hint: string): number {
		const coord = new Coord(col, row);
		const treeHeight = this.treeGrid.getC(coord);
		this.sampleLog(`checkVisible ${row},${col} ${treeHeight} > ${minVisibleHeight} from ${hint}?`);
		if (this.visibleTrees.has(coord.toString())) {
			return Math.max(minVisibleHeight, treeHeight + 1);
		}
		if (treeHeight >= minVisibleHeight) {
			this.sampleLog(`Tree at ${coord} is visible from ${hint} (height ${treeHeight} > min height ${minVisibleHeight})`);
			this.visibleTrees.add(coord.toString());
			minVisibleHeight = treeHeight + 1;
		}
		return minVisibleHeight;
	}
	
	private scenicScore(col: number, row: number): number {
		const coord = new Coord(col, row);
		const treeHeight = this.treeGrid.getC(coord);

		let visibleUp = 0;
		for (let col2 = col - 1; col2 >= 0; col2--) {
			const tree2Height = this.treeGrid.getC(new Coord(col2, row));
			visibleUp++;
			if (tree2Height >= treeHeight) {
				break;
			}
		}
		
		let visibleDown = 0;
		for (let col2 = col + 1; col2 < this.treeGrid.height; col2++) {
			const tree2Height = this.treeGrid.getC(new Coord(col2, row));
			visibleDown++;
			if (tree2Height >= treeHeight) {
				break;
			}
		}
		
		let visibleLeft = 0;
		for (let row2 = row - 1; row2 >= 0; row2--) {
			const tree2Height = this.treeGrid.getC(new Coord(col, row2));
			visibleLeft++;
			if (tree2Height >= treeHeight) {
				break;
			}
		}
		
		let visibleRight = 0;
		for (let row2 = row + 1; row2 < this.treeGrid.width; row2++) {
			const tree2Height = this.treeGrid.getC(new Coord(col, row2));
			visibleRight++;
			if (tree2Height >= treeHeight) {
				break;
			}
		}

		const score = visibleUp * visibleDown * visibleLeft * visibleRight;
		this.sampleLog(`scenicScore for ${row},${col} is ${visibleUp} * ${visibleDown} * ${visibleLeft} * ${visibleRight} = ${score}`);
		return score;
	}

	protected solvePart1(): string {
		this.sampleLog(this.treeGrid.toString());

		for (let row = 0; row < this.treeGrid.height; row++) {
			let minVisibleHeight = 0;
			for (let col = 0; col < this.treeGrid.width; col++) {
				minVisibleHeight = this.checkVisible(col, row, minVisibleHeight, 'left');
			}
			
			minVisibleHeight = 0;
			for (let col = this.treeGrid.width - 1; col >= 0; col--) {
				minVisibleHeight = this.checkVisible(col, row, minVisibleHeight, 'right');
			}
		}
		
		for (let col = 0; col < this.treeGrid.width; col++) {
			let minVisibleHeight = 0;
			for (let row = 0; row < this.treeGrid.height; row++) {
				minVisibleHeight = this.checkVisible(col, row, minVisibleHeight, 'top');
			}
			
			// visible from bottom
			minVisibleHeight = 0;
			for (let row = this.treeGrid.height - 1; row >= 0; row--) {
				minVisibleHeight = this.checkVisible(col, row, minVisibleHeight, 'bottom');
			}
		}

		return `${this.visibleTrees.size}`;
	}

	protected solvePart2(): string {
		let maxScore = 0;

		this.treeGrid.forEachCoord((c) => {
			const score = this.scenicScore(c.x, c.y);
			maxScore = Math.max(maxScore, score);
		});

		return `${maxScore}`;
	}
}

new Day8Solver().solveForArgs();