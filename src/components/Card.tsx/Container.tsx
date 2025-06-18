type Props = {
  children: React.ReactNode
}
export const Container: React.FC<Props> = ({children}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-12">
      {children}
    </div>
  )
}