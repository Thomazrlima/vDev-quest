import { BrandLogo } from "@/components/atoms/BrandLogo";

type QuestLoaderProps = {
  /** Texto anunciado para leitores de tela e exibido sob o logo. */
  label?: string;
  hint?: string;
  /** Cobre a tela inteira: usado em transição de rota e na abertura do vilarejo. */
  fullscreen?: boolean;
  /** Some com um fade em vez de sumir de um quadro para o outro. */
  leaving?: boolean;
  className?: string;
};

export function QuestLoader({ label = "Carregando...", hint, fullscreen = false, leaving = false, className = "" }: QuestLoaderProps) {
  return (
    <div
      aria-live="polite"
      className={`quest-loader ${fullscreen ? "quest-loader--fullscreen" : ""} ${leaving ? "quest-loader--leaving" : ""} ${className}`}
      role="status"
    >
      <span className="quest-loader__stage">
        <span aria-hidden="true" className="quest-loader__halo" />
        <BrandLogo className="quest-loader__mark" imageClassName="quest-loader__image" priority={fullscreen} size={256} />
      </span>
      <p className="quest-loader__label">{label}</p>
      <span aria-hidden="true" className="quest-loader__bar">
        <span />
      </span>
      {hint ? <p className="quest-loader__hint">{hint}</p> : null}
    </div>
  );
}
