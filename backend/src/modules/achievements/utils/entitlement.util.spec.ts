import { hasEntitlement } from './entitlement.util';
import { Subscription } from '../../subscription/entities/subscription.entity';
import { SubscriptionPlan, SubscriptionStatus } from '../../../common/enums/subscription.enums';

function makeSub(overrides: Partial<Subscription> = {}): Subscription {
  return {
    id: 'sub-1',
    userId: 'user-1',
    plan: SubscriptionPlan.VIP,
    status: SubscriptionStatus.ACTIVE,
    startsAt: new Date(Date.now() - 86_400_000),
    expiresAt: new Date(Date.now() + 86_400_000),
    scope: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Subscription;
}

describe('hasEntitlement', () => {
  it('Full VIP (scope=[]) → true cho mọi feature', () => {
    const subs = [makeSub({ scope: [] })];
    expect(hasEntitlement(subs, 'ai_speaking')).toBe(true);
    expect(hasEntitlement(subs, 'flashcard_advanced')).toBe(true);
    expect(hasEntitlement(subs, 'anything')).toBe(true);
  });

  it('Feature VIP (scope=["ai_speaking"]) → chỉ mở ai_speaking', () => {
    const subs = [makeSub({ scope: ['ai_speaking'] })];
    expect(hasEntitlement(subs, 'ai_speaking')).toBe(true);
    expect(hasEntitlement(subs, 'flashcard_advanced')).toBe(false);
  });

  it('Expired VIP → false', () => {
    const subs = [makeSub({ expiresAt: new Date(Date.now() - 1000) })];
    expect(hasEntitlement(subs, 'ai_speaking')).toBe(false);
  });

  it('Cancelled VIP → false', () => {
    const subs = [makeSub({ status: SubscriptionStatus.CANCELLED })];
    expect(hasEntitlement(subs, 'ai_speaking')).toBe(false);
  });

  it('No subscriptions → false', () => {
    expect(hasEntitlement([], 'ai_speaking')).toBe(false);
  });

  it('Multiple subs: 1 expired + 1 active feature → true cho feature đó', () => {
    const subs = [
      makeSub({ id: 'expired', expiresAt: new Date(Date.now() - 1000), scope: [] }),
      makeSub({ id: 'active', scope: ['ai_speaking'] }),
    ];
    expect(hasEntitlement(subs, 'ai_speaking')).toBe(true);
    expect(hasEntitlement(subs, 'flashcard')).toBe(false);
  });
});
