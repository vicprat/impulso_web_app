interface Props {
  onClick: () => void
  isSelected: boolean
}
export const CarrouselNavigations: React.FC<Props> = ({ isSelected, onClick }) => (
  <button
    className={`size-3 rounded-full transition-all duration-300 ${isSelected
      ? 'scale-125 bg-primary shadow-elevation-2'
      : 'bg-surface-container hover:scale-110 hover:bg-surface-container-high'
      }`}
    onClick={onClick}
    aria-label={isSelected ? 'Diapositiva actual' : 'Ir a diapositiva'}
    aria-pressed={isSelected}
  />
)
