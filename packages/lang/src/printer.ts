import { Program } from "./ast";

export class Printer {
  constructor(private program: Program) {}

  print() {
    return this.program.statements
      .map((stmt) => stmt.tokenLiteral())
      .join("\n    ");
  }
}
