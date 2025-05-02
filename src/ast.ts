import type { Token } from "./token";

interface Node {
  tokenLiteral(): string;
}

export interface Statement extends Node {
  tokenLiteral(): string;
  statementNode(): void;
}

export class Team {
  constructor(private token: Token, private name: string) {}

  tokenLiteral(): string {
    return this.token.value;
  }
}

export class Score {
  constructor(private token: Token, private value: number) {}

  tokenLiteral(): number {
    return this.value;
  }
}

export class GameStatement implements Statement {
  constructor(
    public token: Token,
    public leftTeam: Team,
    public leftTeamScore: Score,
    public rightTeam: Team,
    public rightTeamScore: Score
  ) {}

  tokenLiteral(): string {
    return `${this.leftTeam.tokenLiteral()} ${this.leftTeamScore.tokenLiteral()}-${this.rightTeamScore.tokenLiteral()} ${this.rightTeam.tokenLiteral()};`;
  }
  statementNode(): void {
    console.log("GameStatement ??");
  }
}

export class Program implements Node {
  constructor(public statements: Statement[]) {}

  tokenLiteral(): string {
    if (this.statements.length > 0) {
      return this.statements[0]!.tokenLiteral();
    } else {
      return "";
    }
  }
}
