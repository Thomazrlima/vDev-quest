import { useCallback, useEffect, useState } from "react";
import { NAVIGATION_MODE_EVENT, readNavigationMode, saveNavigationMode, type NavigationMode } from "@/utils/navigation-preference";

/**
 * O modo de navegação escolhido, e como trocá-lo. A troca precisa chegar à mesma tela em que
 * foi feita — o menu e o link de volta ao vilarejo vivem no layout, acima da página de perfil.
 */
export function useNavigationMode(): [NavigationMode, (mode: NavigationMode) => void] {
    const [mode, setMode] = useState(readNavigationMode);

    useEffect(() => {
        function refresh() {
            setMode(readNavigationMode());
        }

        window.addEventListener(NAVIGATION_MODE_EVENT, refresh);
        window.addEventListener("storage", refresh);
        return () => {
            window.removeEventListener(NAVIGATION_MODE_EVENT, refresh);
            window.removeEventListener("storage", refresh);
        };
    }, []);

    return [mode, useCallback((next: NavigationMode) => saveNavigationMode(next), [])];
}
