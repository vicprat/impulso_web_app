'use client';
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  );
}