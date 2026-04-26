
import { useRef, useState } from 'react'
import DrawingCanvas from './DrawingCanvas'

const tools = [
  { id: 'pencil', icon: '✎', label: 'Crayon' },
  { id: 'eraser', icon: '⌧', label: 'Gomme' },
  { id: 'line', icon: '╲', label: 'Ligne' },
  { id: 'rectangle', icon: '▭', label: 'Rectangle' },
  { id: 'selection', icon: '✣', label: 'Selection' },
  { icon: '▣', label: 'Fill' },
  { icon: '▰', label: 'Brush' },
  { icon: '▧', label: 'Spray' },
  { icon: '⌕', label: 'Zoom' },
  { icon: '○', label: 'Ellipse' },
  { icon: '▥', label: 'Textured' },
  { icon: '▨', label: 'Shape' },
  { icon: 'A', label: 'Text' },
  { icon: '⌇', label: 'Curve' },
  { icon: '▱', label: 'Polygon' },
  { icon: '◯', label: 'Circle' },
  { icon: '▢', label: 'Square' },
]

const colors = [
  "#000000", "#808080", "#404000", "#008000", "#008080", "#000080", "#400080", "#800080",
  "#ffffff", "#c0c0c0", "#808000", "#80ff80", "#00ffff", "#c0c0ff", "#8000ff", "#ff4000",
  "#80ff00", "#8080ff", "#c080ff", "#800000", "#ff0000", "#80c080", "#408000", "#80c000",
  "#ff80ff", "#ffff00", "#ff8000", "#804000", "#408080", "#004080", "#8080c0", "#c00080",
]

export default function PaintWindow() {
  const [tool, setTool] = useState('pencil')
  const [activeColor, setActiveColor] = useState(colors[0])
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false })
  const canvasActionsRef = useRef(null)

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
          <button
            key={item}
            className="menu-item"
            type="button"
            onClick={item === 'Image' ? () => canvasActionsRef.current?.downloadPng?.() : undefined}
            title={item === 'Image' ? 'Exporter en PNG' : undefined}
          >
            {item}
          </button>
        ))}

        <div className="menu-history-actions" aria-label="Historique">
        <button
          type="button"
          className="menu-item history-btn"
          onClick={() => canvasActionsRef.current?.undo()}
          disabled={!historyState.canUndo}
          aria-label="Undo"
          title="Undo"
        >
          ←
        </button>
        <button
          type="button"
          className="menu-item history-btn"
          onClick={() => canvasActionsRef.current?.redo()}
          disabled={!historyState.canRedo}
          aria-label="Redo"
          title="Redo"
        >
          →
        </button>
        </div>
      </div>

      <div className="paint-main-area">
        <aside className="toolbar">
          <div className="tool-grid">
            {tools.map((item, index) => (
              <button
                key={`${item.icon}-${index}`}
                type="button"
                className={`tool-button${item.id === tool ? ' is-selected' : ''}`}
                onClick={item.id ? () => setTool(item.id) : undefined}
                aria-pressed={item.id ? item.id === tool : undefined}
                aria-label={item.label}
                title={item.label}
              >
                {item.icon}
              </button>
            ))}
          </div>
          <div className="toolbar-filler" />
        </aside>

        <DrawingCanvas
          ref={canvasActionsRef}
          tool={tool}
          color={activeColor}
          onHistoryChange={setHistoryState}
        />
      </div>

      <div className="color-palette">
        <div className="active-colors">
          <div className="active-color primary" style={{ backgroundColor: activeColor }} />
          <div className="active-color secondary" />
        </div>

        <div className="palette-grid">
          {colors.map((color, index) => (
            <button
              key={index}
              type="button"
              className={`palette-swatch${activeColor === color ? ' is-selected' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => setActiveColor(color)}
              aria-label={`Couleur ${index + 1}`}
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
