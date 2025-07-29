// Forzar que el layout sea dinámico
export const dynamic = 'force-dynamic'

export default function ManageInventoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}