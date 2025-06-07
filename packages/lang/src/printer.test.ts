import { describe, it, expect } from "bun:test";
import Lexer from "./lexer";
import { Parser } from "./parser";
import invariant from "tiny-invariant";
import { Printer } from "./printer";

describe("Parser", () => {
  it("should parse a game", () => {
    const input = `TeamA 2-0 TeamB;
    TeamA 3-0 TeamC;
    TeamB 0-1 TeamC;
    TeamA 0-0 TeamB;`;
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parse();
    expect(program).not.toBeNull();
    invariant(program, "Program should not be null");
    expect(program.statements.length).toBe(4);

    const printer = new Printer(program);
    const output = printer.print();
    expect(output).toBe(input);
  });
});
