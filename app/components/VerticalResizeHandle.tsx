"use client"
import { useCallback, useEffect, useRef, useState } from 'react'

interface VerticalResizeHandleProps {
  height: number
  minHeight: number
  maxHeight: number
  onResize: (height: number) => void
}

export function VerticalResizeHandle({ height, minHeight, maxHeight, onResize }: VerticalResizeHandleProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const startYRef = useRef(0)
  const startHeightRef = useRef(0)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    startYRef.current = e.clientY
    startHeightRef.current = height
  }, [height])

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientY - startYRef.current
      const newHeight = Math.min(maxHeight, Math.max(minHeight, startHeightRef.current + delta))
      onResize(newHeight)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = 'row-resize'
    document.body.style.userSelect = 'none'

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isDragging, minHeight, maxHeight, onResize])

  const showHandle = isDragging || isHovering

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="relative w-full cursor-row-resize z-20"
      style={{ height: 12 }}
    >
      {/* Visual indicator line */}
      <div 
        className="absolute left-4 right-4 top-1/2 -translate-y-1/2 transition-opacity duration-150"
        style={{
          height: 3,
          borderRadius: 2,
          background: isDragging 
            ? 'rgba(212, 168, 83, 0.6)' 
            : 'rgba(255, 255, 255, 0.15)',
          opacity: showHandle ? 1 : 0,
        }}
      />
      
      {/* Center grip dots */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-1 transition-opacity duration-150"
        style={{ opacity: showHandle ? 1 : 0 }}
      >
        <div className="w-1 h-1 rounded-full" style={{ background: isDragging ? '#f0d888' : 'rgba(255,255,255,0.4)' }} />
        <div className="w-1 h-1 rounded-full" style={{ background: isDragging ? '#f0d888' : 'rgba(255,255,255,0.4)' }} />
        <div className="w-1 h-1 rounded-full" style={{ background: isDragging ? '#f0d888' : 'rgba(255,255,255,0.4)' }} />
      </div>
    </div>
  )
}

// Hook to manage panel height with localStorage persistence
export function usePanelHeight(key: string, defaultHeight: number, minHeight: number, maxHeight: number) {
  const [height, setHeight] = useState(defaultHeight)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const stored = localStorage.getItem(key)
      if (stored) {
        const parsed = parseInt(stored, 10)
        if (!isNaN(parsed) && parsed >= minHeight && parsed <= maxHeight) {
          setHeight(parsed)
        }
      }
    } catch { /* ignore */ }
  }, [key, minHeight, maxHeight])

  const updateHeight = useCallback((newHeight: number) => {
    const clamped = Math.min(maxHeight, Math.max(minHeight, newHeight))
    setHeight(clamped)
    try {
      localStorage.setItem(key, clamped.toString())
    } catch { /* ignore */ }
  }, [key, minHeight, maxHeight])

  return { height: mounted ? height : defaultHeight, setHeight: updateHeight }
}
