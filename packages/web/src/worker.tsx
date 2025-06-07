import { TournamentDurableObject } from "./tournament-durable-object";

export { TournamentDurableObject };

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": request.headers.get("Origin") || "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Handle preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    // Handle API routes for tournament state
    if (url.pathname.startsWith("/api/tournament/")) {
      const tournamentId = url.pathname.split("/api/tournament/")[1];
      if (!tournamentId) {
        return new Response("Tournament ID required", {
          status: 400,
          headers: corsHeaders,
        });
      }

      const durableObjectId = env.TOURNAMENT_DO.idFromName(tournamentId);
      const durableObject = env.TOURNAMENT_DO.get(durableObjectId);
      const response = await durableObject.fetch(request);

      // Add CORS headers to the response
      const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers),
          ...corsHeaders,
        },
      });

      return newResponse;
    }

    // Serve static files from the public directory
    if (
      url.pathname.startsWith("/assets/") ||
      url.pathname.endsWith(".css") ||
      url.pathname.endsWith(".js")
    ) {
      // Let Cloudflare serve static assets
      return env.ASSETS.fetch(request);
    }

    // For all other routes, serve the index.html (SPA routing)
    const indexResponse = await env.ASSETS.fetch(
      new Request(new URL("/index.html", request.url))
    );

    if (indexResponse.ok) {
      return new Response(indexResponse.body, {
        status: 200,
        headers: {
          "Content-Type": "text/html",
          ...indexResponse.headers,
        },
      });
    }

    return new Response("Not found", { status: 404 });
  },
};
