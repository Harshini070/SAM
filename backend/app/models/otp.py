from datetime import datetime, timedelta
from typing import Optional

class OTP:
    def __init__(
        self,
        phone: str,
        code: str,
        expires_at: Optional[datetime] = None,
        attempts: int = 0,
        is_verified: bool = False,
        created_at: Optional[datetime] = None
    ):
        self.phone = phone
        self.code = code
        self.expires_at = expires_at or (datetime.utcnow() + timedelta(minutes=10))
        self.attempts = attempts
        self.is_verified = is_verified
        self.created_at = created_at or datetime.utcnow()

    def to_dict(self):
        return {
            "phone": self.phone,
            "code": self.code,
            "expires_at": self.expires_at,
            "attempts": self.attempts,
            "is_verified": self.is_verified,
            "created_at": self.created_at
        }
