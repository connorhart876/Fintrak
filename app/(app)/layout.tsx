import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6">
          <Link href="/" className="text-base font-semibold tracking-tight">
            Fintrak
          </Link>
          <LogoutButton />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 min-h-0">
        {children}
      </main>
    </div>
  );
}
