import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

const PENCIL_COLOR = '#000000'
const PENCIL_WIDTH = 3
const ERASER_COLOR = '#ffffff'
const ERASER_WIDTH = 12

function configureContext(context, activeTool = 'pencil', strokeColor = PENCIL_COLOR) {
  context.imageSmoothingEnabled = false
  context.lineCap = 'round'
  context.lineJoin = 'round'

  if (activeTool === 'eraser') {
    context.lineWidth = ERASER_WIDTH
    context.strokeStyle = ERASER_COLOR
    return
  }

  context.lineWidth = PENCIL_WIDTH
  context.strokeStyle = strokeColor
}

function drawLine(context, startPoint, endPoint) {
  context.beginPath()
  context.moveTo(startPoint.x, startPoint.y)
  context.lineTo(endPoint.x, endPoint.y)
  context.stroke()
  context.closePath()
}

function drawRectangle(context, startPoint, endPoint) {
  const x = Math.min(startPoint.x, endPoint.x)
  const y = Math.min(startPoint.y, endPoint.y)
  const width = Math.abs(endPoint.x - startPoint.x)
  const height = Math.abs(endPoint.y - startPoint.y)

  context.beginPath()
  context.strokeRect(x, y, width, height)
  context.closePath()
}

const MAX_HISTORY = 50

function normalizeRect(startPoint, endPoint) {
  const x = Math.floor(Math.min(startPoint.x, endPoint.x))
  const y = Math.floor(Math.min(startPoint.y, endPoint.y))
  const width = Math.max(1, Math.floor(Math.abs(endPoint.x - startPoint.x)))
  const height = Math.max(1, Math.floor(Math.abs(endPoint.y - startPoint.y)))

  return { x, y, width, height }
}

function isPointInsideRect(point, rect) {
  if (!point || !rect) {
    return false
  }

  return (
    point.x >= rect.x
    && point.x <= rect.x + rect.width
    && point.y >= rect.y
    && point.y <= rect.y + rect.height
  )
}

function drawSelectionOutline(context, rect) {
  context.save()
  context.setLineDash([4, 2])
  context.lineWidth = 1
  context.strokeStyle = '#000000'
  context.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.width, rect.height)
  context.restore()
}

const DrawingCanvas = forwardRef(function DrawingCanvas(
  { tool, color = PENCIL_COLOR, onHistoryChange },
  ref,
) {
  const canvasRef = useRef(null)
  const contextRef = useRef(null)
  const isDrawingRef = useRef(false)
  const toolRef = useRef(tool)
  const colorRef = useRef(color)
  const startPointRef = useRef(null)
  const currentPointRef = useRef(null)
  const snapshotRef = useRef(null)
  const historyRef = useRef([])
  const historyIndexRef = useRef(-1)
  const captureHistoryRef = useRef(() => {})
  const finalizeDrawingRef = useRef(() => {})
  const commitSelectedImageRef = useRef(() => {})
  const selectionRectRef = useRef(null)
  const selectedImageRef = useRef(null)
  const isDraggingRef = useRef(false)
  const dragOffsetRef = useRef({ x: 0, y: 0 })

  const [selectionRect, setSelectionRect] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    toolRef.current = tool
  }, [tool])

  useEffect(() => {
    selectionRectRef.current = selectionRect
  }, [selectionRect])

  useEffect(() => {
    selectedImageRef.current = selectedImage
  }, [selectedImage])

  useEffect(() => {
    isDraggingRef.current = isDragging
  }, [isDragging])

  const clearSelectionState = () => {
    setSelectionRect(null)
    setSelectedImage(null)
    setIsDragging(false)
    selectionRectRef.current = null
    selectedImageRef.current = null
    isDraggingRef.current = false
  }

  const notifyHistoryChange = () => {
    if (!onHistoryChange) {
      return
    }

    onHistoryChange({
      canUndo: historyIndexRef.current > 0,
      canRedo: historyIndexRef.current < historyRef.current.length - 1,
    })
  }

  const restoreFromDataUrl = (dataUrl) => {
    const canvas = canvasRef.current
    const context = contextRef.current

    if (!canvas || !context || !dataUrl) {
      return
    }

    const image = new Image()
    image.onload = () => {
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      configureContext(context, toolRef.current, colorRef.current)
    }
    image.src = dataUrl
  }

  const captureHistory = () => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const snapshot = canvas.toDataURL('image/png')
    const current = historyRef.current[historyIndexRef.current]

    if (snapshot === current) {
      notifyHistoryChange()
      return
    }

    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1)
    }

    historyRef.current.push(snapshot)

    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current.shift()
    }

    historyIndexRef.current = historyRef.current.length - 1
    notifyHistoryChange()
  }

  const undo = () => {
    if (historyIndexRef.current <= 0) {
      notifyHistoryChange()
      return
    }

    historyIndexRef.current -= 1
    restoreFromDataUrl(historyRef.current[historyIndexRef.current])
    notifyHistoryChange()
  }

  const redo = () => {
    if (historyIndexRef.current >= historyRef.current.length - 1) {
      notifyHistoryChange()
      return
    }

    historyIndexRef.current += 1
    restoreFromDataUrl(historyRef.current[historyIndexRef.current])
    notifyHistoryChange()
  }

  const downloadPng = () => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const dataUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = 'paint-export.png'
    link.click()
  }

  useImperativeHandle(ref, () => ({ undo, redo, downloadPng }))

  useEffect(() => {
    colorRef.current = color

    const context = contextRef.current
    if (!context) {
      return
    }

    configureContext(context, toolRef.current, color)
  }, [color])

  const renderSelectionPreview = (nextRect, imagePayload = selectedImageRef.current) => {
    const context = contextRef.current
    const baseSnapshot = snapshotRef.current

    if (!context || !baseSnapshot) {
      return
    }

    context.putImageData(baseSnapshot, 0, 0)

    if (imagePayload) {
      context.putImageData(imagePayload.imageData, nextRect.x, nextRect.y)
    }

    drawSelectionOutline(context, nextRect)
  }

  const commitSelectedImage = ({ keepSelection = false } = {}) => {
    const context = contextRef.current
    const rect = selectionRectRef.current
    const imagePayload = selectedImageRef.current

    if (!context || !rect || !imagePayload) {
      if (!keepSelection) {
        clearSelectionState()
      }
      return
    }

    if (snapshotRef.current) {
      context.putImageData(snapshotRef.current, 0, 0)
    }

    context.putImageData(imagePayload.imageData, rect.x, rect.y)

    if (keepSelection) {
      drawSelectionOutline(context, rect)
      return
    }

    clearSelectionState()
    captureHistory()
  }

  function finalizeDrawing(endPoint) {
    const context = contextRef.current
    const activeTool = toolRef.current
    const startPoint = startPointRef.current
    const resolvedEndPoint = endPoint ?? currentPointRef.current ?? startPoint

    if (activeTool === 'selection') {
      if (!context || !startPoint || !resolvedEndPoint) {
        isDrawingRef.current = false
        startPointRef.current = null
        currentPointRef.current = null
        return
      }

      if (isDraggingRef.current) {
        isDrawingRef.current = false
        startPointRef.current = null
        currentPointRef.current = null
        setIsDragging(false)
        commitSelectedImage()
        return
      }

      const rect = normalizeRect(startPoint, resolvedEndPoint)
      const canvas = canvasRef.current

      if (!canvas || rect.width < 2 || rect.height < 2) {
        isDrawingRef.current = false
        startPointRef.current = null
        currentPointRef.current = null
        if (snapshotRef.current) {
          context.putImageData(snapshotRef.current, 0, 0)
        }
        clearSelectionState()
        return
      }

      if (snapshotRef.current) {
        context.putImageData(snapshotRef.current, 0, 0)
      }

      const imageData = context.getImageData(rect.x, rect.y, rect.width, rect.height)
      context.fillStyle = '#ffffff'
      context.fillRect(rect.x, rect.y, rect.width, rect.height)

      const baseWithHole = context.getImageData(0, 0, canvas.width, canvas.height)
      snapshotRef.current = baseWithHole

      setSelectedImage({ imageData })
      setSelectionRect(rect)
      setIsDragging(false)

      drawSelectionOutline(context, rect)

      isDrawingRef.current = false
      startPointRef.current = null
      currentPointRef.current = null
      return
    }

    if (!context || !startPoint || !resolvedEndPoint) {
      isDrawingRef.current = false
      startPointRef.current = null
      currentPointRef.current = null
      snapshotRef.current = null
      return
    }

    if (activeTool === 'line' || activeTool === 'rectangle') {
      if (snapshotRef.current) {
        context.putImageData(snapshotRef.current, 0, 0)
      }

      if (activeTool === 'line') {
        drawLine(context, startPoint, resolvedEndPoint)
      } else {
        drawRectangle(context, startPoint, resolvedEndPoint)
      }
    } else {
      context.closePath()
    }

    isDrawingRef.current = false
    startPointRef.current = null
    currentPointRef.current = null
    snapshotRef.current = null
    captureHistory()
  }

  captureHistoryRef.current = captureHistory
  finalizeDrawingRef.current = finalizeDrawing
  commitSelectedImageRef.current = commitSelectedImage

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return undefined
    }

    const syncCanvasSize = () => {
      const bounds = canvas.getBoundingClientRect()
      const nextWidth = Math.max(1, Math.floor(bounds.width))
      const nextHeight = Math.max(1, Math.floor(bounds.height))

      if (canvas.width === nextWidth && canvas.height === nextHeight) {
        return
      }

      const snapshot = document.createElement('canvas')
      snapshot.width = canvas.width
      snapshot.height = canvas.height

      const snapshotContext = snapshot.getContext('2d')
      if (snapshotContext && canvas.width > 0 && canvas.height > 0) {
        snapshotContext.drawImage(canvas, 0, 0)
      }

      canvas.width = nextWidth
      canvas.height = nextHeight

      const context = canvas.getContext('2d')
      if (!context) {
        return
      }

      configureContext(context, toolRef.current, colorRef.current)
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, canvas.width, canvas.height)

      if (snapshot.width > 0 && snapshot.height > 0) {
        context.drawImage(snapshot, 0, 0, snapshot.width, snapshot.height, 0, 0, canvas.width, canvas.height)
      }

      contextRef.current = context

      if (historyRef.current.length === 0) {
        captureHistoryRef.current()
      }
    }

    syncCanvasSize()

    const resizeObserver = new ResizeObserver(syncCanvasSize)
    resizeObserver.observe(canvas)

    const stopDrawing = () => {
      if (!isDrawingRef.current) {
        return
      }

      finalizeDrawingRef.current(currentPointRef.current)
    }

    window.addEventListener('mouseup', stopDrawing)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('mouseup', stopDrawing)
    }
  }, [])

  useEffect(() => {
    const context = contextRef.current
    if (!context) {
      return
    }

    if (tool === 'selection') {
      return
    }

    if (selectedImageRef.current && selectionRectRef.current) {
      commitSelectedImageRef.current({ keepSelection: false })
    }

    if (!isDrawingRef.current) {
      return
    }

    if (snapshotRef.current) {
      context.putImageData(snapshotRef.current, 0, 0)
    }

    isDrawingRef.current = false
    startPointRef.current = null
    currentPointRef.current = null
    snapshotRef.current = null
    context.closePath()
  }, [tool])

  const getCanvasPoint = (event) => {
    const canvas = canvasRef.current
    if (!canvas) {
      return null
    }

    const bounds = canvas.getBoundingClientRect()
    const clampedX = Math.max(0, Math.min(bounds.width, event.clientX - bounds.left))
    const clampedY = Math.max(0, Math.min(bounds.height, event.clientY - bounds.top))

    return {
      x: clampedX * (canvas.width / bounds.width),
      y: clampedY * (canvas.height / bounds.height),
    }
  }

  const handleMouseDown = (event) => {
    if (event.button !== 0) {
      return
    }

    const context = contextRef.current
    const canvas = canvasRef.current
    const point = getCanvasPoint(event)

    if (!context || !canvas || !point) {
      return
    }

    isDrawingRef.current = true
    startPointRef.current = point
    currentPointRef.current = point

    const activeTool = toolRef.current

    if (activeTool === 'selection') {
      const existingRect = selectionRectRef.current
      const existingImage = selectedImageRef.current

      if (existingRect && existingImage && isPointInsideRect(point, existingRect)) {
        setIsDragging(true)
        dragOffsetRef.current = {
          x: point.x - existingRect.x,
          y: point.y - existingRect.y,
        }
        return
      }

      if (existingRect && existingImage) {
        commitSelectedImage({ keepSelection: false })
      }

      setIsDragging(false)
      clearSelectionState()
      snapshotRef.current = context.getImageData(0, 0, canvas.width, canvas.height)
      return
    }

    configureContext(context, activeTool, colorRef.current)

    if (activeTool === 'pencil' || activeTool === 'eraser') {
      context.beginPath()
      context.moveTo(point.x, point.y)
      context.lineTo(point.x, point.y)
      context.stroke()
      return
    }

    snapshotRef.current = context.getImageData(0, 0, canvas.width, canvas.height)
  }

  const handleMouseMove = (event) => {
    if (!isDrawingRef.current) {
      return
    }

    const context = contextRef.current
    const point = getCanvasPoint(event)

    if (!context || !point) {
      return
    }

    currentPointRef.current = point

    const activeTool = toolRef.current

    if (activeTool === 'selection') {
      const startPoint = startPointRef.current
      if (!startPoint) {
        return
      }

      if (isDraggingRef.current && selectedImageRef.current && selectionRectRef.current) {
        const nextRect = {
          ...selectionRectRef.current,
          x: Math.floor(point.x - dragOffsetRef.current.x),
          y: Math.floor(point.y - dragOffsetRef.current.y),
        }

        setSelectionRect(nextRect)
        renderSelectionPreview(nextRect)
        return
      }

      const nextRect = normalizeRect(startPoint, point)
      setSelectionRect(nextRect)

      if (snapshotRef.current) {
        context.putImageData(snapshotRef.current, 0, 0)
      }

      drawSelectionOutline(context, nextRect)
      return
    }

    configureContext(context, activeTool, colorRef.current)

    if (activeTool === 'pencil' || activeTool === 'eraser') {
      context.lineTo(point.x, point.y)
      context.stroke()
      return
    }

    if (snapshotRef.current) {
      context.putImageData(snapshotRef.current, 0, 0)
    }

    if (activeTool === 'line') {
      drawLine(context, startPointRef.current, point)
      return
    }

    drawRectangle(context, startPointRef.current, point)
  }

  const handleMouseUp = (event) => {
    if (!isDrawingRef.current) {
      return
    }

    finalizeDrawing(getCanvasPoint(event))
  }

  return (
    <main className="canvas-workspace" aria-label="Drawing area">
      <div className="canvas-frame">
        <canvas
          ref={canvasRef}
          className="canvas-surface"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          aria-label="Drawing canvas"
        />
      </div>

      <div className="canvas-scrollbar vertical" aria-hidden="true" />
      <div className="canvas-scrollbar horizontal" aria-hidden="true" />
      <div className="canvas-corner" aria-hidden="true" />
    </main>
  )
})

export default DrawingCanvas
