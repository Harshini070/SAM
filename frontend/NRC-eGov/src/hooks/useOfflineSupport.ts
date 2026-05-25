import { useSync } from '../context/SyncContext';

export const useOfflineSupport = () => {
  const sync = useSync();
  
  return {
    isOnline: sync.isOnline,
    isSyncing: sync.isSyncing,
    queueSize: sync.queueSize,
    lastSyncTime: sync.lastSyncTime,
    syncNow: sync.syncNow,
  };
};
