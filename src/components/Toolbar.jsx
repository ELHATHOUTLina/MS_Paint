function Toolbar() {
  const tools = ['✣', '⬚', '🧽', '🪣', '💧', '🔍', '✏', '🖌', '🧴', 'A', '╱', '⌇', '▭', '⌒', '◯', '▱']

  return (
    <aside className="toolbar" aria-label="Tools">
      <div className="tool-grid">
        {tools.map((tool, index) => (
          <button key={`${tool}-${index}`} type="button" className="tool-button">
            {tool}
          </button>
        ))}
      </div>

      <div className="toolbar-filler" />
    </aside>
  )
}

export default Toolbar
