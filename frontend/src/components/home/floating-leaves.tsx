import { Leaf } from './panda-decoration';

interface FloatingLeaf {
  left: string;
  top: string;
  size: number;
  delay: string;
  duration: string;
  opacity: number;
}

/** Các lá bay tĩnh (deterministic — không dùng Math.random để SSR ổn định). */
const LEAVES: FloatingLeaf[] = [
  { left: '6%', top: '12%', size: 26, delay: '0s', duration: '9s', opacity: 0.7 },
  { left: '14%', top: '64%', size: 20, delay: '1.2s', duration: '11s', opacity: 0.5 },
  { left: '26%', top: '22%', size: 18, delay: '2.4s', duration: '8s', opacity: 0.6 },
  { left: '78%', top: '16%', size: 24, delay: '0.8s', duration: '10s', opacity: 0.6 },
  { left: '86%', top: '58%', size: 20, delay: '2s', duration: '12s', opacity: 0.5 },
  { left: '92%', top: '26%', size: 16, delay: '3.2s', duration: '9s', opacity: 0.7 },
];

/**
 * Overlay lá bay nhẹ — decoration cho hero/section nền rộng.
 * Motion tôn trọng prefers-reduced-motion (rule trong globals.css).
 */
export function FloatingLeaves({ className }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ''}`} aria-hidden>
      {LEAVES.map((leaf, i) => (
        <span
          key={i}
          className="animate-leaf-float absolute"
          style={{
            left: leaf.left,
            top: leaf.top,
            width: leaf.size,
            height: leaf.size,
            opacity: leaf.opacity,
            animationDelay: leaf.delay,
            animationDuration: leaf.duration,
          }}
        >
          <Leaf className="h-full w-full" />
        </span>
      ))}
    </div>
  );
}
