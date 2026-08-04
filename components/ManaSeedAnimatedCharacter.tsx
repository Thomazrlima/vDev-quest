"use client";

import { useEffect, useRef, useState } from "react";
import { ManaSeedSpriteLayers } from "@/components/ManaSeedSpriteLayers";
import { MANA_SEED_FREE } from "@/lib/manaSeed";

type ManaSeedAnimatedCharacterProps = {
  className?: string;
  alt: string;
};

const podiumAnimationEpoch = Date.now();

export function ManaSeedAnimatedCharacter({ className = "", alt }: ManaSeedAnimatedCharacterProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);
  const animation = MANA_SEED_FREE.animations.podiumWalk;

  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;

    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { threshold: 0.1 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const syncFrame = () => setFrameIndex(Math.floor((Date.now() - podiumAnimationEpoch) / animation.frameDurationMs) % animation.frames.length);
    syncFrame();
    const timer = window.setInterval(syncFrame, Math.max(50, animation.frameDurationMs / 2));

    return () => window.clearInterval(timer);
  }, [animation.frameDurationMs, animation.frames.length, isVisible]);

  return (
    <div ref={rootRef} role="img" aria-label={alt} className={`mana-seed-sprite ${className}`}>
      <ManaSeedSpriteLayers frame={animation.frames[frameIndex]} />
    </div>
  );
}
