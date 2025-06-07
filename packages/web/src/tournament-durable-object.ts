export interface DurableObjectState {
  storage: DurableObjectStorage;
}

export interface TournamentState {
  games: Array<{
    home: string;
    away: string;
    homeScore: number;
    awayScore: number;
  }>;
  tournamentText: string;
}

export class TournamentDurableObject {
  private state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    
    switch (request.method) {
      case 'GET':
        return this.handleGet();
      case 'POST':
        return this.handlePost(request);
      case 'PUT':
        return this.handlePut(request);
      default:
        return new Response('Method not allowed', { status: 405 });
    }
  }

  private async handleGet(): Promise<Response> {
    const games = await this.state.storage.get<TournamentState['games']>('games') ?? [];
    const tournamentText = await this.state.storage.get<string>('tournamentText') ?? '';
    
    const state: TournamentState = {
      games,
      tournamentText
    };

    return new Response(JSON.stringify(state), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private async handlePost(request: Request): Promise<Response> {
    const data = await request.json() as TournamentState;
    
    await this.state.storage.put('games', data.games);
    await this.state.storage.put('tournamentText', data.tournamentText);
    
    return new Response('OK');
  }

  private async handlePut(request: Request): Promise<Response> {
    const data = await request.json() as Partial<TournamentState>;
    
    if (data.games !== undefined) {
      await this.state.storage.put('games', data.games);
    }
    
    if (data.tournamentText !== undefined) {
      await this.state.storage.put('tournamentText', data.tournamentText);
    }
    
    return new Response('OK');
  }
}
