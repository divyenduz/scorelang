import { DurableObject, env as EnvObject } from "cloudflare:workers";
import { Lexer } from "@scorelang/lang/src/lexer";
import { Parser } from "@scorelang/lang/src/parser";
import { Evaluator } from "@scorelang/lang/src/evaluator";

interface Game {
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
}

export interface TournamentState {
  games: Array<Game>;
  tournamentText: string;
}

export class TournamentDurableObject extends DurableObject<typeof EnvObject> {
  ctx: DurableObjectState;

  constructor(ctx: DurableObjectState, env: typeof EnvObject) {
    super(ctx, env);
    this.ctx = ctx;
  }

  async fetch(request: Request): Promise<Response> {
    switch (request.method) {
      case "GET":
        return this.handleGet();
      case "POST":
        return this.handlePost(request);
      case "PUT":
        return this.handlePut(request);
      default:
        return new Response("Method not allowed", { status: 405 });
    }
  }

  private async handleGet(): Promise<Response> {
    const tournamentText: string =
      (await this.ctx.storage.get("tournamentText")) ?? "";

    const games = this.parseGamesFromText(tournamentText);

    const state: TournamentState = {
      games,
      tournamentText,
    };

    return new Response(JSON.stringify(state), {
      headers: { "Content-Type": "application/json" },
    });
  }

  private async handlePost(request: Request): Promise<Response> {
    const data = (await request.json()) as TournamentState;

    await this.ctx.storage.put("tournamentText", data.tournamentText);

    return new Response("OK");
  }

  private async handlePut(request: Request): Promise<Response> {
    const data = (await request.json()) as Partial<TournamentState>;

    if (data.tournamentText !== undefined) {
      await this.ctx.storage.put("tournamentText", data.tournamentText);
    }

    return new Response("OK");
  }

  private parseGamesFromText(tournamentText: string): Array<Game> {
    if (!tournamentText.trim()) return [];

    try {
      const lexer = new Lexer(tournamentText);
      const parser = new Parser(lexer);
      const program = parser.parse();
      const evaluator = new Evaluator();
      const { results } = evaluator.evaluate(program);

      return results.map((result) => {
        if (result.type === "RESOLVED") {
          return {
            home: result.winningTeam,
            away: result.losingTeam,
            homeScore: result.winningTeamScore,
            awayScore: result.losingTeamScore,
          };
        } else {
          return {
            home: result.leftTeam,
            away: result.rightTeam,
            homeScore: result.leftTeamScore,
            awayScore: result.rightTeamScore,
          };
        }
      });
    } catch (error) {
      console.log("Error parsing tournament text:", error);
      return [];
    }
  }
}
