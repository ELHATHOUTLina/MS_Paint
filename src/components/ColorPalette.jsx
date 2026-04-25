function ColorPalette() {
  const colors = [
    '#000000',
    '#808080',
    '#800000',
    '#808000',
    '#008000',
    '#008080',
    '#000080',
    '#800080',
    '#ffffff',
    '#c0c0c0',
    '#ff0000',
    '#ffff00',
    '#00ff00',
    '#00ffff',
    '#0000ff',
    '#ff00ff',
    '#ffd2d2',
    '#ffb366',
    '#ffcc66',
    '#c8f06f',
    '#a0f0a0',
    '#9ceff0',
    '#9fb7ff',
    '#d2a8ff',
  ]

  return (
    <section className="color-palette" aria-label="Color palette">
      <div className="active-colors" aria-hidden="true">
        <span className="active-color primary" />
        <span className="active-color secondary" />
      </div>

      <div className="palette-grid">
        {colors.map((color, index) => (
          <button
            key={`${color}-${index}`}
            type="button"
            className="palette-swatch"
            style={{ backgroundColor: color }}
            aria-label={`Color ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}

export default ColorPalette
