import { match } from "ts-pattern";
import { Evaluator } from "./evaluator";
import Lexer from "./lexer";
import { Parser } from "./parser";
import invariant from "tiny-invariant";
import { calculatePointsTable, printPointsTable } from "./utils";

async function main() {
  // Try to read from file argument if provided
  const args = process.argv.slice(2);
  const input = await match(args.length > 0)
    .with(true, async () => await Bun.file(args[0]!).text())
    .with(false, async () => await Bun.stdin.text())
    .exhaustive();

  invariant(input, "invariant: input should not be empty");

  const lexer = new Lexer(input);
  const parser = new Parser(lexer);
  const program = parser.parse();
  const evaluator = new Evaluator();
  const { results } = evaluator.evaluate(program);

  const pointsTable = calculatePointsTable(results);
  printPointsTable(pointsTable);
}

if (import.meta.main) {
  await main();
}
