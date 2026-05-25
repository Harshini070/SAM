import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueueService, QueuedRequest } from './queueService';
import { networkService } from './networkService';

type SyncListener = (status: 'syncing' | 'synced' | 'error') => void;

export class SyncService {
  private apiClient: AxiosInstance;
  private isSyncing = false;
  private listeners: Set<SyncListener> = new Set();

  constructor(apiClient: AxiosInstance) {
    this.apiClient = apiClient;
    this.setupNetworkListener();
  }

  private setupNetworkListener() {
    networkService.subscribe((state) => {
      if (state.isOnline && !this.isSyncing) {
        this.syncQueue();
      }
    });
  }

  async syncQueue(): Promise<void> {
    if (this.isSyncing) return;
    if (!networkService.isOnline()) return;

    this.isSyncing = true;
    this.notifyListeners('syncing');

    try {
      const queue = await QueueService.getQueue();
      if (queue.length === 0) {
        this.notifyListeners('synced');
        this.isSyncing = false;
        return;
      }

      let syncedCount = 0;
      let failedCount = 0;

      for (const request of queue) {
        try {
          await this.executeRequest(request);
          await QueueService.removeFromQueue(request.id);
          syncedCount++;
        } catch (err) {
          const canRetry = await QueueService.incrementRetries(request.id);
          if (!canRetry) {
            failedCount++;
          }
        }
      }

      console.log(`Sync completed: ${syncedCount} succeeded, ${failedCount} failed`);
      this.notifyListeners('synced');
    } catch (err) {
      console.error('Sync error:', err);
      this.notifyListeners('error');
    } finally {
      this.isSyncing = false;
    }
  }

  private async executeRequest(request: QueuedRequest): Promise<any> {
    const config: any = {
      method: request.method.toLowerCase(),
      url: request.url,
      headers: request.headers,
    };

    if (request.method !== 'GET' && request.data) {
      config.data = request.data;
    }

    return this.apiClient(config);
  }

  subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(status: 'syncing' | 'synced' | 'error') {
    this.listeners.forEach((listener) => {
      try {
        listener(status);
      } catch (err) {
        console.error('Error notifying sync listener:', err);
      }
    });
  }

  async getQueueSize(): Promise<number> {
    return QueueService.getQueueSize();
  }

  isSyncingNow(): boolean {
    return this.isSyncing;
  }

  async clearQueue(): Promise<void> {
    await QueueService.clearQueue();
  }
}
