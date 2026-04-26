
const tools = [
  "✣", "▣",
  "▰", "▧",
  "⌕", "○",
  "✎", "▥",
  "▨", "A",
  "╲", "⌇",
  "▭", "▱",
  "◯", "▢",
]

const colors = [
  "#000000", "#808080", "#404000", "#008000", "#008080", "#000080", "#400080", "#800080",
  "#ffffff", "#c0c0c0", "#808000", "#80ff80", "#00ffff", "#c0c0ff", "#8000ff", "#ff4000",
  "#80ff00", "#8080ff", "#c080ff", "#800000", "#ff0000", "#80c080", "#408000", "#80c000",
  "#ff80ff", "#ffff00", "#ff8000", "#804000", "#408080", "#004080", "#8080c0", "#c00080",
]

export default function PaintWindow() {
  return (
    <div className="paint-window">
      <div className="title-bar">
        <div className="title-left">
          <div className="title-icon">▣</div>
          <span className="title-text">untitled - Paint</span>
        </div>

        <div className="window-controls">
          <button className="win-btn">_</button>
          <button className="win-btn">□</button>
          <button className="win-btn">×</button>
        </div>
      </div>

      <div className="menu-bar">
        {["File", "Edit", "View", "Image", "Colors", "Help"].map((item) => (
          <button key={item} className="menu-item">{item}</button>
        ))}
      </div>

      <div className="paint-main-area">
        <aside className="toolbar">
          <div className="tool-grid">
            {tools.map((tool, index) => (
              <button key={index} className="tool-button">
                {tool}
              </button>
            ))}
          </div>
          <div className="toolbar-filler" />
        </aside>

        <main className="canvas-workspace">
          <div className="canvas-frame">
            <div className="canvas-surface" />
          </div>

          <div className="canvas-scrollbar vertical" />
          <div className="canvas-scrollbar horizontal" />
          <div className="canvas-corner" />
        </main>
      </div>

      <div className="color-palette">
        <div className="active-colors">
          <div className="active-color primary" />
          <div className="active-color secondary" />
        </div>

        <div className="palette-grid">
          {colors.map((color, index) => (
            <button
              key={index}
              className="palette-swatch"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div className="status-bar">
        <div className="status-message">
          For Help, click Help Topics on the Help Menu.
        </div>
        <div className="status-extra" />
        <div className="status-grip" />
      </div>
    </div>
  )
}
