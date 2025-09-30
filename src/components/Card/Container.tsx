interface Props {
  children: React.ReactNode
}
export const Container: React.FC<Props> = ({ children }) => {
  return (
    <div className='mb-12 grid grid-cols-3 gap-4  sm:px-4  lg:px-6 xl:grid-cols-4 2xl:grid-cols-5'>
      {children}
    </div>
  )
}
