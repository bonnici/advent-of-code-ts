/*
Helper class for a DAG of a generic type.
*/

export class GenericDagNode<Type> {
	public backLinks: Map<Type, GenericDagNode<Type>>;
	public forwardLinks: Map<Type, GenericDagNode<Type>>;

	constructor(private readonly name: Type) {
		this.backLinks = new Map();
		this.forwardLinks = new Map();
	}

	// For when using this as an undirected graph
	public allLinkNames(): Array<Type> {
		return [...this.backLinks.keys(), ...this.forwardLinks.keys()];
	}
}

export default class GenericDag<Type> {
	private readonly nodes: Map<Type, GenericDagNode<Type>>;

	constructor() {
		this.nodes = new Map();
	}

	public size(): number {
		return this.nodes.size;
	}

	public getNode(name: Type): GenericDagNode<Type> | null {
		return this.nodes.get(name) || null;
	}

	public addLink(from: Type, to: Type): void {
		let fromNode = this.nodes.get(from);
		if (!fromNode) {
			fromNode = new GenericDagNode<Type>(from);
			this.nodes.set(from, fromNode);
		}

		let toNode = this.nodes.get(to);
		if (!toNode) {
			toNode = new GenericDagNode<Type>(to);
			this.nodes.set(to, toNode);
		}

		fromNode.forwardLinks.set(to, toNode);
		toNode.backLinks.set(from, fromNode);
	}

	public removeNode(name: Type): void {
		const toRemove = this.nodes.get(name);

		if (!toRemove) {
			return;
		}

		toRemove.forwardLinks.forEach(node => node.backLinks.delete(name));
		toRemove.backLinks.forEach(node => node.forwardLinks.delete(name));

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
}
