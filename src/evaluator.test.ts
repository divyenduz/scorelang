import { describe, it, expect } from "bun:test";
import Lexer from "./lexer";
import { Parser } from "./parser";
import invariant from "tiny-invariant";
import { GameStatement } from "./ast";
import { Evaluator } from "./evaluator";

describe("Evaluator", () => {
  it("should evaluate a tournament", () => {
    const input = `TeamA 2-0 TeamB;
    TeamA 3-0 TeamC;
    TeamB 0-1 TeamC;
    TeamA 0-0 TeamB;`;
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parse();
    const evaluator = new Evaluator();
    const { results } = evaluator.evaluate(program);
    expect(results.length).toBe(4);
    expect(results).toEqual([
      {
        type: "RESOLVED",
        winningTeam: "TeamA",
        losingTeam: "TeamB",
        winningTeamScore: 2,
        losingTeamScore: 0,
      },
      {
        type: "RESOLVED",
        winningTeam: "TeamA",
        losingTeam: "TeamC",
        winningTeamScore: 3,
        losingTeamScore: 0,
      },
      {
        type: "RESOLVED",
        winningTeam: "TeamC",
        losingTeam: "TeamB",
        winningTeamScore: 1,
        losingTeamScore: 0,
      },
      {
        type: "DRAW",
        leftTeam: "TeamA",
        rightTeam: "TeamB",
        leftTeamScore: 0,
        rightTeamScore: 0,
      },
    ]);
  });
});
