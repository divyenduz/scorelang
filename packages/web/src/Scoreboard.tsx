import { useState, useMemo } from "react";
import { Card, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Plus, Minus, Trophy, FileText, Target } from "lucide-react";
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
    { home: TEAMS[0]!, away: TEAMS[1]!, homeScore: 0, awayScore: 0 },
  ]);
  // Tournament state as scorelang text
  const [tournamentText, setTournamentText] = useState<string>("");
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
                className={`w-full p-4 sm:p-8 mb-4 transition-all duration-500 backdrop-blur-md bg-white/10 border-white/20 ${
                  isCurrent
                    ? "scale-105 shadow-2xl bg-white/20 border-white/30"
                    : "opacity-60 scale-95"
                }`}
              >
                <CardContent className="flex flex-col items-center gap-4 sm:gap-6">
                  {isCurrent && (
                    <div className="flex items-center gap-2">
                      <span className="text-xl sm:text-2xl">🎮</span>
                      <h2 className="text-xl sm:text-2xl font-bold text-white">
                        Live Game
                      </h2>
                      <span className="text-xl sm:text-2xl">🎮</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-center gap-4 text-xl sm:text-2xl font-bold text-white">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-400 px-3 sm:px-4 py-2 rounded-xl text-center">
                      {game.home}
                    </div>
                    <span className="text-2xl sm:text-3xl animate-pulse">
                      ⚡
                    </span>
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-400 px-3 sm:px-4 py-2 rounded-xl text-center">
                      {game.away}
                    </div>
                  </div>

                  {isCurrent ? (
                    <div className="flex items-center gap-2 sm:gap-4 w-full justify-center">
                      <Button
                        size="icon"
                        className="aspect-square h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 border-0 shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
                        onClick={() => updateScore("home", 1)}
                      >
                        <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                      <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-md rounded-xl px-3 py-2 border border-white/30">
                        <span className="text-2xl sm:text-3xl font-bold tabular-nums text-white drop-shadow-lg">
                          {game.homeScore}
                        </span>
                      </div>
                      <Button
                        size="icon"
                        className="aspect-square h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 border-0 shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
                        onClick={() => updateScore("home", -1)}
                      >
                        <Minus className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                      <span className="text-xl sm:text-2xl mx-2">-</span>
                      <Button
                        size="icon"
                        className="aspect-square h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 border-0 shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
                        onClick={() => updateScore("away", 1)}
                      >
                        <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                      <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-md rounded-xl px-3 py-2 border border-white/30">
                        <span className="text-2xl sm:text-3xl font-bold tabular-nums text-white drop-shadow-lg">
                          {game.awayScore}
                        </span>
                      </div>
                      <Button
                        size="icon"
                        className="aspect-square h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 border-0 shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
                        onClick={() => updateScore("away", -1)}
                      >
                        <Minus className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-8 sm:gap-16">
                      <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-md rounded-2xl px-4 sm:px-6 py-3 sm:py-4 border border-white/30">
                        <span className="text-4xl sm:text-6xl font-bold tabular-nums text-white drop-shadow-lg">
                          {game.homeScore}
                        </span>
                      </div>
                      <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-md rounded-2xl px-4 sm:px-6 py-3 sm:py-4 border border-white/30">
                        <span className="text-4xl sm:text-6xl font-bold tabular-nums text-white drop-shadow-lg">
                          {game.awayScore}
                        </span>
                      </div>
                    </div>
                  )}
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
              📝 Tournament (ScoreLang)
            </h3>
            {tournamentText ? (
              <pre className="text-white/90 bg-black/20 p-4 rounded-lg text-xs sm:text-sm font-mono overflow-x-auto min-h-[200px]">
                {tournamentText}
              </pre>
            ) : (
              <div className="text-gray-700 text-center py-8">
                No games finalized yet. Complete some games in the Score
                Management tab to see ScoreLang output.
              </div>
            )}
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
