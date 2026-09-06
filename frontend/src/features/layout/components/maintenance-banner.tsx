'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { adminConfigsApi } from '@/lib/api/endpoints/admin-configs';
import { useAuth } from '@/lib/auth/auth-context';
import { useTranslations } from 'next-intl';

export function MaintenanceBanner() {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const { user } = useAuth();
  const t = useTranslations('Layout');

  useEffect(() => {
    // Only check if we have a token (logged in as admin)
    // For MVP, we just ping the configs API to see if maintenance_mode is true
    // If it's a public user, they will get a 503 from the backend anyway
    const checkMaintenance = async () => {
      if (user?.role !== 'ADMIN') return;
      try {
        const data = await adminConfigsApi.getConfigs();
        const systemConfigs = data['system'] || [];
        const maintenanceConfig = systemConfigs.find(c => c.key === 'maintenance_mode');

        if (maintenanceConfig && maintenanceConfig.value === 'true') {
          setIsMaintenance(true);
        } else {
          setIsMaintenance(false);
        }
      } catch (e) {
        // If 503 is thrown from our own proxy or backend due to maintenance mode,
        // we might not even be able to fetch the configs, but since we are Admin, we should be able to.
      }
    };

    checkMaintenance();

    // Optionally poll every 30 seconds
    const interval = setInterval(checkMaintenance, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!isMaintenance) return null;

  return (
    <div className="bg-red-500 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium shadow-md sticky top-0 z-[100]">
      <AlertTriangle className="w-5 h-5" />
      <span>{t('maintenanceText')}</span>
    </div>
  );
}
