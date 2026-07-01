import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex items-center justify-center p-8">
      <div className="w-full max-w-md border border-border bg-surface p-8" style={{ clipPath: "var(--clip-corner-md)" }}>
        <div className="text-center mb-8">
          <div className="text-xs text-sci-blue tracking-[0.2em] mb-4">
            ▶ SYSTEM INITIALIZED — VAULT ONLINE
          </div>
          <pre className="font-mono text-xl font-bold text-sci-green leading-tight tracking-[0.12em] mb-4" style={{ textShadow: "var(--text-glow-green)" }}>
{`╔══════════════════╗
║  CITADEL  VAULT  ║
╚══════════════════╝`}
          </pre>
          <p className="text-sm text-sci-bone tracking-wide">
            Secure, zero-knowledge password management.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Button variant="info" className="w-full" asChild>
            <Link href="/login">INITIALIZE NEW VAULT</Link>
          </Button>
          <Button variant="default" className="w-full" asChild>
            <Link href="/login">DECRYPT EXISTING VAULT</Link>
          </Button>
        </div>
        
        <div className="mt-8 pt-4 border-t border-border flex justify-between items-center text-xs font-mono tracking-widest">
          <span className="text-sci-blue">SYS:SECURE</span>
          <span className="text-sci-green" style={{ textShadow: "var(--text-glow-green)" }}>● READY</span>
        </div>
      </div>
    </main>
  );
}
