import { TournamentDurableObject } from './tournament-durable-object';

export { TournamentDurableObject };

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);
    
    // Handle API routes for tournament state
    if (url.pathname.startsWith('/api/tournament/')) {
      const tournamentId = url.pathname.split('/api/tournament/')[1];
      if (!tournamentId) {
        return new Response('Tournament ID required', { status: 400 });
      }
      
      const durableObjectId = env.TOURNAMENT_DO.idFromName(tournamentId);
      const durableObject = env.TOURNAMENT_DO.get(durableObjectId);
      return durableObject.fetch(request);
    }
    
    // Serve static files from the public directory
    if (url.pathname.startsWith('/assets/') || url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) {
      // Let Cloudflare serve static assets
      return env.ASSETS.fetch(request);
    }
    
    // For all other routes, serve the index.html (SPA routing)
    const indexResponse = await env.ASSETS.fetch(new Request(new URL('/index.html', request.url)));
    
    if (indexResponse.ok) {
      return new Response(indexResponse.body, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
          ...indexResponse.headers,
        },
      });
    }
    
    return new Response('Not found', { status: 404 });
  },
};
