import inquirer from "inquirer";
import { execSync } from "child_process";
import * as fs from 'fs';
import Scaffolder from "./Scaffolder";

export class CliDriver {
  private verbose = false;
  private lastMainOption = 'p1';
  private yearOverride: number | null = null;

  public async run() {
    while (true) {
      let currentYear = this.yearOverride || this.detectCurrentYear();
      let currentDay = this.detectCurrentDay(currentYear);
      const mainOption = await this.promptMainOption(currentYear, currentDay);
      switch (mainOption) {
        case 'p1':
          await this.execSolution(currentYear, currentDay, 1, 'input.txt');
          break;
        case 'p2':
          await this.execSolution(currentYear, currentDay, 2, 'input.txt');
          break;
        case 'p1s':
          await this.execSolution(currentYear, currentDay, 1, 'sample.p1.txt', 'sample.p1.expected.txt');
          break;
        case 'p2s':
          await this.execSolution(currentYear, currentDay, 2, 'sample.p2.txt', 'sample.p2.expected.txt');
          break;
        case 'solve':
          await this.promptSolution(currentYear, currentDay);
          break;
        case 'next':
          await this.scaffold(currentYear, currentDay + 1);
          break;
        case 'scaffold':
          await this.promptScaffold(currentYear, currentDay + 1);
          break;
        case 'override':
          await this.promptOverrideYear();
          break;
        case 'verbose':
          this.verbose = !this.verbose;
          break;
        case 'quit':
          process.exit(0);
          break;
        default:
          console.log(`Unrecognised option ${mainOption}`);
          process.exit(1);
          break;
      }
    }
  }

  private async promptMainOption(year: number, day: number): Promise<string> {
    const result = await inquirer.prompt([
      {
        type: 'rawlist',
        name: 'mainOption',
        message: `Currently on ${year} Day ${day}${this.verbose ? ' in verbose mode' : ''}. Select an option:`,
        choices: [
          { name: `Part 1 solution`, value: 'p1' },
          { name: 'Part 2 solution', value: 'p2' },
          { name: 'Part 1 sample solution', value: 'p1s' },
          { name: 'Part 2 sample solution', value: 'p2s' },
          { name: 'Run another solution', value: 'solve' },
          { name: `Scaffold Day ${day + 1}`, value: 'next' },
          { name: 'Scaffold another day', value: 'scaffold' },
          { name: 'Override year', value: 'override' },
          { name: 'Toggle verbose mode', value: 'verbose' },
          { name: 'Quit', value: 'quit' },
        ],
        default: this.lastMainOption,
        pageSize: 15,
      }
    ]);
    this.lastMainOption = result.mainOption;
    return result.mainOption;
  }

  private async promptSolution(defaultYear: number, defaultDay: number) {
    const result = await inquirer.prompt([
      {
        type: 'number',
        name: 'year',
        message: 'What year?',
        default: defaultYear,
      },
      {
        type: 'number',
        name: 'day',
        message: 'What day?',
        default: defaultDay,
      },
      {
        type: 'number',
        name: 'part',
        message: 'What part?',
        default: 1,
      },
      {
        type: 'input',
        name: 'input',
        message: 'What is the input file name?',
        default: 'input.txt',
      },
      {
        type: 'input',
        name: 'expected',
        message: 'What is the expected result file name? (optional)',
        default: '',
      }
    ]);

    await this.execSolution(result.year, result.day, result.part, result.input, result.expected);
  }

  private async promptScaffold(defaultYear: number, defaultDay: number) {
    const result = await inquirer.prompt([
      {
        type: 'number',
        name: 'year',
        message: 'What year?',
        default: defaultYear,
      },
      {
        type: 'number',
        name: 'day',
        message: 'What day?',
        default: defaultDay,
      }
    ]);

    this.scaffold(result.year, result.day);
  }

  private async promptOverrideYear() {
    const result = await inquirer.prompt([
      {
        type: 'number',
        name: 'year',
        message: 'What year?',
      },
    ]);

    this.yearOverride = result.year;
  }

  private async execSolution(year: number, day: number, part: number, inputFile: string, expectFile?: string) {
    try {
      const prefix = `src/${year}/day${day}/`;
      const expected = expectFile ? ` src/${year}/day${day}/${expectFile}` : '';
      const command = `${this.verbose ? 'VERBOSE=1 ' : ''}npx ts-node "${prefix}index.ts" "${prefix}${inputFile}" ${part}${expected}`;
      console.log(`Running command: ${command}`);
      execSync(
        command,
        {stdio: 'inherit'}
      );
    } catch (e) {
      console.error('Error running solution', e);
    }
  }

  private scaffold(year: number, day: number) {
    try {
      Scaffolder.scaffold(year, day);
    } catch (e) {
      console.error(`Error scaffolding day ${day}`, e);
    }
  }

  private detectCurrentYear(): number {
    for (let year = 2020; year < 2100; year++) {
      const exists = fs.existsSync(`./src/${year}`)
      if (!exists) {
        return year - 1;
      }
    }
    return 2020;
  }

  private detectCurrentDay(year: number): number {
    for (let day = 1; day < 30; day++) {
      const exists = fs.existsSync(`./src/${year}/day${day}`)
      if (!exists) {
        return day - 1;
      }
    }
    return 1;
  }
}

new CliDriver().run()
  .then(() => {
    console.log('Done.');
  })
  .catch((error) => {
    console.error(error);
  });
