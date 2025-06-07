import React, { useState } from "react";
import { Card, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Plus, Minus } from "lucide-react";

type Team = "Team A" | "Team B" | "Team C";

type Game = {
  home: Team;
  away: Team;
  homeScore: number;
  awayScore: number;
};

const TEAMS: Team[] = ["Team A", "Team B", "Team C"];

export default function Scoreboard() {
  const [games, setGames] = useState<Game[]>([
    { home: TEAMS[0], away: TEAMS[1], homeScore: 0, awayScore: 0 },
  ]);

  const currentGame = games[games.length - 1];

  const updateScore = (side: "home" | "away", delta: 1 | -1) => {
    setGames((prev) => {
      const next = [...prev];
      const game = { ...next[next.length - 1] };
      game[side === "home" ? "homeScore" : "awayScore"] = Math.max(
        0,
        game[side === "home" ? "homeScore" : "awayScore"] + delta
      );
      next[next.length - 1] = game;
      return next;
    });
  };

  const handleNextGame = () => {
    setGames((prev) => {
      const last = prev[prev.length - 1];
      // Identify idle team (one that did NOT play last game)
      const idle = TEAMS.find((t) => t !== last.home && t !== last.away)!;
      // Persist the *away* team so one team appears twice in a row
      const newGame: Game = {
        home: last.away,
        away: idle,
        homeScore: 0,
        awayScore: 0,
      };
      return [...prev, newGame];
    });
  };

  /* ────────────────────────── Render ────────────────────────── */
  return (
    <div className="flex flex-col items-center gap-4 py-10 text-center">
      {games.map((game, idx) => {
        const isCurrent = idx === games.length - 1;
        return (
          <Card
            key={`${game.home}-vs-${game.away}-${idx}`}
            className={`w-full max-w-md p-6 transition-all duration-300 ${
              isCurrent ? "scale-105 shadow-2xl" : "opacity-70"
            }`}
          >
            <CardContent className="flex flex-col items-center gap-4">
              {isCurrent && (
                <h2 className="text-lg font-semibold">Current Game</h2>
              )}

              <div className="flex items-center gap-2 text-4xl font-bold">
                <span>{game.home}</span>
                <span className="text-xl font-normal">vs</span>
                <span>{game.away}</span>
              </div>

              <div className="flex items-center gap-10">
                <ScoreColumn
                  score={game.homeScore}
                  editable={isCurrent}
                  onInc={() => updateScore("home", 1)}
                  onDec={() => updateScore("home", -1)}
                />
                <ScoreColumn
                  score={game.awayScore}
                  editable={isCurrent}
                  onInc={() => updateScore("away", 1)}
                  onDec={() => updateScore("away", -1)}
                />
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Button
        variant="default"
        size="lg"
        className="mt-4 w-40"
        onClick={handleNextGame}
      >
        Next Game
      </Button>
    </div>
  );
}

function ScoreColumn({
  score,
  editable,
  onInc,
  onDec,
}: {
  score: number;
  editable: boolean;
  onInc: () => void;
  onDec: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      {editable && (
        <Button
          variant="outline"
          size="icon"
          className="aspect-square h-9"
          onClick={onInc}
        >
          <Plus className="h-4 w-4" />
        </Button>
      )}

      <span className="text-5xl tabular-nums">{score}</span>

      {editable && (
        <Button
          variant="outline"
          size="icon"
          className="aspect-square h-9"
          onClick={onDec}
        >
          <Minus className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
