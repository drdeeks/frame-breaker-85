export default ({ level }: { level: number }) => (
  <div className="game-ui">
    <h2>Generating Level {level}...</h2>
    <div className="loader"></div>
  </div>
);
