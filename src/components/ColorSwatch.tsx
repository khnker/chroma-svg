interface ColorSwatchProps {
  color: string
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  selected?: boolean
}

export function ColorSwatch({ color, size = 'md', onClick, selected }: ColorSwatchProps) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }
  const classes = `${sizes[size]} rounded-md border-2 transition-transform hover:scale-110
    ${selected ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300'}
    ${color === '#ffffff' || color === '#fff' ? 'shadow-inner' : ''}`

  if (!onClick) {
    return (
      <span className={classes} style={{ backgroundColor: color }} title={color} />
    )
  }

  return (
    <button
      onClick={onClick}
      className={classes}
      style={{ backgroundColor: color }}
      title={color}
    />
  )
}
