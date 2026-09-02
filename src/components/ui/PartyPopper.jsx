import React, { useRef } from "react";
import gsap from "gsap";

function random(min, max) {
  return Math.random() * (max - min) + min;
}

const DIRECTION_ANGLES = {
  center: { center: 0, spread: 180, streamerCenter: 315, streamerSpread: 25 },
  down: { center: 90, spread: 60, streamerCenter: 90, streamerSpread: 40 },
  left: { center: 180, spread: 60, streamerCenter: 180, streamerSpread: 40 },
  right: { center: 0, spread: 60, streamerCenter: 0, streamerSpread: 40 },
  up: { center: 270, spread: 60, streamerCenter: 270, streamerSpread: 40 },
};

function randomAngle(center, spread) {
  return center + random(-spread, spread);
}

export function PartyPopper({
  children,
  className = "",
  particleCount = 12,
  streamerCount = 4,
  direction = "center",
  colors: colorsProp,
  particleSizeMin = 8,
  particleSizeMax = 12,
  streamerWidthMin = 25,
  streamerWidthMax = 35,
  streamerHeightMin = 4,
  streamerHeightMax = 6,
}) {
  const colors = colorsProp ?? [
    "#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57",
    "#ff9ff3", "#54a0ff", "#5f27cd", "#00d2d3", "#ff9f43",
    "#10ac84", "#ee5a24",
  ];
  
  const getColor = () => colors[Math.floor(Math.random() * colors.length)] ?? "#000";
  const triggerRef = useRef(null);
  const particleContainerRef = useRef(null);

  const prefersReducedMotion = typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  function createParticle(shape, size, color, x, y) {
    const particle = document.createElement("div");
    particle.style.position = "absolute";
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.background = color;
    particle.style.borderRadius = shape === "circle" ? "50%" : "0";
    particle.style.transform = "translate(-50%, -50%)";
    particle.style.pointerEvents = "none";
    return particle;
  }

  function pop(e) {
    const trigger = triggerRef.current;
    const container = particleContainerRef.current;
    
    if (!(trigger && container) || prefersReducedMotion) {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    const { center, spread, streamerCenter, streamerSpread } = DIRECTION_ANGLES[direction] || DIRECTION_ANGLES.center;

    for (let i = 0; i < particleCount; i++) {
      const size = random(particleSizeMin, particleSizeMax);
      const shape = i % 3 === 0 ? "square" : "circle";
      const color = getColor();
      const particle = createParticle(shape, size, color, originX, originY);

      container.appendChild(particle);

      const angle = randomAngle(center, spread);
      const velocity = random(200, 400);
      const vx = Math.cos((angle * Math.PI) / 180) * velocity;
      const vy = Math.sin((angle * Math.PI) / 180) * velocity;
      const duration = random(1.5, 2.5);
      const fallDistance = random(100, 200);

      const timeline = gsap.timeline({
        onComplete: () => particle.remove(),
      });

      timeline.to(particle, {
        duration: duration * 0.6,
        ease: "power2.out",
        rotation: random(-360, 360),
        x: vx * duration * 0.8,
        y: vy * duration * 0.8,
      });

      timeline.to(
        particle,
        {
          duration: 1.0,
          ease: "power1.in",
          rotation: `+=${random(-180, 180)}`,
          y: `+=${fallDistance}`,
        },
        "-=0.2",
      );

      timeline.to(
        particle,
        {
          duration: 0.8,
          ease: "power2.out",
          opacity: 0,
        },
        "-=0.6",
      );
    }

    for (let i = 0; i < streamerCount; i++) {
      const streamer = document.createElement("div");
      streamer.style.position = "absolute";
      streamer.style.left = `${originX}px`;
      streamer.style.top = `${originY}px`;
      streamer.style.width = `${random(streamerWidthMin, streamerWidthMax)}px`;
      streamer.style.height = `${random(streamerHeightMin, streamerHeightMax)}px`;
      streamer.style.background = getColor();
      streamer.style.borderRadius = "2px";
      streamer.style.transform = "translate(-50%, -50%)";
      streamer.style.pointerEvents = "none";

      container.appendChild(streamer);

      const angle = randomAngle(streamerCenter, streamerSpread);
      const velocity = random(450, 550);
      const vx = Math.cos((angle * Math.PI) / 180) * velocity;
      const vy = Math.sin((angle * Math.PI) / 180) * velocity;

      const timeline = gsap.timeline({
        onComplete: () => streamer.remove(),
      });

      timeline.to(streamer, {
        duration: 1.0,
        ease: "power2.out",
        rotation: random(-360, 360),
        x: vx * 1.0,
        y: vy * 1.0,
      });

      timeline.to(
        streamer,
        {
          duration: 1.2,
          ease: "power2.in",
          rotation: `+=${random(-180, 180)}`,
          y: "+=250",
        },
        "-=0.1",
      );

      timeline.to(
        streamer,
        {
          duration: 1.0,
          ease: "power2.out",
          opacity: 0,
        },
        "-=0.8",
      );
    }
  }

  // Intercept onClick in children if possible, or just wrap in a span
  return (
    <>
      <div
        ref={triggerRef}
        onClick={pop}
        className={`inline-block cursor-pointer ${className}`}
        style={{ display: 'inline-block' }}
      >
        {children}
      </div>
      <div
        ref={particleContainerRef}
        style={{ position: 'fixed', inset: 0, zIndex: 99999, pointerEvents: 'none' }}
        aria-hidden={true}
      />
    </>
  );
}

export default PartyPopper;
