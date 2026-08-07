import Link from 'next/link';

const FEATURES = [
  {
    href: '/learn',
    icon: '📚',
    title: 'Học theo cấp độ',
    desc: 'Bài học HSK 1–6 với từ vựng, ngữ pháp và nội dung bài học.',
  },
  {
    href: '/topics',
    icon: '🗂️',
    title: 'Chủ đề',
    desc: 'Ôn luyện từ vựng theo chủ đề thực tế, dễ nhớ hơn.',
  },
  {
    href: '/practice',
    icon: '✍️',
    title: 'Luyện tập',
    desc: 'Ghép từ, thẻ học, điền khuyết và sắp xếp câu.',
  },
  {
    href: '/games',
    icon: '🎮',
    title: 'Trò chơi',
    desc: 'Bóng pinyin, trí nhớ và tập viết chữ Hán.',
  },
  {
    href: '/tests/join',
    icon: '📝',
    title: 'Kiểm tra',
    desc: 'Làm đề kiểm tra do giáo viên biên soạn.',
  },
  {
    href: '/resources',
    icon: '📄',
    title: 'Tài liệu',
    desc: 'Tải giáo trình, đề thi và tài liệu tham khảo.',
  },
];

/**
 * Lưới 6 feature card — nền trắng, bo 24px, hover nhấc nhẹ.
 */
export function FeatureGrid() {
  return (
    <section className="py-12 sm:py-16">
      <div className="mb-8 text-center">
        <span className="inline-block rounded-full bg-soft-lime px-3 py-1 text-sm font-semibold text-forest">
          Tính năng
        </span>
        <h2 className="mt-3 text-2xl font-bold text-forest sm:text-3xl">
          Mọi thứ bạn cần để chinh phục HSK
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-gray-500">
          Học, luyện, chơi và kiểm tra — trong một khu rừng thân thiện.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className="group rounded-3xl border border-light-bamboo bg-white p-6 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-lift"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-soft-lime text-2xl">
              {f.icon}
            </span>
            <h3 className="mt-4 text-lg font-bold text-forest transition-colors group-hover:text-olive">
              {f.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{f.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
