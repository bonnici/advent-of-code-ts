import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';

interface Result {
	endIndex: number;
	metadataCount: number;
	metadataSum: number;
	value: number;
}

class Day8Solver extends Solver {
	private input: Array<number> = [];

	public init(inputFile: string): void {
		this.input = InputParser.readFirstLineAsInts(inputFile);
	}

	protected solvePart1(): string {
		this.sampleLog('input', this.input);

		const result = this.processNode(0);
		return `${result.metadataSum}`;
	}

	protected solvePart2(): string {
		const nodeValues: Map<number, number> = new Map(); // map of child start index to value
		const result = this.processNode(0, nodeValues);
		return `${result.value}`;
	}

	private processNode(index: number, nodeValues?: Map<number, number>): Result {
		const startIndex = index;
		const numChildNodes = this.input[index++];
		const metadataCount = this.input[index++];
		let metadataSum = 0;

		this.sampleLog(`Processing node with ${numChildNodes} child nodes and ${metadataCount} metadata records`);

		const childIndices = [];
		for (let curChild = 0; curChild < numChildNodes; curChild++) {
			childIndices.push(index);
			const curResult = this.processNode(index, nodeValues);
			index = curResult.endIndex;
			metadataSum += curResult.metadataSum;
		}

		this.sampleLog(`Processing ${metadataCount} metadata records starting at index ${index}`);
		let valueWithChildren = 0;
		for (let curMetadata = 0; curMetadata < metadataCount; curMetadata++) {
			this.sampleLog(`Adding metadata ${this.input[index]} at index ${index}`);
			const metadata = this.input[index++];
			metadataSum += metadata;

			const childIndex = metadata - 1;
			if (childIndex >= 0 && childIndex < numChildNodes && !!nodeValues) {
				const childValue = nodeValues?.get(childIndices[childIndex]);
				if (childValue === undefined) {
					this.sampleLog(`Did not find expected child value ${childIndex} ${childIndices[childIndex]}`);
				} else {
					valueWithChildren += childValue;
				}
			}
		}

		const value = numChildNodes === 0 ? metadataSum : valueWithChildren;
		this.sampleLog(`Value on node at starting index ${startIndex} is ${value} (metadataSum=${metadataSum}, valueWithChildren=${valueWithChildren})`);
		if (nodeValues) {
			nodeValues.set(startIndex, value);
		}

		return { endIndex: index, metadataCount, metadataSum, value };
	}
}

new Day8Solver().solveForArgs();
