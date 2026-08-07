const BADGES = [
  { icon: '🎯', label: 'Nhập môn' },
  { icon: '🔥', label: 'Chuỗi 3 ngày' },
  { icon: '🌟', label: '100 từ' },
  { icon: '🏆', label: 'Chiến thắng đầu tiên' },
];

/**
 * Hàng huy hiệu thành tích — chưa có API (FR-18) nên render mẫu
 * rõ ràng là "Xem trước". Ẩn khi có dữ liệu thật cần gọi API.
 */
export function AchievementsSection() {
  return (
    <section className="py-12 sm:py-16">
      <div className="mb-8 text-center">
        <span className="inline-block rounded-full bg-soft-lime px-3 py-1 text-sm font-semibold text-forest">
          Thành tích
        </span>
        <h2 className="mt-3 text-2xl font-bold text-forest sm:text-3xl">Huy hiệu của bạn</h2>
        <p className="mt-1 text-xs text-gray-400">Xem trước — dữ liệu thật khi API thống kê sẵn sàng</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {BADGES.map((b) => (
          <div
            key={b.label}
            className="flex flex-col items-center gap-2 rounded-3xl border border-light-bamboo bg-white p-5 text-center shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-lift"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-pale-green text-3xl">
              {b.icon}
            </span>
            <span className="text-sm font-semibold text-forest">{b.label}</span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
              Xem trước
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
