import { Header } from '@/components/Header';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface">
        <main className="w-full">
          <Header.Public />
            {children}
        </main>
    </div>
  );
}