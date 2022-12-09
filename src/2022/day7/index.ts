import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';
import GenericDag from '../../common/GenericDag';

class Day7Solver extends Solver {
	private input: Array<string> = [];
	private dirDag = new GenericDag<string>();
	private dirSizes = new Map<string, number>();
	private dirTotalSizes = new Map<string, number>();

	public init(inputFile: string): void {
		this.input = InputParser.readLines(inputFile);
		this.buildDirDetails();
	}

	private recursiveDirSize(dir: string): number {
		let totalSize = this.dirSizes.get(dir) || 0;

		const subdirs = [...(this.dirDag.getNode(dir)?.forwardLinks?.keys() || [])];
		for (const subdir of subdirs) {
			totalSize += this.recursiveDirSize(subdir);
		}

		return totalSize;
	}

	private buildDirDetails() {let i = 0;
		let curDir = '/';
		while (i < this.input.length) {
			let line = this.input[i];
			this.sampleLog(`Processing line: ${line}`);
			
			if (line.charAt(0) !== '$') {
				throw 'should have skipped through this row';
			}

			const split = line.split(' ');
			const cmd = split[1];

			switch (cmd) {
			case 'cd': {
				const to = split[2];
				if (to === '..') {
					const node = this.dirDag.getNode(curDir);
					curDir = [...(node?.backLinks?.keys() || [])][0];
				} else if (to === '/') {
					curDir = '/';
				} else {
					curDir = `${curDir}${to}/`;
				}
				this.sampleLog(`Changed directory to: ${curDir}`);
				i++;
				break;
			}
			case 'ls': {
				line = this.input[++i];
				let dirSize = 0;
				while (line && line.charAt(0) !== '$') {
					const dirSplit = line.split(' ');
					if (dirSplit[0] === 'dir') {
						const linkDir = `${curDir}${dirSplit[1]}/`;
						this.dirDag.addLink(curDir, linkDir);
						this.sampleLog(`Added DAG link: ${curDir} -> ${linkDir}`);
					} else {
						const size = parseInt(dirSplit[0]);
						dirSize += size;
						this.sampleLog(`Added size ${size} to get ${dirSize}`);
					}

					line = this.input[++i];
				}

				this.dirSizes.set(curDir, dirSize);
				this.sampleLog(`Set size for dir ${curDir} to ${dirSize}`);
				break;
			}
			default:
				throw 'unexpected command';
			}
		}

		this.sampleLog(`DAG:\n${this.dirDag.toGraphStringVerbose()}`);
		
		const allDirs = this.dirDag.keys();
		for (const dir of allDirs) {
			const totalSize = this.recursiveDirSize(dir);
			this.dirTotalSizes.set(dir, totalSize);
		}
	}

	protected solvePart1(): string {
		let sum = 0;
		for (const dir of this.dirTotalSizes.keys()) {
			const totalSize = this.dirTotalSizes.get(dir) || 0;
			if (totalSize <= 100000) {
				sum += totalSize;
			}
		}

		return `${sum}`;
	}

	protected solvePart2(): string {
		const rootSize = this.dirTotalSizes.get('/') || 0;
		const used = 70000000 - rootSize;
		const spaceToDelete = 30000000 - used;
		this.sampleLog(`rootSize=${rootSize}, used=${used}, spaceToDelete=${spaceToDelete}`);

		let minSize = Infinity;
		for (const dir of this.dirTotalSizes.keys()) {
			const totalSize = this.dirTotalSizes.get(dir) || 0;
			if (totalSize > spaceToDelete) {
				minSize = Math.min(minSize, totalSize);
			}
		}

		return `${minSize}`;
	}
}

new Day7Solver().solveForArgs();