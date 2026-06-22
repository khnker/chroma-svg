import { useEffect, useRef, useState } from 'react'
import { HexColorPicker } from 'react-colorful'

declare global {
  interface Window {
    EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> }
  }
}

interface ColorPopoverProps {
  x: number
  y: number
  current: string
  original: string
  onChange: (color: string) => void
  onReset: () => void
  onClose: () => void
}

export function ColorPopover({ x, y, current, original, onChange, onReset, onClose }: ColorPopoverProps) {
  const [color, setColor] = useState(current)
  const [hexInput, setHexInput] = useState(current)
  const popoverRef = useRef<HTMLDivElement>(null)
  const isModified = original.toLowerCase() !== color.toLowerCase()

  useEffect(() => {
    setColor(current)
    setHexInput(current)
  }, [current])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  const handlePickerChange = (c: string) => {
    setColor(c)
    setHexInput(c)
  }

  const handlePickerDone = () => {
    onChange(color)
  }

  const handleHexInput = (value: string) => {
    setHexInput(value)
    if (/^#[0-9a-fA-F]{6}$/.test(value)) {
      setColor(value)
      handlePickerDone()
    }
  }

  const handleReset = () => {
    setColor(original)
    setHexInput(original)
    onReset()
  }

  const handleEyedropper = async () => {
    if (!window.EyeDropper) return
    const eyeDropper = new window.EyeDropper()
    try {
      const result = await eyeDropper.open()
      const c = result.sRGBHex.toLowerCase()
      setColor(c)
      setHexInput(c)
      onChange(c)
    } catch {
      // user cancelled
    }
  }

  const adjustPosition = (px: number, py: number) => {
    const popW = 240, popH = 280
    const maxX = window.innerWidth - popW - 16
    const maxY = window.innerHeight - popH - 16
    return {
      left: Math.min(px, maxX),
      top: Math.min(py, maxY)
    }
  }

  const pos = adjustPosition(x, y)

  return (
    <div
      ref={popoverRef}
      className="fixed z-[60] bg-white rounded-xl shadow-[0_12px_40px_0_rgba(0,0,0,0.15),0_4px_12px_0_rgba(0,0,0,0.08)] border border-neutral-200 p-3 w-[240px]"
      style={{ left: pos.left, top: pos.top }}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-6 h-6 rounded border border-neutral-200 shrink-0" style={{ backgroundColor: color }} />
        <input
          type="text"
          value={hexInput}
          onChange={(e) => handleHexInput(e.target.value)}
          className="flex-1 px-2 py-1 text-xs font-mono border border-neutral-200 rounded focus:outline-none focus:ring-2 focus:ring-primary-400"
        />
        {window.EyeDropper && (
          <button
            onClick={handleEyedropper}
            className="w-7 h-7 flex items-center justify-center text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="Pick color from screen"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M2 22l1-1h3l9-9" />
              <path d="M3 21l6-6" />
              <circle cx="17" cy="7" r="4.5" />
              <path d="M14 7l3-3" />
            </svg>
          </button>
        )}
        {isModified && (
          <button onClick={handleReset} className="text-[10px] text-neutral-400 hover:text-red-500 underline whitespace-nowrap ml-1">
            Reset
          </button>
        )}
      </div>
      <div onMouseUp={handlePickerDone} onTouchEnd={handlePickerDone}>
        <HexColorPicker color={color} onChange={handlePickerChange} className="!w-full !h-36" />
      </div>
    </div>
  )
}
