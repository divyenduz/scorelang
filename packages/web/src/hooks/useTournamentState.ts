import { useState, useEffect, useCallback } from "react";

type Team = "🩷 Team A" | "⚪ Team B" | "⚫ Team C";

type Game = {
  home: Team;
  away: Team;
  homeScore: number;
  awayScore: number;
};

interface TournamentState {
  games: Game[];
  tournamentText: string;
}

export function useTournamentState(tournamentId: string) {
  const [games, setGames] = useState<Game[]>([
    { home: "🩷 Team A", away: "⚪ Team B", homeScore: 0, awayScore: 0 },
  ]);
  const [tournamentText, setTournamentText] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // Load state from API
  useEffect(() => {
    const loadTournamentState = async () => {
      try {
        const baseUrl =
          import.meta.env.VITE_API_BASE_URL || "https://score.zoid.dev";
        const response = await fetch(
          `${baseUrl}/api/tournament/${tournamentId}`
        );
        if (
          response.ok &&
          response.headers.get("content-type")?.includes("application/json")
        ) {
          const state: TournamentState = await response.json();
          if (state.games.length > 0) {
            setGames(state.games);
          }
          if (state.tournamentText) {
            setTournamentText(state.tournamentText);
          }
        }
      } catch (error) {
        console.error("Failed to load tournament state:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTournamentState();
  }, [tournamentId]);

  // Save state to API
  const saveState = useCallback(
    async (newGames?: Game[], newTournamentText?: string) => {
      try {
        const updateData: Partial<TournamentState> = {};
        if (newGames !== undefined) {
          updateData.games = newGames;
        }
        if (newTournamentText !== undefined) {
          updateData.tournamentText = newTournamentText;
        }

        const baseUrl =
          import.meta.env.VITE_API_BASE_URL || "https://score.zoid.dev";
        const response = await fetch(
          `${baseUrl}/api/tournament/${tournamentId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updateData),
          }
        );

        if (!response.ok) {
          console.error(
            "Failed to save tournament state:",
            response.statusText
          );
        }
      } catch (error) {
        console.error("Failed to save tournament state:", error);
      }
    },
    [tournamentId]
  );

  // Enhanced setters that also save to durable object
  const updateGames = useCallback(
    (updater: (prev: Game[]) => Game[]) => {
      setGames((prev) => {
        const newGames = updater(prev);
        saveState(newGames, undefined);
        return newGames;
      });
    },
    [saveState]
  );

  const updateTournamentText = useCallback(
    (updater: (prev: string) => string) => {
      setTournamentText((prev) => {
        const newText = updater(prev);
        saveState(undefined, newText);
        return newText;
      });
    },
    [saveState]
  );

  return {
    games,
    tournamentText,
    isLoading,
    setGames: updateGames,
    setTournamentText: updateTournamentText,
  };
}
