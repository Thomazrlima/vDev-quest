import { api } from "@/api/client";
import { profileService } from "@/api/profile";
import type { StoredCharacter } from "@/utils/character-storage";
import { DEFAULT_CHARACTER } from "@/utils/character-storage";
import { MANA_SEED_SLOTS } from "@/mocks/data/mana-seed";
import { queryClient } from "@/api/queryClient";

type AvatarItem = { id: string; slot: string; code: string };
type Avatar = { bodyType: "hero" | "heroine"; skinColorIndex: number; slots: { slot: string; item: AvatarItem | null; colorIndex: number }[] };

export const avatarService = {
    async read(): Promise<StoredCharacter> {
        const [profile, avatar] = await Promise.all([queryClient.fetchQuery({ queryKey: ["profile", "me"], queryFn: profileService.me }), api<Avatar>("/me/avatar")]);
        const appearance = { ...DEFAULT_CHARACTER.appearance };
        const colors = { ...DEFAULT_CHARACTER.colors, skin: avatar.skinColorIndex };
        for (const slot of avatar.slots) {
            if (!(slot.slot in appearance)) continue;
            const key = slot.slot as keyof typeof appearance;
            appearance[key] = slot.item?.code ?? null;
            colors[key] = slot.colorIndex;
        }
        return { name: profile.name, appearance, colors, bodyType: avatar.bodyType };
    },
    async save(character: StoredCharacter): Promise<void> {
        const catalog = await api<AvatarItem[]>("/avatar/catalog");
        const bySlotAndCode = new Map(catalog.map((item) => [`${item.slot}/${item.code}`, item.id]));
        const slots = MANA_SEED_SLOTS.map(({ slot }) => ({
            slot, itemId: character.appearance[slot] ? bySlotAndCode.get(`${slot}/${character.appearance[slot]}`) ?? null : null,
            colorIndex: character.colors[slot],
        }));
        for (const slot of slots) if (character.appearance[slot.slot] && !slot.itemId) throw new Error(`Peça de avatar não encontrada no catálogo: ${slot.slot}.`);
        await api<Avatar>("/me/avatar", { method: "PATCH", body: JSON.stringify({ bodyType: character.bodyType, skinColorIndex: character.colors.skin, slots }) });
        await profileService.rename(character.name);
    },
};
