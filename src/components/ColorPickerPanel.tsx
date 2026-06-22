import { HexColorPicker } from 'react-colorful'
import { useState, useEffect, useRef } from 'react'

interface ColorPickerPanelProps {
  original: string
  current: string
  onChange: (newColor: string) => void
  onReset: () => void
}

export function ColorPickerPanel({ original, current, onChange, onReset }: ColorPickerPanelProps) {
  const [localColor, setLocalColor] = useState(current)
  const [hexInput, setHexInput] = useState(current)
  const dragColor = useRef(current)

  useEffect(() => {
    setLocalColor(current)
    setHexInput(current)
    dragColor.current = current
  }, [current])

  const isModified = original.toLowerCase() !== current.toLowerCase()

  const handleHexChange = (value: string) => {
    setHexInput(value)
    if (/^#[0-9a-fA-F]{6}$/.test(value)) {
      setLocalColor(value)
      onChange(value)
    }
  }

  const handlePickerChange = (color: string) => {
    setHexInput(color)
    setLocalColor(color)
    dragColor.current = color
  }

  const handleDragEnd = () => {
    if (dragColor.current !== current) {
      onChange(dragColor.current)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg border border-neutral-200" style={{ backgroundColor: localColor }} />
        <div className="flex-1">
          <label className="text-xs text-neutral-500 font-medium">HEX</label>
          <input
            type="text"
            value={hexInput}
            onChange={(e) => handleHexChange(e.target.value)}
            className="w-full px-2 py-1 text-sm font-mono border rounded focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>
        {isModified && (
          <button
            onClick={onReset}
            className="text-xs text-neutral-400 hover:text-red-500 underline"
          >
            Reset
          </button>
        )}
      </div>
      <div onMouseUp={handleDragEnd} onTouchEnd={handleDragEnd}>
        <HexColorPicker color={localColor} onChange={handlePickerChange} className="!w-full !h-40" />
      </div>
    </div>
  )
}
