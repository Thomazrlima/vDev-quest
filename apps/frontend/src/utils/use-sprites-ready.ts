import { useEffect, useReducer } from "react";
import { getManaSeedTexture, getManaSeedTextureKey, loadManaSeedTexture } from "@/components/ManaSeed/textures";
import type { ManaSeedLayer } from "@/types/character";

/**
 * Camadas cuja carga já terminou nesta sessão, chaveadas por (folha, rampa). Falha entra aqui
 * também: uma imagem que nunca vai chegar não pode segurar a tela de carregamento para sempre.
 */
const settled = new Set<string>();
/** Cargas em andamento, para que a mesma camada não seja pedida duas vezes. */
const loading = new Map<string, Promise<void>>();

/**
 * Uma camada só está pronta quando existe o bitmap exato que ela vai pintar. Peça recolorida
 * passa por um canvas antes de virar textura, e até essa pintura terminar o desenho cai na folha
 * original — nas rampas de teste, não na cor escolhida. Peça que já vem pintada não tem o que
 * trocar, mas ainda precisa ter chegado da rede, senão aparece depois do resto do herói.
 */
function isLayerReady(layer: ManaSeedLayer) {
    if (settled.has(getManaSeedTextureKey(layer))) return true;
    // Textura pintada em outra tela (a prévia da oficina) vale aqui: o cache é o mesmo.
    return layer.recolor.length > 0 && getManaSeedTexture(layer) !== null;
}

/** Folha sem recolorir: basta o download. Erro resolve igual, para não travar a espera. */
function loadSheet(src: string) {
    return new Promise<void>((resolve) => {
        const image = new Image();
        image.decoding = "async";
        image.addEventListener("load", () => resolve(), { once: true });
        image.addEventListener("error", () => resolve(), { once: true });
        image.src = src;
        // Folha que já estava no cache do navegador pode nem disparar `load`.
        if (image.complete) resolve();
    });
}

function loadLayer(layer: ManaSeedLayer) {
    const key = getManaSeedTextureKey(layer);
    const running = loading.get(key);
    if (running) return running;

    const job = (layer.recolor.length === 0 ? loadSheet(layer.src) : loadManaSeedTexture(layer).then(() => undefined)).then(() => {
        settled.add(key);
        loading.delete(key);
    });

    loading.set(key, job);
    return job;
}

/**
 * `false` enquanto qualquer camada ainda estiver a caminho — o momento de mostrar a tela de
 * carregamento. Vira `true` só quando todas podem ser pintadas no mesmo quadro, que é o que
 * evita o herói aparecer sem cabelo, e depois com a cor errada.
 */
export function useSpritesReady(layers: readonly ManaSeedLayer[]) {
    const [, redraw] = useReducer((tick: number) => tick + 1, 0);
    // Lido do cache a cada render em vez de guardado em estado: quem responde se a textura
    // existe é o cache, e ele muda por fora do React.
    const ready = layers.every(isLayerReady);

    useEffect(() => {
        if (ready) return;
        let active = true;
        void Promise.all(layers.map(loadLayer)).then(() => {
            if (active) redraw();
        });
        return () => {
            active = false;
        };
    }, [layers, ready]);

    return ready;
}
