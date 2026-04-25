function DrawingCanvas() {
  return (
    <section className="canvas-workspace" aria-label="Drawing area">
      <div className="canvas-frame">
        <div className="canvas-surface">Canvas</div>
      </div>

      <div className="canvas-scrollbar vertical" aria-hidden="true" />
      <div className="canvas-scrollbar horizontal" aria-hidden="true" />
    </section>
  )
}

export default DrawingCanvas
