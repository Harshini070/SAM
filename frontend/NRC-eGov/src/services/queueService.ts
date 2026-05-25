import AsyncStorage from '@react-native-async-storage/async-storage';

export interface QueuedRequest {
  id: string;
  timestamp: number;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  data?: any;
  headers?: Record<string, string>;
  retries: number;
  priority: 'high' | 'normal' | 'low';
}

const QUEUE_KEY = '@sam_request_queue';
const MAX_RETRIES = 3;

export class QueueService {
  static async addToQueue(request: Omit<QueuedRequest, 'id' | 'timestamp' | 'retries'>): Promise<string> {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const queuedRequest: QueuedRequest = {
      ...request,
      id,
      timestamp: Date.now(),
      retries: 0,
    };

    try {
      const queue = await this.getQueue();
      queue.push(queuedRequest);
      // Sort by priority (high first) and timestamp
      queue.sort((a, b) => {
        const priorityOrder = { high: 0, normal: 1, low: 2 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return a.timestamp - b.timestamp;
      });
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch (err) {
      console.error('Failed to add request to queue:', err);
    }

    return id;
  }

  static async getQueue(): Promise<QueuedRequest[]> {
    try {
      const data = await AsyncStorage.getItem(QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.error('Failed to get queue:', err);
      return [];
    }
  }

  static async removeFromQueue(id: string): Promise<void> {
    try {
      const queue = await this.getQueue();
      const filtered = queue.filter((req) => req.id !== id);
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
    } catch (err) {
      console.error('Failed to remove from queue:', err);
    }
  }

  static async incrementRetries(id: string): Promise<boolean> {
    try {
      const queue = await this.getQueue();
      const request = queue.find((req) => req.id === id);
      if (!request) return false;

      request.retries += 1;
      if (request.retries > MAX_RETRIES) {
        await this.removeFromQueue(id);
        return false;
      }

      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
      return true;
    } catch (err) {
      console.error('Failed to increment retries:', err);
      return false;
    }
  }

  static async clearQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(QUEUE_KEY);
    } catch (err) {
      console.error('Failed to clear queue:', err);
    }
  }

  static async getQueueSize(): Promise<number> {
    try {
      const queue = await this.getQueue();
      return queue.length;
    } catch (err) {
      console.error('Failed to get queue size:', err);
      return 0;
    }
  }
}
