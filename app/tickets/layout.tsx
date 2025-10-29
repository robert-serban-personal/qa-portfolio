import Navigation from '@/components/ui/Navigation';

export default function TicketsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navigation />
      <main className="overflow-x-hidden pt-20">
        {children}
      </main>
    </>
  );
}

