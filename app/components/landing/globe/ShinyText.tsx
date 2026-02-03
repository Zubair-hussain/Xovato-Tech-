"use client";

import React from "react";

type Props = {
  text: string;
  className?: string;
  speedMs?: number;     // shimmer speed in ms
  pauseOnHover?: boolean;
};

export default function ShinyText({
  text,
  className = "",
  speedMs = 2200,
  pauseOnHover = true,
}: Props) {
  return (
    <span
      className={`inline-block ${pauseOnHover ? "group" : ""} ${className}`}
      style={{ "--shine-speed": `${speedMs}ms` } as React.CSSProperties}
    >
      {text}

      <style jsx>{`
        span {
          position: relative;
          background: linear-gradient(
            120deg,
            rgba(255, 255, 255, 0.25) 0%,
            rgba(255, 255, 255, 0.85) 45%,
            rgba(255, 255, 255, 0.95) 50%,
            rgba(255, 255, 255, 0.85) 55%,
            rgba(255, 255, 255, 0.25) 100%
          );
          background-size: 200% 100%;
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
          animation: shine var(--shine-speed, 2200ms) linear infinite;
        }

        @keyframes shine {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        .group:hover {
          animation-play-state: paused;
        }
      `}</style>
    </span>
  );
}