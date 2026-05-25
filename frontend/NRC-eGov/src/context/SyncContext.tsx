import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { SyncService } from '../services/syncService';
import { networkService } from '../services/networkService';
import api from '../services/api';

interface SyncContextType {
  isOnline: boolean;
  isSyncing: boolean;
  queueSize: number;
  lastSyncTime?: Date;
  syncNow: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [queueSize, setQueueSize] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date>();
  const [syncService] = useState(() => new SyncService(api));

  useEffect(() => {
    // Setup network listener
    const unsubscribeNetwork = networkService.subscribe((state) => {
      setIsOnline(state.isOnline);
    });

    // Setup sync listener
    const unsubscribeSync = syncService.subscribe((status) => {
      if (status === 'syncing') {
        setIsSyncing(true);
      } else if (status === 'synced' || status === 'error') {
        setIsSyncing(false);
        setLastSyncTime(new Date());
      }
    });

    return () => {
      unsubscribeNetwork();
      unsubscribeSync();
    };
  }, [syncService]);

  const syncNow = async () => {
    await syncService.syncQueue();
  };

  return (
    <SyncContext.Provider value={{ isOnline, isSyncing, queueSize, lastSyncTime, syncNow }}>
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => {
  const context = React.useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within SyncProvider');
  }
  return context;
};
