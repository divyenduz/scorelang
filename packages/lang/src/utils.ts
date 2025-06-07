import type { GameResult } from "./evaluator";
import Table from "cli-table3";

type TeamStats = {
  points: number;
  wins: number;
  losses: number;
  draws: number;
};

export const calculatePointsTable = (results: GameResult[]) => {
  const pointsTable = new Map<string, TeamStats>();

  const initTeam = (team: string) => {
    if (!pointsTable.has(team)) {
      pointsTable.set(team, {
        points: 0,
        wins: 0,
        losses: 0,
        draws: 0,
      });
    }
  };

  for (const result of results) {
    if (result.type === "RESOLVED") {
      initTeam(result.winningTeam);
      initTeam(result.losingTeam);

      const winnerStats = pointsTable.get(result.winningTeam)!;
      const loserStats = pointsTable.get(result.losingTeam)!;

      // Winner gets 3 points and a win
      pointsTable.set(result.winningTeam, {
        ...winnerStats,
        points: winnerStats.points + 3,
        wins: winnerStats.wins + 1,
      });

      // Loser gets 0 points and a loss
      pointsTable.set(result.losingTeam, {
        ...loserStats,
        losses: loserStats.losses + 1,
      });
    } else {
      initTeam(result.leftTeam);
      initTeam(result.rightTeam);

      const leftStats = pointsTable.get(result.leftTeam)!;
      const rightStats = pointsTable.get(result.rightTeam)!;

      // Both teams get 1 point and a draw
      pointsTable.set(result.leftTeam, {
        ...leftStats,
        points: leftStats.points + 1,
        draws: leftStats.draws + 1,
      });

      pointsTable.set(result.rightTeam, {
        ...rightStats,
        points: rightStats.points + 1,
        draws: rightStats.draws + 1,
      });
    }
  }

  return pointsTable;
};

export const printPointsTable = (pointsTable: Map<string, TeamStats>) => {
  const sortedTeams = [...pointsTable.entries()].sort(
    (a, b) => b[1].points - a[1].points
  );

  const table = new Table({
    head: ["Team", "Wins", "Losses", "Draws", "Points"],
  });

  for (const [team, stats] of sortedTeams) {
    table.push([team, stats.wins, stats.losses, stats.draws, stats.points]);
  }
  console.log(table.toString());
};
