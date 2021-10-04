import inquirer from "inquirer";
import { execSync } from "child_process";
import * as fs from 'fs';
import Scaffolder from "./Scaffolder";

export class CliDriver {
  private verbose = false;
  private lastMainOption = 'p1';

  public async run(yearOverride: number | undefined): Promise<void> {
    for (;;) {
      const currentYear = yearOverride || CliDriver.detectCurrentYear();
      const currentDay = CliDriver.detectCurrentDay(currentYear);
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
          await CliDriver.scaffold(currentYear, currentDay + 1);
          break;
        case 'scaffold':
          await CliDriver.promptScaffold(currentYear, currentDay + 1);
          break;
        case 'verbose':
          this.verbose = !this.verbose;
          break;
        case 'quit':
          process.exit(0);
          return;
        default:
          console.log(`Unrecognised option ${mainOption}`);
          process.exit(1);
          return;
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

  private static async promptScaffold(defaultYear: number, defaultDay: number) {
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

    CliDriver.scaffold(result.year, result.day);
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

  private static scaffold(year: number, day: number) {
    try {
      Scaffolder.scaffold(year, day);
    } catch (e) {
      console.error(`Error scaffolding day ${day}`, e);
    }
  }

  private static detectCurrentYear(): number {
    for (let year = 2020; year < 2100; year++) {
      const exists = fs.existsSync(`./src/${year}`)
      if (!exists) {
        return year - 1;
      }
    }
    return 2020;
  }

  private static detectCurrentDay(year: number): number {
    for (let day = 1; day < 30; day++) {
      const exists = fs.existsSync(`./src/${year}/day${day}`)
      if (!exists) {
        return day - 1;
      }
    }
    return 1;
  }
}

const args = process.argv.slice(2);
const yearOverride = parseInt(args[0]) || undefined;

new CliDriver().run(yearOverride)
  .then(() => {
    console.log('Done.');
  })
  .catch((error) => {
    console.error(error);
  });
