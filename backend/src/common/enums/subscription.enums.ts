/** Gói người dùng (PR-14 entitlement). */
export enum SubscriptionPlan {
  FREE = 'FREE',
  VIP = 'VIP',
}

export enum SubscriptionStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
}

/** Trạng thái yêu cầu nâng cấp VIP (FR-26). */
export enum UpgradeRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

/** Gói nâng cấp VIP (Tháng/6 Tháng/Năm) */
export enum VipPackagePlan {
  ONE_MONTH = '1_MONTH',
  SIX_MONTHS = '6_MONTHS',
  ONE_YEAR = '1_YEAR',
}
