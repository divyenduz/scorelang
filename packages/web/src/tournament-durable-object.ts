import { DurableObject, env as EnvObject } from "cloudflare:workers";

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
    const games: Array<Game> = (await this.ctx.storage.get("games")) ?? [];
    const tournamentText: string =
      (await this.ctx.storage.get("tournamentText")) ?? "";

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

    await this.ctx.storage.put("games", data.games);
    await this.ctx.storage.put("tournamentText", data.tournamentText);

    return new Response("OK");
  }

  private async handlePut(request: Request): Promise<Response> {
    const data = (await request.json()) as Partial<TournamentState>;

    if (data.games !== undefined) {
      await this.ctx.storage.put("games", data.games);
    }

    if (data.tournamentText !== undefined) {
      await this.ctx.storage.put("tournamentText", data.tournamentText);
    }

    return new Response("OK");
  }
}
