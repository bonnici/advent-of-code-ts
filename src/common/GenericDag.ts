/*
Helper class for a DAG of a generic type.
*/

import RedisSortedSet from 'redis-sorted-set';

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

	public shortestPath(from: KeyType, to: KeyType, incrementProgressFn?: () => void): number {
		// Use dijkstra's algorithm to calculate the shortest path between two nodes.

		function consider(
			fromCost: number,
			link: GenericDagLink<KeyType>,
			distances: Map<KeyType, number>,
			// eslint-disable-next-line
			unvisitedSet: any,
		): void {
			const toCost = link.cost;
			const targetCost = fromCost + toCost;
			const toName = link.target.name;
			if (targetCost < (distances.get(toName) || Number.MAX_SAFE_INTEGER)) {
				distances.set(toName, targetCost);
				unvisitedSet.add(toName, targetCost);
			}
		}

		// Mark all nodes unvisited. Create a set of all the unvisited nodes called the unvisited set.
		// Assign to every node a tentative distance value: set it to zero for our initial node and to infinity for all
		// other nodes. The tentative distance of a node v is the length of the shortest path discovered so far between the
		// node v and the starting node. Since initially no path is known to any other vertex than the source itself (which
		// is a path of length zero), all other tentative distances are initially set to infinity. Set the initial node as
		// current.
		const distances: Map<KeyType, number> = new Map();
		// eslint-disable-next-line
		const unvisitedSet: any = new RedisSortedSet();

		this.keys().forEach(key => {
			const cost = key === from ? 0 : Number.MAX_SAFE_INTEGER;
			unvisitedSet.add(key, cost);
			distances.set(key, cost);
		});
		let current = from;

		for (;;) {
			// For the current node, consider all of its unvisited neighbors and calculate their tentative distances through
			// the current node. Compare the newly calculated tentative distance to the current assigned value and assign the
			// smaller one.
			const currentNode = this.getNode(current);
			const currentCost = distances.get(current);
			if (!currentNode || currentCost === undefined || currentCost === Number.MAX_SAFE_INTEGER) {
				throw `Unexpected current node ${currentNode} cost ${currentCost}`;
			}

			// If the destination node has been marked visited, then stop. The algorithm has finished.
			if (current === to) {
				return currentCost;
			}

			for (const link of currentNode.forwardLinks.values()) {
				consider(currentCost, link, distances, unvisitedSet);
			}

			// When we are done considering all of the unvisited neighbors of the current node, mark the current node as
			// visited and remove it from the unvisited set. A visited node will never be checked again.
			unvisitedSet.rem(current);

			if (incrementProgressFn) {
				incrementProgressFn();
			}

			// Otherwise, select the unvisited node that is marked with the smallest tentative distance, set it as the new
			// current node, and go back to step 3.
			const bestUnvisited = unvisitedSet.range(0, 0)[0];
			current = bestUnvisited;
		}
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
