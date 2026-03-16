"use client"
import { useCallback, useEffect, useRef, useState } from 'react'

interface ResizeHandleProps {
  side: 'left' | 'right'
  width: number
  minWidth: number
  maxWidth: number
  onResize: (width: number) => void
}

export function ResizeHandle({ side, width, minWidth, maxWidth, onResize }: ResizeHandleProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const startXRef = useRef(0)
  const startWidthRef = useRef(0)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    startXRef.current = e.clientX
    startWidthRef.current = width
  }, [width])

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const delta = side === 'left' 
        ? e.clientX - startXRef.current
        : startXRef.current - e.clientX
      
      const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidthRef.current + delta))
      onResize(newWidth)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isDragging, side, minWidth, maxWidth, onResize])

  const showHandle = isDragging || isHovering

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`absolute top-0 bottom-0 z-30 cursor-col-resize
        ${side === 'left' ? 'right-0' : 'left-0'}`}
      style={{ width: 12 }}
    >
      {/* Visual indicator - only visible on hover/drag */}
      <div 
        className="absolute top-0 bottom-0 transition-opacity duration-150"
        style={{
          width: 3,
          left: side === 'left' ? 'auto' : 0,
          right: side === 'left' ? 0 : 'auto',
          background: isDragging 
            ? 'rgba(212, 168, 83, 0.6)' 
            : 'rgba(255, 255, 255, 0.15)',
          opacity: showHandle ? 1 : 0,
        }}
      />
      
      {/* Center grip dots - only visible on hover/drag */}
      <div 
        className="absolute top-1/2 -translate-y-1/2 flex flex-col gap-1 transition-opacity duration-150"
        style={{
          left: side === 'left' ? 'auto' : 2,
          right: side === 'left' ? 2 : 'auto',
          opacity: showHandle ? 1 : 0,
        }}
      >
        <div className="w-1 h-1 rounded-full" style={{ background: isDragging ? '#f0d888' : 'rgba(255,255,255,0.4)' }} />
        <div className="w-1 h-1 rounded-full" style={{ background: isDragging ? '#f0d888' : 'rgba(255,255,255,0.4)' }} />
        <div className="w-1 h-1 rounded-full" style={{ background: isDragging ? '#f0d888' : 'rgba(255,255,255,0.4)' }} />
      </div>
    </div>
  )
}

// Hook to manage panel width with localStorage persistence
export function usePanelWidth(key: string, defaultWidth: number, minWidth: number, maxWidth: number) {
  const [width, setWidth] = useState(defaultWidth)
  const [mounted, setMounted] = useState(false)

  // Load from localStorage
  useEffect(() => {
    setMounted(true)
    try {
      const stored = localStorage.getItem(key)
      if (stored) {
        const parsed = parseInt(stored, 10)
        if (!isNaN(parsed) && parsed >= minWidth && parsed <= maxWidth) {
          setWidth(parsed)
        }
      }
    } catch { /* ignore */ }
  }, [key, minWidth, maxWidth])

  // Save to localStorage
  const updateWidth = useCallback((newWidth: number) => {
    const clamped = Math.min(maxWidth, Math.max(minWidth, newWidth))
    setWidth(clamped)
    try {
      localStorage.setItem(key, clamped.toString())
    } catch { /* ignore */ }
  }, [key, minWidth, maxWidth])

  return { width: mounted ? width : defaultWidth, setWidth: updateWidth }
}
