interface LoadingSkeletonProps {
  variant?: 'text' | 'circle' | 'rect'
  width?: string
  height?: string
  className?: string
}

const variantStyles = {
  text: 'rounded h-4',
  circle: 'rounded-full',
  rect: 'rounded-lg',
}

export function LoadingSkeleton({ variant = 'text', width, height, className }: LoadingSkeletonProps) {
  return (
    <div
      className={`bg-gray-200 animate-pulse ${variantStyles[variant]} ${className ?? ''}`}
      style={{ width, height }}
    />
  )
}
