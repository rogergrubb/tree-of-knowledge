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

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`absolute top-0 bottom-0 w-1 cursor-col-resize z-20 group
        ${side === 'left' ? 'right-0' : 'left-0'}`}
      style={{ 
        background: isDragging ? 'rgba(212, 168, 83, 0.4)' : 'transparent',
      }}
    >
      {/* Wider hit area */}
      <div className={`absolute top-0 bottom-0 w-3 -translate-x-1/2
        ${side === 'left' ? 'right-0 translate-x-1/2' : 'left-0 -translate-x-1/2'}`} />
      
      {/* Visual handle */}
      <div className={`absolute top-1/2 -translate-y-1/2 w-1 h-12 rounded-full transition-all
        ${isDragging 
          ? 'bg-[#d4a853] opacity-100' 
          : 'bg-white/10 opacity-0 group-hover:opacity-100 group-hover:bg-white/20'}`} 
      />
      
      {/* Drag indicator dots */}
      <div className={`absolute top-1/2 -translate-y-1/2 flex flex-col gap-1 transition-opacity
        ${side === 'left' ? '-right-1' : '-left-1'}
        ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`}>
        <div className="w-1 h-1 rounded-full bg-white/40" />
        <div className="w-1 h-1 rounded-full bg-white/40" />
        <div className="w-1 h-1 rounded-full bg-white/40" />
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
