import { useState, useMemo } from "react";
import { Card, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Plus, Minus } from "lucide-react";
import {
  calculatePointsTable,
  Evaluator,
  Lexer,
  Parser,
} from "../../lang/src/index";

type Team = "🩷 Team A" | "⚪ Team B" | "⚫ Team C";

type Game = {
  home: Team;
  away: Team;
  homeScore: number;
  awayScore: number;
};

const TEAMS: Team[] = ["🩷 Team A", "⚪ Team B", "⚫ Team C"];

// Map display names to scorelang team names
const TEAM_MAP: Record<Team, string> = {
  "🩷 Team A": "TeamA",
  "⚪ Team B": "TeamB",
  "⚫ Team C": "TeamC",
};

export default function Scoreboard() {
  const [games, setGames] = useState<Game[]>([
    { home: TEAMS[0], away: TEAMS[1], homeScore: 0, awayScore: 0 },
  ]);
  // Tournament state as scorelang text
  const [tournamentText, setTournamentText] = useState<string>("");

  const currentGame = games[games.length - 1];

  // Parse tournament text and calculate points table using scorelang
  const pointsTable = useMemo(() => {
    if (!tournamentText.trim()) return new Map();

    try {
      const lexer = new Lexer(tournamentText);
      const parser = new Parser(lexer);
      const program = parser.parse();
      const evaluator = new Evaluator();
      const { results } = evaluator.evaluate(program);
      return calculatePointsTable(results);
    } catch (error) {
      console.error("Error parsing tournament text:", error);
      return new Map();
    }
  }, [tournamentText]);

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

  const finalizeCurrentGame = () => {
    const game = currentGame;

    // Convert to scorelang format
    const homeTeamName = TEAM_MAP[game.home];
    const awayTeamName = TEAM_MAP[game.away];

    // Create scorelang game statement
    const gameStatement = `${homeTeamName} ${game.homeScore}-${game.awayScore} ${awayTeamName};`;

    // Append to tournament text
    setTournamentText((prev) =>
      prev ? `${prev}\n${gameStatement}` : gameStatement
    );
  };

  const handleNextGame = () => {
    // Finalize current game first
    finalizeCurrentGame();

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
    <div className="flex flex-col items-center gap-6 py-8 text-center w-full max-w-2xl">
      <div className="text-center mb-4">
        <h1 className="text-4xl font-bold mb-2">🏆 Scoreboard</h1>
        <p className="text-white/80 text-lg">
          Track your game scores with style!
        </p>
      </div>

      {games.map((game, idx) => {
        const isCurrent = idx === games.length - 1;
        return (
          <Card
            key={`${game.home}-vs-${game.away}-${idx}`}
            className={`w-full p-8 transition-all duration-500 backdrop-blur-md bg-white/10 border-white/20 ${
              isCurrent
                ? "scale-105 shadow-2xl bg-white/20 border-white/30"
                : "opacity-60 scale-95"
            }`}
          >
            <CardContent className="flex flex-col items-center gap-6">
              {isCurrent && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎮</span>
                  <h2 className="text-2xl font-bold text-white">Live Game</h2>
                  <span className="text-2xl">🎮</span>
                </div>
              )}

              <div className="flex items-center gap-4 text-2xl font-bold text-white">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-2 rounded-xl">
                  {game.home}
                </div>
                <span className="text-3xl animate-pulse">⚡</span>
                <div className="bg-gradient-to-r from-emerald-500 to-teal-400 px-4 py-2 rounded-xl">
                  {game.away}
                </div>
              </div>

              <div className="flex items-center gap-16">
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
        size="lg"
        className="mt-6 px-8 py-4 text-lg font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
        onClick={handleNextGame}
      >
        🎯 Next Game
      </Button>

      {tournamentText && (
        <Card className="w-full mt-8 backdrop-blur-md bg-white/10 border-white/20">
          <CardContent className="p-6">
            <h3 className="text-2xl font-bold text-white mb-4 text-center">
              📝 Tournament (ScoreLang)
            </h3>
            <pre className="text-white/80 bg-black/20 p-4 rounded-lg text-sm font-mono overflow-x-auto">
              {tournamentText}
            </pre>
          </CardContent>
        </Card>
      )}

      {pointsTable.size > 0 && (
        <Card className="w-full mt-8 backdrop-blur-md bg-white/10 border-white/20">
          <CardContent className="p-6">
            <h3 className="text-2xl font-bold text-white mb-4 text-center">
              🏆 Points Table
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-white">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-2">Team</th>
                    <th className="text-center py-2">Wins</th>
                    <th className="text-center py-2">Losses</th>
                    <th className="text-center py-2">Draws</th>
                    <th className="text-center py-2 font-bold">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {[...pointsTable.entries()]
                    .sort((a, b) => b[1].points - a[1].points)
                    .map(([team, stats]) => {
                      // Find the display name for the team
                      const displayName =
                        Object.entries(TEAM_MAP).find(
                          ([_, scoreTeam]) => scoreTeam === team
                        )?.[0] || team;
                      return (
                        <tr key={team} className="border-b border-white/10">
                          <td className="py-2 font-semibold">{displayName}</td>
                          <td className="text-center py-2">{stats.wins}</td>
                          <td className="text-center py-2">{stats.losses}</td>
                          <td className="text-center py-2">{stats.draws}</td>
                          <td className="text-center py-2 font-bold text-yellow-400">
                            {stats.points}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
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
    <div className="flex flex-col items-center gap-3">
      {editable && (
        <Button
          size="icon"
          className="aspect-square h-12 w-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 border-0 shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
          onClick={onInc}
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      <div className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/30">
        <span className="text-6xl font-bold tabular-nums text-white drop-shadow-lg">
          {score}
        </span>
      </div>

      {editable && (
        <Button
          size="icon"
          className="aspect-square h-12 w-12 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 border-0 shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
          onClick={onDec}
        >
          <Minus className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
