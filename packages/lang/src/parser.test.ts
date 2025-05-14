import { describe, it, expect } from "bun:test";
import Lexer from "./lexer";
import { Parser } from "./parser";
import invariant from "tiny-invariant";
import { GameStatement } from "./ast";

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

    const statement1 = program.statements[0];
    invariant(statement1, "Statement should not be null");
    expect(statement1.tokenLiteral()).toBe("TeamA 2-0 TeamB;");
    expect(statement1).toBeInstanceOf(GameStatement);
    const gameStatement1 = statement1 as GameStatement;
    expect(gameStatement1.leftTeam.tokenLiteral()).toBe("TeamA");
    expect(gameStatement1.leftTeamScore.tokenLiteral()).toBe(2);
    expect(gameStatement1.rightTeam.tokenLiteral()).toBe("TeamB");
    expect(gameStatement1.rightTeamScore.tokenLiteral()).toBe(0);

    const statement2 = program.statements[1];
    invariant(statement2, "Statement should not be null");
    expect(statement2.tokenLiteral()).toBe("TeamA 3-0 TeamC;");
    expect(statement2).toBeInstanceOf(GameStatement);
    const gameStatement2 = statement2 as GameStatement;
    expect(gameStatement2.leftTeam.tokenLiteral()).toBe("TeamA");
    expect(gameStatement2.leftTeamScore.tokenLiteral()).toBe(3);
    expect(gameStatement2.rightTeam.tokenLiteral()).toBe("TeamC");
    expect(gameStatement2.rightTeamScore.tokenLiteral()).toBe(0);

    const statement3 = program.statements[2];
    invariant(statement3, "Statement should not be null");
    expect(statement3.tokenLiteral()).toBe("TeamB 0-1 TeamC;");
    expect(statement3).toBeInstanceOf(GameStatement);
    const gameStatement3 = statement3 as GameStatement;
    expect(gameStatement3.leftTeam.tokenLiteral()).toBe("TeamB");
    expect(gameStatement3.leftTeamScore.tokenLiteral()).toBe(0);
    expect(gameStatement3.rightTeam.tokenLiteral()).toBe("TeamC");
    expect(gameStatement3.rightTeamScore.tokenLiteral()).toBe(1);

    const statement4 = program.statements[3];
    invariant(statement4, "Statement should not be null");
    expect(statement4.tokenLiteral()).toBe("TeamA 0-0 TeamB;");
    expect(statement4).toBeInstanceOf(GameStatement);
    const gameStatement4 = statement4 as GameStatement;
    expect(gameStatement4.leftTeam.tokenLiteral()).toBe("TeamA");
    expect(gameStatement4.leftTeamScore.tokenLiteral()).toBe(0);
    expect(gameStatement4.rightTeam.tokenLiteral()).toBe("TeamB");
    expect(gameStatement4.rightTeamScore.tokenLiteral()).toBe(0);
  });
});
