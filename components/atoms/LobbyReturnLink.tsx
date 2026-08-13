"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { shouldIgnoreKeyboardEvent } from "@/utils/lobby-navigation";

/**
 * Único caminho de volta ao vilarejo agora que a barra de navegação saiu.
 * Esc atalha o clique, mas nunca quando o foco está em um campo de formulário.
 */
export function LobbyReturnLink() {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape" || shouldIgnoreKeyboardEvent(event)) return;
      event.preventDefault();
      router.push("/");
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return (
    <Link className="lobby-return" href="/">
      <span aria-hidden="true">‹</span>
      Voltar ao vilarejo
      <kbd className="lobby-return__key">Esc</kbd>
    </Link>
  );
}
