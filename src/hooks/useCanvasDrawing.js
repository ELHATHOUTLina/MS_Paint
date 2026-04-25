import { useEffect, useRef, useState } from 'react';

function getCanvasCoordinates(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

function fillWhiteBackground(canvas) {
  const context = canvas.getContext('2d');
  context.save();
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.restore();
}

export default function useCanvasDrawing(activeTool, activeColor) {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    fillWhiteBackground(canvas);
  }, []);

  const startDrawing = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');
    const point = getCanvasCoordinates(canvas, event);

    isDrawingRef.current = true;
    context.beginPath();
    context.moveTo(point.x, point.y);

    draw(event);
  };

  const draw = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const point = getCanvasCoordinates(canvas, event);
    setCursor({ x: Math.round(point.x), y: Math.round(point.y) });

    if (!isDrawingRef.current) {
      return;
    }

    const context = canvas.getContext('2d');
    const isEraser = activeTool === 'eraser';

    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = isEraser ? 14 : 2;
    context.strokeStyle = isEraser ? '#ffffff' : activeColor;

    context.lineTo(point.x, point.y);
    context.stroke();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    fillWhiteBackground(canvas);
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const link = document.createElement('a');
    link.download = 'paint-mvp.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return {
    canvasRef,
    cursor,
    startDrawing,
    draw,
    stopDrawing,
    clearCanvas,
    downloadImage
  };
}
