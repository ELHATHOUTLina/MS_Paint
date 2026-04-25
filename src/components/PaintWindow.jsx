import MenuBar from './MenuBar'
import Toolbar from './Toolbar'
import DrawingCanvas from './DrawingCanvas'
import ColorPalette from './ColorPalette'
import StatusBar from './StatusBar'

function PaintWindow() {
  return (
    <div className="paint-desktop">
      <div className="paint-window">
        <header className="title-bar">
          <div className="title-left">
            <span className="title-icon" aria-hidden="true">
              🎨
            </span>
            <span className="title-text">untitled - Paint</span>
          </div>

          <div className="window-controls" aria-label="Window controls">
            <button type="button" className="win-btn" aria-label="Minimize">
              _
            </button>
            <button type="button" className="win-btn" aria-label="Maximize">
              □
            </button>
            <button type="button" className="win-btn" aria-label="Close">
              ×
            </button>
          </div>
        </header>

        <MenuBar />

        <div className="paint-main-area">
          <Toolbar />
          <DrawingCanvas />
        </div>

        <ColorPalette />
        <StatusBar />
      </div>
    </div>
  )
}

export default PaintWindow
