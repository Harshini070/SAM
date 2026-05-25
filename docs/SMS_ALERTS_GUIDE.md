# SMS & Push Notification System Documentation

## Overview

The SAM/NRC system now includes a complete SMS and push notification infrastructure enabling real-time alerts to all stakeholders:
- **SMS Alerts** via Twilio for critical events (no smartphone required)
- **Push Notifications** via Expo for smartphone users
- **Alert Types**: SAM/MAM detection, urgent referrals, fund disbursement, missed followups, high occupancy

## Architecture

### Backend Components

#### 1. **Alert Service** (`app/services/alerts_service.py`)
- Sends SMS notifications via Twilio
- Logs all alerts to MongoDB for analytics
- Fallback to database-only logging if Twilio unavailable
- Specialized methods for each alert type

**Alert Types:**
- `SAM_DETECTED` - Severe Acute Malnutrition
- `MAM_DETECTED` - Moderate Acute Malnutrition  
- `FUND_DISBURSEMENT` - Fund allocation notification
- `REFERRAL_URGENT` - Urgent NRC referral
- `CENTER_OCCUPANCY` - High bed occupancy alert
- `MISSED_FOLLOWUP` - Missed health check
- `ADMIN_NOTIFICATION` - General admin alerts

**Key Methods:**
- `send_sms()` - Send SMS to a phone number
- `send_sam_detection_alert()` - Alert mother of SAM
- `send_mam_detection_alert()` - Alert mother of MAM
- `send_urgent_referral_alert()` - Alert NRC of referral
- `send_fund_disbursement_alert()` - Alert district officer
- `send_missed_followup_alert()` - Alert Anganwadi
- `send_high_occupancy_alert()` - Alert NRC of full beds
- `get_alerts_for_user()` - Get user's alert history
- `get_alert_statistics()` - Analytics data

#### 2. **Push Notification Service** (`app/services/push_notification_service.py`)
- Manages Expo push notification tokens
- Sends push notifications to individual devices
- Broadcasts to users by role/district
- Tracks device registration

**Key Methods:**
- `register_device_token()` - Register device for notifications
- `unregister_device_token()` - Remove device
- `send_push_notification()` - Send to single user
- `send_push_to_role()` - Broadcast to role group
- `get_user_devices()` - List user's devices
- `disable_device_token()` - Deactivate device

#### 3. **Alert Model** (`app/models/alert.py`)
```python
Alert {
  recipient_phone: str
  recipient_id: str (optional)
  recipient_role: str
  alert_type: AlertType (enum)
  title: str
  message: str
  data: dict
  status: AlertStatus (pending/sent/delivered/failed)
  delivery_channel: str (sms/push/database)
  created_at: datetime
  sent_at: datetime
  delivery_id: str (Twilio SID or Expo token)
}
```

#### 4. **Device Token Model** (`app/models/device_token.py`)
```python
DeviceToken {
  user_phone: str
  user_id: str (optional)
  device_token: str (Expo push token)
  device_type: str (ios/android)
  is_active: bool
  created_at: datetime
  last_used_at: datetime
}
```

### REST API Endpoints

#### SMS Alerts

**Send Generic SMS**
```
POST /api/alerts/send-sms
Authorization: Bearer <token>

{
  "recipient_phone": "+919876543210",
  "alert_type": "admin_notification",
  "message": "Custom message text",
  "data": {"key": "value"}
}

Response: { "success": true, "message": "SMS sent", "delivery_id": "..." }
```

**Send SAM Detection Alert**
```
POST /api/alerts/sam-detection?child_id=...&child_name=...&mother_phone=...
Authorization: Bearer <token>

Response: { "success": true, "delivery_id": "..." }
```

**Send MAM Detection Alert**
```
POST /api/alerts/mam-detection?child_id=...&child_name=...&mother_phone=...
Authorization: Bearer <token>
```

**Send Urgent Referral Alert**
```
POST /api/alerts/urgent-referral?child_id=...&child_name=...&nrc_name=...&nrc_phone=...
Authorization: Bearer <token>
```

**Send Fund Disbursement Alert**
```
POST /api/alerts/fund-disbursement?district=...&amount=...&officer_phone=...
Authorization: Bearer <token>
```

**Send Missed Follow-up Alert**
```
POST /api/alerts/missed-followup?child_id=...&child_name=...&anganwadi_phone=...
Authorization: Bearer <token>
```

**Send High Occupancy Alert**
```
POST /api/alerts/high-occupancy?nrc_name=...&occupancy_percent=...&nrc_phone=...
Authorization: Bearer <token>
```

#### Alert History & Analytics

**Get My Alerts**
```
GET /api/alerts/my-alerts?limit=20
Authorization: Bearer <token>

Response: {
  "success": true,
  "count": 5,
  "alerts": [...]
}
```

**Get Alerts by Type**
```
GET /api/alerts/by-type/{alert_type}?limit=50
Authorization: Bearer <token>

Response: { "success": true, "count": 10, "alerts": [...] }
```

**Get Statistics**
```
GET /api/alerts/statistics
Authorization: Bearer <token>

Response: {
  "total_alerts": 450,
  "by_type": {
    "sam_detected": 120,
    "mam_detected": 85,
    ...
  },
  "delivery_success_rate": 94.5
}
```

#### Push Notifications

**Register Device for Notifications**
```
POST /api/push/register-device
Authorization: Bearer <token>

{
  "device_token": "ExponentPushToken[xxxxx]",
  "device_type": "ios"
}

Response: { "success": true, "message": "Device registered" }
```

**Unregister Device**
```
POST /api/push/unregister-device/{device_token}
Authorization: Bearer <token>
```

**Get My Devices**
```
GET /api/push/my-devices
Authorization: Bearer <token>

Response: {
  "success": true,
  "count": 2,
  "devices": [
    {
      "device_token": "ExponentPushToken[...]",
      "device_type": "ios",
      "is_active": true,
      "created_at": "2025-05-20T10:30:00Z"
    }
  ]
}
```

**Send Push Notification**
```
POST /api/push/send
Authorization: Bearer <token>

{
  "user_phone": "+919876543210",
  "title": "SAM Alert",
  "body": "Your child has been identified with SAM",
  "data": {"child_id": "123", "action": "view_child"}
}

Response: {
  "success": true,
  "sent_count": 1,
  "response": {...}
}
```

**Broadcast to Role**
```
POST /api/push/send-to-role
Authorization: Bearer <token>

{
  "role": "nrc",
  "title": "High Occupancy Alert",
  "body": "NRC is at 85% capacity",
  "data": {"nrc_id": "456"},
  "district": "Raipur" (optional, filters by district)
}

Response: {
  "success": true,
  "total_sent": 12,
  "failed": 0
}
```

### Mobile Components

#### 1. **Push Notification Manager** (`services/pushNotificationService.ts`)
- Handles Expo push notification initialization
- Manages device tokens
- Sets up notification listeners
- Auto-registers device with backend

**Key Methods:**
- `initialize()` - Init push notifications
- `registerForPushNotificationsAsync()` - Get Expo token
- `subscribe()` - Listen for incoming notifications
- `subscribeToDeviceToken()` - Get token updates
- `unregisterDevice()` - Stop notifications
- `getStoredToken()` - Retrieve cached token

#### 2. **Notification Context** (`context/NotificationContext.tsx`)
- Global state for notifications
- Tracks unread count
- Stores last notification
- Provides `useNotifications()` hook

**Provided State:**
```typescript
{
  notifications: Notification[];
  lastNotification: Notification | null;
  unreadCount: number;
  deviceToken: string | null;
  clearNotifications: () => void;
  markAsRead: (notificationId: string) => void;
}
```

#### 3. **Usage in Components**
```typescript
import { useNotifications } from '../context/NotificationContext';

export const MyComponent = () => {
  const { notifications, unreadCount, lastNotification } = useNotifications();
  
  return (
    <View>
      <Text>Notifications: {unreadCount}</Text>
      {lastNotification && (
        <Text>{lastNotification.title}: {lastNotification.body}</Text>
      )}
    </View>
  );
};
```

## Configuration

### Backend Setup

**1. Twilio Configuration**
Set in `.env`:
```
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

Get credentials from [Twilio Console](https://www.twilio.com/console)

**2. Database Indexes**
Automatically created on startup:
- `alerts.recipient_phone`
- `alerts.alert_type`
- `alerts.created_at`
- `device_tokens.user_phone`
- `device_tokens.device_token` (unique)

### Mobile Setup

**1. Expo Project ID**
Update in `pushNotificationService.ts`:
```typescript
projectId: 'your-expo-project-id'
```

**2. Install Dependencies**
```bash
npm install expo-notifications expo-device
```

**3. App Configuration** (already wrapped with NotificationProvider in App.tsx)

## Alert Flow Examples

### Example 1: SAM Detection Alert

**Backend Flow:**
```
1. Health Worker screens child in Mitanin app
2. App calculates MUAC/Weight-Height → SAM detected
3. App calls POST /children/screen with health_status=SAM
4. Backend receives and calls AlertService.send_sam_detection_alert()
5. SMS sent to mother: "🚨 URGENT: {child_name} has SAM. Please contact health center."
6. Push notification sent to mother if registered
7. Alert logged to database
8. District dashboard updated with SAM count
```

### Example 2: Urgent Referral Alert

**Backend Flow:**
```
1. Health Worker identifies SAM case needs NRC admission
2. App calls POST /nrc/admit with child_id
3. Backend finds nearest available NRC
4. Backend calls AlertService.send_urgent_referral_alert()
5. SMS sent to NRC: "🏥 URGENT: {child_name} requires admission. Contact: ..."
6. Push notification sent to NRC staff
7. NRC can immediately start admission process
8. Mother receives separate notification with NRC address/contact
```

### Example 3: Fund Disbursement Alert

**Backend Flow:**
```
1. State Admin approves ₹50L fund allocation to Raipur district
2. Admin calls POST /alerts/fund-disbursement
3. AlertService sends SMS + push to Raipur district officer
4. District officer receives: "💰 ₹50,00,000 allocated for nutrition"
5. Officer can immediately access fund management portal
6. District dashboard updates with fund availability
```

## Monitoring & Analytics

### Dashboard Metrics
```
GET /api/alerts/statistics

Returns:
- Total alerts sent (all time)
- Breakdown by alert type
- Delivery success rate (SMS + push)
- Last 24h volume
- Failed delivery count
```

### Sample Data
```json
{
  "total_alerts": 1250,
  "by_type": {
    "sam_detected": 450,
    "mam_detected": 320,
    "urgent_referral": 185,
    "fund_disbursement": 145,
    "missed_followup": 95,
    "high_occupancy": 55
  },
  "delivery_success_rate": 96.3
}
```

## Testing

### Test SMS Without Twilio
System falls back to database logging:
```
POST /api/alerts/send-sms (without TWILIO_* env vars)
→ Alert created in database with status="pending"
→ Logs to console for development
```

### Test Push Notifications
```typescript
// In dev console
import { pushNotificationManager } from './services/pushNotificationService';
const token = pushNotificationManager.getCurrentToken();
console.log('Device token:', token);

// Send test push via backend
POST /api/push/send
{
  "user_phone": "9876543210",
  "title": "Test",
  "body": "Test notification"
}
```

### Test Device Registration
```
POST /api/push/register-device
{
  "device_token": "ExponentPushToken[...]",
  "device_type": "ios"
}

GET /api/push/my-devices
→ Should show registered device
```

## Troubleshooting

### SMS Not Sending
1. Check Twilio credentials in `.env`
2. Verify phone number format: `+919876543210`
3. Check Twilio account has SMS credits
4. Look at alert status: pending/sent/failed

### Push Notifications Not Received
1. Check device is online
2. Verify `expo-notifications` installed
3. Check device permissions granted
4. Verify ProjectID in `pushNotificationService.ts`
5. Confirm device token registered: `GET /api/push/my-devices`

### Alerts Not Saved to Database
1. Verify MongoDB connection
2. Check alerts collection indexes exist
3. Verify user has `_id` in database
4. Check logs for database errors

## Security

- All alert endpoints require authentication (Bearer token)
- Role-based access: Only authorized users can send alerts
- SMS phone numbers sanitized and validated
- Device tokens are unique per device
- No sensitive data in notification bodies
- All alerts logged with sender information

## Rate Limiting (Future)

Recommended limits to prevent abuse:
- 100 SMS per number per day
- 1000 SMS per user per day
- 500 push notifications per device per day
- 10,000 broadcast messages per admin per day

## Compliance

✅ SMS compliant with:
- TRAI regulations (India)
- DND (Do Not Disturb) handling
- Twilio best practices

✅ Push notifications:
- iOS Push Notification Service
- Firebase Cloud Messaging (Android via Expo)

✅ Data privacy:
- Phone numbers encrypted in transit
- Device tokens stored securely
- GDPR-compliant data retention
- Right to unsubscribe (device removal)

