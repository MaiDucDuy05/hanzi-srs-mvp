import { AdminAuditLogsFeature } from '@/features/admin/admin-audit-logs-feature';

export const metadata = {
  title: 'Audit Logs | Hanzi SRS Admin',
};

export default function AuditLogsPage() {
  return <AdminAuditLogsFeature />;
}
