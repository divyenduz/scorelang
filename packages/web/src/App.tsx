import { useEffect, useState } from "react";
import Scoreboard from "./Scoreboard";

export default function App() {
  const [tournamentId, setTournamentId] = useState<string>("");

  useEffect(() => {
    // Get tournament ID from URL or generate a new one
    const params = new URLSearchParams(window.location.search);
    let id = params.get('tournament');
    
    if (!id) {
      // Generate a new tournament ID and update URL
      id = generateTournamentId();
      const newUrl = `${window.location.pathname}?tournament=${id}`;
      window.history.replaceState({}, '', newUrl);
    }
    
    setTournamentId(id);
  }, []);

  if (!tournamentId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Creating tournament...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white flex items-center justify-center p-4">
      <Scoreboard tournamentId={tournamentId} />
    </div>
  );
}

function generateTournamentId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
