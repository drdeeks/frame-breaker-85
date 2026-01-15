export default ({ colors, onSelect }: { colors: string[]; onSelect: (color: string) => void }) => (
  <div className="game-ui">
    <h2>Paint Palette!</h2>
    <p>Choose a color to eliminate all bricks of that type.</p>
    <div className="color-picker-buttons">
      {colors.map((color) => (
        <button
          key={color}
          style={{
            backgroundColor: color,
            borderColor: color,
            textShadow: '0 0 5px #000',
            width: '100px',
            height: '50px',
          }}
          onClick={() => onSelect(color)}
        />
      ))}
    </div>
  </div>
);
