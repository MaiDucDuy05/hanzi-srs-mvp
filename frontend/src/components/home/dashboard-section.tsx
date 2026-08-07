import Link from 'next/link';
import { ROLE_LABELS } from '@/lib/utils/constants';
import type { User } from '@/lib/api/types';

/**
 * Dashboard học tập (chỉ hiện khi đã đăng nhập).
 *
 * Nguồn dữ liệu (theo plan scope): tên/role thật từ getServerUser().
 * Streak/điểm/SRS/tiến độ HSK chưa có API (FR-18 pending) → placeholder
 * rõ ràng, KHÔNG fake số liệu. Ghi chú: cập nhật khi có API.
 */
export function DashboardSection({ user }: { user: User }) {
  return (
    <section className="py-10 sm:py-12">
      <div className="rounded-3xl border border-light-bamboo bg-white p-6 shadow-soft sm:p-8">
        {/* header chào */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-forest">
              Chào, {user.fullName}! 👋
            </h2>
            <p className="mt-1 text-sm text-gray-500">{ROLE_LABELS[user.role]}</p>
          </div>
          {/* streak / điểm — placeholder tới khi có API FR-18 */}
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-soft-lime px-4 py-1.5 text-sm font-semibold text-forest">
              🔥 Streak · Xem trước
            </span>
            <span className="rounded-full bg-pale-green px-4 py-1.5 text-sm font-semibold text-forest">
              ⭐ Điểm · Xem trước
            </span>
          </div>
        </div>

        {/* hành động chính */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {/* tiếp tục học */}
          <div className="rounded-2xl bg-pale-green p-5">
            <h3 className="font-bold text-forest">📚 Tiếp tục học</h3>
            <p className="mt-1 text-sm text-gray-600">
              Vào bài học theo cấp độ để tiếp tục hành trình HSK của bạn.
            </p>
            <Link
              href="/learn"
              className="mt-4 inline-block rounded-full bg-accent-lime px-6 py-2.5 text-sm font-bold text-forest shadow-soft transition-transform hover:scale-105 hover:bg-accent-olive"
            >
              Vào học
            </Link>
          </div>

          {/* ôn tập hôm nay — SRS chưa có API → placeholder */}
          <div className="rounded-2xl bg-soft-lime p-5">
            <h3 className="font-bold text-forest">🔄 Ôn tập hôm nay</h3>
            <p className="mt-1 text-sm text-gray-600">
              {/* TODO: thay bằng số từ SRS thật khi có schedule API (FR-18) */}
              Chưa có dữ liệu lịch ôn tập — hãy bắt đầu học để tạo thói quen nhé.
            </p>
            <Link
              href="/practice"
              className="mt-4 inline-block rounded-full border-2 border-bamboo px-6 py-2.5 text-sm font-bold text-forest transition-colors hover:bg-white/70"
            >
              Ôn ngay
            </Link>
          </div>
        </div>

        {/* tiến độ HSK — placeholder rõ ràng */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm">
            <h3 className="font-bold text-forest">📊 Tiến độ HSK</h3>
            <span className="text-xs text-gray-400">Xem trước — chưa có dữ liệu</span>
          </div>
          <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-light-bamboo">
            <div className="h-full w-0 rounded-full bg-accent-lime" />
          </div>
          <p className="mt-1.5 text-xs text-gray-400">
            Tiến độ từng cấp sẽ hiển thị tại đây khi API thống kê sẵn sàng.
          </p>
        </div>

        {/* quick links */}
        <div className="mt-6 flex flex-wrap gap-3 border-t border-light-bamboo pt-5 text-sm font-medium">
          <Link href="/mistake-book" className="text-forest transition-colors hover:text-olive">
            📓 Sổ lỗi sai
          </Link>
          <span className="text-light-bamboo">·</span>
          <Link href="/profile" className="text-forest transition-colors hover:text-olive">
            👤 Hồ sơ của tôi
          </Link>
          <span className="text-light-bamboo">·</span>
          <Link href="/upgrade-vip" className="text-forest transition-colors hover:text-olive">
            ⭐ Nâng cấp VIP
          </Link>
        </div>
      </div>
    </section>
  );
}
