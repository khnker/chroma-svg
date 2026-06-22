import { useCallback } from 'react'

interface HomogenizeSliderProps {
  value: number
  onChange: (v: number) => void
}

export function HomogenizeSlider({ value, onChange }: HomogenizeSliderProps) {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value))
  }, [onChange])

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-500">Homogenize</span>
        <span className="text-xs text-neutral-400 font-mono min-w-[3rem] text-right">
          {Math.round(value * 100)}%
        </span>
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={value}
        onChange={handleChange}
        className="w-full h-1.5 bg-neutral-200 rounded-full appearance-none cursor-pointer
          accent-primary-500 [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary-500
          [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-grab
          [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4
          [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary-500
          [&::-moz-range-thumb]:shadow-sm [&::-moz-range-thumb]:cursor-grab"
      />
      <div className="flex justify-between text-[10px] text-neutral-400">
        <span className={value < 0.1 ? 'text-neutral-600 font-medium' : ''}>Original</span>
        <span className={value > 0.9 ? 'text-neutral-600 font-medium' : ''}>Centered</span>
      </div>
    </div>
  )
}
