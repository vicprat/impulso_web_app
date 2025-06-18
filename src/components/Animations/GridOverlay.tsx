'use client';

type Props = {
  size?: number; 
  dotSize?: number; 
  color?: string; 
  opacity?: number; 
  className?: string;
}

export const GridOverlay: React.FC<Props> = ({
  size = 40,
  dotSize = 1,
  color = 'white',
  opacity = 0.03,
  className = ''
}) => {
  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        opacity,
        backgroundImage: `radial-gradient(circle at ${dotSize}px ${dotSize}px, ${color} ${dotSize}px, transparent 0)`,
        backgroundSize: `${size}px ${size}px`
      }}
    />
  );
};