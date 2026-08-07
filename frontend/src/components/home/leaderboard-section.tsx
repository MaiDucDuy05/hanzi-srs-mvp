const MEDALS = ['🥇', '🥈', '🥉'];

/**
 * Mock dữ liệu BXH — ĐÁNH DẤU rõ là mock "Xem trước", không phải dữ liệu thật.
 * Khi có API xếp hạng (FR-18/leaderboard), thay bằng dữ liệu server.
 */
const MOCK_LEADERBOARD = [
  { name: 'Minh Anh', points: 2480 },
  { name: 'Tuấn Kiệt', points: 2315 },
  { name: 'Hồng Nhung', points: 2100 },
  { name: 'Đức Huy', points: 1980 },
  { name: 'Phương Linh', points: 1745 },
];

/**
 * Bảng xếp hạng preview (top 5) — nhãn rõ "Xem trước".
 */
export function LeaderboardSection() {
  return (
    <section className="py-12 sm:py-16">
      <div className="mb-8 text-center">
        <span className="inline-block rounded-full bg-soft-lime px-3 py-1 text-sm font-semibold text-forest">
          Bảng xếp hạng
        </span>
        <h2 className="mt-3 text-2xl font-bold text-forest sm:text-3xl">
          Những người bạn rừng tre xuất sắc
        </h2>
        <p className="mt-1 text-xs text-gray-400">Xem trước — dữ liệu thật khi API sẵn sàng</p>
      </div>

      <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-light-bamboo bg-white shadow-soft">
        {MOCK_LEADERBOARD.map((row, i) => {
          const isTop3 = i < 3;
          return (
            <div
              key={row.name}
              className={`flex items-center gap-4 px-5 py-3.5 ${
                i !== MOCK_LEADERBOARD.length - 1 ? 'border-b border-light-bamboo' : ''
              } ${isTop3 ? 'bg-pale-green/60' : ''}`}
            >
              <span className="w-9 text-center text-lg" aria-hidden>
                {isTop3 ? MEDALS[i] : <span className="text-sm font-bold text-gray-400">{i + 1}</span>}
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-soft-lime text-sm font-bold text-forest">
                {row.name.charAt(0)}
              </span>
              <span className="flex-1 truncate text-sm font-medium text-foreground">{row.name}</span>
              <span className="rounded-full bg-mint-cream px-3 py-1 text-sm font-semibold text-olive">
                {row.points.toLocaleString('vi-VN')} đ
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
