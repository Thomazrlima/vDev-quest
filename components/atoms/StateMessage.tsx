import type { ReactNode } from "react";

export function StateMessage({ children, icon }: { children: ReactNode; icon?: ReactNode }) {
  return <div className="p-10 text-center text-sm text-[#999383]">{icon}{children}</div>;
}
