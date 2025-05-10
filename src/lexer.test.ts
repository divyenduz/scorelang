import { describe, it, expect } from "bun:test";
import Lexer from "./lexer";

describe("Lexer", () => {
  it("should tokenize a string with proper team names and structure", () => {
    const input = `TeamA 2-0 TeamB;
    TeamA 3-0 TeamC;
    TeamB 0-1 TeamC;
    TeamA 0-0 TeamB;`;
    const lexer = new Lexer(input);
    [
      { type: "TEAM_NAME" as const, value: "TeamA" },
      { type: "TEAM_SCORE" as const, value: "2" },
      { type: "SCORE_SEPARATOR" as const, value: "-" },
      { type: "TEAM_SCORE" as const, value: "0" },
      { type: "TEAM_NAME" as const, value: "TeamB" },
      { type: "GAME_SEPARATOR" as const, value: ";" },
      { type: "TEAM_NAME" as const, value: "TeamA" },
      { type: "TEAM_SCORE" as const, value: "3" },
      { type: "SCORE_SEPARATOR" as const, value: "-" },
      { type: "TEAM_SCORE" as const, value: "0" },
      { type: "TEAM_NAME" as const, value: "TeamC" },
      { type: "GAME_SEPARATOR" as const, value: ";" },
      { type: "TEAM_NAME" as const, value: "TeamB" },
      { type: "TEAM_SCORE" as const, value: "0" },
      { type: "SCORE_SEPARATOR" as const, value: "-" },
      { type: "TEAM_SCORE" as const, value: "1" },
      { type: "TEAM_NAME" as const, value: "TeamC" },
      { type: "GAME_SEPARATOR" as const, value: ";" },
      { type: "TEAM_NAME" as const, value: "TeamA" },
      { type: "TEAM_SCORE" as const, value: "0" },
      { type: "SCORE_SEPARATOR" as const, value: "-" },
      { type: "TEAM_SCORE" as const, value: "0" },
      { type: "TEAM_NAME" as const, value: "TeamB" },
      { type: "GAME_SEPARATOR" as const, value: ";" },
      { type: "EOF" as const, value: "" },
    ].forEach((expectedToken) => {
      const token = lexer.nextToken();
      expect(token).toEqual(expectedToken);
    });
  });

  it("should tokenize a string with team names with spaces", () => {
    const input = `Manchester United 2-0 Arsenal;`;
    const lexer = new Lexer(input);
    [
      { type: "TEAM_NAME" as const, value: "Manchester United" },
      { type: "TEAM_SCORE" as const, value: "2" },
      { type: "SCORE_SEPARATOR" as const, value: "-" },
      { type: "TEAM_SCORE" as const, value: "0" },
      { type: "TEAM_NAME" as const, value: "Arsenal" },
      { type: "GAME_SEPARATOR" as const, value: ";" },
      { type: "EOF" as const, value: "" },
    ].forEach((expectedToken) => {
      const token = lexer.nextToken();
      expect(token).toEqual(expectedToken);
    });
  })
});
