import { Subscription } from '../../subscription/entities/subscription.entity';
import { SubscriptionStatus } from '../../../common/enums/subscription.enums';

/**
 * Entitlement check a-la-carte (PR-33 ADR-5).
 * - Full VIP: scope = [] → mở tất cả feature.
 * - Feature VIP: scope = ['ai_speaking'] → chỉ mở feature trong scope.
 * - Còn hạn: status ACTIVE + expires_at > now.
 *
 * @param subscriptions — tất cả subscription của user (ACTIVE).
 * @param required — feature cần check (vd 'ai_speaking', 'flashcard_advanced').
 * @returns true nếu user có quyền lợi.
 */
export function hasEntitlement(
  subscriptions: Subscription[],
  required: string,
): boolean {
  const now = new Date();
  return subscriptions.some((sub) => {
    if (sub.status !== SubscriptionStatus.ACTIVE) return false;
    if (sub.expiresAt && sub.expiresAt <= now) return false;
    // Full VIP (scope rỗng) OR feature VIP chứa required.
    const scope = sub.scope ?? [];
    return scope.length === 0 || scope.includes(required);
  });
}
