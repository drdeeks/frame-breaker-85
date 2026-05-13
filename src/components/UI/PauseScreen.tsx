export default ({ onResume, onRestart, onMainMenu }: any) => (
  <div className="game-ui paused">
    <h2>Paused</h2>
    <button onClick={onResume}>Resume</button>
    <button onClick={onRestart}>Restart Game</button>
    <button onClick={onMainMenu}>Main Menu</button>
  </div>
);
