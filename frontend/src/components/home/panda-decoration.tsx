/**
 * Panda Forest SVG illustrations — flat 2D, dùng chung cho homepage.
 * Không realistic, không gradient nặng. Màu lấy theo token forest.
 * Mỗi component nhận className để chỉnh kích thước/vị trí.
 */

/** Gấu trúc cute: đen-trắng, má hồng, ngồi. */
export function Panda({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden focusable="false">
      {/* body */}
      <ellipse cx="60" cy="86" rx="34" ry="28" fill="#2E2E2E" />
      {/* belly */}
      <ellipse cx="60" cy="92" rx="20" ry="15" fill="#FFFFFF" />
      {/* head */}
      <circle cx="60" cy="44" r="28" fill="#FFFFFF" />
      {/* ears */}
      <circle cx="38" cy="24" r="10" fill="#2E2E2E" />
      <circle cx="82" cy="24" r="10" fill="#2E2E2E" />
      {/* eye patches */}
      <ellipse cx="48" cy="42" rx="9" ry="11" fill="#2E2E2E" transform="rotate(-14 48 42)" />
      <ellipse cx="72" cy="42" rx="9" ry="11" fill="#2E2E2E" transform="rotate(14 72 42)" />
      {/* eyes */}
      <circle cx="48" cy="42" r="3" fill="#FFFFFF" />
      <circle cx="72" cy="42" r="3" fill="#FFFFFF" />
      {/* nose */}
      <ellipse cx="60" cy="52" rx="4" ry="3" fill="#2E2E2E" />
      {/* mouth */}
      <path d="M60 55 C58 59 55 60 52 59" stroke="#2E2E2E" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M60 55 C62 59 65 60 68 59" stroke="#2E2E2E" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* pink cheeks */}
      <circle cx="40" cy="50" r="4.5" fill="#F8B4C4" opacity="0.8" />
      <circle cx="80" cy="50" r="4.5" fill="#F8B4C4" opacity="0.8" />
      {/* arms */}
      <path d="M30 82 C24 90 26 98 32 100" stroke="#2E2E2E" strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M90 82 C96 90 94 98 88 100" stroke="#2E2E2E" strokeWidth="9" strokeLinecap="round" fill="none" />
      {/* feet */}
      <ellipse cx="42" cy="112" rx="10" ry="6" fill="#2E2E2E" />
      <ellipse cx="78" cy="112" rx="10" ry="6" fill="#2E2E2E" />
    </svg>
  );
}

/** Cọng tre: thân đốt + lá. */
export function Bamboo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 140" className={className} aria-hidden focusable="false">
      {/* stalk */}
      <path
        d="M30 138 C30 100 30 70 30 12"
        stroke="#5E7F26"
        strokeWidth="7"
        strokeLinecap="round"
      />
      {/* nodes */}
      <path d="M24 96 C30 92 36 96 36 96" stroke="#6E8B2D" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M24 58 C30 54 36 58 36 58" stroke="#6E8B2D" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M24 24 C30 20 36 24 36 24" stroke="#6E8B2D" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* leaves */}
      <path d="M30 30 C44 26 54 30 56 38 C46 38 36 42 30 46 Z" fill="#78993A" />
      <path d="M30 66 C16 62 6 66 4 74 C14 74 24 78 30 82 Z" fill="#6E8B2D" />
      <path d="M30 44 C42 40 50 42 53 48 C44 49 37 52 30 55 Z" fill="#5E7F26" />
      <path d="M30 108 C18 104 8 108 6 116 C16 116 26 120 30 124 Z" fill="#78993A" />
    </svg>
  );
}

/** Lá cây đơn giản. */
export function Leaf({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden focusable="false">
      <path
        d="M20 4 C30 10 34 22 26 34 C16 32 8 24 14 10 C16 6 18 4 20 4 Z"
        fill="#78993A"
      />
      <path
        d="M20 6 C22 16 22 26 20 34"
        stroke="#5E7F26"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/** Cỏ nhỏ. */
export function Grass({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 30" className={className} aria-hidden focusable="false">
      <path d="M10 30 C8 20 12 12 16 4" stroke="#6E8B2D" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M30 30 C28 18 32 10 34 6" stroke="#5E7F26" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M50 30 C48 22 52 14 56 8" stroke="#78993A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/** Đá nhỏ bo tròn. */
export function Stone({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 26" className={className} aria-hidden focusable="false">
      <path
        d="M8 22 C2 18 4 10 12 7 C20 4 32 5 35 11 C38 17 33 23 24 24 C16 25 12 24 8 22 Z"
        fill="#DDE8A6"
      />
      <path
        d="M12 14 C14 11 20 9 26 10"
        stroke="#78993A"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
    </svg>
  );
}

/** Hoa nhỏ 5 cánh. */
export function Flower({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden focusable="false">
      <circle cx="20" cy="12" r="6" fill="#C7CF35" />
      <circle cx="28" cy="20" r="6" fill="#C7CF35" />
      <circle cx="24" cy="29" r="6" fill="#C7CF35" />
      <circle cx="16" cy="29" r="6" fill="#C7CF35" />
      <circle cx="12" cy="20" r="6" fill="#C7CF35" />
      <circle cx="20" cy="20" r="5" fill="#F3F8D7" />
      <circle cx="20" cy="20" r="2.5" fill="#B8C533" />
    </svg>
  );
}

/** Mây mềm. */
export function Cloud({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 40" className={className} aria-hidden focusable="false">
      <ellipse cx="26" cy="26" rx="18" ry="12" fill="#DDE8A6" />
      <ellipse cx="48" cy="20" rx="20" ry="14" fill="#EAF3C5" />
      <ellipse cx="62" cy="27" rx="16" ry="10" fill="#DDE8A6" />
    </svg>
  );
}

/** Organic blob — hình trái tim (heart shape) cho góc nền. */
export function Blob({
  className,
  fill = '#F3F8D7',
}: {
  className?: string;
  fill?: string;
}) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden focusable="false" preserveAspectRatio="none">
      <path
        d="M 0,0 L 200,0 C 200,120 120,90 100,100 C 90,120 120,200 0,200 Z"
        fill={fill}
      />
    </svg>
  );
}
