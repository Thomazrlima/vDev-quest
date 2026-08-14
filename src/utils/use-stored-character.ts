import { useEffect, useState } from "react";
import { CHARACTER_UPDATED_EVENT, readStoredCharacter, type StoredCharacter } from "@/utils/character-storage";

/**
 * A ficha gravada, acompanhando as alterações feitas na oficina — na mesma aba, pelo
 * evento próprio; em outra aba, pelo `storage` do navegador.
 */
export function useStoredCharacter(): StoredCharacter {
    const [character, setCharacter] = useState(readStoredCharacter);

    useEffect(() => {
        function refresh() {
            setCharacter(readStoredCharacter());
        }

        window.addEventListener(CHARACTER_UPDATED_EVENT, refresh);
        window.addEventListener("storage", refresh);
        return () => {
            window.removeEventListener(CHARACTER_UPDATED_EVENT, refresh);
            window.removeEventListener("storage", refresh);
        };
    }, []);

    return character;
}
