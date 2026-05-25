# Offline-First Sync System Documentation

## Overview

The SAM/NRC mobile app now includes a comprehensive offline-first sync system that allows users to continue working even without internet connectivity. All write operations (POST, PUT, DELETE) are automatically queued and synced when connectivity is restored.

## Architecture

### Components

#### 1. **QueueService** (`services/queueService.ts`)
- Manages a persistent queue of pending requests in AsyncStorage
- Stores requests with metadata: ID, timestamp, method, URL, data, headers, retry count, priority
- Features:
  - Automatic priority sorting (high → normal → low)
  - Max 3 retry attempts per request
  - Overflow protection

**Key Methods:**
- `addToQueue()` - Add a request to the queue
- `getQueue()` - Retrieve all queued requests
- `removeFromQueue()` - Remove after successful sync
- `incrementRetries()` - Track retry attempts
- `clearQueue()` - Emergency clear all pending requests

#### 2. **NetworkService** (`services/networkService.ts`)
- Real-time network status monitoring using `@react-native-community/netinfo`
- Detects both connection state and internet reachability
- Provides subscription model for network state changes

**Key Methods:**
- `isOnline()` - Get current online status
- `getState()` - Get detailed network state
- `subscribe()` - Subscribe to network changes (returns unsubscribe function)
- `waitForConnection()` - Wait up to 30s for connection

#### 3. **SyncService** (`services/syncService.ts`)
- Executes queued requests when online
- Automatically triggers sync on connection restoration
- Tracks sync progress and notifies listeners

**Key Methods:**
- `syncQueue()` - Execute all pending requests
- `subscribe()` - Listen to sync status: 'syncing', 'synced', 'error'
- `getQueueSize()` - Get number of pending requests
- `isSyncingNow()` - Check if currently syncing

#### 4. **Updated API Interceptor** (`services/api.ts`)
- Intercepts failed requests
- Detects offline scenarios
- Routes write operations to queue instead of failing
- Returns special response: `{ _queued: true, requestId }`

#### 5. **SyncContext** (`context/SyncContext.tsx`)
- Global React Context for sync state management
- Provides `useSync()` hook to all components
- Auto-initializes network and sync services

**Provided State:**
```typescript
{
  isOnline: boolean;
  isSyncing: boolean;
  queueSize: number;
  lastSyncTime?: Date;
  syncNow: () => Promise<void>;
}
```

#### 6. **OfflineIndicator** (`components/OfflineIndicator.tsx`)
- Visual indicator showing sync status
- Shows at top of app when offline/syncing/pending
- Displays queue size with badge
- Expandable for details

#### 7. **useOfflineSupport Hook** (`hooks/useOfflineSupport.ts`)
- Convenience hook to access offline state in components
- Shorter than accessing SyncContext directly

## How It Works

### Offline Write Operation Flow

```
User Action (POST/PUT/DELETE)
    ↓
API Call via Axios
    ↓
Request fails (offline detected)
    ↓
Error Interceptor triggers
    ↓
Request added to AsyncStorage queue
    ↓
Returns 202 "Accepted (Queued)" response
    ↓
App shows in UI (request succeeded, will sync later)
```

### Sync Flow

```
Device comes online
    ↓
NetworkService detects connection
    ↓
SyncService auto-triggers
    ↓
Retrieve all queued requests
    ↓
Execute each request sequentially
    ↓
If success: Remove from queue
If failure: Increment retry counter
If max retries exceeded: Remove from queue (log error)
    ↓
Notify listeners (syncing → synced/error)
    ↓
Update UI
```

## Usage in Components

### Display Sync Status

```typescript
import { OfflineIndicator } from '../components/OfflineIndicator';

export const MyComponent = () => {
  return (
    <View>
      <OfflineIndicator />
      {/* Rest of component */}
    </View>
  );
};
```

### Access Sync State

```typescript
import { useSync } from '../context/SyncContext';
// or
import { useOfflineSupport } from '../hooks/useOfflineSupport';

export const MyComponent = () => {
  const { isOnline, isSyncing, queueSize } = useSync();
  
  if (!isOnline) {
    return <Text>You are offline</Text>;
  }
  
  return <Text>{queueSize} pending requests</Text>;
};
```

### Manual Sync Trigger

```typescript
import { useSync } from '../context/SyncContext';

export const MyComponent = () => {
  const { syncNow } = useSync();
  
  return (
    <Button onPress={syncNow} title="Sync Now" />
  );
};
```

## Queue Storage Format

Requests are stored in AsyncStorage with this structure:

```json
{
  "id": "1672531200000-abc12345",
  "timestamp": 1672531200000,
  "method": "POST",
  "url": "/children/register",
  "data": {
    "name": "Priya",
    "dob": "2023-01-15",
    "mother_phone": "9876543210"
  },
  "headers": {
    "Authorization": "Bearer token...",
    "Content-Type": "application/json"
  },
  "retries": 0,
  "priority": "normal"
}
```

## Retry Strategy

- **Max Retries:** 3 attempts per request
- **Retry Trigger:** Automatic when connection restored
- **Failed Requests:** Logged but removed from queue after 3 failed attempts
- **Manual Retry:** User can call `syncNow()` to retry

## Dependencies Added

```json
{
  "@react-native-community/netinfo": "^11.1.0"
}
```

Run: `npm install` or `expo install`

## Configuration

### Change Network Detection Timeout

Edit `networkService.ts`:
```typescript
async waitForConnection(maxWaitTime: number = 30000) // Change 30000ms
```

### Change Max Retries

Edit `queueService.ts`:
```typescript
const MAX_RETRIES = 3; // Change this value
```

## Limitations & Considerations

1. **GET Requests:** Not queued (reads are not safe to replay)
2. **File Uploads:** Not yet supported (need multipart handling)
3. **Real-time Sync:** Syncs only when connection detected (no polling)
4. **Storage:** Queue limited by device AsyncStorage (typically 6-10MB)
5. **Order:** Requests processed in priority order, then by timestamp

## Testing Offline Mode

### React Native DevTools
```
Press 'D' → Toggle Network Inspector → Test offline
```

### Manual Testing
```typescript
// In any component
import { networkService } from '../services/networkService';

// Check status
console.log(networkService.isOnline());

// Subscribe to changes
networkService.subscribe((state) => {
  console.log('Online:', state.isOnline);
});
```

## Troubleshooting

### Queue Not Syncing
1. Check if device is online: `networkService.isOnline()`
2. Check queue size: `syncService.getQueueSize()`
3. Manually trigger: `syncNow()`
4. Check device AsyncStorage permissions

### Requests Stuck in Queue
1. Clear queue manually: `QueueService.clearQueue()`
2. Check API server is running
3. Verify token is valid
4. Check request retry count (max 3)

### Memory Issues
- AsyncStorage has size limits
- Clear old successful syncs: `QueueService.clearQueue()`
- Monitor queue size in dev tools

## Future Enhancements

- [ ] Background sync task scheduling
- [ ] Differential sync (only changed fields)
- [ ] Upload progress tracking
- [ ] File attachment support with offline queueing
- [ ] Conflict resolution (server vs local data)
- [ ] Analytics on sync success/failure rates

