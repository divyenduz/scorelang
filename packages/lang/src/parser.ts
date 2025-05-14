import invariant from "tiny-invariant";
import { GameStatement, Program, Score, Team, type Statement } from "./ast";
import { Lexer } from "./lexer";
import type { Token } from "./token";
import { match } from "ts-pattern";

export class Parser {
  private currentToken: Token = { type: "UNDEFINED", value: "" };
  private peekToken: Token = { type: "UNDEFINED", value: "" };

  constructor(private lexer: Lexer) {
    this.nextToken();
    this.nextToken();
  }

  nextToken(): Token {
    this.currentToken = this.peekToken;
    const nextToken = this.lexer.nextToken();
    invariant(nextToken, "invariant: next token called after EOF");
    this.peekToken = nextToken;
    const token = this.currentToken;
    invariant(token, "invariant: next token called after EOF");
    return token;
  }

  expectPeekToken(type: Token["type"]): boolean {
    invariant(this.peekToken, "Peek token should not be null");
    if (this.peekToken.type === type) {
      this.nextToken();
      return true;
    }
    return false;
  }

  parseGameStatement(): GameStatement {
    invariant(this.currentToken, "Current token should not be null");
    invariant(this.peekToken, "Peek token should not be null");
    const leftTeamNameToken = this.currentToken;
    invariant(
      this.expectPeekToken("TEAM_SCORE"),
      `Expected TEAM_SCORE, got ${this.peekToken?.type}`
    );
    const leftTeamScoreToken = this.currentToken;

    invariant(
      this.expectPeekToken("SCORE_SEPARATOR"),
      `Expected SCORE_SEPARATOR, got ${this.peekToken?.type}`
    );

    invariant(
      this.expectPeekToken("TEAM_SCORE"),
      `Expected TEAM_SCORE, got ${this.peekToken?.type}`
    );
    const rightTeamScoreToken = this.currentToken;

    invariant(
      this.expectPeekToken("TEAM_NAME"),
      `Expected TEAM_NAME, got ${this.peekToken?.type}`
    );
    const rightTeamNameToken = this.currentToken;

    invariant(
      this.expectPeekToken("GAME_SEPARATOR"),
      `Expected GAME_SEPARATOR, got ${this.peekToken?.type}`
    );

    return new GameStatement(
      this.currentToken,
      new Team(leftTeamNameToken, leftTeamNameToken.value),
      new Score(leftTeamScoreToken, parseInt(leftTeamScoreToken.value)),
      new Team(rightTeamNameToken, rightTeamNameToken.value),
      new Score(rightTeamScoreToken, parseInt(rightTeamScoreToken.value))
    );
  }

  parseStatement(): Statement | null {
    invariant(this.currentToken, "Current token should not be null");
    invariant(this.peekToken, "Peek token should not be null");

    const statement = match({
      currentTokenType: this.currentToken?.type,
      peekTokenType: this.peekToken?.type,
    })
      .with(
        { currentTokenType: "TEAM_NAME", peekTokenType: "TEAM_SCORE" },
        () => this.parseGameStatement()
      )
      .otherwise(() => null);
    return statement;
  }

  parse(): Program {
    const program = new Program([]);
    while (this.currentToken?.type !== "EOF") {
      const statement = this.parseStatement();
      invariant(statement, "Statement should not be null");
      program.statements.push(statement);
      this.nextToken();
    }
    return program;
  }
}
