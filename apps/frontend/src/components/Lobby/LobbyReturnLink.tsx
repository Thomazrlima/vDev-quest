import { useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { shouldIgnoreKeyboardEvent } from "@/utils/lobby-navigation";

/**
 * Único caminho de volta ao vilarejo agora que a barra de navegação saiu.
 * Esc atalha o clique, mas nunca quando o foco está em um campo de formulário.
 */
export function LobbyReturnLink() {
    const navigate = useNavigate();

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key !== "Escape" || shouldIgnoreKeyboardEvent(event)) return;
            event.preventDefault();
            void navigate({ to: "/" });
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [navigate]);

    return (
        <Link className="lobby-return" to="/">
            <span aria-hidden="true">‹</span>
            Voltar ao vilarejo
            <kbd className="lobby-return__key">Esc</kbd>
        </Link>
    );
}
