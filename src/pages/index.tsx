import { useCallback, useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { LobbyMap } from "@/components/Lobby/LobbyMap";
import { QuestLoader } from "@/components/ui/QuestLoader";
import { LOBBY_DESTINATIONS } from "@/mocks/data/lobby-map";
import { CHARACTER_UPDATED_EVENT, readStoredCharacter } from "@/utils/character-storage";
import { useCoarsePointer } from "@/utils/use-coarse-pointer";

/** Tempo do fade da abertura: precisa bater com `quest-loader-out` no CSS. */
const BOOT_FADE_MS = 260;
/** Rede de segurança: nenhuma falha de carregamento do mapa prende o vilarejo. */
const BOOT_TIMEOUT_MS = 6000;

export const Route = createFileRoute("/")({
    component: LobbyPage,
});

function LobbyPage() {
    const [name, setName] = useState(() => readStoredCharacter().name);
    const [mapReady, setMapReady] = useState(false);
    const [booting, setBooting] = useState(true);
    const coarsePointer = useCoarsePointer();
    const handleMapReady = useCallback(() => setMapReady(true), []);

    // A arte do vilarejo é grande: seguramos a abertura até ela existir na tela,
    // senão o primeiro quadro é um vazio preto com o avatar solto no meio.
    useEffect(() => {
        const timer = window.setTimeout(() => setBooting(false), mapReady ? BOOT_FADE_MS : BOOT_TIMEOUT_MS);
        return () => window.clearTimeout(timer);
    }, [mapReady]);

    useEffect(() => {
        function refreshName() {
            setName(readStoredCharacter().name);
        }

        window.addEventListener(CHARACTER_UPDATED_EVENT, refreshName);
        window.addEventListener("storage", refreshName);
        return () => {
            window.removeEventListener(CHARACTER_UPDATED_EVENT, refreshName);
            window.removeEventListener("storage", refreshName);
        };
    }, []);

    return (
        <div className="lobby">
            <LobbyMap onReady={handleMapReady} />

            {booting ? <QuestLoader fullscreen hint="Desenhando o vilarejo" label="Preparando a jornada..." leaving={mapReady} /> : null}

            <header className="lobby__hud">
                <Logo className="lobby__brand" imageClassName="lobby__brand-image" priority />
                <div className="lobby__hud-text">
                    <p className="lobby__hud-name">{name || "Aventureiro"}</p>
                    <p className="lobby__hud-hint">
                        {coarsePointer ? (
                            <>
                                <b>Toque</b> no caminho ou <b>arraste</b> para o manche
                            </>
                        ) : (
                            <>
                                <b>WASD</b>, <b>setas</b> ou <b>clique</b> no caminho
                            </>
                        )}
                    </p>
                </div>
            </header>

            {/* Rotas reais: leitores de tela e toque não dependem do teclado. */}
            <nav className="lobby__routes" aria-label="Destinos do vilarejo">
                {LOBBY_DESTINATIONS.map((destination) => (
                    <Link className="lobby__route" key={destination.href} to={destination.href}>
                        {destination.label}
                    </Link>
                ))}
            </nav>
        </div>
    );
}
