import type { LeaderboardEntry } from '@/src/utils/types';

export default ({ leaderboard, onMainMenu }: { leaderboard: LeaderboardEntry[]; onMainMenu: () => void }) => (
  <div className="game-ui">
    <h1>High Scores</h1>
    <ol className="leaderboard">
      {leaderboard.length > 0 ? (
        leaderboard.map((entry, index) => (
          <li key={index}>
            <span className="leaderboard-name">{entry.name}</span>
            <span className="leaderboard-score">{entry.score}</span>
          </li>
        ))
      ) : (
        <p>No scores yet. Be the first!</p>
      )}
    </ol>
    <button onClick={onMainMenu}>Main Menu</button>
  </div>
);
