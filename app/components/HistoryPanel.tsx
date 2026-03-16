"use client"
import { useState, useEffect, useCallback } from 'react'

export interface HistoryItem {
  id: string
  path: string[]  // Navigation path to this node
  name: string
  icon?: string
  timestamp: number
}

interface HistoryPanelProps {
  history: HistoryItem[]
  onNavigate: (path: string[]) => void
  onDelete: (ids: Set<string>) => void
  onClear: () => void
  currentPath: string[]
}

const STORAGE_KEY = 'tok_history'
const MAX_HISTORY = 50

// Hook to manage history state - use this in the parent component
export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [mounted, setMounted] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true)
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setHistory(parsed)
      }
    } catch (e) {
      console.error('Failed to load history:', e)
    }
  }, [])

  // Add item to history
  const addToHistory = useCallback((name: string, path: string[], icon?: string) => {
    if (!mounted) return
    
    setHistory(prev => {
      // Don't add if same as last item
      if (prev.length > 0 && prev[0].name === name && prev[0].path.join('/') === path.join('/')) {
        return prev
      }
      
      // Don't add root
      if (path.length <= 1) return prev
      
      const newItem: HistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name,
        path,
        icon,
        timestamp: Date.now()
      }
      const updated = [newItem, ...prev.slice(0, MAX_HISTORY - 1)]
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch (e) {
        console.error('Failed to save history:', e)
      }
      
      return updated
    })
  }, [mounted])

  // Delete items
  const deleteItems = useCallback((ids: Set<string>) => {
    setHistory(prev => {
      const updated = prev.filter(item => !ids.has(item.id))
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch (e) {
        console.error('Failed to save history:', e)
      }
      return updated
    })
  }, [])

  // Clear all
  const clearHistory = useCallback(() => {
    setHistory([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (e) {
      console.error('Failed to clear history:', e)
    }
  }, [])

  return { history, addToHistory, deleteItems, clearHistory }
}

export function HistoryPanel({ history, onNavigate, onDelete, onClear, currentPath }: HistoryPanelProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [isEditing, setIsEditing] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    if (selected.size === history.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(history.map(h => h.id)))
    }
  }

  const handleDelete = () => {
    if (selected.size === 0) return
    onDelete(selected)
    setSelected(new Set())
    if (history.length <= selected.size) setIsEditing(false)
  }

  const handleClearAll = () => {
    if (confirm('Clear all history?')) {
      onClear()
      setSelected(new Set())
      setIsEditing(false)
    }
  }

  const formatTime = (ts: number) => {
    const now = Date.now()
    const diff = now - ts
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
    return new Date(ts).toLocaleDateString()
  }

  if (history.length === 0) {
    return (
      <div className="pointer-events-auto px-4 py-2">
        <div className="text-[10px] text-white/20 uppercase tracking-wider font-bold">
          History
        </div>
        <div className="text-[10px] text-white/10 mt-1">
          Navigate to start building history
        </div>
      </div>
    )
  }

  return (
    <div className="pointer-events-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 text-[10px] text-white/30 uppercase tracking-wider font-bold hover:text-white/50 transition-colors"
        >
          <span className="text-[8px]">{isExpanded ? '▼' : '▶'}</span>
          History ({history.length})
        </button>
        {isExpanded && (
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button 
                  onClick={selectAll}
                  className="text-[9px] text-white/30 hover:text-[#f0d888] transition-colors"
                >
                  {selected.size === history.length ? 'Deselect' : 'Select All'}
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={selected.size === 0}
                  className="text-[9px] text-red-400/60 hover:text-red-400 transition-colors disabled:opacity-30"
                >
                  Delete ({selected.size})
                </button>
                <button 
                  onClick={() => { setIsEditing(false); setSelected(new Set()) }}
                  className="text-[9px] text-white/30 hover:text-white/60 transition-colors"
                >
                  Done
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-[9px] text-white/20 hover:text-white/40 transition-colors"
                >
                  Edit
                </button>
                <button 
                  onClick={handleClearAll}
                  className="text-[9px] text-white/20 hover:text-red-400/60 transition-colors"
                >
                  Clear
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* History List */}
      {isExpanded && (
        <div className="px-2 pb-2 max-h-[35vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <div className="space-y-0.5">
            {history.map((item) => {
              const isCurrent = item.path.join('/') === currentPath.join('/')
              return (
                <div key={item.id} className="flex items-center gap-1.5 group">
                  {/* Checkbox (editing mode) */}
                  {isEditing && (
                    <button 
                      onClick={() => toggleSelect(item.id)}
                      className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all
                        ${selected.has(item.id) 
                          ? 'bg-[#d4a853]/30 border-[#d4a853]/50 text-[#f0d888]' 
                          : 'border-white/15 hover:border-white/30'}`}
                    >
                      {selected.has(item.id) && <span className="text-[10px]">✓</span>}
                    </button>
                  )}
                  
                  {/* Item button */}
                  <button
                    onClick={() => !isEditing && onNavigate(item.path)}
                    disabled={isEditing}
                    className={`flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all
                      ${isCurrent 
                        ? 'bg-[#d4a853]/10 border border-[#d4a853]/20' 
                        : 'bg-white/[0.02] border border-transparent hover:bg-white/[0.05] hover:border-white/5'}
                      ${isEditing ? 'opacity-70' : ''}`}
                  >
                    {/* Icon */}
                    {item.icon && (
                      <span className="text-[12px] flex-shrink-0">{item.icon}</span>
                    )}
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className={`text-[11px] font-semibold truncate
                        ${isCurrent ? 'text-[#f0d888]' : 'text-[#c0bab0]'}`}>
                        {item.name}
                      </div>
                      {item.path.length > 2 && (
                        <div className="text-[8px] text-white/20 truncate">
                          {item.path.slice(1, -1).join(' > ')}
                        </div>
                      )}
                    </div>
                    
                    {/* Time */}
                    <div className="text-[8px] text-white/15 flex-shrink-0">
                      {formatTime(item.timestamp)}
                    </div>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
