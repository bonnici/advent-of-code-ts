/*
Helper class for a DAG of a generic type.
*/

export interface GenericDagLink<KeyType> {
	target: GenericDagNode<KeyType>;
	cost: number;
}

export class GenericDagNode<KeyType> {
	public backLinks: Map<KeyType, GenericDagLink<KeyType>>;
	public forwardLinks: Map<KeyType, GenericDagLink<KeyType>>;

	constructor(readonly name: KeyType) {
		this.backLinks = new Map();
		this.forwardLinks = new Map();
	}

	// For when using this as an undirected graph
	public allLinkNames(): Array<KeyType> {
		return [...this.backLinks.keys(), ...this.forwardLinks.keys()];
	}
}

export default class GenericDag<KeyType> {
	private readonly nodes: Map<KeyType, GenericDagNode<KeyType>>;

	constructor() {
		this.nodes = new Map();
	}

	public size(): number {
		return this.nodes.size;
	}

	public keys(): Array<KeyType> {
		return [...this.nodes.keys()];
	}

	public getNode(name: KeyType): GenericDagNode<KeyType> | null {
		return this.nodes.get(name) || null;
	}

	public addLink(from: KeyType, to: KeyType, bidirectional = false, cost = 1): void {
		let fromNode = this.nodes.get(from);
		if (!fromNode) {
			fromNode = new GenericDagNode<KeyType>(from);
			this.nodes.set(from, fromNode);
		}

		let toNode = this.nodes.get(to);
		if (!toNode) {
			toNode = new GenericDagNode<KeyType>(to);
			this.nodes.set(to, toNode);
		}

		fromNode.forwardLinks.set(to, { target: toNode, cost });
		toNode.backLinks.set(from, { target: fromNode, cost });

		if (bidirectional) {
			toNode.forwardLinks.set(from, { target: fromNode, cost });
			fromNode.backLinks.set(to, { target: toNode, cost });
		}
	}

	public removeNode(name: KeyType): void {
		const toRemove = this.nodes.get(name);

		if (!toRemove) {
			return;
		}

		toRemove.forwardLinks.forEach(node => node.target.backLinks.delete(name));
		toRemove.backLinks.forEach(node => node.target.forwardLinks.delete(name));

		this.nodes.delete(name);
	}

	public toString(): string {
		let result = '';
		for (const [key, value] of this.nodes) {
			const back = [...value.backLinks.keys()].join(',');
			const forward = [...value.forwardLinks.keys()].join(',');
			result += `${key}: back=[${back}], forward=[${forward}]\n`;
		}
		return result;
	}

	public toGraphString(): string {
		let result = '';
		for (const [key, value] of this.nodes) {
			result += `${key}: ${value.allLinkNames()}\n`;
		}
		return result;
	}

	public toGraphStringVerbose(): string {
		let result = '';
		for (const [key, value] of this.nodes) {
			result += `${key}: backlinks: ${[...value.backLinks.keys()].join(', ')}, forwardlinks: ${[...value.forwardLinks.keys()].join(', ')}\n`;
		}
		return result;
	}
}
