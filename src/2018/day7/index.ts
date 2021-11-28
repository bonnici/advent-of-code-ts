import { Solver } from '../../common/Solver';
import { InputParser}  from '../../common/InputParser';
import GenericDag from '../../common/GenericDag';

const inputRe = /Step ([A-Z]) must be finished before step ([A-Z]) can begin\./;

class Day7Solver extends Solver {
	private input: Array<string> = [];

	public init(inputFile: string): void {
		this.input = InputParser.readLines(inputFile);
	}

	protected solvePart1(): string {
		const dag = this.dagFromInput();

		const steps: Array<string> = [];

		while (dag.size() > 0) {
			this.sampleLog(`Checking for available steps, DAG size is ${dag.size()}`);
			for (let curStep = 'A'; curStep <= 'Z'; curStep = String.fromCharCode(curStep.charCodeAt(0) + 1)) {
				const node = dag.getNode(curStep);
				if (node && node.backLinks.size === 0) {
					this.sampleLog(`Found available step, removing ${curStep}`);
					dag.removeNode(curStep);
					steps.push(curStep);
					break;
				}
			}
		}

		return steps.join('');
	}

	protected solvePart2(isSample?: boolean): string {
		const extraSeconds = isSample ? 0 : 60;
		const numWorkers = isSample ? 2 : 6;

		const dag = this.dagFromInput();
		let numSeconds = 0;

		// The second that each worker is available and the step that they are working, null if they are available now
		const workerStatus: Array<{ available: number, step: string} | null> = Array(numWorkers).fill(null);
		// The worker assigned to each step
		const stepWorkers: Map<string, number> = new Map();

		this.initProgress(10000);

		while (dag.size() > 0) {
			for (let curWorker = 0; curWorker < numWorkers; curWorker++) {
				const curStatus = workerStatus[curWorker];
				if (curStatus !== null && curStatus.available <= numSeconds) {
					const workedStep = curStatus.step;
					if (workedStep === null) {
						throw 'Should be working a step';
					}
					this.sampleLog(`Worker ${curWorker} who was on step ${workedStep} is now available`);
					stepWorkers.delete(workedStep);
					workerStatus[curWorker] = null;
					dag.removeNode(workedStep);
				}
			}

			this.sampleLog(`Checking for available steps, DAG size is ${dag.size()}`);
			const readySteps = [];
			for (let curStep = 'A'; curStep <= 'Z'; curStep = String.fromCharCode(curStep.charCodeAt(0) + 1)) {
				const node = dag.getNode(curStep);
				if (node && node.backLinks.size === 0) {
					readySteps.push(curStep);
				}
			}

			this.sampleLog(`At second ${numSeconds}, available steps are [${readySteps.join('')}], worked steps are [${[...stepWorkers.keys()].join('')}], workers working are [${[...stepWorkers.values()].join('')}]`);

			for (const curStep of readySteps) {
				if (!stepWorkers.has(curStep)) {
					const availableWorker = workerStatus.findIndex(w => w === null);
					if (availableWorker >= 0) {
						const available = numSeconds + extraSeconds + (curStep.charCodeAt(0) - 'A'.charCodeAt(0)) + 1;
						workerStatus[availableWorker] = {
							available,
							step: curStep,
						};
						stepWorkers.set(curStep, availableWorker);
						this.sampleLog(`Assigned worker ${availableWorker} to step ${curStep}, available at ${available}`);
					} else {
						this.sampleLog(`No worker free to work step ${curStep}`);
					}
				}
			}

			this.incrementProgress();
			numSeconds++;
		}

		this.stopProgress();

		return `${numSeconds-1}`;
	}

	private dagFromInput(): GenericDag<string> {
		const dag = new GenericDag<string>();
		this.input.forEach(line => {
			const match = line.match(inputRe) || [];
			if (match.length < 3) {
				throw 'bad input';
			}
			dag.addLink(match[1], match[2]);
			this.sampleLog(`Added link ${match[1]} => ${match[2]}`);
		});
		return dag;
	}
}

new Day7Solver().solveForArgs();
