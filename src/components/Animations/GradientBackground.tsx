'use client';

const layers = [
  { gradient: 'bg-gradient-to-br from-gray-900 via-black to-gray-800' },
  { gradient: 'bg-gradient-to-tr from-orange-500/10 via-pink-500/5 to-purple-600/10' },
  { gradient: 'bg-gradient-to-bl from-blue-500/8 via-transparent to-teal-500/12' }
];

type Props = {
  className?: string;
  children?: React.ReactNode;
}

export const GradientBackground: React.FC<Props> = ({
  className = '',
  children
}) => {
  return (
    <div className={`relative ${className}`}>
      {layers.map((layer, index) => (
        <div
          key={index}
          className={`absolute inset-0 ${layer.gradient}`}
        />
      ))}
      {children && <div className="relative z-10">{children}</div>}
    </div>
  );
};