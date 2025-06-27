interface Props {
  children: React.ReactNode
}
export const Container: React.FC<Props> = ({ children }) => {
  return (
    <div className='mb-12 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'>
      {children}
    </div>
  )
}
