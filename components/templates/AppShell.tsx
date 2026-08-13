import type { ReactNode } from "react";
import { LobbyReturnLink } from "@/components/atoms/LobbyReturnLink";

export function AppShell({ children, width = "max-w-7xl", className = "" }: { children: ReactNode; width?: string; className?: string }) {
  return <div className={`min-h-screen bg-[linear-gradient(rgba(8,10,8,.90),rgba(8,10,8,.97)),url('/art/quest-landscape.png')] bg-cover bg-fixed bg-center ${className}`}><LobbyReturnLink /><main className={`mx-auto px-4 pb-8 pt-20 sm:px-6 sm:pb-10 ${width}`}>{children}</main></div>;
}
