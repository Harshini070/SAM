import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export interface NetworkState {
  isOnline: boolean;
  type: string;
}

type NetworkListener = (state: NetworkState) => void;

class NetworkService {
  private listeners: Set<NetworkListener> = new Set();
  private currentState: NetworkState = { isOnline: true, type: 'unknown' };

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const isOnline = state.isConnected !== false && state.isInternetReachable !== false;
      this.currentState = {
        isOnline,
        type: state.type || 'unknown',
      };
      this.notifyListeners();
    });

    // Get initial state
    NetInfo.fetch().then((state: NetInfoState) => {
      const isOnline = state.isConnected !== false && state.isInternetReachable !== false;
      this.currentState = {
        isOnline,
        type: state.type || 'unknown',
      };
      this.notifyListeners();
    });
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentState);
      } catch (err) {
        console.error('Error notifying network listener:', err);
      }
    });
  }

  isOnline(): boolean {
    return this.currentState.isOnline;
  }

  getState(): NetworkState {
    return { ...this.currentState };
  }

  subscribe(listener: NetworkListener): () => void {
    this.listeners.add(listener);
    // Immediately call with current state
    listener(this.currentState);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  async waitForConnection(maxWaitTime: number = 30000): Promise<boolean> {
    if (this.currentState.isOnline) return true;

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        unsubscribe();
        resolve(false);
      }, maxWaitTime);

      const unsubscribe = this.subscribe((state) => {
        if (state.isOnline) {
          clearTimeout(timeout);
          unsubscribe();
          resolve(true);
        }
      });
    });
  }
}

export const networkService = new NetworkService();
