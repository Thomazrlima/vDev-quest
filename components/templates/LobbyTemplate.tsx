"use client";

import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/atoms/BrandLogo";
import { LobbyMap } from "@/components/organisms/LobbyMap";
import { LOBBY_DESTINATIONS } from "@/data/lobby-map";
import { CHARACTER_UPDATED_EVENT, readStoredCharacter } from "@/utils/character-storage";
import { useCoarsePointer } from "@/utils/use-coarse-pointer";

export function LobbyTemplate() {
  const [name, setName] = useState("");
  const coarsePointer = useCoarsePointer();

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
      <LobbyMap />

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
