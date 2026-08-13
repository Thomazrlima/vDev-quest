'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { CrownIcon, GridIcon, ScrollIcon } from '@/components/atoms/icons';
import {
  JOYSTICK_DEADZONE,
  JOYSTICK_RADIUS,
  LobbyJoystick,
} from '@/components/molecules/LobbyJoystick';
import {
  LobbyMinimap,
  MINIMAP_SCALE,
} from '@/components/molecules/LobbyMinimap';
import { ManaSeedSpriteLayers } from '@/components/molecules/ManaSeedSpriteLayers';
import {
  LOBBY_CORRIDORS,
  LOBBY_DESTINATIONS,
  LOBBY_MAP,
} from '@/data/lobby-map';
import type {
  LobbyDestinationIcon,
  LobbyDirection,
  LobbyPlayerPose,
  LobbyPoint,
} from '@/types/lobby';
import {
  CHARACTER_UPDATED_EVENT,
  readStoredCharacter,
} from '@/utils/character-storage';
import {
  IDLE_FRAME,
  clamp,
  directionFromVector,
  getDestinationByHref,
  getDestinationForPoint,
  isMovementKey,
  movementVector,
  resolveMove,
  shouldIgnoreKeyboardEvent,
  walkFrame,
} from '@/utils/lobby-navigation';
import { findLobbyPath, snapToNavmesh } from '@/utils/lobby-pathfinding';
import { readLobbyExit, rememberLobbyExit } from '@/utils/lobby-session';
import { getManaSeedLayers } from '@/utils/mana-seed';
import { useCoarsePointer } from '@/utils/use-coarse-pointer';

const WORLD_SIZE = LOBBY_MAP.size * LOBBY_MAP.zoom;
const SPRITE_SIZE = 64 * LOBBY_MAP.zoom * LOBBY_MAP.playerScale;
const CAMERA_EASING = 12;
const TRANSITION_MS = 180;
/** Distância que conta como "cheguei" num ponto da rota (px nativos). */
const WAYPOINT_RADIUS = 10;
/** Quadros parado seguindo rota antes de desistir dela. */
const STUCK_FRAME_LIMIT = 20;
/** Arrasto acima disso vira manche; abaixo, continua sendo um toque. */
const TAP_MAX_MS = 500;

type PointerGesture = {
  id: number;
  touch: boolean;
  startX: number;
  startY: number;
  startedAt: number;
  steering: boolean;
};

const DESTINATION_ICONS: Record<LobbyDestinationIcon, typeof CrownIcon> = {
  crown: CrownIcon,
  grid: GridIcon,
  scroll: ScrollIcon,
};

function toIdlePose(direction: LobbyDirection): LobbyPlayerPose {
  return { direction, frame: IDLE_FRAME[direction], moving: false };
}

function samePose(a: LobbyPlayerPose, b: LobbyPlayerPose) {
  return (
    a.direction === b.direction && a.frame === b.frame && a.moving === b.moving
  );
}

/** `onReady` avisa quando a arte do mapa terminou de carregar (ou falhou), para
 *  quem estiver segurando a tela de abertura poder sair da frente. */
export function LobbyMap({ onReady }: { onReady?: () => void }) {
  const router = useRouter();
  const [pose, setPose] = useState<LobbyPlayerPose>(() =>
    toIdlePose(LOBBY_MAP.spawnDirection),
  );
  const [activeHref, setActiveHref] = useState<string | null>(null);
  const [transitionHref, setTransitionHref] = useState<string | null>(null);
  const [avatarLayers, setAvatarLayers] = useState(() => getManaSeedLayers());
  const [debug, setDebug] = useState(false);
  const [tapMarker, setTapMarker] = useState<LobbyPoint | null>(null);
  const touchInput = useCoarsePointer();

  const viewportRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const minimapDotRef = useRef<HTMLSpanElement>(null);

  const positionRef = useRef<LobbyPoint>({ ...LOBBY_MAP.spawn });
  const cameraRef = useRef<LobbyPoint>({ x: 0, y: 0 });
  const viewportSizeRef = useRef({ width: 0, height: 0 });
  const poseRef = useRef(pose);
  const pressedKeysRef = useRef(new Set<string>());
  const activeHrefRef = useRef<string | null>(null);
  const routingRef = useRef(false);
  const transitionTimerRef = useRef<number | null>(null);
  const pathRef = useRef<LobbyPoint[]>([]);
  const stuckFramesRef = useRef(0);
  const joystickVectorRef = useRef<LobbyPoint | null>(null);
  const pointerRef = useRef<PointerGesture | null>(null);
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const joystickKnobRef = useRef<HTMLSpanElement>(null);

  const clearPath = useCallback(() => {
    pathRef.current = [];
    stuckFramesRef.current = 0;
    setTapMarker(null);
  }, []);

  /**
   * Uma fonte de direção por quadro, nesta ordem: teclado, manche, rota tocada.
   * O teclado e o manche já cancelam a rota ao serem acionados; a ordem aqui é
   * só a rede de segurança.
   */
  const steeringVector = useCallback(
    (position: LobbyPoint): LobbyPoint => {
      const keyboard = movementVector(pressedKeysRef.current);
      if (keyboard.x || keyboard.y) return keyboard;

      const stick = joystickVectorRef.current;
      if (stick) return stick;

      const path = pathRef.current;
      while (path.length) {
        const target = path[0];
        const dx = target.x - position.x;
        const dy = target.y - position.y;
        const length = Math.hypot(dx, dy);
        if (length <= WAYPOINT_RADIUS) {
          path.shift();
          if (!path.length) setTapMarker(null);
          continue;
        }
        return { x: dx / length, y: dy / length };
      }
      return { x: 0, y: 0 };
    },
    [],
  );

  /** Alvo da câmera: jogador centralizado, preso às bordas para não revelar vazio. */
  const cameraTarget = useCallback((position: LobbyPoint): LobbyPoint => {
    const { width, height } = viewportSizeRef.current;
    const rangeX = WORLD_SIZE - width;
    const rangeY = WORLD_SIZE - height;
    return {
      x:
        rangeX <= 0
          ? rangeX / 2
          : clamp(position.x * LOBBY_MAP.zoom - width / 2, 0, rangeX),
      y:
        rangeY <= 0
          ? rangeY / 2
          : clamp(position.y * LOBBY_MAP.zoom - height / 2, 0, rangeY),
    };
  }, []);

  const paint = useCallback(() => {
    const position = positionRef.current;
    const camera = cameraRef.current;
    if (playerRef.current) {
      playerRef.current.style.transform = `translate3d(${position.x * LOBBY_MAP.zoom}px, ${position.y * LOBBY_MAP.zoom}px, 0)`;
    }
    if (worldRef.current) {
      worldRef.current.style.transform = `translate3d(${-camera.x}px, ${-camera.y}px, 0)`;
    }
    if (minimapDotRef.current) {
      minimapDotRef.current.style.transform = `translate3d(${position.x * MINIMAP_SCALE}px, ${position.y * MINIMAP_SCALE}px, 0)`;
    }
  }, []);

  const enterDestination = useCallback(
    (href: string) => {
      if (routingRef.current) return;
      routingRef.current = true;
      pressedKeysRef.current.clear();
      rememberLobbyExit(href);
      setTransitionHref(href);
      transitionTimerRef.current = window.setTimeout(
        () => router.push(href),
        TRANSITION_MS,
      );
    },
    [router],
  );

  /** Ponto da tela para o espaço nativo da arte, descontando a câmera. */
  const toWorldPoint = useCallback(
    (clientX: number, clientY: number): LobbyPoint | null => {
      const viewport = viewportRef.current;
      if (!viewport) return null;
      const bounds = viewport.getBoundingClientRect();
      return {
        x: (clientX - bounds.left + cameraRef.current.x) / LOBBY_MAP.zoom,
        y: (clientY - bounds.top + cameraRef.current.y) / LOBBY_MAP.zoom,
      };
    },
    [],
  );

  const stopJoystick = useCallback(() => {
    joystickVectorRef.current = null;
    if (joystickBaseRef.current) {
      joystickBaseRef.current.classList.remove('lobby-joystick--active');
    }
  }, []);

  const handlePointerDown = useCallback((event: ReactPointerEvent) => {
    // Placas são botões de verdade e o minimapa não é chão: ambos tratam o
    // próprio toque, senão um toque neles viraria "ande até aqui".
    if ((event.target as HTMLElement).closest('button, a, .lobby-minimap')) {
      return;
    }

    pointerRef.current = {
      id: event.pointerId,
      touch: event.pointerType !== 'mouse',
      startX: event.clientX,
      startY: event.clientY,
      startedAt: event.timeStamp,
      steering: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent) => {
      const gesture = pointerRef.current;
      if (!gesture || gesture.id !== event.pointerId || !gesture.touch) return;

      const dx = event.clientX - gesture.startX;
      const dy = event.clientY - gesture.startY;
      const length = Math.hypot(dx, dy);
      if (!gesture.steering && length < JOYSTICK_DEADZONE) return;

      if (!gesture.steering) {
        gesture.steering = true;
        clearPath();
        const viewport = viewportRef.current;
        const base = joystickBaseRef.current;
        if (viewport && base) {
          const bounds = viewport.getBoundingClientRect();
          base.style.transform = `translate3d(${gesture.startX - bounds.left - JOYSTICK_RADIUS}px, ${gesture.startY - bounds.top - JOYSTICK_RADIUS}px, 0)`;
          base.classList.add('lobby-joystick--active');
        }
      }

      joystickVectorRef.current =
        length > 0 ? { x: dx / length, y: dy / length } : null;

      const knob = joystickKnobRef.current;
      if (knob) {
        const reach = Math.min(length, JOYSTICK_RADIUS);
        const scale = length > 0 ? reach / length : 0;
        knob.style.transform = `translate3d(${dx * scale}px, ${dy * scale}px, 0)`;
      }
    },
    [clearPath],
  );

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent) => {
      const gesture = pointerRef.current;
      if (!gesture || gesture.id !== event.pointerId) return;
      pointerRef.current = null;

      if (gesture.steering) {
        stopJoystick();
        return;
      }

      // Arrasto curto demais para ser manche e rápido o bastante: é um toque.
      const travel = Math.hypot(
        event.clientX - gesture.startX,
        event.clientY - gesture.startY,
      );
      if (travel >= JOYSTICK_DEADZONE) return;
      if (event.timeStamp - gesture.startedAt > TAP_MAX_MS) return;

      const world = toWorldPoint(event.clientX, event.clientY);
      const target = world && snapToNavmesh(world);
      if (!target) return;

      const path = findLobbyPath(positionRef.current, target);
      if (!path.length) return;

      pressedKeysRef.current.clear();
      pathRef.current = path;
      stuckFramesRef.current = 0;
      setTapMarker(target);
    },
    [stopJoystick, toWorldPoint],
  );

  const handlePointerCancel = useCallback(() => {
    pointerRef.current = null;
    stopJoystick();
  }, [stopJoystick]);

  // Posição inicial antes da primeira pintura: volta pelo mesmo portão por onde saiu.
  useLayoutEffect(() => {
    setDebug(window.location.search.includes('debug'));

    const exit = getDestinationByHref(readLobbyExit());
    positionRef.current = { ...(exit ? exit.arrival : LOBBY_MAP.spawn) };
    poseRef.current = toIdlePose(exit ? 'down' : LOBBY_MAP.spawnDirection);
    setPose(poseRef.current);

    const viewport = viewportRef.current;
    if (viewport)
      viewportSizeRef.current = {
        width: viewport.clientWidth,
        height: viewport.clientHeight,
      };
    cameraRef.current = cameraTarget(positionRef.current);
    paint();

    const destination = getDestinationForPoint(positionRef.current);
    activeHrefRef.current = destination?.href ?? null;
    setActiveHref(activeHrefRef.current);
  }, [cameraTarget, paint]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const observer = new ResizeObserver(() => {
      viewportSizeRef.current = {
        width: viewport.clientWidth,
        height: viewport.clientHeight,
      };
      cameraRef.current = cameraTarget(positionRef.current);
      paint();
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [cameraTarget, paint]);

  useEffect(() => {
    function refreshAvatar() {
      setAvatarLayers(getManaSeedLayers(readStoredCharacter().appearance));
    }

    refreshAvatar();
    window.addEventListener(CHARACTER_UPDATED_EVENT, refreshAvatar);
    window.addEventListener('storage', refreshAvatar);
    return () => {
      window.removeEventListener(CHARACTER_UPDATED_EVENT, refreshAvatar);
      window.removeEventListener('storage', refreshAvatar);
    };
  }, []);

  useEffect(() => {
    let animationFrame = 0;
    let lastTime = performance.now();

    function tick(time: number) {
      const deltaSeconds = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      const vector = routingRef.current
        ? { x: 0, y: 0 }
        : steeringVector(positionRef.current);
      const previous = positionRef.current;

      if (vector.x || vector.y) {
        const distance = LOBBY_MAP.playerSpeed * deltaSeconds;
        positionRef.current = resolveMove(previous, {
          x: previous.x + vector.x * distance,
          y: previous.y + vector.y * distance,
        });
      }

      const position = positionRef.current;
      const moving = position.x !== previous.x || position.y !== previous.y;

      // Rota travada numa quina do corredor: desiste em vez de vibrar no lugar.
      if (pathRef.current.length && !moving) {
        stuckFramesRef.current += 1;
        if (stuckFramesRef.current > STUCK_FRAME_LIMIT) clearPath();
      } else {
        stuckFramesRef.current = 0;
      }

      const direction = directionFromVector(vector, poseRef.current.direction);
      const nextPose: LobbyPlayerPose = {
        direction,
        frame: moving ? walkFrame(direction, time) : IDLE_FRAME[direction],
        moving,
      };

      if (!samePose(nextPose, poseRef.current)) {
        poseRef.current = nextPose;
        setPose(nextPose);
      }

      const target = cameraTarget(position);
      const ease = Math.min(1, deltaSeconds * CAMERA_EASING);
      cameraRef.current = {
        x: cameraRef.current.x + (target.x - cameraRef.current.x) * ease,
        y: cameraRef.current.y + (target.y - cameraRef.current.y) * ease,
      };
      paint();

      if (moving) {
        const nextHref = getDestinationForPoint(position)?.href ?? null;
        if (activeHrefRef.current !== nextHref) {
          activeHrefRef.current = nextHref;
          setActiveHref(nextHref);
          if (nextHref) router.prefetch(nextHref);
        }
      }

      animationFrame = window.requestAnimationFrame(tick);
    }

    animationFrame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [cameraTarget, clearPath, paint, router, steeringVector]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (shouldIgnoreKeyboardEvent(event)) return;
      const key = event.key.toLowerCase();

      if (isMovementKey(key)) {
        pressedKeysRef.current.add(key);
        clearPath();
        event.preventDefault();
        return;
      }

      if (key === 'e' && activeHrefRef.current) {
        event.preventDefault();
        enterDestination(activeHrefRef.current);
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      pressedKeysRef.current.delete(event.key.toLowerCase());
    }

    function clearMovement() {
      pressedKeysRef.current.clear();
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', clearMovement);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', clearMovement);
      if (transitionTimerRef.current)
        window.clearTimeout(transitionTimerRef.current);
    };
  }, [enterDestination]);

  const stageStyle = {
    '--lobby-world': `${WORLD_SIZE}px`,
    '--lobby-sprite': `${SPRITE_SIZE}px`,
  } as CSSProperties;

  return (
    <div
      className="lobby__viewport"
      ref={viewportRef}
      role="application"
      aria-label="Vilarejo navegável"
      onPointerCancel={handlePointerCancel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={stageStyle}
    >
      <div className="lobby__world" ref={worldRef}>
        {tapMarker ? (
          <span
            aria-hidden="true"
            className="lobby__tap-marker"
            style={{
              left: `${tapMarker.x * LOBBY_MAP.zoom}px`,
              top: `${tapMarker.y * LOBBY_MAP.zoom}px`,
            }}
          />
        ) : null}

        <Image
          alt=""
          className="lobby__map"
          height={LOBBY_MAP.size}
          onError={onReady}
          onLoad={onReady}
          priority
          quality={92}
          src={LOBBY_MAP.src}
          width={LOBBY_MAP.size}
        />

        {debug ? (
          <div className="lobby__debug" aria-hidden="true">
            {LOBBY_CORRIDORS.map((corridor) => {
              const length =
                Math.hypot(
                  corridor.b.x - corridor.a.x,
                  corridor.b.y - corridor.a.y,
                ) * LOBBY_MAP.zoom;
              const angle =
                (Math.atan2(
                  corridor.b.y - corridor.a.y,
                  corridor.b.x - corridor.a.x,
                ) *
                  180) /
                Math.PI;
              const thickness = corridor.width * LOBBY_MAP.zoom;
              return (
                <span
                  className="lobby__debug-corridor"
                  key={`${corridor.a.x},${corridor.a.y}-${corridor.b.x},${corridor.b.y}`}
                  style={{
                    left: `${corridor.a.x * LOBBY_MAP.zoom}px`,
                    top: `${corridor.a.y * LOBBY_MAP.zoom}px`,
                    width: `${length + thickness}px`,
                    height: `${thickness}px`,
                    transform: `translate(${-thickness / 2}px, ${-thickness / 2}px) rotate(${angle}deg)`,
                    transformOrigin: `${thickness / 2}px ${thickness / 2}px`,
                    borderRadius: `${thickness}px`,
                  }}
                />
              );
            })}
            {LOBBY_DESTINATIONS.map((destination) => (
              <span
                className="lobby__debug-arrival"
                key={destination.href}
                style={{
                  left: `${(destination.arrival.x - destination.radius) * LOBBY_MAP.zoom}px`,
                  top: `${(destination.arrival.y - destination.radius) * LOBBY_MAP.zoom}px`,
                  width: `${destination.radius * 2 * LOBBY_MAP.zoom}px`,
                  height: `${destination.radius * 2 * LOBBY_MAP.zoom}px`,
                }}
              />
            ))}
          </div>
        ) : null}

        {LOBBY_DESTINATIONS.map((destination) => {
          const Icon = DESTINATION_ICONS[destination.icon];
          const near = activeHref === destination.href;
          return (
            <div
              className={`lobby__marker ${near ? 'lobby__marker--near' : ''}`}
              key={destination.href}
              style={{
                left: `${destination.arrival.x * LOBBY_MAP.zoom}px`,
                top: `${destination.arrival.y * LOBBY_MAP.zoom}px`,
              }}
            >
              <button
                aria-label={`Entrar em ${destination.label}`}
                className="lobby__sign"
                onClick={() => enterDestination(destination.href)}
                type="button"
              >
                <Icon className="lobby__sign-icon" />
                <span className="lobby__sign-label">{destination.sign}</span>
              </button>
              {near ? (
                <p aria-live="polite" className="lobby__prompt">
                  {touchInput ? (
                    <>
                      Toque na placa para entrar em {destination.label}
                    </>
                  ) : (
                    <>
                      Pressione <b>[E]</b> para entrar em {destination.label}
                    </>
                  )}
                </p>
              ) : null}
            </div>
          );
        })}

        <div
          className={`lobby__player lobby__player--${pose.direction} ${pose.moving ? 'lobby__player--moving' : ''}`}
          ref={playerRef}
        >
          <span className="lobby__player-shadow" aria-hidden="true" />
          <span className="mana-seed-sprite lobby__player-sprite">
            <ManaSeedSpriteLayers frame={pose.frame} layers={avatarLayers} />
          </span>
        </div>
      </div>

      <LobbyJoystick baseRef={joystickBaseRef} knobRef={joystickKnobRef} />

      <LobbyMinimap dotRef={minimapDotRef} />

      {transitionHref ? (
        <span aria-hidden="true" className="lobby__fade" />
      ) : null}
    </div>
  );
}
