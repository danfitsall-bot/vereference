export const dynamic = "force-dynamic";

export default function RefLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-white">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-lg font-semibold">VeReference</h1>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="border-t mt-auto">
        <div className="max-w-2xl mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          Powered by VeReference &middot; AI-Powered Reference Verification
        </div>
      </footer>
    </div>
  );
}
