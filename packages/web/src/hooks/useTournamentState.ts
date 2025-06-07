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

  // Load state from durable object or localStorage (fallback for development)
  useEffect(() => {
    const loadTournamentState = async () => {
      try {
        const response = await fetch(`/api/tournament/${tournamentId}`);
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
        } else {
          // Fallback to localStorage for development
          const localState = localStorage.getItem(`tournament_${tournamentId}`);
          if (localState) {
            const state: TournamentState = JSON.parse(localState);
            if (state.games.length > 0) {
              setGames(state.games);
            }
            if (state.tournamentText) {
              setTournamentText(state.tournamentText);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load tournament state:", error);
        // Try localStorage as fallback
        try {
          const localState = localStorage.getItem(`tournament_${tournamentId}`);
          if (localState) {
            const state: TournamentState = JSON.parse(localState);
            if (state.games.length > 0) {
              setGames(state.games);
            }
            if (state.tournamentText) {
              setTournamentText(state.tournamentText);
            }
          }
        } catch (localError) {
          console.error("Failed to load from localStorage:", localError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadTournamentState();
  }, [tournamentId]);

  // Save state to durable object or localStorage (fallback for development)
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

        const response = await fetch(`/api/tournament/${tournamentId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        });

        if (
          !response.ok ||
          !response.headers.get("content-type")?.includes("application/json")
        ) {
          // Fallback to localStorage for development
          const currentState = localStorage.getItem(
            `tournament_${tournamentId}`
          );
          const fullState: TournamentState = currentState
            ? JSON.parse(currentState)
            : { games: [], tournamentText: "" };

          if (newGames !== undefined) {
            fullState.games = newGames;
          }
          if (newTournamentText !== undefined) {
            fullState.tournamentText = newTournamentText;
          }

          localStorage.setItem(
            `tournament_${tournamentId}`,
            JSON.stringify(fullState)
          );
        }
      } catch (error) {
        console.error("Failed to save tournament state:", error);
        // Fallback to localStorage
        try {
          const currentState = localStorage.getItem(
            `tournament_${tournamentId}`
          );
          const fullState: TournamentState = currentState
            ? JSON.parse(currentState)
            : { games: [], tournamentText: "" };

          if (newGames !== undefined) {
            fullState.games = newGames;
          }
          if (newTournamentText !== undefined) {
            fullState.tournamentText = newTournamentText;
          }

          localStorage.setItem(
            `tournament_${tournamentId}`,
            JSON.stringify(fullState)
          );
        } catch (localError) {
          console.error("Failed to save to localStorage:", localError);
        }
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
