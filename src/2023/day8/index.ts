import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';
import CircularArray  from '../../common/CircularArray';

class Node {
	constructor(public name: string, public left: string, public right: string) {}

	public toString() {
		return `${this.name} = (${this.left}, ${this.right})`;
	}
}

class Day8Solver extends Solver {
	private directions: CircularArray<string> = new CircularArray();
	private nodes: Map<string, Node> = new Map();
	private aNodes: Array<Node> = [];

	public init(inputFile: string): void {
		const groups = InputParser.readLinesInGroups(inputFile);
		this.directions = new CircularArray(groups[0][0].trim().split(''));
		this.sampleLog(this.directions.array.join(''));

		groups[1].forEach(line => {
			const split = line.split(' = ');
			const node = new Node(split[0].trim(), split[1].substring(1, 4), split[1].substring(6, 9));
			this.sampleLog(node.toString());
			this.nodes.set(node.name, node);

			if (node.name.endsWith('A')) {
				this.aNodes.push(node);
			}
		});
	}

	protected solvePart1(): string {
		let steps = 0;
		let curNode = this.nodes.get('AAA');
		while (curNode != null && curNode.name != 'ZZZ') {
			const direction = this.directions.safeGet(steps++);
			curNode = direction === 'L' ? this.nodes.get(curNode.left) : this.nodes.get(curNode.right);
		}
		return `${steps}`;
	}

	protected solvePart2(): string {
		// For each node that ends in A
		//  Loop through and keep note of how many steps it takes to reach each node that ends in Z
		//   Keep going until we start looping (we end up at the same node and index we've seen before)
		// Out of those, take the lowest common denominator
		const aNodeEnds: Array<{ node: string, ends: Array<number> }> = [];
		for (const aNode of this.aNodes) {
			this.sampleLog(`Getting endpoints for node ${aNode.name}`);
			const ends: Array<number> = [];

			const visited = new Set();
			let steps = 0;
			let curNode: Node | undefined = aNode;
			while (curNode != null) {
				const index = steps % this.directions.array.length;
				const direction = this.directions.safeGet(steps++);

				const key = `${index}${curNode.name}`;
				if (visited.has(key)) {
					break;
				}
				visited.add(key);

				curNode = direction === 'L' ? this.nodes.get(curNode.left) : this.nodes.get(curNode.right);

				if (curNode?.name.endsWith('Z')) {
					ends.push(steps);
				}
			}

			aNodeEnds.push({ node: aNode.name, ends });
			console.log(`Found endpoints for node ${aNode.name}: ${ends.join(', ')}`);
		}

		// Found the result by running the endpoint array through an LCM calculator
		// https://www.calculatorsoup.com/calculators/math/lcm.php?input=13939%2C+11309%2C+20777%2C+15517%2C+17621%2C+18673&data=none&action=solve
		return `${'external'}`;
	}
}

new Day8Solver().solveForArgs();