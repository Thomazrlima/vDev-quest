import type { ManaSeedLayer, ManaSeedRecolor } from "@/types/character";

/**
 * Mana Seed sheets ship painted in placeholder ramps. Swapping a ramp means replacing a handful
 * of exact colours, so each (sheet, ramp) pair is rendered once through a canvas and cached as a
 * blob URL. Sheets that need no substitution are used straight from disk.
 */
const textures = new Map<string, string>();
/** Last texture produced for a sheet, whatever ramp it used. Stands in while the next one paints. */
const lastPainted = new Map<string, string>();
const inFlight = new Map<string, Promise<string>>();

export function getManaSeedTextureKey({ src, recolor }: ManaSeedLayer) {
    return recolor.length ? `${src}|${recolor.map(({ to }) => to).join(",")}` : src;
}

/** The exact texture for this ramp, or null when it still has to be painted. */
export function getManaSeedTexture(layer: ManaSeedLayer) {
    return layer.recolor.length === 0 ? layer.src : (textures.get(getManaSeedTextureKey(layer)) ?? null);
}

/**
 * What to paint right now. A layer must never resolve to nothing: dropping it mid-recolour makes
 * the part vanish from the character, and it would stay gone if the paint failed. Falling back to
 * the sheet's previous colour (or the untouched sheet) keeps the silhouette whole either way.
 */
export function getManaSeedVisibleTexture(layer: ManaSeedLayer) {
    return getManaSeedTexture(layer) ?? lastPainted.get(layer.src) ?? layer.src;
}

function toRgb(hex: string) {
    return parseInt(hex.slice(1), 16);
}

function paint(image: HTMLImageElement, recolor: ManaSeedRecolor) {
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d");
    if (!context) return canvas;
    context.drawImage(image, 0, 0);
    const frame = context.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = frame.data;
    const lookup = new Map(recolor.map(({ from, to }) => [toRgb(from), toRgb(to)]));

    for (let offset = 0; offset < pixels.length; offset += 4) {
        if (pixels[offset + 3] === 0) continue;
        const replacement = lookup.get((pixels[offset] << 16) | (pixels[offset + 1] << 8) | pixels[offset + 2]);
        if (replacement === undefined) continue;
        pixels[offset] = (replacement >> 16) & 255;
        pixels[offset + 1] = (replacement >> 8) & 255;
        pixels[offset + 2] = replacement & 255;
    }

    context.putImageData(frame, 0, 0);
    return canvas;
}

/**
 * The cache is never evicted on purpose. A blob URL that is still painted somewhere breaks the
 * moment it is revoked, and an entry can be on screen no matter how long ago it was created, so
 * there is no eviction order that is safe. Entries are ~20KB and keyed by (sheet, ramp), which
 * only grows as far as the player actually explores; the browser reclaims them on unload.
 */
function remember(key: string, src: string, url: string) {
    textures.set(key, url);
    lastPainted.set(src, url);
    return url;
}

/**
 * `decode()` is the clean way to wait for a bitmap, but it rejects in cases where the plain load
 * event still fires, so a rejection here is not proof the sheet is unusable.
 */
async function load(src: string) {
    const image = new Image();
    image.decoding = "async";
    image.src = src;
    try {
        await image.decode();
        return image;
    } catch {
        await new Promise<void>((resolve, reject) => {
            if (image.complete && image.naturalWidth > 0) return resolve();
            image.addEventListener("load", () => resolve(), { once: true });
            image.addEventListener("error", () => reject(new Error(`could not load ${src}`)), { once: true });
        });
        return image;
    }
}

export function loadManaSeedTexture(layer: ManaSeedLayer): Promise<string> {
    const key = getManaSeedTextureKey(layer);
    const cached = textures.get(key);
    if (cached) return Promise.resolve(cached);
    const running = inFlight.get(key);
    if (running) return running;

    const job = (async () => {
        const image = await load(layer.src);
        const canvas = paint(image, layer.recolor);
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
        return remember(key, layer.src, blob ? URL.createObjectURL(blob) : layer.src);
    })()
        // Resolve rather than reject: the caller redraws on settle, and a rejected batch would
        // leave the character frozen mid-recolour with no retry until something else changes.
        .catch(() => layer.src)
        .finally(() => inFlight.delete(key));

    inFlight.set(key, job);
    return job;
}
