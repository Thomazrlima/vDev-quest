import { SparkIcon } from "@/components/atoms/icons";
import { RankingBadge } from "@/components/atoms/RankingBadge";
import { ManaSeedAvatar } from "@/components/molecules/ManaSeedAvatar";
import type { RankingEntry } from "@/types/ranking";
import { getManaSeedLayers } from "@/utils/mana-seed";

export function RankingTable({ entries }: { entries: RankingEntry[] }) {
  return (
    <section className="ranking-ledger" aria-labelledby="ranking-table-title">
      <header className="ranking-ledger-heading">
        <div>
          <p>Classificação geral</p>
          <h2 id="ranking-table-title">Ranking de Aventureiros</h2>
        </div>
        <span><SparkIcon /> Atualizado há 2 min</span>
      </header>

      <div className="ranking-table-scroll">
        <div className="ranking-table">
          <div className="ranking-table-head" role="row">
            <span>Pos.</span>
            <span>Aventureiro</span>
            <span>Nível / EXP</span>
          </div>

          {entries.map((person) => (
            <article className="ranking-table-row" key={person.position}>
              <strong className="ranking-row-position">{String(person.position).padStart(2, "0")}</strong>

              <div className="ranking-adventurer">
                <ManaSeedAvatar size="md" alt={`Retrato de ${person.name}`} layers={getManaSeedLayers(person.appearance)} className="ranking-avatar" />
                <div>
                  <div className="ranking-adventurer-name-row">
                    <h3>{person.name}</h3>
                    <div className="ranking-adventurer-badges">
                      {person.badges.map((badge) => <RankingBadge badge={badge} compact key={badge} />)}
                    </div>
                  </div>
                  <p>{person.title}</p>
                </div>
              </div>

              <div className="ranking-level-exp" aria-label={`Nível ${person.level}, ${person.exp} de experiência`}>
                <div className="ranking-level-exp-values">
                  <span>Nível <strong>{person.level}</strong></span>
                  <b>{person.exp} XP</b>
                </div>
                <div className="ranking-exp-track" aria-label={`${person.progress}% para o próximo nível`}>
                  <span style={{ width: `${person.progress}%` }} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
