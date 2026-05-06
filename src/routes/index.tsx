import { createFileRoute } from "@tanstack/react-router";
import { SignatureStudio, StudioHeader } from "@/components/SignatureStudio";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-background">
      <StudioHeader />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <SignatureStudio />
      </section>
      <footer className="border-t border-border/60 py-6 sm:py-8 mt-6 sm:mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} EKO Elektrofrigo · Studio za potpise</span>
          <span className="font-mono">v1.0 · Piksel-savršenstvo · Multi-klijent</span>
        </div>
      </footer>
      <Toaster richColors position="bottom-right" />
    </main>
  );
}
