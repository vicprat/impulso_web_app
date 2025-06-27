'use client'

interface Props {
  size?: number
  dotSize?: number
  color?: string
  opacity?: number
  className?: string
}

export const GridOverlay: React.FC<Props> = ({
  className = '',
  color = 'white',
  dotSize = 1,
  opacity = 0.03,
  size = 40,
}) => {
  return (
    <div
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        backgroundImage: `radial-gradient(circle at ${dotSize}px ${dotSize}px, ${color} ${dotSize}px, transparent 0)`,
        backgroundSize: `${size}px ${size}px`,
        opacity,
      }}
    />
  )
}
