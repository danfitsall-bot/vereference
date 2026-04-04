export const dynamic = "force-dynamic";

export default function RefLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-white/8 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-sm">V</span>
            </div>
            <span className="text-base font-bold tracking-tight text-foreground">VeReference</span>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10">
        {children}
      </main>
      <footer className="border-t border-white/6 mt-auto">
        <div className="max-w-2xl mx-auto px-6 py-5 text-center text-xs text-white/25">
          Powered by VeReference &middot; AI-Powered Reference Verification
        </div>
      </footer>
    </div>
  );
}
