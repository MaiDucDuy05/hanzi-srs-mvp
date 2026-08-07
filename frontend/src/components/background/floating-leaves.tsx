import Image from 'next/image';

interface StaticLeaf {
  left: string;
  top: string;
  size: number;
  opacity: number;
  leafIndex: number;
  rotation: number;
  leafType?: 1 | 2; // Loại 1 (lá đơn), Loại 2 (chụm 3 lá)
}

/** 
 * Trang trí các lá tĩnh ở 4 góc màn hình theo thiết kế.
 */
const LEAVES: StaticLeaf[] = [
  // --- Góc trên bên trái (Top Left) ---
  { left: '12%', top: '16%', size: 35, opacity: 0.8, leafIndex: 1, rotation: -15 },
  { left: '6%', top: '26%', size: 45, opacity: 0.9, leafIndex: 2, rotation: 35 },
  { left: '18%', top: '8%', size: 25, opacity: 0.7, leafIndex: 3, rotation: 60 },
  
  // --- Góc trên bên phải (Top Right) ---
  { left: '85%', top: '15%', size: 55, opacity: 0.9, leafIndex: 4, rotation: 25 },
  { left: '92%', top: '28%', size: 30, opacity: 0.8, leafIndex: 5, rotation: -40 },
  { left: '82%', top: '6%', size: 25, opacity: 0.7, leafIndex: 6, rotation: -10 },
  
  // --- Góc dưới bên trái (Bottom Left) ---
  { left: '5%', top: '72%', size: 40, opacity: 0.8, leafIndex: 7, rotation: -30 },
  { left: '12%', top: '88%', size: 50, opacity: 0.9, leafIndex: 8, rotation: 15 },
  { left: '16%', top: '65%', size: 25, opacity: 0.7, leafIndex: 9, rotation: 45 },
  
  // --- Góc dưới bên phải (Bottom Right) ---
  { left: '88%', top: '78%', size: 45, opacity: 0.9, leafIndex: 10, rotation: 40 },
  { left: '82%', top: '90%', size: 35, opacity: 0.8, leafIndex: 11, rotation: -20 },
  { left: '94%', top: '65%', size: 28, opacity: 0.7, leafIndex: 12, rotation: -50 },
  { left: '76%', top: '70%', size: 22, opacity: 0.6, leafIndex: 13, rotation: 10 },
];

/**
 * Overlay lá tĩnh nằm ở 4 góc màn hình.
 */
export function FloatingLeaves({ className }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${className ?? ''}`} aria-hidden>
      {LEAVES.map((leaf, i) => (
        <span
          key={i}
          className="absolute"
          style={{
            left: leaf.left,
            top: leaf.top,
            width: leaf.size,
            height: leaf.size,
            opacity: leaf.opacity,
            transform: `rotate(${leaf.rotation}deg)`,
          }}
        >
          <img 
            src={`/assets/nature/leaves/leaf_${leaf.leafIndex}.svg`} 
            alt="" 
            className="h-full w-full object-contain" 
          />
        </span>
      ))}
    </div>
  );
}
