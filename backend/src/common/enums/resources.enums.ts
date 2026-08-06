/** Mức truy cập tài liệu theo gói (FR-24 / NFR-06). */
export enum ResourceTier {
  FREE = 'FREE',
  VIP = 'VIP',
}

/** Loại tác vụ AI (FR-15, FR-16). */
export enum AiJobType {
  STORY = 'STORY',
  STUDY_PATH = 'STUDY_PATH',
}

export enum AiJobStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

/** Trạng thái yêu cầu nâng cấp VIP (FR-26). */
export enum UpgradeRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

/** Trạng thái form liên hệ tư vấn (FR-25). */
export enum ContactStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  CLOSED = 'CLOSED',
}

/** Trạng thái lượt luyện nói HSKK (FR-08). */
export enum SpeakingStatus {
  SUBMITTED = 'SUBMITTED',
  GRADED = 'GRADED',
}
