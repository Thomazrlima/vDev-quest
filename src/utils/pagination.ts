/** Um botão da paginação: o número de uma página ou o salto que ficou entre duas delas. */
export type PageItem = number | "gap";

/** Sempre ao menos uma página, mesmo sem nada para mostrar: a lista vazia continua sendo a página 1. */
export function pageCountOf(total: number, pageSize: number) {
    return Math.max(1, Math.ceil(total / pageSize));
}

/** Uma página fora do intervalo vira a mais próxima que existe — filtrar não pode deixar a tela em branco. */
export function clampPage(page: number, pageCount: number) {
    return Math.min(Math.max(Math.trunc(page), 1), pageCount);
}

/** A fatia que a página mostra, já protegida contra uma página que a lista não tem mais. */
export function pageSlice<T>(items: T[], page: number, pageSize: number) {
    const start = (clampPage(page, pageCountOf(items.length, pageSize)) - 1) * pageSize;
    return items.slice(start, start + pageSize);
}

/**
 * Os números que a paginação desenha: a primeira, a última, as vizinhas da página atual e,
 * no lugar do que ficou de fora, o salto que vira reticências na tela.
 */
export function pageItems(page: number, pageCount: number, siblings = 1): PageItem[] {
    const current = clampPage(page, pageCount);
    const pages = new Set([1, pageCount]);

    for (let offset = -siblings; offset <= siblings; offset += 1) {
        const candidate = current + offset;
        if (candidate >= 1 && candidate <= pageCount) pages.add(candidate);
    }

    const sorted = [...pages].sort((a, b) => a - b);
    return sorted.flatMap((value, index) => (index > 0 && value - sorted[index - 1] > 1 ? (["gap", value] as PageItem[]) : [value]));
}
