import { useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Logout } from "pixelarticons/react";
import { useAuth } from "@/auth/useAuth";
import { Button } from "@/components/ui/Button";
import { shouldIgnoreKeyboardEvent } from "@/utils/lobby-navigation";

/**
 * Único caminho de volta ao vilarejo agora que a barra de navegação saiu.
 * Esc atalha o clique, mas nunca quando o foco está em um campo de formulário.
 */
export function LobbyReturnLink() {
    const navigate = useNavigate();
    const { signOut } = useAuth();

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key !== "Escape" || shouldIgnoreKeyboardEvent(event)) return;
            event.preventDefault();
            void navigate({ to: "/" });
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [navigate]);

    return <>
        <Link className="lobby-return" to="/">
            <span aria-hidden="true">‹</span>
            Voltar ao vilarejo
            <kbd className="lobby-return__key">Esc</kbd>
        </Link>
        <Button type="button" onClick={() => void signOut()} variant="ghost" className="fixed top-3.5 right-3.5 z-40 border-[#4b3518] bg-[#080a08e6] px-3 py-[7px] text-[.64rem] text-[#f0dfb6] shadow-[4px_4px_0_rgba(0,0,0,.55)] hover:border-[#d99a2b] hover:text-[#f1c461] sm:top-[14px] sm:right-[14px]" aria-label="Sair da conta">
            <Logout className="h-4 w-4" aria-hidden="true" />
            Sair
        </Button>
    </>;
}
