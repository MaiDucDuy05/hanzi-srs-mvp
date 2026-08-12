/** Gói người dùng (PR-14 entitlement). */
export enum SubscriptionPlan {
  FREE = 'FREE',
  VIP = 'VIP',
}

export enum SubscriptionStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}
