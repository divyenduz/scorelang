import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Plus, Minus, Trophy, FileText, Target } from "lucide-react";
import {
  calculatePointsTable,
  Evaluator,
  Lexer,
  Parser,
} from "../../lang/src/index";
import { useTournamentState } from "./hooks/useTournamentState";

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

interface ScoreboardProps {
  tournamentId: string;
}

export default function Scoreboard({ tournamentId }: ScoreboardProps) {
  const { games, tournamentText, setGames, setTournamentText } =
    useTournamentState(tournamentId);

  // Active tab state
  const [activeTab, setActiveTab] = useState<"score" | "scorelang" | "table">(
    "score"
  );

  const currentGame = games[games.length - 1]!;

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

  // Update games array when tournament text changes
  useEffect(() => {
    if (!tournamentText.trim()) return;

    try {
      const lexer = new Lexer(tournamentText);
      const parser = new Parser(lexer);
      const program = parser.parse();
      const evaluator = new Evaluator();
      const { results } = evaluator.evaluate(program);

      // Convert GameResults back to Game format
      const parsedGames: Game[] = results.map((result) => {
        if (result.type === "RESOLVED") {
          // Map scorelang team names back to display names
          const winningTeamDisplay =
            (Object.entries(TEAM_MAP).find(
              ([_, scoreTeam]) => scoreTeam === result.winningTeam
            )?.[0] as Team) || "🩷 Team A";
          const losingTeamDisplay =
            (Object.entries(TEAM_MAP).find(
              ([_, scoreTeam]) => scoreTeam === result.losingTeam
            )?.[0] as Team) || "⚪ Team B";

          return {
            home: winningTeamDisplay,
            away: losingTeamDisplay,
            homeScore: result.winningTeamScore,
            awayScore: result.losingTeamScore,
          };
        } else {
          // DRAW
          const leftTeamDisplay =
            (Object.entries(TEAM_MAP).find(
              ([_, scoreTeam]) => scoreTeam === result.leftTeam
            )?.[0] as Team) || "🩷 Team A";
          const rightTeamDisplay =
            (Object.entries(TEAM_MAP).find(
              ([_, scoreTeam]) => scoreTeam === result.rightTeam
            )?.[0] as Team) || "⚪ Team B";

          return {
            home: leftTeamDisplay,
            away: rightTeamDisplay,
            homeScore: result.leftTeamScore,
            awayScore: result.rightTeamScore,
          };
        }
      });

      // Add current live game if games array is not empty
      if (parsedGames.length > 0) {
        const lastGame = parsedGames[parsedGames.length - 1];
        // Identify idle team for next game
        const idle = TEAMS.find(
          (t) => t !== lastGame.home && t !== lastGame.away
        )!;
        parsedGames.push({
          home: lastGame.away,
          away: idle,
          homeScore: 0,
          awayScore: 0,
        });
      }

      setGames(() =>
        parsedGames.length > 0
          ? parsedGames
          : [
              {
                home: "🩷 Team A",
                away: "⚪ Team B",
                homeScore: 0,
                awayScore: 0,
              },
            ]
      );
    } catch (error) {
      console.error("Error parsing tournament text for games:", error);
    }
  }, [tournamentText, setGames]);

  const updateScore = (side: "home" | "away", delta: 1 | -1) => {
    setGames((prev) => {
      const next = [...prev];
      const game = { ...next[next.length - 1]! };
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
      const last = prev[prev.length - 1]!;
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
    <div className="flex flex-col items-center gap-6 py-4 sm:py-8 text-center w-full max-w-4xl px-4">
      <div className="text-center mb-4">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">🏆 Scoreboard</h1>
        <p className="text-white/80 text-base sm:text-lg">
          Track your game scores with style!
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 w-full max-w-lg mb-6">
        <Button
          variant={activeTab === "score" ? "default" : "outline"}
          className={`flex-1 text-xs sm:text-sm ${
            activeTab === "score"
              ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
              : "bg-white/10 text-white border-white/20 hover:bg-white/20"
          }`}
          onClick={() => setActiveTab("score")}
        >
          <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Score</span>
          <span className="sm:hidden">Score</span>
        </Button>
        <Button
          variant={activeTab === "scorelang" ? "default" : "outline"}
          className={`flex-1 text-xs sm:text-sm ${
            activeTab === "scorelang"
              ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
              : "bg-white/10 text-white border-white/20 hover:bg-white/20"
          }`}
          onClick={() => setActiveTab("scorelang")}
        >
          <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Code</span>
          <span className="sm:hidden">Code</span>
        </Button>
        <Button
          variant={activeTab === "table" ? "default" : "outline"}
          className={`flex-1 text-xs sm:text-sm ${
            activeTab === "table"
              ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
              : "bg-white/10 text-white border-white/20 hover:bg-white/20"
          }`}
          onClick={() => setActiveTab("table")}
        >
          <Trophy className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Table</span>
          <span className="sm:hidden">Table</span>
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === "score" && (
        <div className="w-full">
          {games.map((game, idx) => {
            const isCurrent = idx === games.length - 1;
            return (
              <Card
                key={`${game.home}-vs-${game.away}-${idx}`}
                className={`w-full p-2 sm:p-1 mb-2 transition-all duration-500 backdrop-blur-md bg-white/10 border-white/20 ${
                  isCurrent
                    ? "scale-105 shadow-xl bg-white/20 border-white/30"
                    : "opacity-60 scale-95"
                }`}
              >
                <CardContent className="flex flex-col items-center gap-2">
                  {isCurrent && (
                    <div className="flex items-center gap-1">
                      <span className="text-sm">🎮</span>
                      <h2 className="text-sm font-bold text-black">
                        Live Game
                      </h2>
                      <span className="text-sm">🎮</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 w-full max-w-lg">
                    {/* Home team buttons (left side) */}
                    {isCurrent && (
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <Button
                          size="icon"
                          className="h-6 w-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 border-0 shadow-sm transform hover:scale-110 transition-all duration-200"
                          onClick={() => updateScore("home", 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          className="h-6 w-6 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 border-0 shadow-sm transform hover:scale-110 transition-all duration-200"
                          onClick={() => updateScore("home", -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                      </div>
                    )}

                    <div className="bg-gradient-to-r from-blue-500 to-cyan-400 px-3 py-1 rounded-lg text-center flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 text-white">
                        <span className="text-xs font-medium truncate">
                          {game.home}
                        </span>
                        <span className="text-sm font-bold tabular-nums">
                          {game.homeScore}
                        </span>
                      </div>
                    </div>

                    <span className="text-lg animate-pulse flex-shrink-0">
                      ⚡
                    </span>

                    <div className="bg-gradient-to-r from-emerald-500 to-teal-400 px-3 py-1 rounded-lg text-center flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 text-white">
                        <span className="text-xs font-medium truncate">
                          {game.away}
                        </span>
                        <span className="text-sm font-bold tabular-nums">
                          {game.awayScore}
                        </span>
                      </div>
                    </div>

                    {/* Away team buttons (right side) */}
                    {isCurrent && (
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <Button
                          size="icon"
                          className="h-6 w-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 border-0 shadow-sm transform hover:scale-110 transition-all duration-200"
                          onClick={() => updateScore("away", 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          className="h-6 w-6 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 border-0 shadow-sm transform hover:scale-110 transition-all duration-200"
                          onClick={() => updateScore("away", -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <Button
            size="lg"
            className="mt-6 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            onClick={handleNextGame}
          >
            🎯 Next Game
          </Button>
        </div>
      )}

      {activeTab === "scorelang" && (
        <Card className="w-full backdrop-blur-md bg-white/10 border-white/20">
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 text-center">
              📝 ScoreLang Code
            </h3>
            <textarea
              className="w-full text-white/90 bg-black/20 p-4 rounded-lg text-xs sm:text-sm font-mono overflow-x-auto min-h-[200px] resize-none border border-white/20 focus:border-white/40 focus:outline-none"
              value={tournamentText || ""}
              onChange={(e) => setTournamentText(() => e.target.value)}
              placeholder="No games finalized yet. Complete some games in the Score Management tab to see ScoreLang output, or write your own ScoreLang code here."
            />
          </CardContent>
        </Card>
      )}

      {activeTab === "table" && (
        <Card className="w-full backdrop-blur-md bg-white/10 border-white/20">
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 text-center">
              🏆 Points Table
            </h3>
            {pointsTable.size > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-black text-sm sm:text-base">
                  <thead>
                    <tr className="border-b border-gray-400">
                      <th className="text-left py-2 px-2">Team</th>
                      <th className="text-center py-2 px-1">Wins</th>
                      <th className="text-center py-2 px-1">Losses</th>
                      <th className="text-center py-2 px-1">Draws</th>
                      <th className="text-center py-2 px-2 font-bold">
                        Points
                      </th>
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
                          <tr key={team} className="border-b border-gray-300">
                            <td className="py-2 px-2 font-semibold">
                              {displayName}
                            </td>
                            <td className="text-center py-2 px-1">
                              {stats.wins}
                            </td>
                            <td className="text-center py-2 px-1">
                              {stats.losses}
                            </td>
                            <td className="text-center py-2 px-1">
                              {stats.draws}
                            </td>
                            <td className="text-center py-2 px-2 font-bold text-orange-600">
                              {stats.points}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-black text-center py-8">
                No points table available yet. Complete some games in the Score
                Management tab to see the points table.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
