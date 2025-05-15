import { useState } from "react";
import "./App.css";
import Lexer from "@scorelang/lang/src/lexer";
import { Parser } from "@scorelang/lang/src/parser";
import { Evaluator } from "@scorelang/lang/src/evaluator";
import { calculatePointsTable } from "@scorelang/lang/src/utils";

const DEFAULT_INPUT = `TeamA 2-0 TeamB;
TeamA 3-0 TeamC;
TeamB 0-1 TeamC;
TeamA 0-0 TeamB;
TeamA 1-5 TeamC;
TeamB 0-1 TeamC;
TeamA 2-2 TeamB;
TeamA 4-0 TeamC;
TeamB 1-0 TeamC;
TeamA 0-2 TeamB;
TeamA 1-0 TeamC;
TeamB 0-1 TeamC;
TeamA 1-4 TeamB;
TeamA 1-3 TeamC;
TeamB 3-1 TeamC;
TeamA 0-3 TeamB;
TeamA 0-2 TeamC;
TeamB 1-1 TeamC;`;

function App() {
  const [input, setInput] = useState(DEFAULT_INPUT);
  const [results, setResults] = useState<{team: string; wins: number; losses: number; draws: number; points: number}[]>([]);
  const [error, setError] = useState<string | null>(null);

  const processInput = () => {
    try {
      setError(null);
      const lexer = new Lexer(input);
      const parser = new Parser(lexer);
      const program = parser.parse();
      const evaluator = new Evaluator();
      const { results } = evaluator.evaluate(program);

      const pointsTable = calculatePointsTable(results);
      
      // Convert Map to array for rendering
      const tableData = [...pointsTable.entries()]
        .sort((a, b) => b[1].points - a[1].points)
        .map(([team, stats]) => ({
          team,
          wins: stats.wins,
          losses: stats.losses,
          draws: stats.draws,
          points: stats.points
        }));
      
      setResults(tableData);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setResults([]);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: "50%", padding: "20px" }}>
        <h2>ScoreLang Input</h2>
        <textarea 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ width: "100%", height: "80%", fontFamily: "monospace" }}
        />
        <button 
          onClick={processInput}
          style={{ marginTop: "10px", padding: "8px 16px" }}
        >
          Process
        </button>
      </div>
      
      <div style={{ width: "50%", padding: "20px" }}>
        <h2>Results</h2>
        {error ? (
          <div style={{ color: "red", marginBottom: "20px" }}>
            <h3>Error</h3>
            <pre style={{ whiteSpace: "pre-wrap" }}>{error}</pre>
          </div>
        ) : results.length > 0 ? (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>Team</th>
                <th style={tableHeaderStyle}>Wins</th>
                <th style={tableHeaderStyle}>Losses</th>
                <th style={tableHeaderStyle}>Draws</th>
                <th style={tableHeaderStyle}>Points</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.team}>
                  <td style={tableCellStyle}>{result.team}</td>
                  <td style={tableCellStyle}>{result.wins}</td>
                  <td style={tableCellStyle}>{result.losses}</td>
                  <td style={tableCellStyle}>{result.draws}</td>
                  <td style={tableCellStyle}>{result.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Click "Process" to see results</p>
        )}
      </div>
    </div>
  );
}

const tableHeaderStyle = {
  border: "1px solid #ddd",
  padding: "8px",
  textAlign: "left" as const,
  backgroundColor: "#f2f2f2"
};

const tableCellStyle = {
  border: "1px solid #ddd",
  padding: "8px",
  textAlign: "left" as const
};

export default App;
