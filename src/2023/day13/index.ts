import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';
import { binaryNumberToString } from '../../common/Utils';

class Day13Solver extends Solver {
	private input: Array<Array<string>> = [];

	public init(inputFile: string): void {
		this.input = InputParser.readLinesInGroups(inputFile);
	}

	protected solvePart1(): string {
		let result = 0;

		let curGroup = 0;
		for (const group of this.input) {
			if (group.length === 0) {
				continue;
			}

			const groupResult = this.findReflection(group, curGroup);

			if (groupResult === 0) {
				console.log(`Did not find mirrored cols or rows in group ${curGroup}`);
				console.log(group.join('\n'));
			}

			result += groupResult;
			curGroup++;
		}

		return `${result}`;
	}

	protected solvePart2(): string {
		let result = 0;

		let curGroup = 0;
		for (const group of this.input) {
			if (group.length === 0) {
				continue;
			}
			
			const groupResult = this.findReflectionWithSmudge(group, curGroup);

			if (groupResult === 0) {
				console.log(`Did not find mirrored cols or rows in group ${curGroup}`);
				console.log(group.join('\n'));
			}

			result += groupResult;
			curGroup++;
		}

		return `${result}`;
	}

	private findReflection(group: string[], curGroup: number): number {
		// Build array of columns and an array of rows, both represented as binary numbers
		const cols = new Array(group[0].length).fill(0);
		const rows = [];
		for (const line of group) {
			let row = 0;
			for (let i = 0; i < line.length; i++) {
				row = row << 1;
				cols[i] = cols[i] << 1;
				if (line.charAt(i) === '#') {
					row = row | 1;
					cols[i] = cols[i] | 1;
				}
			}
			rows.push(row);
		}

		return this.findReflectionForNumbers(cols, rows, 0, curGroup, group.length, group[0].length);
	}

	private findReflectionWithSmudge(group: string[], curGroup: number): number {
		// Build array of columns and an array of rows, both represented as binary numbers
		const cols = new Array(group[0].length).fill(0);
		const rows = [];
		for (const line of group) {
			let row = 0;
			for (let i = 0; i < line.length; i++) {
				row = row << 1;
				cols[i] = cols[i] << 1;
				if (line.charAt(i) === '#') {
					row = row | 1;
					cols[i] = cols[i] | 1;
				}
			}
			rows.push(row);
		}

		const rowLength = group[0].length;
		const colLength = group.length;
		
		const existingReflection = this.findReflectionForNumbers(cols, rows, 0, curGroup, colLength, rowLength);

		// Go through each possible smudge and return the first one with a reflection
		if (process.env.SAMPLE_FILE) {
			this.sampleLog(`\nProcessing group ${curGroup}: rowLength ${rowLength} colLength ${colLength} existingReflection ${existingReflection}`);
			this.sampleLog(`rows: \n${rows.map(row => binaryNumberToString(row, rowLength)).join('\n')}`);
			this.sampleLog(`cols: \n${cols.map(col => binaryNumberToString(col, colLength)).join('\n')}`);
		}
		for (let smudgeRow = 0; smudgeRow < rows.length; smudgeRow++) {
			for (let smudgeCol = 0; smudgeCol < cols.length; smudgeCol++) {
				const smudgedCols = [...cols];
				const smudgedRows = [...rows];

				smudgedRows[smudgeRow] = smudgedRows[smudgeRow] ^ (1 << (rowLength - 1 - smudgeCol));
				smudgedCols[smudgeCol] = smudgedCols[smudgeCol] ^ (1 << (colLength - 1 - smudgeRow));
				
				if (process.env.SAMPLE_FILE && (smudgeRow <= 1 || smudgeCol <= 1)) {
					this.sampleLog(`smudgeRow ${smudgeRow} smudgeCol ${smudgeCol}`);
					this.sampleLog(`smudgedRows: \n${smudgedRows.map(row => binaryNumberToString(row, rowLength)).join('\n')}`);
					this.sampleLog(`smudgedCols: \n${smudgedCols.map(col => binaryNumberToString(col, colLength)).join('\n')}`);
				}

				const result = this.findReflectionForNumbers(smudgedCols, smudgedRows, existingReflection, curGroup, colLength, rowLength);
				if (result > 0) {
					return result;
				}
			}
		}

		return 0;
	}

	private findReflectionForNumbers(cols: number[], rows: number[], invalidScore: number, curGroup: number, colLength: number, rowLength: number): number {
		// Check to see if a col has a mirrored copy before it
		if (process.env.SAMPLE_FILE) {
			this.sampleLog(`cols: \n${cols.map(col => binaryNumberToString(col, colLength)).join('\n')}`);
		}
		for (let curCol = 1; curCol < cols.length; curCol++) {
			let mirroredCols = 0;
			let isMirrored = true;
			while (curCol + mirroredCols < cols.length && curCol - 1 - mirroredCols >= 0) {
				if (cols[curCol + mirroredCols] === cols[curCol - 1 - mirroredCols]) {
					mirroredCols++;
				}
				else {
					isMirrored = false;
					break;
				}
			}

			if (isMirrored) {
				const score = curCol;
				if (score !== invalidScore) {
					if (process.env.SAMPLE_FILE) {
						this.sampleLog(`Found mirrored cols in group ${curGroup} for col #${curCol} (${binaryNumberToString(cols[curCol], colLength)})`);
					}
					return score;
				}
			}
		}

		// Do same for rows
		if (process.env.SAMPLE_FILE) {
			this.sampleLog(`rows: \n${rows.map(row => binaryNumberToString(row, rowLength)).join('\n')}`);
		}
		for (let curRow = 1; curRow < rows.length; curRow++) {
			let mirroredRows = 0;
			let isMirrored = true;
			while (curRow + mirroredRows < rows.length && curRow - 1 - mirroredRows >= 0) {
				if (rows[curRow + mirroredRows] === rows[curRow - 1 - mirroredRows]) {
					mirroredRows++;
				}
				else {
					isMirrored = false;
					break;
				}
			}

			if (isMirrored) {
				const score = (curRow * 100);
				if (score !== invalidScore) {
					if (process.env.SAMPLE_FILE) {
						this.sampleLog(`Found mirrored rows in group ${curGroup} for row #${curRow} (${binaryNumberToString(rows[curRow], rowLength)})`);
					}
					return score;
				}
			}
		}

		return 0;
	}
}

new Day13Solver().solveForArgs();