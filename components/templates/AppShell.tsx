import type { ReactNode } from "react";
import { GameNav } from "@/components/organisms/GameNav";

export function AppShell({ children, width = "max-w-7xl", className = "" }: { children: ReactNode; width?: string; className?: string }) {
  return <div className={`min-h-screen bg-[linear-gradient(rgba(8,10,8,.90),rgba(8,10,8,.97)),url('/art/quest-landscape.png')] bg-cover bg-fixed bg-center ${className}`}><GameNav /><main className={`mx-auto px-4 py-8 sm:px-6 sm:py-10 ${width}`}>{children}</main></div>;
}
