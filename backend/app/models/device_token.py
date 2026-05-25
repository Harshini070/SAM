from datetime import datetime
from typing import Optional

class DeviceToken:
    def __init__(
        self,
        user_phone: str,
        device_token: str,
        device_type: str = "ios",  # ios, android, web
        user_id: Optional[str] = None,
        is_active: bool = True,
        created_at: Optional[datetime] = None,
        last_used_at: Optional[datetime] = None
    ):
        self.user_phone = user_phone
        self.user_id = user_id
        self.device_token = device_token
        self.device_type = device_type
        self.is_active = is_active
        self.created_at = created_at or datetime.utcnow()
        self.last_used_at = last_used_at

    def to_dict(self):
        return {
            "user_phone": self.user_phone,
            "user_id": self.user_id,
            "device_token": self.device_token,
            "device_type": self.device_type,
            "is_active": self.is_active,
            "created_at": self.created_at,
            "last_used_at": self.last_used_at
        }
