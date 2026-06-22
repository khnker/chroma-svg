import { useCallback, useRef, useState, type DragEvent } from 'react'

interface SvgUploaderProps {
  onFile: (file: File) => void
  hasFile: boolean
}

export function SvgUploader({ onFile, hasFile }: SvgUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) onFile(file)
    },
    [onFile]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) onFile(file)
    },
    [onFile]
  )

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200
        ${isDragging ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-300 ring-offset-2 shadow-lg shadow-primary-100' : hasFile ? 'border-neutral-200 bg-neutral-50/50' : 'border-neutral-300 hover:border-neutral-400 hover:shadow-md'}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".svg"
        onChange={handleChange}
        className="hidden"
      />
      <div className="flex flex-col items-center gap-3">
        <svg className="w-12 h-12 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-lg font-medium text-neutral-700">Drop an SVG file here</p>
        <p className="text-sm text-neutral-500">or click to browse</p>
      </div>
    </div>
  )
}
