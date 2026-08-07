import Link from 'next/link';

const GAMES = [
  {
    href: '/games',
    name: 'Bắn bóng Pinyin',
    emoji: '🎈',
    bg: 'bg-light-bamboo',
    desc: 'Gõ pinyin đúng để bắn bóng',
  },
  {
    href: '/games',
    name: 'Memory',
    emoji: '🃏',
    bg: 'bg-soft-lime',
    desc: 'Lật thẻ ghép cặp từ — nghĩa',
  },
  {
    href: '/games',
    name: 'Luyện viết chữ Hán',
    emoji: '🖌️',
    bg: 'bg-pale-green',
    desc: 'Viết đúng thứ tự nét chữ Hán',
  },
  {
    href: '/practice',
    name: 'Nối từ',
    emoji: '🧩',
    bg: 'bg-mint-cream',
    desc: 'Nối Hán tự — pinyin — nghĩa',
  },
];

/**
 * 4 tile trò chơi lớn — mỗi tile nền pastel khác nhau.
 */
export function GameCategories() {
  return (
    <section className="py-12 sm:py-16">
      <div className="mb-8 text-center">
        <span className="inline-block rounded-full bg-soft-lime px-3 py-1 text-sm font-semibold text-forest">
          Trò chơi
        </span>
        <h2 className="mt-3 text-2xl font-bold text-forest sm:text-3xl">
          Học mà chơi, chơi mà học
        </h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {GAMES.map((g) => (
          <Link
            key={g.name}
            href={g.href}
            className={`group relative flex items-center gap-5 overflow-hidden rounded-3xl ${g.bg} p-6 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-lift`}
          >
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-3xl shadow-soft transition-transform duration-200 group-hover:scale-110">
              {g.emoji}
            </span>
            <span>
              <span className="block text-lg font-bold text-forest">{g.name}</span>
              <span className="mt-0.5 block text-sm text-gray-600">{g.desc}</span>
              <span className="mt-1.5 inline-flex items-center gap-1 text-sm font-semibold text-olive transition-colors group-hover:text-forest">
                Chơi ngay <span aria-hidden>→</span>
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
