export default function TicketsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="overflow-x-hidden">
        {children}
      </main>
    </>
  );
}

