import { CrownIcon } from "@/components/atoms/icons";
import { RankingBadge } from "@/components/atoms/RankingBadge";
import { ManaSeedSpriteLayers } from "@/components/molecules/ManaSeedSpriteLayers";
import { MANA_SEED_FREE } from "@/data/mana-seed";
import type { RankingLeader } from "@/types/ranking";
import { getManaSeedLayers } from "@/utils/mana-seed";

const podiumOrder = [2, 1, 3] as const;

export function RankingPodium({ leaders }: { leaders: RankingLeader[] }) {
  const orderedLeaders = podiumOrder.map((position) => leaders.find((leader) => leader.position === position)).filter((leader): leader is RankingLeader => Boolean(leader));

  return (
    <div className="ranking-podium" role="list" aria-label="Pódio dos três melhores aventureiros">
      {orderedLeaders.map((leader) => {
        const first = leader.position === 1;

        return (
          <article className={`ranking-champion ranking-champion--${leader.position}`} key={leader.position} role="listitem">
            <div className="ranking-player-plate">
              {first ? <CrownIcon className="ranking-player-crown" /> : null}
              <div className="ranking-player-name-row">
                <strong>{leader.name}</strong>
                <div className="ranking-player-badges">
                  {leader.badges.map((badge) => <RankingBadge badge={badge} compact key={badge} />)}
                </div>
              </div>
              <div className="ranking-player-meta">
                <span>Nível {leader.level}</span>
                <span>{leader.exp} XP</span>
              </div>
            </div>

            <div className="mana-seed-sprite ranking-podium-sprite" role="img" aria-label={`Personagem de ${leader.name}`}>
              <ManaSeedSpriteLayers frame={MANA_SEED_FREE.staticAvatarFrame} layers={getManaSeedLayers(leader.appearance)} />
            </div>

            <div className="ranking-podium-step">
              <strong className="ranking-position-medallion" aria-label={`${leader.position}º lugar`}>{leader.position}</strong>
            </div>
          </article>
        );
      })}
    </div>
  );
}
