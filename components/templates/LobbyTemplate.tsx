"use client";

import { useCallback, useEffect, useState } from "react";
import { BrandLogo } from "@/components/atoms/BrandLogo";
import { QuestLoader } from "@/components/atoms/QuestLoader";
import { LobbyMap } from "@/components/organisms/LobbyMap";
import { LOBBY_DESTINATIONS } from "@/data/lobby-map";
import { CHARACTER_UPDATED_EVENT, readStoredCharacter } from "@/utils/character-storage";
import { useCoarsePointer } from "@/utils/use-coarse-pointer";

/** Tempo do fade da abertura: precisa bater com `quest-loader-out` no CSS. */
const BOOT_FADE_MS = 260;
/** Rede de segurança: nenhuma falha de carregamento do mapa prende o vilarejo. */
const BOOT_TIMEOUT_MS = 6000;

export function LobbyTemplate() {
  const [name, setName] = useState("");
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

    refreshName();
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

      {booting ? (
        <QuestLoader fullscreen hint="Desenhando o vilarejo" label="Preparando a jornada..." leaving={mapReady} />
      ) : null}

      <header className="lobby__hud">
        <BrandLogo className="lobby__brand" href="/" imageClassName="lobby__brand-image" priority />
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
          <a className="lobby__route" href={destination.href} key={destination.href}>
            {destination.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
