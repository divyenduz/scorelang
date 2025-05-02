import invariant from "tiny-invariant";
import { GameStatement, Program } from "./ast";
import { match, P } from "ts-pattern";

export type GameResult = GameResolvedResult | GameDrawResult;

type GameResolvedResult = {
  type: "RESOLVED";
  winningTeam: string;
  losingTeam: string;
  winningTeamScore: number;
  losingTeamScore: number;
};

type GameDrawResult = {
  type: "DRAW";
  leftTeam: string;
  rightTeam: string;
  leftTeamScore: number;
  rightTeamScore: number;
};

export class Evaluator {
  evaluate(program: Program) {
    const statements = program.statements;

    const results: GameResult[] = [];

    for (const statement of statements) {
      if (statement instanceof GameStatement) {
        const gameStatement = statement as GameStatement;

        const result: GameResult = match(gameStatement)
          .with(
            P.when(({ leftTeamScore, rightTeamScore }) => {
              return (
                leftTeamScore.tokenLiteral() === rightTeamScore.tokenLiteral()
              );
            }),
            ({ leftTeam, rightTeam, leftTeamScore, rightTeamScore }) => {
              return {
                type: "DRAW" as const,
                leftTeam: leftTeam.tokenLiteral(),
                rightTeam: rightTeam.tokenLiteral(),
                leftTeamScore: leftTeamScore.tokenLiteral(),
                rightTeamScore: rightTeamScore.tokenLiteral(),
              };
            }
          )
          .with(
            P.when(({ leftTeamScore, rightTeamScore }) => {
              return (
                leftTeamScore.tokenLiteral() > rightTeamScore.tokenLiteral()
              );
            }),
            ({ leftTeam, rightTeam, leftTeamScore, rightTeamScore }) => {
              return {
                type: "RESOLVED" as const,
                winningTeam: leftTeam.tokenLiteral(),
                losingTeam: rightTeam.tokenLiteral(),
                winningTeamScore: leftTeamScore.tokenLiteral(),
                losingTeamScore: rightTeamScore.tokenLiteral(),
              };
            }
          )
          .otherwise(
            ({ leftTeam, rightTeam, leftTeamScore, rightTeamScore }) => {
              return {
                type: "RESOLVED" as const,
                winningTeam: rightTeam.tokenLiteral(),
                losingTeam: leftTeam.tokenLiteral(),
                winningTeamScore: rightTeamScore.tokenLiteral(),
                losingTeamScore: leftTeamScore.tokenLiteral(),
              };
            }
          );

        results.push(result);
      } else {
        invariant(
          false,
          `invariant: unknown statement type, ${JSON.stringify(
            statement,
            null,
            2
          )}`
        );
      }
    }

    return { results };
  }
}
