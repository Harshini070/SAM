from datetime import datetime
from typing import Optional
from enum import Enum

class AlertType(str, Enum):
    SAM_DETECTED = "sam_detected"
    MAM_DETECTED = "mam_detected"
    FUND_DISBURSEMENT = "fund_disbursement"
    REFERRAL_URGENT = "referral_urgent"
    CENTER_OCCUPANCY = "center_occupancy"
    MISSED_FOLLOWUP = "missed_followup"
    ADMIN_NOTIFICATION = "admin_notification"

class AlertStatus(str, Enum):
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    FAILED = "failed"

class Alert:
    def __init__(
        self,
        recipient_phone: str,
        alert_type: AlertType,
        title: str,
        message: str,
        data: dict,
        recipient_id: Optional[str] = None,
        recipient_role: Optional[str] = None,
        status: AlertStatus = AlertStatus.PENDING,
        delivery_channel: str = "sms",
        created_at: Optional[datetime] = None,
        sent_at: Optional[datetime] = None,
        delivery_id: Optional[str] = None
    ):
        self.recipient_phone = recipient_phone
        self.recipient_id = recipient_id
        self.recipient_role = recipient_role
        self.alert_type = alert_type
        self.title = title
        self.message = message
        self.data = data
        self.status = status
        self.delivery_channel = delivery_channel
        self.created_at = created_at or datetime.utcnow()
        self.sent_at = sent_at
        self.delivery_id = delivery_id

    def to_dict(self):
        return {
            "recipient_phone": self.recipient_phone,
            "recipient_id": self.recipient_id,
            "recipient_role": self.recipient_role,
            "alert_type": self.alert_type.value,
            "title": self.title,
            "message": self.message,
            "data": self.data,
            "status": self.status.value,
            "delivery_channel": self.delivery_channel,
            "created_at": self.created_at,
            "sent_at": self.sent_at,
            "delivery_id": self.delivery_id
        }
